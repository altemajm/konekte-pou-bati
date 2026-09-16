// Authentification admin minimaliste : un mot de passe unique (variable
// d'environnement ADMIN_PASSWORD) et un cookie de session signe en HMAC
// (pas de bibliotheque de session externe necessaire).

const crypto = require("crypto");

const SECRET = process.env.SESSION_SECRET || "change-moi-en-production";
const COOKIE_NAME = "konekte_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 heures

function sign(value) {
  const hmac = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${hmac}`;
}

function verify(signed) {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const hmac = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

function createSessionCookie() {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const payload = `admin|${expiresAt}`;
  const signed = sign(payload);
  const expires = new Date(expiresAt).toUTCString();
  return `${COOKIE_NAME}=${encodeURIComponent(signed)}; HttpOnly; Path=/; SameSite=Lax; Expires=${expires}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    out[key] = decodeURIComponent(val);
  });
  return out;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req);
  const raw = cookies[COOKIE_NAME];
  const payload = verify(raw);
  if (!payload) return false;
  const [role, expiresAtStr] = payload.split("|");
  const expiresAt = Number(expiresAtStr);
  return role === "admin" && Date.now() < expiresAt;
}

function checkPassword(candidate) {
  const expected = process.env.ADMIN_PASSWORD || "konekte2026";
  const a = Buffer.from(String(candidate || ""));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  createSessionCookie,
  clearSessionCookie,
  isAuthenticated,
  checkPassword,
  parseCookies,
};
