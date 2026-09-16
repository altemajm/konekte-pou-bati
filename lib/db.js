// Couche de stockage simple basee sur des fichiers JSON.
// Suffisant pour le volume attendu (quelques milliers d'enregistrements).
// A remplacer par une vraie base de donnees (PostgreSQL, etc.) si le
// systeme grossit au-dela d'une utilisation ponctuelle par edition.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "..", "data");

const FILES = {
  inscriptions: "inscriptions.json",
  mentors: "mentors.json",
  mentores: "mentores.json",
  offres: "offres.json",
  partenaires: "partenaires.json",
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  for (const file of Object.values(FILES)) {
    const p = path.join(DATA_DIR, file);
    if (!fs.existsSync(p)) fs.writeFileSync(p, "[]", "utf8");
  }
}

function filePath(collection) {
  if (!FILES[collection]) throw new Error(`Collection inconnue: ${collection}`);
  return path.join(DATA_DIR, FILES[collection]);
}

// Verrou tres simple en memoire pour eviter les ecritures concurrentes
// qui se marchent dessus (suffisant pour un serveur mono-process).
const locks = {};
function withLock(collection, fn) {
  const prev = locks[collection] || Promise.resolve();
  const next = prev.then(fn, fn);
  locks[collection] = next.catch(() => {});
  return next;
}

function readAll(collection) {
  ensureDataDir();
  const raw = fs.readFileSync(filePath(collection), "utf8");
  try {
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

function writeAll(collection, records) {
  ensureDataDir();
  fs.writeFileSync(filePath(collection), JSON.stringify(records, null, 2), "utf8");
}

function insert(collection, record) {
  return withLock(collection, () => {
    const records = readAll(collection);
    const withId = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...record,
    };
    records.push(withId);
    writeAll(collection, records);
    return withId;
  });
}

function findAll(collection, filterFn) {
  const records = readAll(collection);
  return filterFn ? records.filter(filterFn) : records;
}

function updateById(collection, id, patch) {
  return withLock(collection, () => {
    const records = readAll(collection);
    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    records[idx] = { ...records[idx], ...patch, updatedAt: new Date().toISOString() };
    writeAll(collection, records);
    return records[idx];
  });
}

function removeById(collection, id) {
  return withLock(collection, () => {
    const records = readAll(collection);
    const next = records.filter((r) => r.id !== id);
    writeAll(collection, next);
    return next.length !== records.length;
  });
}

module.exports = { insert, findAll, updateById, removeById, ensureDataDir };
