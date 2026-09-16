# Konekte pou Bati — Système Node.js

Système web pour le Salon des métiers d'avenir **Konekte pou Bati** : vitrine, programme d'orientation vers l'emploi et le mentorat, avec un espace organisateurs pour la modération.

Trois briques, comme discuté dans la note conceptuelle :

1. **Vitrine** — accueil, programme, présentation des 4 axes, inscription des jeunes.
2. **Rezo Konekte** — formulaires mentors et jeunes en demande de mentorat, plus l'Appel à l'action territoriale.
3. **Mur des opportunités** — publication et affichage d'offres de stage/emploi réelles, avec modération par l'équipe organisatrice.

## Pourquoi zéro dépendance externe ?

Ce projet n'utilise **que les modules natifs de Node.js** (`http`, `fs`, `crypto`, `querystring`) — pas d'Express, pas de base de données à installer. Deux avantages concrets pour ce projet :

- **Aucune installation complexe** : `node server.js` suffit, sur n'importe quel serveur ou hébergement supportant Node.js.
- **Aucun risque de dépendance cassée** dans le temps (paquets npm abandonnés, failles de sécurité dans des sous-dépendances).

La contrepartie : le stockage des données se fait dans de simples fichiers JSON (dossier `data/`), suffisant pour le volume attendu d'une ou deux éditions du salon. Si le système grossit significativement (Phase 3/4 de la feuille de route plateforme évoquée dans la note conceptuelle), il faudra migrer vers une vraie base de données (PostgreSQL, MongoDB...).

## Démarrage rapide

```bash
# 1. Avoir Node.js 18 ou plus récent installé
node --version

# 2. Copier la configuration
cp .env.example .env
# puis éditer .env : changer ADMIN_PASSWORD et SESSION_SECRET
# générer un SESSION_SECRET aléatoire avec :
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Démarrer le serveur
npm start
# ou directement :
node server.js
```

Le site est alors accessible sur **http://localhost:3000**.

## Structure du projet

```
konekte-platform/
├── server.js              # Point d'entrée : routes et logique métier
├── lib/
│   ├── router.js           # Routeur minimaliste (méthode + chemin + :params)
│   ├── db.js                # Stockage JSON (inscriptions, mentors, offres...)
│   ├── auth.js               # Session admin par cookie signé (HMAC)
│   ├── render.js              # Moteur de gabarits HTML (layout + placeholders)
│   └── body.js                 # Lecture des formulaires POST
├── views/                  # Gabarits HTML (une page = un fichier)
├── public/css/style.css   # Feuille de style (identité visuelle du salon)
├── data/                    # Fichiers JSON générés au premier lancement
├── .env.example
└── package.json
```

## Sécurité : ne pas garder les valeurs par défaut

Le serveur affiche un avertissement bien visible dans les logs au démarrage tant que `ADMIN_PASSWORD` et/ou `SESSION_SECRET` n'ont pas été définis avec des valeurs propres à vous (voir `.env.example`). Ces valeurs par défaut sont présentes dans le code source public — les garder telles quelles en production permettrait à quiconque de deviner le mot de passe de l'espace organisateurs ou de falsifier une session admin. Corriger avant toute mise en ligne accessible publiquement.

## Bilinguisme (français / créole)

Le site public est disponible en français et en créole haïtien, via un sélecteur **FR / HT** dans le menu (le choix est mémorisé par cookie, pas besoin de compte).

- Les textes d'interface courts (navigation, boutons, formulaires) sont dans `locales/fr.js` et `locales/ht.js` — une clé, deux traductions.
- Le contenu structuré plus long (les 4 axes, le programme de la journée) est dans `data/content.js`, avec un champ `{fr, ht}` pour chaque texte.
- **L'espace organisateurs (`/admin`) reste en français uniquement** — c'est un outil interne pour l'équipe, pas une page destinée aux jeunes ou aux partenaires. Si vous souhaitez le traduire aussi, les mêmes fichiers `locales/*.js` peuvent être étendus.

### Ajouter ou corriger une traduction
Ouvrir `locales/ht.js` (ou `fr.js`), trouver la clé concernée, modifier le texte. Pas besoin de toucher au code — le changement s'applique au prochain rechargement de page.

### Ajouter une nouvelle langue
1. Dupliquer `locales/fr.js` en `locales/xx.js` (xx = code de la langue) et traduire chaque valeur
2. Dans `lib/i18n.js`, ajouter `xx` à la liste `SUPPORTED` et au `require` en haut du fichier
3. Ajouter un lien `/lang/xx` dans le sélecteur de langue de `views/layout.html`

## Diaporama du hero et logo

- Le logo fourni est intégré dans `public/images/` (icône transparente, favicon). Toute la palette de couleurs du site (`public/css/style.css`) a été calée sur les couleurs exactes du logo.
- Le hero de la page d'accueil affiche un diaporama de 4 images en fondu enchaîné (`public/js/main.js`). Comme le reste des visuels du site, ce sont des images de substitution à thématique caribéenne — voir la section suivante pour les remplacer par de vraies photos.

## Personnaliser les images

Le site utilise actuellement des **images de substitution neutres** (service Lorem Picsum) pour le hero, la galerie photo et les vignettes des 4 axes — elles n'ont aucun rapport avec le salon et **doivent être remplacées avant la mise en ligne réelle**.

Pourquoi des images neutres plutôt que des photos trouvées en ligne ? Une recherche d'images ramène surtout des photos de presse ou d'organisations tierces (UNICEF, médias...) dont les droits ne permettent pas une réutilisation sur le site d'un autre événement. Les vraies images à utiliser sont les vôtres : photos de terrain, portraits des intervenants, captures d'écran d'éditions précédentes.

### Comment remplacer une image

1. Déposer votre fichier dans `public/images/` (formats `.jpg`, `.png`, `.webp` supportés)
2. Dans le fichier `views/*.html` concerné, remplacer l'URL `https://picsum.photos/seed/...` par le chemin local, par exemple :
   ```html
   <img src="/images/hero-terrain.jpg" alt="..." />
   ```

### Où se trouvent ces images dans le code

| Emplacement | Fichier | Repère à chercher |
|---|---|---|
| Image de fond du hero (page d'accueil) | `views/home.html` | `konekte-hero` |
| Galerie de 5 photos (page d'accueil) | `views/home.html` | `konekte-gallery-1` à `-5` |
| Vignette de chaque axe | `views/home.html` et `views/axes.html` | `axis-numerique`, `axis-agriculture`, `axis-territoire`, `axis-securite` |

Une fois vos vraies photos en place, supprimer aussi la ligne d'avertissement `<p class="gallery-caption">Images provisoires...</p>` dans `views/home.html`.

### Ajouter un vrai logo

Le logo actuel est un badge texte "KB" (`views/layout.html`, classe `.brand-badge`). Pour utiliser le logo pointillé (ou tout autre logo) :
1. Déposer le fichier dans `public/images/logo.png`
2. Remplacer `<span class="brand-badge">KB</span>` par `<img src="/images/logo.png" alt="Konekte pou Bati" style="height:36px;">`

## Espace organisateurs

Accessible sur `/admin`, protégé par le mot de passe défini dans `.env` (`ADMIN_PASSWORD`).

Permet de :
- Voir les inscriptions de jeunes, candidatures mentors, demandes de mentorat, contacts partenaires.
- **Valider un mentor** avant qu'il n'apparaisse comme actif.
- **Marquer un jumelage mentor-jeune** comme réalisé (le jumelage lui-même se fait manuellement pour cette première édition, comme recommandé dans la note conceptuelle — une phase pilote à échelle limitée plutôt qu'un matching automatique non testé).
- **Publier ou rejeter** une offre soumise sur le Mur des opportunités (toute offre est soumise à modération avant d'apparaître publiquement).

## Personnalisation

- **Couleurs et identité visuelle** : `public/css/style.css`, variables CSS en haut du fichier (`--navy`, `--gold`, couleurs par axe).
- **Contenu des pages** : fichiers dans `views/*.html` — placeholders `{{cle}}` (texte échappé) ou `{{{cle}}}` (HTML brut, utilisé pour les blocs générés dynamiquement).
- **Textes du programme, des axes, etc.** : directement modifiables dans `views/programme.html` et `views/axes.html`.

## Déploiement

Le serveur écoute sur le port défini par la variable `PORT` (3000 par défaut). Compatible avec la plupart des hébergeurs Node.js (Render, Railway, VPS classique avec `pm2`, etc.). Pour un déploiement durable :

1. Définir `ADMIN_PASSWORD` et `SESSION_SECRET` avec des valeurs fortes et uniques.
2. Prévoir une sauvegarde régulière du dossier `data/` (ce sont de simples fichiers JSON, faciles à copier).
3. Mettre le site derrière HTTPS (la plupart des hébergeurs le gèrent automatiquement).

## Prochaines étapes possibles (Phase 2+)

Comme évoqué dans la note conceptuelle, ce système est pensé comme un **MVP volontairement simple** pour cette première édition. Évolutions envisageables si le besoin se confirme :
- Migration vers une vraie base de données si le volume dépasse quelques milliers d'enregistrements.
- Emails automatiques de confirmation (actuellement, les organisateurs doivent contacter manuellement les inscrits).
- Filtrage et recherche des offres sur le Mur des opportunités par axe/ville.
- Matching semi-automatique pour Rezo Konekte (par axe et ville d'origine).
