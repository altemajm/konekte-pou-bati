// Moteur de gabarits volontairement minimaliste : un layout commun +
// des vues HTML avec des marqueurs {{cle}} remplaces par des valeurs,
// et {{{cle}}} pour du HTML non echappe (ex: contenu genere).
// Pas besoin d'EJS/Handlebars pour ce niveau de besoin.

const fs = require("fs");
const path = require("path");

const VIEWS_DIR = path.join(__dirname, "..", "views");
const layoutCache = {};

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readView(name) {
  const p = path.join(VIEWS_DIR, `${name}.html`);
  return fs.readFileSync(p, "utf8");
}

function interpolate(template, data) {
  // {{{key}}} => HTML brut, {{key}} => texte echappe
  return template
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, key) => (data[key] !== undefined ? data[key] : ""))
    .replace(/\{\{(\w+)\}\}/g, (_, key) => escapeHtml(data[key]));
}

function render(viewName, data = {}) {
  const layout = readView("layout");
  const view = readView(viewName);
  const content = interpolate(view, data);
  return interpolate(layout, {
    ...data,
    content,
    title: data.title || "Konekte pou Bati",
  });
}

module.exports = { render, escapeHtml, interpolate };
