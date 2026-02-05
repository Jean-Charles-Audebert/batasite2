# Batala La Rochelle – Administration et Site

Ce dépôt contient le code source du site officiel de Batala La Rochelle ([https://batala-lr.com](https://batala-lr.com)) ainsi que son interface d'administration sécurisée.

## À quoi sert ce dépôt ?
- **Site public** : Présente l'association, les événements, la galerie photo/vidéo, et les informations de contact.
- **Interface d'administration** : Permet de gérer dynamiquement le contenu du site (sections, médias, événements, etc.) via une interface web sécurisée.

## Fonctionnement de la partie admin
- Accès réservé aux administrateurs via une page de connexion.
- Gestion des sections éditables du site (présentation, agenda, galerie, etc.).
- Ajout, modification, suppression et réorganisation des médias et événements.
- Possibilité de réinitialiser son mot de passe par email.
- Toutes les actions sensibles nécessitent une authentification.

## CI/CD et déploiement
- Le projet est découpé en deux parties :
  - **back/** : API Node.js (Express) + PostgreSQL
  - **front/** : Application React (Vite)
- Le déploiement en production s'effectue via Docker Compose sur le serveur OVH.
- La CI/CD automatise les étapes suivantes :
  - Build des images Docker (front et back)
  - Push des images sur le registre privé
  - Déploiement automatique sur le serveur de production
- Les variables d'environnement et secrets sont gérés via des fichiers `.env` non inclus dans le dépôt.

---

Pour toute question contactez l'équipe Batala La Rochelle via le site officiel.
Pour toute question liée au code ou au développement, contactez moi.