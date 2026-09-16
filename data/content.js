// Contenu structure bilingue (FR / HT) pour les axes thematiques et le
// programme de la journee. Separe des locales/*.js car ce sont des
// donnees structurees (plusieurs champs par entree), pas de simples
// libelles d'interface.

const AXES = [
  {
    id: "numerique",
    color: "#1E88E5",
    tag: { fr: "Numérique", ht: "Nimerik" },
    title: { fr: "Numérique & économie digitale", ht: "Nimerik & ekonomi dijital" },
    pourquoi: {
      fr: "Fort potentiel de contribution à distance depuis la diaspora ; secteur en forte croissance mondiale.",
      ht: "Gwo potansyèl kontribisyon a distans soti nan dyaspora a ; sektè k ap grandi anpil nan lemonn antye.",
    },
    metiers: {
      fr: "Développeur IA, data-analyst, cybersécurité, freelance tech, e-commerce.",
      ht: "Devlopè IA, analis done, sekirite enfòmatik, freelance teknoloji, komès sou entènèt.",
    },
    indicateur: {
      fr: "Taux de pénétration internet, emplois numériques créés.",
      ht: "To itilizasyon entènèt, travay nimerik ki kreye.",
    },
    imgSeed: "axis-numerique",
  },
  {
    id: "agriculture",
    color: "#4CAF50",
    tag: { fr: "Agriculture", ht: "Agrikilti" },
    title: { fr: "Agriculture, agro-transformation & agritech", ht: "Agrikilti, agwo-transfòmasyon & agritech" },
    pourquoi: {
      fr: "Dépendance élevée aux importations alimentaires ; potentiel agricole sous-exploité ; la technologie peut transformer les rendements.",
      ht: "Gwo depandans sou manje enpòte ; gwo potansyèl agrikòl ki poko byen itilize ; teknoloji ka transfòme rannman yo.",
    },
    metiers: {
      fr: "Agronome, technicien en transformation agroalimentaire, spécialiste agritech, agro-entrepreneur.",
      ht: "Agwonòm, teknisyen transfòmasyon agwoalimantè, espesyalis agritech, agwo-antreprenè.",
    },
    indicateur: {
      fr: "Réduction des importations alimentaires, hausse des rendements par hectare.",
      ht: "Diminisyon enpòtasyon manje, ogmantasyon rannman pa ekta.",
    },
    imgSeed: "axis-agriculture",
  },
  {
    id: "territoriale",
    color: "#0097B2",
    tag: { fr: "Territoire", ht: "Teritwa" },
    title: { fr: "Diplomatie territoriale & tech civique", ht: "Diplomasi teritoryal & tech sivik" },
    pourquoi: {
      fr: "Coopération décentralisée ville-à-ville ; mobilisation de la diaspora par région d'origine.",
      ht: "Kolaborasyon desantralize vil ak vil ; mobilizasyon dyaspora a selon rejyon orijin yo.",
    },
    metiers: {
      fr: "Chargé de coopération décentralisée, développeur civic-tech, fundraising diaspora.",
      ht: "Chaje kolaborasyon desantralize, devlopè tech sivik, kolekt fon nan dyaspora a.",
    },
    indicateur: {
      fr: "Nombre de partenariats villes/communes actifs.",
      ht: "Kantite patenarya vil/komin ki aktif.",
    },
    imgSeed: "axis-territoire",
  },
  {
    id: "securite",
    color: "#8B1E3F",
    tag: { fr: "Résilience", ht: "Rezistans" },
    title: { fr: "Technologie, sécurité, défense & résilience nationale", ht: "Teknoloji, sekirite, defans & rezistans nasyonal" },
    pourquoi: {
      fr: "Besoin de professionnalisation face aux défis de stabilité et de gestion de crise.",
      ht: "Bezwen pwofesyonalizasyon devan defi estabilite ak jesyon kriz.",
    },
    metiers: {
      fr: "Cybersécurité étatique, gestion de crise, protection civile, logistique humanitaire.",
      ht: "Sekirite enfòmatik leta, jesyon kriz, pwoteksyon sivil, lojistik imanitè.",
    },
    indicateur: {
      fr: "Capacité de réponse aux catastrophes, effectifs formés.",
      ht: "Kapasite reponn a katastwòf, kantite moun ki fòme.",
    },
    imgSeed: "axis-securite",
  },
];

const PROGRAMME = [
  { time: "10h00 – 10h10", title: { fr: "Ouverture officielle", ht: "Ouvèti ofisyèl" },
    detail: { fr: "Mot de bienvenue, présentation de l'esprit \"Konekte pou Bati\" et du programme de la journée.",
              ht: "Mo byenveni, prezantasyon lespri \"Konekte pou Bati\" ak pwogram jounen an." } },
  { time: "10h10 – 10h15", title: { fr: "Mindset système", ht: "Mentalite sistèm" },
    detail: { fr: "Comment les 4 axes du salon s'interconnectent dans le développement du pays.",
              ht: "Kijan 4 aks salon an konekte ansanm nan devlopman peyi a." } },
  { time: "10h15 – 10h25", title: { fr: "Nommer la réalité", ht: "Nonmen reyalite a" },
    detail: { fr: "Reconnaissance brève des difficultés réelles (insécurité, précarité) — cadrage Maslow.",
              ht: "Yon rekonesans kout sou difikilte reyèl yo (ensekirite, presarite) — kadraj Maslow." } },
  { time: "10h25 – 10h35", title: { fr: "Mantalite Ganyan", ht: "Mantalite Ganyan" },
    detail: { fr: "Les 5 principes d'une mentalité gagnante, reliés à ce que propose le salon.",
              ht: "Senk (5) prensip yon mantalite ki genyen, ki konekte ak sa salon an ofri." } },
  { time: "10h35 – 11h00", title: { fr: "Fireside chat — Les nouveaux métiers à l'ère de l'IA", ht: "Fireside chat — Nouvo metye nan epòk Entèlijans Atifisyèl la" },
    detail: { fr: "Échange sur les métiers transformés ou menacés par l'IA, et ceux qui émergent (développeur IA, prompt engineering).",
              ht: "Echanj sou metye Entèlijans Atifisyèl transfòme oswa menase, ak nouvo metye k ap parèt (devlopè IA, \"prompt engineering\")." } },
  { time: "11h00 – 11h50", title: { fr: "Zoom métiers — Numérique & économie digitale", ht: "Zoom Metye — Nimerik & ekonomi dijital" },
    detail: { fr: "Développeur IA, data-analyst, cybersécurité : compétences clés à acquérir, plateformes de formation accessibles à distance, débouchés freelance et e-commerce.",
              ht: "Devlopè IA, analis done, sekirite enfòmatik: konpetans kle pou aprann, platfòm fòmasyon aksesib a distans, opòtinite nan freelance ak komès sou entènèt." } },
  { time: "11h50 – 12h40", title: { fr: "Zoom métiers — Agriculture, agro-transformation & agritech", ht: "Zoom Metye — Agrikilti, agwo-transfòmasyon & agritech" },
    detail: { fr: "Agronome, agritech (drones, capteurs IoT) : comment moderniser une exploitation, filières porteuses, formations disponibles en Haïti.",
              ht: "Agwonòm, agritech (dwòn, kapte IoT): kijan pou modènize yon eksplwatasyon, filyè pwomèt, fòmasyon ki disponib an Ayiti." } },
  { time: "12h40 – 12h50", title: { fr: "Pause", ht: "Poz" }, detail: { fr: "Courte pause / animation sur les réseaux sociaux.", ht: "Yon ti poz / animasyon sou rezo sosyal yo." } },
  { time: "12h50 – 13h40", title: { fr: "Zoom métiers — Diplomatie territoriale & tech civique", ht: "Zoom Metye — Diplomasi teritoryal & tech sivik" },
    detail: { fr: "Coopération décentralisée, civic-tech : comment initier un partenariat ville-à-ville, mobiliser la diaspora de sa région d'origine.",
              ht: "Kolaborasyon desantralize, tech sivik: kijan pou kòmanse yon patenarya vil ak vil, mobilize dyaspora rejyon orijin ou." } },
  { time: "13h40 – 14h40", title: { fr: "Zoom métiers — Technologie, sécurité, défense & résilience", ht: "Zoom Metye — Teknoloji, sekirite, defans & rezistans" },
    detail: { fr: "Cybersécurité étatique, gestion de crise : parcours de formation, débouchés dans les institutions publiques et privées.",
              ht: "Sekirite enfòmatik leta, jesyon kriz: chemen fòmasyon, opòtinite nan enstitisyon piblik ak prive." } },
  { time: "14h40 – 14h45", title: { fr: "Pause", ht: "Poz" }, detail: { fr: "Courte pause / animation sur les réseaux sociaux.", ht: "Yon ti poz / animasyon sou rezo sosyal yo." } },
  { time: "14h45 – 15h00", title: { fr: "Appel à l'action territoriale", ht: "Apèl pou Aksyon Teritoryal" },
    detail: { fr: "Formulation de propositions concrètes sur les opportunités de la diplomatie territoriale et la mobilisation de la diaspora, à l'attention de l'ensemble des acteurs et décideurs à venir.",
              ht: "Fòmilasyon pwopozisyon konkrè sou opòtinite diplomasi teritoryal ak mobilizasyon dyaspora a, pou tout aktè ak deside k ap vini yo." } },
  { time: "15h00 – 15h30", title: { fr: "Numérique et santé mentale", ht: "Nimerik ak sante mantal" },
    detail: { fr: "Usage des écrans et réseaux sociaux, pression de la performance en ligne, gestion du stress chez les jeunes connectés.",
              ht: "Itilizasyon ekran ak rezo sosyal, presyon pèfòmans sou entènèt, jesyon estrès." } },
  { time: "15h30 – 15h35", title: { fr: "Pause", ht: "Poz" }, detail: { fr: "Courte pause / animation sur les réseaux sociaux.", ht: "Yon ti poz / animasyon sou rezo sosyal yo." } },
  { time: "15h35 – 15h55", title: { fr: "Mur des opportunités", ht: "Mi Opòtinite yo" },
    detail: { fr: "Diffusion en direct d'offres réelles de stage/emploi (Haïti et diaspora), avec liens pour postuler séance tenante.",
              ht: "Difizyon an dirèk òf reyèl staj/travay (Ayiti ak dyaspora), ak lyen pou aplike sou plas." } },
  { time: "15h55 – 16h00", title: { fr: "Clôture", ht: "Klotti" },
    detail: { fr: "Mots de clôture.", ht: "Mo klotti yo." } },
];

module.exports = { AXES, PROGRAMME };
