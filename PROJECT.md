Project Guidance for Copilot
Conception générale

Architecture Back / Front séparée :

/back : Node.js + PostgreSQL

/front : React + Vite

Base de données : PostgreSQL

Authentification : JWT + Refresh Token, cookie HttpOnly

Uploads :

/back/uploads : médias utilisateurs

Fonts et médias statiques du site restent dans le front

Contenu modifiable par l’utilisateur :

Sections : Hero (image + logo), Présentation, Mundo, Évènements, Galerie

Drag & drop pour les cards et les images

Media :

Table media pour les fichiers utilisateur (images, vidéos, fonts)

Liens YouTube stockés en src dans sections “Gallery”

JSON initial (data.json) pour seed de la DB

Back-end

src/config/db.js : configuration et seed de la DB
src/config/data.json : contenu initial du site (modifiable via l’API

uploads/content : médias modifiables par l’utilisateur

Back-end fonctionnalités
1. Authentification

Inscription / login

JWT + Refresh token

Cookie HttpOnly

Middleware auth.js pour protéger routes

Vérification rôle (admin / superadmin / user)

2. API Site

GET /site → récupérer le contenu du site

PATCH /site/sections/:id → modifier section spécifique

PATCH /site/events/:id → modifier, ajouter, supprimer un événement

PATCH /site/gallery/:id → modifier, ajouter, supprimer image ou vidéo

3. API Media

POST /media → upload fichier

GET /media/:id → récupérer fichier

DELETE /media/:id → supprimer fichier

Stockage minimaliste dans /uploads, nom de fichier unique

Front-end
Structure minimale /front
/front
 ├─ src/
 │   ├─ App.jsx
 │   ├─ main.jsx
 │   ├─ pages/
 │   ├─ components/
 │   ├─ hooks/
 │   └─ services/   # appels API
 └─ vite.config.js

 les fichiers statiques (fonts, médias par défaut) dans /public

Front-end fonctionnalités

Authentification (login form → JWT via cookie HttpOnly)

Dashboard minimaliste pour gérer sections éditables

Drag & drop :

Réordonner événements

Réordonner images galerie

Upload media → API /media

Lecture des données depuis /site

Règles Copilot

Minimaliste et maintenable : pas de dépendances inutiles.

Respecter conception actuelle (JSON + DB existants)

Les sections non éditables par l’utilisateur restent statiques.

Toute nouvelle fonctionnalité doit passer par :

Back : controller / route / middleware

Front : service API + composant si nécessaire

Respecter standard JS/React moderne (hooks, functional components)

Sécuriser toutes les routes sensibles (auth / admin)

Utiliser async/await, pas de callbacks, pas de code spaghetti