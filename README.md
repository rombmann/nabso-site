# NABSO, barbier à Lausanne

Site vitrine de NABSO (Rue du Maupas 16, 1004 Lausanne). Pendant le défilement, le visiteur pilote un vol de drone FPV filmé en un seul plan : on part de la rue, on entre dans le salon et on finit installé dans le fauteuil. La suite de la page présente les tarifs, les vraies photos du salon, les avis Google, l'espace enfants, les horaires et l'accès.

## Structure

```
index.html          la page (tout le texte est ici)
css/site.css        le design (couleurs et polices en haut du fichier)
js/main.js          le film piloté par le scroll + animations
assets/world/       le film découpé en 4 chapitres (desktop + mobile + images de départ)
assets/photos/      les vraies photos du salon (Google Maps)
assets/og.jpg       l'image d'aperçu pour les partages (WhatsApp, réseaux)
assets/favicon.svg  l'icône de l'onglet
```

Aucune installation n'est nécessaire : c'est du HTML, du CSS et du JavaScript sans framework.

## Voir le site en local

Le film se charge via `fetch`, il faut donc un petit serveur local (ouvrir le fichier en double-clic ne suffit pas) :

```bash
cd nabso-site
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Modifier

- **Textes, prix, horaires** : `index.html` (les horaires du badge « ouvert/fermé » sont aussi dans `js/main.js`, constante `HOURS`).
- **Couleurs et polices** : variables en haut de `css/site.css`.
- **Réservations** : liens Calendly `https://calendly.com/nabso-salon/...`.

## Mettre en ligne

Le dossier est un site statique : il peut être publié tel quel avec GitHub Pages, Netlify ou Vercel.
