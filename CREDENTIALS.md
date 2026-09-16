# Identifiants générés pour Konekte pou Bati

Ce fichier récapitule les secrets déjà configurés dans `.env`, pour que vous les ayez sous la main sans devoir ouvrir le code.

⚠️ **Gardez ce fichier privé.** Ne le partagez pas publiquement, ne le committez pas dans un dépôt Git accessible à tous, et supprimez-le une fois les valeurs notées en lieu sûr (gestionnaire de mots de passe, etc.).

## Accès à l'espace organisateurs

- URL : `http://votre-domaine/admin` (ou `http://localhost:3000/admin` en local)
- Mot de passe : `4gZBp4hhg5oOjSP`

## Clé technique (ne pas partager, ne concerne pas la connexion humaine)

- `SESSION_SECRET` : `8087fb41cc80dc7f398bd45b45c2cdb33223468df132ea56c08f844b92f91d43`
  Cette clé sert uniquement à signer les cookies de session en interne — vous n'avez jamais besoin de la saisir vous-même.

## Pour changer le mot de passe plus tard

1. Ouvrir le fichier `.env` à la racine du projet
2. Remplacer la valeur après `ADMIN_PASSWORD=`
3. Redémarrer le serveur (`node server.js`)

## Si vous déployez ce projet sur un vrai serveur en ligne

Il est recommandé de générer un **nouveau** `SESSION_SECRET` propre à cet environnement plutôt que de réutiliser celui-ci (qui a été généré dans un environnement de développement). Commande pour en générer un nouveau :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
