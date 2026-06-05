# Rapport de projet - Gestion academique

## 1. Presentation generale

Le projet est une application web de gestion academique developpee avec React pour le frontend et Node.js/Express pour le backend. L'objectif est de centraliser la gestion des etudiants, matieres, unites d'enseignement, diplomes, professeurs, notes, statistiques et notifications, avec une authentification securisee et des droits d'acces par role.

L'application est organisee autour de quatre profils principaux : ADMIN, SCOLARITE, STUDENT et TEACHER. Chaque profil accede uniquement aux fonctionnalites qui correspondent a son role.

## 2. Architecture technique

Frontend :
- React avec Vite
- Material UI pour l'interface, le theming clair/sombre et le responsive
- Formulaires controles avec validations obligatoires
- Persistance des donnees via l'API backend

Backend :
- Node.js avec Express
- MongoDB avec Mongoose
- Authentification JWT
- OAuth 2 / SSO Google
- OTP optionnel
- Services email et SMS pour les notifications

Deploiement :
- Dockerfile frontend
- Dockerfile backend
- docker-compose.yml pour lancer l'application complete avec MongoDB

## 3. Fonctionnalites implementees

### Gestion academique

L'application permet de gerer les entites principales du domaine academique :

- Etudiants : creation, edition, suppression, photo, adresse, email, telephone, niveau, filiere, classe, groupe et double diplomation.
- Matieres : description, syllabus, prerequis, professeur responsable.
- Unites d'enseignement : regroupement de plusieurs matieres, professeur referent, promotion et regles de validation.
- Diplomes : inscription des etudiants, validation selon les UE, prise en compte de la double diplomation.
- Professeurs : creation de comptes, affectation aux matieres et UE.
- Notes : saisie, edition, consultation, regroupement par UE, moyenne et validation.

### Regles metier

Une UE regroupe plusieurs matieres. Les matieres d'une meme UE peuvent se compenser entre elles, sauf si l'etudiant obtient une note eliminatoire dans une matiere. Un diplome est valide uniquement si toutes les UE associees sont validees.

### Authentification et roles

L'acces a l'application est protege par authentification. Les roles sont les suivants :

- ADMIN : acces complet a toutes les donnees et gestion des comptes.
- SCOLARITE : gestion administrative des etudiants, cours et notes.
- STUDENT : consultation de ses propres notes, statistiques et modification de son profil.
- TEACHER : consultation et saisie des notes uniquement pour les matieres/UE qui lui sont affectees.

Le SSO Google permet a un utilisateur de se connecter avec son compte Google. Si l'email Google correspond a l'email d'un etudiant ou professeur existant dans la base, l'utilisateur retrouve ses donnees et ses notes.

### OTP

Le champ OTP est utilise uniquement si l'OTP est active pour le compte. Dans ce cas, apres saisie de l'email et du mot de passe, l'utilisateur doit saisir le code temporaire fourni par le mecanisme OTP.

### Notifications

Les notifications sont ciblees par utilisateur ou envoyees en mode general lorsque le contexte le justifie. Elles apparaissent dans la barre de notifications et dans l'historique. Le compteur rouge disparait lorsque l'utilisateur ouvre la barre et revient seulement pour les nouvelles notifications.

Les notifications peuvent aussi etre envoyees par email ou SMS dans certains cas importants :

- creation d'un compte etudiant ou professeur ;
- notification administrative importante ;
- message cible envoye a un etudiant ou a un professeur.

Le numero de telephone est optionnel. Si l'utilisateur n'a pas renseigne de numero, l'application garde la notification sur la plateforme et n'interrompt pas le traitement.

### Statistiques et exports

L'application propose des dashboards adaptes aux roles :

- ADMIN : vision globale des etudiants, matieres, UE, diplomes, professeurs et notes.
- SCOLARITE : statistiques sur les etudiants, cours et notes.
- STUDENT : moyenne personnelle, progression et validation des UE.

Des exports CSV et une generation de bulletin sont disponibles pour exploiter les donnees.

## 4. Scenarios de validation

### Scenario 1 - Connexion administrateur

1. L'administrateur ouvre l'application.
2. Il se connecte avec son email et son mot de passe.
3. Il accede au tableau de bord global.
4. Il peut gerer les comptes, les etudiants, les professeurs, les matieres, les UE, les diplomes, les notes et les notifications.

Capture attendue : `rapport/screenshots/02_admin_dashboard.png`

### Scenario 2 - Creation d'un etudiant

1. L'administrateur ou la scolarite ouvre le formulaire etudiant.
2. Il renseigne les champs obligatoires : nom, prenom, email et informations principales.
3. Il peut ajouter une photo, une adresse, un telephone international, un niveau, une filiere, une classe, un groupe et une double diplomation.
4. Le compte est cree et un email est envoye a l'etudiant avec ses identifiants temporaires.
5. Les donnees restent disponibles apres rafraichissement de la page.

Capture attendue : `rapport/screenshots/03_admin_etudiants.png`

### Scenario 3 - Saisie des notes

1. L'administrateur, la scolarite ou le professeur autorise selectionne un etudiant.
2. Il choisit la matiere concernee.
3. Il saisit la note.
4. Les notes sont visibles par UE et les moyennes sont recalculees.
5. L'etudiant retrouve la note dans son espace personnel.

Capture attendue : `rapport/screenshots/04_scolarite_notes.png`

### Scenario 4 - Connexion etudiant par Google

1. L'etudiant clique sur le bouton Google.
2. Il utilise le meme email que celui enregistre dans son profil etudiant.
3. Apres connexion, il accede uniquement a ses donnees.
4. Il consulte ses notes, ses statistiques et peut modifier son profil.

Capture attendue : `rapport/screenshots/06_student_notes.png`

### Scenario 5 - Espace professeur

1. Le professeur se connecte.
2. Il voit uniquement les UE et matieres qui lui sont affectees.
3. Il peut consulter les etudiants concernes.
4. Il peut saisir ou consulter les notes des matieres qu'il enseigne.

Capture attendue : `rapport/screenshots/05_teacher_espace.png`

### Scenario 6 - Notification ciblee

1. L'administrateur ou la scolarite cree une notification.
2. Il selectionne un destinataire dans la liste afin d'eviter les erreurs de saisie.
3. La notification apparait uniquement chez le destinataire concerne.
4. Si email ou SMS est active, le message est aussi envoye sur le canal choisi.
5. Le statut passe de queued a sent/delivered apres traitement.

Captures attendues :
- `rapport/screenshots/09_notification_creation.png`
- `rapport/screenshots/07_notifications_barre.png`
- `rapport/screenshots/08_notifications_historique.png`
- `rapport/screenshots/14_email_notification.jpeg`
- `rapport/screenshots/15_sms_notification.jpg`

### Scenario 7 - Lancement Docker

1. Le correcteur copie le projet.
2. Il cree un fichier `.env` a partir de `.env.docker.example`.
3. Il lance `docker compose up --build`.
4. MongoDB, le backend et le frontend demarrent ensemble.
5. L'application devient accessible localement.

Capture attendue : `rapport/screenshots/11_docker.png`

## 5. Comptes de test

Les comptes de test sont fournis par le seed backend. Ils couvrent les roles ADMIN, SCOLARITE, STUDENT et TEACHER afin de verifier les droits d'acces.

Mot de passe commun du jeu de donnees : `password123`

| Role | Compte | Utilisation |
| --- | --- | --- |
| ADMIN | `admin@academic.com` | Gestion globale des donnees et des comptes |
| SCOLARITE | `scolarite1@academic.com` | Gestion administrative, etudiants, matieres, notes |
| TEACHER | `teacher1@academic.com` | Matieres IA et Big Data |
| TEACHER | `teacher2@academic.com` | Matieres Cloud et Securite |
| STUDENT | `student1@academic.com` | Notes MBDS avec cas de note eliminatoire |
| STUDENT | `student2@academic.com` | Etudiant MBDS avec double diplomation IA |
| STUDENT | `student3@academic.com` | Etudiant BI avec notes en UE decisionnelle |

## 6. Verification technique

Tests backend :

```bash
cd backend
npm run test:smoke
```

Build frontend :

```bash
cd frontend
npm run build
```

Lancement Docker :

```bash
docker compose up --build
```

## 7. Captures a joindre

Les captures suivantes doivent etre ajoutees pour rendre le dossier plus convaincant :

- page de connexion ;
- tableau de bord ADMIN ;
- creation d'un etudiant avec photo ;
- saisie des notes ;
- espace TEACHER ;
- espace STUDENT ;
- barre de notifications ;
- historique de notifications ;
- email de creation de compte : `rapport/screenshots/13_email_compte.jpg` ;
- email de notification : `rapport/screenshots/14_email_notification.jpeg` ;
- SMS recu : `rapport/screenshots/15_sms_notification.jpg` ;
- lancement Docker ;
- smoke tests backend.

## 8. Conclusion

Le projet couvre les fonctionnalites minimales attendues : gestion complete des entites academiques, authentification securisee, gestion des roles, statistiques, notifications, persistance des donnees, documentation, collection Postman et containerisation Docker. Les scenarios de test permettent de verifier les principaux parcours utilisateur et les droits d'acces de chaque profil.
