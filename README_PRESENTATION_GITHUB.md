# Gestion academique - React / Node.js

Application web de gestion academique developpee avec React, Node.js, Express et MongoDB. Le projet permet de gerer les etudiants, matieres, unites d'enseignement, diplomes, professeurs, notes, statistiques et notifications avec une authentification securisee et des droits d'acces par role.

## Objectif

L'objectif du projet est de centraliser la gestion pedagogique et administrative d'une formation academique. L'application couvre les besoins principaux d'un service de scolarite, des enseignants, des etudiants et de l'administration.

## Technologies utilisees

- Frontend : React, Vite, Material UI
- Backend : Node.js, Express
- Base de donnees : MongoDB avec Mongoose
- Authentification : JWT, Google OAuth 2, OTP
- Notifications : plateforme, email SMTP, SMS Twilio
- Tests : smoke tests backend
- Containerisation : Docker et Docker Compose

## Fonctionnalites principales

### Gestion academique

- Gestion complete des etudiants
- Ajout de photo, adresse, telephone, niveau, classe, filiere et groupe
- Gestion des matieres avec description, syllabus et prerequis
- Gestion des UE avec matieres associees, professeur referent et promotion
- Gestion des diplomes et de la double diplomation
- Gestion des professeurs et de leurs matieres
- Association etudiant-cours

### Notes et validation

- Saisie, edition et suppression des notes
- Notes regroupees par UE
- Moyennes par UE
- Moyenne generale
- Regle de note eliminatoire
- Validation des UE
- Validation du diplome selon les UE validees
- Export CSV
- Generation de bulletin imprimable

### Authentification et securite

- Connexion classique email / mot de passe
- Authentification Google SSO
- OTP optionnel
- Validation de compte par email
- Mot de passe temporaire a changer lors de l'activation
- Droits d'acces selon le role

Roles disponibles :

- ADMIN : acces complet
- SCOLARITE : gestion administrative des etudiants, matieres et notes
- STUDENT : consultation de ses donnees personnelles
- TEACHER : gestion des matieres et UE affectees

### Notifications

- Notifications ciblees par utilisateur
- Notifications generales
- Historique des notifications
- Badge lu / non lu
- Envoi email pour les cas importants
- Envoi SMS via Twilio si le numero est renseigne
- Gestion propre du cas ou le telephone est absent

## Lancement avec Docker

Creer le fichier `.env` :

```powershell
copy .env.docker.example .env
```

Lancer l'application :

```powershell
docker compose up -d --build
```

Importer les donnees de test :

```powershell
docker compose exec backend npm run seed
```

Verifier l'API :

```powershell
Invoke-WebRequest -Uri http://localhost/api/health -UseBasicParsing
```

Ouvrir l'application :

```text
http://localhost
```

## Comptes de test

Mot de passe :

```text
password123
```

Comptes :

```text
admin@academic.com
scolarite1@academic.com
teacher1@academic.com
teacher2@academic.com
student1@academic.com
student2@academic.com
student3@academic.com
```

## Tests backend

```powershell
cd backend
npm install
npm run test:smoke
```

Resultat attendu :

```text
All smoke tests passed.
```

## Services externes

Les services Google, email et SMS necessitent des variables d'environnement dans `.env`.

Google SSO :

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

SMTP :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=...
```

Twilio :

```env
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

## Structure du projet

```text
backend/      API Node.js / Express
frontend/     Application React / Vite
postman/      Collection Postman
rapport/      Rapport et captures de validation
docker-compose.yml
.env.docker.example
README.md
```

## Validation

Le projet a ete teste avec :

- build frontend React ;
- smoke tests backend ;
- lancement Docker complet ;
- authentification classique ;
- Google SSO ;
- notifications email ;
- notifications SMS ;
- verification des roles et restrictions d'acces.

## Remarque

Le fichier `.env` contient des secrets locaux et ne doit pas etre pousse sur GitHub. Le fichier `.env.docker.example` sert uniquement de modele public.
