# youtube-thumbnail

Outil qui récupère les miniatures des vidéos d'une chaîne YouTube (2021).

À partir de l'identifiant d'une chaîne, le serveur retrouve son adresse via Social Blade, ouvre la page des vidéos dans Chrome sans interface (Puppeteer, avec le module « stealth ») et enregistre les miniatures dans une petite base locale (NeDB, `database.db`). Une interface React les affiche.

## Lancer

```bash
npm install
node index.js      # serveur sur http://localhost:3000
npm start          # interface React (Create React App)
```

## Fichiers

- `index.js` : serveur Express, récupération des miniatures, base NeDB
- `src/` : interface React
- `functions/`, `netlify.toml` : essai de déploiement en fonctions Netlify

Le scraping dépend de la structure des pages de YouTube et de Social Blade de 2021 : il a probablement besoin d'être mis à jour.
