// Systeme Konekte pou Bati : vitrine bilingue (FR/HT) + Rezo Konekte +
// Mur des opportunites. 100% Node.js natif (aucune dependance externe
// requise) : http, fs, crypto.
//
// Demarrage :
//   node server.js
// Variables d'environnement optionnelles (voir .env.example) :
//   PORT              (defaut 3000)
//   ADMIN_PASSWORD    (defaut "konekte2026" — A CHANGER en production)
//   SESSION_SECRET    (chaine aleatoire longue en production)
//
// Bilinguisme : le site public (accueil, programme, axes, formulaires,
// mur des opportunites, partenaires) est disponible en francais et en
// creole haitien, via le petit systeme dans lib/i18n.js + locales/*.js.
// L'espace organisateurs (/admin) reste volontairement en francais :
// c'est un outil interne pour l'equipe, pas une page destinee au
// public / aux jeunes / aux partenaires.

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const Router = require("./lib/router");
const db = require("./lib/db");
const auth = require("./lib/auth");
const i18n = require("./lib/i18n");
const { render, escapeHtml } = require("./lib/render");
const { parseFormBody } = require("./lib/body");
const { AXES, PROGRAMME } = require("./data/content");

// Charge un .env tres simple si present (pas de dependance dotenv)
function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const idx = trimmed.indexOf("=");
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  });
}
loadEnvFile();

const PORT = process.env.PORT || 3000;
const router = new Router();

// ---------------------------------------------------------------------
// Aide bilingue (i18n)
// ---------------------------------------------------------------------

function getLangFromReq(req) {
  req._cookies = req._cookies || auth.parseCookies(req);
  return i18n.getLang(req);
}

function currentPath(req) {
  return url.parse(req.url).pathname;
}

// Variables communes a toutes les pages publiques (nav, pied de page,
// selecteur de langue).
function commonVars(lang, req) {
  const L = i18n.dict(lang);
  const back = encodeURIComponent(currentPath(req));
  return {
    lang,
    navProgramme: L.nav_programme,
    navAxes: L.nav_axes,
    navOpportunites: L.nav_opportunites,
    navRezo: L.nav_rezo,
    navPartenaires: L.nav_partenaires,
    navInscription: L.nav_inscription,
    footerMeta: L.footer_meta,
    footerAdmin: L.footer_admin,
    footerTagline: L.footer_tagline,
    contactLabel: L.contact_label,
    contactEmail: L.contact_email,
    contactPhoneLabel: L.contact_phone_label,
    contactPhone: L.contact_phone,
    backPath: back,
    langFrClass: lang === "fr" ? "lang-active" : "",
    langHtClass: lang === "ht" ? "lang-active" : "",
  };
}

function axisLabel(axisId, lang) {
  const axis = AXES.find((a) => a.id === axisId);
  return axis ? i18n.pick(axis.title, lang) : axisId;
}

function axisOptionsHtml(lang, selected) {
  return AXES.map(
    (a) =>
      `<option value="${a.id}" ${a.id === selected ? "selected" : ""}>${escapeHtml(i18n.pick(a.title, lang))}</option>`
  ).join("\n");
}

function axesCardsHtml(lang) {
  return AXES.map(
    (a) => `
      <div class="axis-card">
        <div class="axis-card-img">
          <img src="https://loremflickr.com/500/320/${a.imgSeed === "axis-numerique" ? "haiti,technology" : a.imgSeed === "axis-agriculture" ? "haiti,agriculture" : a.imgSeed === "axis-territoire" ? "caribbean,city" : "caribbean,security"}" alt="" />
          <span class="axis-card-tag" style="background:${a.color};">${escapeHtml(i18n.pick(a.tag, lang))}</span>
        </div>
        <div class="axis-card-body">
          <h3>${escapeHtml(i18n.pick(a.title, lang))}</h3>
          <p>${escapeHtml(i18n.pick(a.metiers, lang))}</p>
        </div>
      </div>`
  ).join("\n");
}

function axesDetailHtml(lang) {
  const L = i18n.dict(lang);
  return AXES.map(
    (a) => `
      <div class="axis-card">
        <div class="axis-card-img">
          <img src="https://loremflickr.com/500/320/${a.imgSeed === "axis-numerique" ? "haiti,technology" : a.imgSeed === "axis-agriculture" ? "haiti,agriculture" : a.imgSeed === "axis-territoire" ? "caribbean,city" : "caribbean,security"}" alt="" />
          <span class="axis-card-tag" style="background:${a.color};">${escapeHtml(i18n.pick(a.tag, lang))}</span>
        </div>
        <div class="axis-card-body">
          <h3>${escapeHtml(i18n.pick(a.title, lang))}</h3>
          <p><strong>${escapeHtml(L.label_pourquoi)} :</strong> ${escapeHtml(i18n.pick(a.pourquoi, lang))}</p>
          <p><strong>${escapeHtml(L.label_metiers)} :</strong> ${escapeHtml(i18n.pick(a.metiers, lang))}</p>
          <p><strong>${escapeHtml(L.label_indicateur)} :</strong> ${escapeHtml(i18n.pick(a.indicateur, lang))}</p>
        </div>
      </div>`
  ).join("\n");
}

function timelineHtml(lang) {
  return PROGRAMME.map(
    (item) => `
      <div class="timeline-item">
        <div class="timeline-time">${escapeHtml(item.time)}</div>
        <div class="timeline-body">
          <h4>${escapeHtml(i18n.pick(item.title, lang))}</h4>
          <p>${escapeHtml(i18n.pick(item.detail, lang))}</p>
        </div>
      </div>`
  ).join("\n");
}

// ---------------------------------------------------------------------
// Selecteur de langue
// ---------------------------------------------------------------------

router.get("/lang/:code", (req, res, params) => {
  const code = i18n.SUPPORTED.includes(params.code) ? params.code : "fr";
  const backRaw = url.parse(req.url, true).query.back;
  const back = backRaw ? decodeURIComponent(backRaw) : "/";
  res.setHeader("Set-Cookie", i18n.setLangCookie(code));
  redirect(res, back.startsWith("/") ? back : "/");
});

// ---------------------------------------------------------------------
// Pages vitrine
// ---------------------------------------------------------------------

router.get("/", (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  send(
    res,
    200,
    render("home", {
      title: L.hero_title,
      ...commonVars(lang, req),
      heroTitle: L.hero_title,
      heroTagline: L.hero_tagline,
      heroLead: L.hero_lead,
      heroMeta: L.hero_meta,
      heroTarget: L.hero_target,
      btnInscription: L.btn_inscription,
      btnPartenaire: L.btn_partenaire,
      galleryCaption: L.gallery_caption,
      statsTitle: L.stats_title,
      statsSub: L.stats_sub,
      stat1Num: L.stat1_num, stat1Label: L.stat1_label,
      stat2Num: L.stat2_num, stat2Label: L.stat2_label,
      stat3Num: L.stat3_num, stat3Label: L.stat3_label,
      stat4Num: L.stat4_num, stat4Label: L.stat4_label,
      axesTitle: L.axes_title,
      axesSub: L.axes_sub,
      axesCardsHtml: axesCardsHtml(lang),
      btnVoirAxes: L.btn_voir_axes,
      retombeesTitle: L.retombees_title,
      tierRezoTitle: L.tier_rezo_title, tierRezoDesc: L.tier_rezo_desc,
      tierMurTitle: L.tier_mur_title, tierMurDesc: L.tier_mur_desc,
      linkVoirOffres: L.link_voir_offres,
      tierPrixTitle: L.tier_prix_title, tierPrixDesc: L.tier_prix_desc,
    })
  );
});

router.get("/programme", (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  send(
    res,
    200,
    render("programme", {
      title: L.programme_title,
      ...commonVars(lang, req),
      programmeTitle: L.programme_title,
      programmeSub: L.programme_sub,
      timelineHtml: timelineHtml(lang),
    })
  );
});

router.get("/axes", (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  send(
    res,
    200,
    render("axes", {
      title: L.axes_page_title,
      ...commonVars(lang, req),
      axesPageTitle: L.axes_page_title,
      axesPageSub: L.axes_page_sub,
      axesDetailHtml: axesDetailHtml(lang),
    })
  );
});

// ---------------------------------------------------------------------
// Inscription des jeunes
// ---------------------------------------------------------------------

function inscriptionData(lang, req, message) {
  const L = i18n.dict(lang);
  return {
    title: L.inscription_title,
    ...commonVars(lang, req),
    inscriptionTitle: L.inscription_title,
    inscriptionSub: L.inscription_sub,
    labelNom: L.label_nom,
    labelEmail: L.label_email,
    labelWhatsapp: L.label_whatsapp,
    labelVille: L.label_ville,
    labelAxeInteret: L.label_axe_interet,
    chooseOption: L.choose_option,
    axisOptions: axisOptionsHtml(lang),
    labelStatut: L.label_statut,
    statutEtudiant: L.statut_etudiant,
    statutRecherche: L.statut_recherche,
    statutPoste: L.statut_poste,
    statutAutre: L.statut_autre,
    btnConfirmerInscription: L.btn_confirmer_inscription,
    hintInscription: L.hint_inscription,
    message: message || "",
  };
}

router.get("/inscription", (req, res) => {
  const lang = getLangFromReq(req);
  send(res, 200, render("inscription", inscriptionData(lang, req)));
});

router.post("/inscription", async (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  const body = await parseFormBody(req);
  const errors = requireFields(body, ["nom", "email", "ville", "axe"]);
  if (errors.length) {
    const message = alertHtml({ type: "error", text: `${L.msg_champs_manquants}${errors.join(", ")}` });
    return send(res, 400, render("inscription", inscriptionData(lang, req, message)));
  }
  await db.insert("inscriptions", {
    nom: clean(body.nom),
    email: clean(body.email),
    whatsapp: clean(body.whatsapp),
    ville: clean(body.ville),
    axe: clean(body.axe),
    statut: clean(body.statut) || "non precise",
  });
  const message = alertHtml({ type: "success", text: L.msg_inscription_success });
  send(res, 200, render("inscription", inscriptionData(lang, req, message)));
});

// ---------------------------------------------------------------------
// Rezo Konekte (mentors + jeunes en demande de mentorat)
// ---------------------------------------------------------------------

function rezoData(lang, req, message) {
  const L = i18n.dict(lang);
  return {
    title: L.rezo_title,
    ...commonVars(lang, req),
    rezoTitle: L.rezo_title,
    rezoSub: L.rezo_sub,
    appelTitle: L.appel_title,
    appelText: L.appel_text,
    mentorHeading: L.mentor_heading,
    labelNom: L.label_nom,
    labelEmail: L.label_email,
    labelVilleResidence: L.label_ville_residence,
    labelVilleOrigine: L.label_ville_origine,
    labelAxeExpertise: L.label_axe_expertise,
    chooseOption: L.choose_option,
    axisOptions: axisOptionsHtml(lang),
    labelDisponibilite: L.label_disponibilite,
    placeholderDisponibilite: L.placeholder_disponibilite,
    labelMotivation: L.label_motivation,
    btnDevenirMentor: L.btn_devenir_mentor,
    jeuneHeading: L.jeune_heading,
    labelVille: L.label_ville,
    labelAxeInteresse: L.label_axe_interesse,
    labelObjectif: L.label_objectif,
    btnDemanderMentor: L.btn_demander_mentor,
    message: message || "",
  };
}

router.get("/rezo-konekte", (req, res) => {
  const lang = getLangFromReq(req);
  send(res, 200, render("rezo-konekte", rezoData(lang, req)));
});

router.post("/rezo-konekte/mentor", async (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  const body = await parseFormBody(req);
  const errors = requireFields(body, ["nom", "email", "villeResidence", "axe"]);
  if (errors.length) {
    const message = alertHtml({ type: "error", text: `${L.msg_champs_manquants}${errors.join(", ")}` });
    return send(res, 400, render("rezo-konekte", rezoData(lang, req, message)));
  }
  await db.insert("mentors", {
    nom: clean(body.nom),
    email: clean(body.email),
    villeResidence: clean(body.villeResidence),
    villeOrigine: clean(body.villeOrigine),
    axe: clean(body.axe),
    disponibilite: clean(body.disponibilite),
    motivation: clean(body.motivation),
    statut: "en_attente", // en_attente | valide | actif
  });
  const message = alertHtml({ type: "success", text: L.msg_mentor_success });
  send(res, 200, render("rezo-konekte", rezoData(lang, req, message)));
});

router.post("/rezo-konekte/jeune", async (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  const body = await parseFormBody(req);
  const errors = requireFields(body, ["nom", "email", "ville", "axe"]);
  if (errors.length) {
    const message = alertHtml({ type: "error", text: `${L.msg_champs_manquants}${errors.join(", ")}` });
    return send(res, 400, render("rezo-konekte", rezoData(lang, req, message)));
  }
  await db.insert("mentores", {
    nom: clean(body.nom),
    email: clean(body.email),
    ville: clean(body.ville),
    axe: clean(body.axe),
    objectif: clean(body.objectif),
    statut: "en_attente", // en_attente | jumele
  });
  const message = alertHtml({ type: "success", text: L.msg_jeune_success });
  send(res, 200, render("rezo-konekte", rezoData(lang, req, message)));
});

// ---------------------------------------------------------------------
// Mur des opportunites
// ---------------------------------------------------------------------

router.get("/opportunites", (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  const offres = db.findAll("offres", (o) => o.statut === "publiee").reverse();
  const html = offres.length
    ? offres.map((o) => jobCardHtml(o, lang)).join("\n")
    : `<p class="section-sub">${escapeHtml(L.opportunites_empty)}</p>`;
  send(
    res,
    200,
    render("opportunites", {
      title: L.opportunites_title,
      ...commonVars(lang, req),
      opportunitesTitle: L.opportunites_title,
      opportunitesSub: L.opportunites_sub,
      offres: html,
      opportunitesPublierHint: L.opportunites_publier_hint,
      opportunitesPublierLink: L.opportunites_publier_link,
      opportunitesPublierSuffix: L.opportunites_publier_suffix,
    })
  );
});

function publierData(lang, req, message) {
  const L = i18n.dict(lang);
  return {
    title: L.publier_title,
    ...commonVars(lang, req),
    publierTitle: L.publier_title,
    publierSub: L.publier_sub,
    labelEntreprise: L.label_entreprise,
    labelPoste: L.label_poste,
    labelType: L.label_type,
    typeEmploi: L.type_emploi,
    typeStage: L.type_stage,
    typeFreelance: L.type_freelance,
    labelLieu: L.label_lieu,
    placeholderLieu: L.placeholder_lieu,
    labelAxeLie: L.label_axe_lie,
    axisOptions: axisOptionsHtml(lang),
    labelDescription: L.label_description,
    labelLien: L.label_lien,
    labelContactEmail: L.label_contact_email,
    btnSoumettreOffre: L.btn_soumettre_offre,
    message: message || "",
  };
}

router.get("/opportunites/publier", (req, res) => {
  const lang = getLangFromReq(req);
  send(res, 200, render("opportunites-publier", publierData(lang, req)));
});

router.post("/opportunites/publier", async (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  const body = await parseFormBody(req);
  const errors = requireFields(body, ["entreprise", "poste", "lien", "contactEmail"]);
  if (errors.length) {
    const message = alertHtml({ type: "error", text: `${L.msg_champs_manquants}${errors.join(", ")}` });
    return send(res, 400, render("opportunites-publier", publierData(lang, req, message)));
  }
  await db.insert("offres", {
    entreprise: clean(body.entreprise),
    poste: clean(body.poste),
    type: clean(body.type) || "emploi",
    lieu: clean(body.lieu),
    axe: clean(body.axe),
    description: clean(body.description),
    lien: clean(body.lien),
    contactEmail: clean(body.contactEmail),
    statut: "en_attente", // en_attente | publiee | rejetee -- validee par un admin
  });
  const message = alertHtml({ type: "success", text: L.msg_offre_success });
  send(res, 200, render("opportunites-publier", publierData(lang, req, message)));
});

// ---------------------------------------------------------------------
// Partenaires
// ---------------------------------------------------------------------

function partenairesData(lang, req, message) {
  const L = i18n.dict(lang);
  return {
    title: L.partenaires_title,
    ...commonVars(lang, req),
    partenairesTitle: L.partenaires_title,
    partenairesSub: L.partenaires_sub,
    tierOfficielTitle: L.tier_officiel_title, tierOfficielAmount: L.tier_officiel_amount, tierOfficielDesc: L.tier_officiel_desc,
    tierOrTitle: L.tier_or_title, tierOrAmount: L.tier_or_amount, tierOrDesc: L.tier_or_desc,
    tierArgentTitle: L.tier_argent_title, tierArgentAmount: L.tier_argent_amount, tierArgentDesc: L.tier_argent_desc,
    tierBronzeTitle: L.tier_bronze_title, tierBronzeAmount: L.tier_bronze_amount, tierBronzeDesc: L.tier_bronze_desc,
    partenaireFormTitle: L.partenaire_form_title,
    labelOrganisation: L.label_organisation,
    labelContact: L.label_contact,
    labelEmail: L.label_email,
    labelPalier: L.label_palier,
    palierOfficiel: L.palier_officiel,
    palierOr: L.palier_or,
    palierArgent: L.palier_argent,
    palierBronze: L.palier_bronze,
    palierNature: L.palier_nature,
    labelMessage: L.label_message,
    btnEnvoyer: L.btn_envoyer,
    message: message || "",
  };
}

router.get("/partenaires", (req, res) => {
  const lang = getLangFromReq(req);
  send(res, 200, render("partenaires", partenairesData(lang, req)));
});

router.post("/partenaires", async (req, res) => {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  const body = await parseFormBody(req);
  const errors = requireFields(body, ["organisation", "contact", "email"]);
  if (errors.length) {
    const message = alertHtml({ type: "error", text: `${L.msg_champs_manquants}${errors.join(", ")}` });
    return send(res, 400, render("partenaires", partenairesData(lang, req, message)));
  }
  await db.insert("partenaires", {
    organisation: clean(body.organisation),
    contact: clean(body.contact),
    email: clean(body.email),
    palier: clean(body.palier) || "a discuter",
    message: clean(body.message),
    statut: "nouveau", // nouveau | contacte | confirme
  });
  const message = alertHtml({ type: "success", text: L.msg_partenaire_success });
  send(res, 200, render("partenaires", partenairesData(lang, req, message)));
});

// ---------------------------------------------------------------------
// Espace organisateurs (admin) — reste en francais (outil interne)
// ---------------------------------------------------------------------

const AXES_LABELS_FR = Object.fromEntries(AXES.map((a) => [a.id, a.title.fr]));

router.get("/admin", (req, res) => {
  if (!auth.isAuthenticated(req)) {
    return send(res, 200, render("admin-login", { title: "Connexion", message: "" }));
  }
  renderDashboard(res);
});

router.post("/admin/login", async (req, res) => {
  const body = await parseFormBody(req);
  if (auth.checkPassword(body.password)) {
    res.setHeader("Set-Cookie", auth.createSessionCookie());
    res.writeHead(302, { Location: "/admin" });
    return res.end();
  }
  const message = alertHtml({ type: "error", text: "Mot de passe incorrect." });
  send(res, 401, render("admin-login", { title: "Connexion", message }));
});

router.post("/admin/logout", (req, res) => {
  res.setHeader("Set-Cookie", auth.clearSessionCookie());
  res.writeHead(302, { Location: "/admin" });
  res.end();
});

// Actions rapides de moderation depuis le dashboard (offres, mentors, mentores)
router.post("/admin/offres/:id/publier", requireAdmin(async (req, res, params) => {
  await db.updateById("offres", params.id, { statut: "publiee" });
  redirect(res, "/admin");
}));
router.post("/admin/offres/:id/rejeter", requireAdmin(async (req, res, params) => {
  await db.updateById("offres", params.id, { statut: "rejetee" });
  redirect(res, "/admin");
}));
router.post("/admin/mentors/:id/valider", requireAdmin(async (req, res, params) => {
  await db.updateById("mentors", params.id, { statut: "valide" });
  redirect(res, "/admin");
}));
router.post("/admin/mentores/:id/jumele", requireAdmin(async (req, res, params) => {
  await db.updateById("mentores", params.id, { statut: "jumele" });
  redirect(res, "/admin");
}));

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

function requireAdmin(handler) {
  return async (req, res, params) => {
    if (!auth.isAuthenticated(req)) {
      res.writeHead(302, { Location: "/admin" });
      return res.end();
    }
    return handler(req, res, params);
  };
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim().slice(0, 4000);
}

function requireFields(body, fields) {
  return fields.filter((f) => !clean(body[f]));
}

function alertHtml({ type, text }) {
  const cls = type === "error" ? "alert-error" : "alert-success";
  return `<div class="alert ${cls}">${escapeHtml(text)}</div>`;
}

function jobCardHtml(o, lang) {
  const L = i18n.dict(lang || "fr");
  const axeLabel = axisLabel(o.axe, lang || "fr");
  const typeLabels = { emploi: L.type_emploi, stage: L.type_stage, freelance: L.type_freelance };
  return `
  <div class="job-card">
    <div>
      <h3>${escapeHtml(o.poste)}</h3>
      <div class="job-meta">${escapeHtml(o.entreprise)} · ${escapeHtml(o.lieu || "—")}</div>
      <p>${escapeHtml(o.description || "")}</p>
      <span class="job-tag">${escapeHtml(typeLabels[o.type] || o.type)}</span>
      ${axeLabel ? `<span class="job-tag">${escapeHtml(axeLabel)}</span>` : ""}
    </div>
    <div style="align-self:center;">
      <a class="btn btn-secondary" href="${escapeHtml(o.lien)}" target="_blank" rel="noopener">${escapeHtml(L.btn_postuler)}</a>
    </div>
  </div>`;
}

function tableHtml(records, columns, actions) {
  if (!records.length) return `<p class="form-hint">Aucune donnee pour le moment.</p>`;
  const head = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const rows = records
    .map((r) => {
      const cells = columns.map((c) => `<td>${escapeHtml(c.render ? c.render(r) : r[c.key])}</td>`).join("");
      const actionCell = actions ? `<td>${actions(r)}</td>` : "";
      return `<tr>${cells}${actionCell}</tr>`;
    })
    .join("");
  const actionHead = actions ? "<th>Actions</th>" : "";
  return `<table><thead><tr>${head}${actionHead}</tr></thead><tbody>${rows}</tbody></table>`;
}

function actionForm(action, label, style) {
  return `<form method="POST" action="${action}" style="display:inline;margin-right:6px;">
    <button class="btn ${style || "btn-secondary"}" style="padding:4px 12px;font-size:0.78rem;">${label}</button>
  </form>`;
}

function renderDashboard(res) {
  const inscriptions = db.findAll("inscriptions").reverse();
  const mentors = db.findAll("mentors").reverse();
  const mentores = db.findAll("mentores").reverse();
  const offres = db.findAll("offres").reverse();
  const partenaires = db.findAll("partenaires").reverse();

  const tableInscriptions = tableHtml(inscriptions, [
    { key: "nom", label: "Nom" },
    { key: "email", label: "Email" },
    { key: "ville", label: "Ville" },
    { key: "axe", label: "Axe", render: (r) => AXES_LABELS_FR[r.axe] || r.axe },
    { key: "statut", label: "Statut" },
  ]);

  const tableMentors = tableHtml(
    mentors,
    [
      { key: "nom", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "villeOrigine", label: "Ville d'origine" },
      { key: "axe", label: "Axe", render: (r) => AXES_LABELS_FR[r.axe] || r.axe },
      { key: "statut", label: "Statut", render: (r) => `<span class="badge">${r.statut}</span>` },
    ],
    (r) => (r.statut !== "valide" ? actionForm(`/admin/mentors/${r.id}/valider`, "Valider") : "—")
  );

  const tableMentores = tableHtml(
    mentores,
    [
      { key: "nom", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "axe", label: "Axe", render: (r) => AXES_LABELS_FR[r.axe] || r.axe },
      { key: "statut", label: "Statut", render: (r) => `<span class="badge">${r.statut}</span>` },
    ],
    (r) => (r.statut !== "jumele" ? actionForm(`/admin/mentores/${r.id}/jumele`, "Marquer jumele") : "—")
  );

  const tableOffres = tableHtml(
    offres,
    [
      { key: "poste", label: "Poste" },
      { key: "entreprise", label: "Organisation" },
      { key: "type", label: "Type" },
      { key: "statut", label: "Statut", render: (r) => `<span class="badge">${r.statut}</span>` },
    ],
    (r) =>
      r.statut === "publiee"
        ? actionForm(`/admin/offres/${r.id}/rejeter`, "Depublier", "btn-outline")
        : `${actionForm(`/admin/offres/${r.id}/publier`, "Publier")}${actionForm(`/admin/offres/${r.id}/rejeter`, "Rejeter", "btn-outline")}`
  );

  const tablePartenaires = tableHtml(partenaires, [
    { key: "organisation", label: "Organisation" },
    { key: "contact", label: "Contact" },
    { key: "email", label: "Email" },
    { key: "palier", label: "Palier" },
  ]);

  send(
    res,
    200,
    render("admin-dashboard", {
      title: "Tableau de bord",
      countInscriptions: inscriptions.length,
      countMentors: mentors.length,
      countMentores: mentores.length,
      countOffres: offres.length,
      countPartenaires: partenaires.length,
      tableInscriptions,
      tableMentors,
      tableMentores,
      tableOffres,
      tablePartenaires,
    })
  );
}

// ---------------------------------------------------------------------
// Fichiers statiques (CSS, JS, images)
// ---------------------------------------------------------------------

const PUBLIC_DIR = path.join(__dirname, "public");
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function tryServeStatic(req, res) {
  const parsed = url.parse(req.url);
  if (!parsed.pathname.startsWith("/css/") && !parsed.pathname.startsWith("/js/") && !parsed.pathname.startsWith("/images/")) return false;
  const filePath = path.join(PUBLIC_DIR, parsed.pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) return false; // anti path traversal
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) return false;
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

// ---------------------------------------------------------------------
// Serveur HTTP
// ---------------------------------------------------------------------

function send(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function notFound(res, req) {
  const lang = getLangFromReq(req);
  const L = i18n.dict(lang);
  send(res, 404, render("home", {
    title: L.hero_title,
    ...commonVars(lang, req),
    heroTitle: L.hero_title, heroTagline: L.hero_tagline, heroLead: L.hero_lead, heroMeta: L.hero_meta, heroTarget: L.hero_target,
    btnInscription: L.btn_inscription, btnPartenaire: L.btn_partenaire, galleryCaption: L.gallery_caption,
    statsTitle: L.stats_title, statsSub: L.stats_sub,
    stat1Num: L.stat1_num, stat1Label: L.stat1_label, stat2Num: L.stat2_num, stat2Label: L.stat2_label,
    stat3Num: L.stat3_num, stat3Label: L.stat3_label, stat4Num: L.stat4_num, stat4Label: L.stat4_label,
    axesTitle: L.axes_title, axesSub: L.axes_sub, axesCardsHtml: axesCardsHtml(lang), btnVoirAxes: L.btn_voir_axes,
    retombeesTitle: L.retombees_title,
    tierRezoTitle: L.tier_rezo_title, tierRezoDesc: L.tier_rezo_desc,
    tierMurTitle: L.tier_mur_title, tierMurDesc: L.tier_mur_desc, linkVoirOffres: L.link_voir_offres,
    tierPrixTitle: L.tier_prix_title, tierPrixDesc: L.tier_prix_desc,
  }));
}

const server = http.createServer(async (req, res) => {
  try {
    if (tryServeStatic(req, res)) return;

    req._cookies = auth.parseCookies(req);

    const parsed = url.parse(req.url);
    const match = router.match(req.method, parsed.pathname);
    if (!match) return notFound(res, req);

    await match.handler(req, res, match.params);
  } catch (err) {
    console.error("Erreur serveur:", err);
    send(res, 500, "<h1>Erreur serveur</h1><p>Une erreur est survenue. Merci de reessayer.</p>");
  }
});

function warnIfDefaultSecrets() {
  const usingDefaultPassword = !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === "konekte2026";
  const usingDefaultSecret = !process.env.SESSION_SECRET || process.env.SESSION_SECRET === "change-moi-en-production";

  if (!usingDefaultPassword && !usingDefaultSecret) return;

  const line = "!".repeat(70);
  console.warn(`\n${line}`);
  console.warn("!! ATTENTION SECURITE — valeurs par defaut encore utilisees      !!");
  if (usingDefaultPassword) {
    console.warn("!! - ADMIN_PASSWORD n'est pas defini (ou vaut la valeur par     !!");
    console.warn("!!   defaut). N'importe qui connaissant le code source peut     !!");
    console.warn("!!   deviner le mot de passe de l'espace organisateurs (/admin).!!");
  }
  if (usingDefaultSecret) {
    console.warn("!! - SESSION_SECRET n'est pas defini (ou vaut la valeur par     !!");
    console.warn("!!   defaut). Les sessions admin peuvent etre falsifiees.       !!");
  }
  console.warn("!!                                                                !!");
  console.warn("!! Corriger avant toute mise en ligne publique : copier          !!");
  console.warn("!! .env.example vers .env et definir des valeurs fortes.         !!");
  console.warn(`${line}\n`);
}

db.ensureDataDir();
warnIfDefaultSecrets();
server.listen(PORT, () => {
  console.log(`Konekte pou Bati — serveur demarre sur http://localhost:${PORT}`);
  console.log(`Espace organisateurs : http://localhost:${PORT}/admin`);
});
