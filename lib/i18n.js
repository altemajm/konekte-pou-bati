// Gestion bilingue (francais / creole haitien) du site public.
// La langue est retenue via un cookie simple (pas besoin de compte
// utilisateur). L'espace organisateurs (/admin) reste en francais.

const fr = require("../locales/fr");
const ht = require("../locales/ht");

const DICTS = { fr, ht };
const COOKIE_NAME = "konekte_lang";
const SUPPORTED = ["fr", "ht"];

function getLang(req) {
  const cookies = req._cookies || {};
  const lang = cookies[COOKIE_NAME];
  return SUPPORTED.includes(lang) ? lang : "fr";
}

// Renvoie l'ensemble des cles traduites pour une langue donnee, avec
// repli automatique sur le francais si une cle manque en creole.
function dict(lang) {
  const base = DICTS.fr;
  const active = DICTS[lang] || DICTS.fr;
  return new Proxy(active, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop in base) return base[prop];
      return `[[${String(prop)}]]`; // aide au debug si une cle est oubliee
    },
  });
}

function pick(field, lang) {
  if (!field) return "";
  return field[lang] || field.fr || "";
}

function setLangCookie(lang) {
  return `${COOKIE_NAME}=${lang}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`;
}

module.exports = { getLang, dict, pick, setLangCookie, COOKIE_NAME, SUPPORTED };
