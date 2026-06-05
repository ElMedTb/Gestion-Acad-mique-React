# Checklist des captures a ajouter au rapport

Place les images dans le dossier `rapport/screenshots`. Le script `rapport/build_report.py` les integre automatiquement dans le fichier Word si les noms correspondent.

## Captures application

1. `01_connexion.png`  
   Page de connexion avec le bouton Google, le formulaire email/mot de passe et le champ OTP.

2. `02_admin_dashboard.png`  
   Tableau de bord ADMIN avec les statistiques globales.

3. `03_admin_etudiants.png`  
   Creation ou edition d'un etudiant avec photo, telephone, niveau, filiere et double diplomation.

4. `04_scolarite_notes.png`  
   Ecran SCOLARITE montrant la saisie des notes et l'association etudiant-cours.

5. `05_teacher_espace.png`  
   Espace TEACHER montrant seulement les UE/matieres affectees au professeur.

6. `06_student_notes.png`  
   Espace STUDENT montrant ses notes personnelles et ses statistiques.

7. `07_notifications_barre.png`  
   Barre de notifications ouverte, avec les dernieres notifications.

8. `08_notifications_historique.png`  
   Historique des notifications ciblees.

9. `09_notification_creation.png`  
   Creation d'une notification avec choix du destinataire et canaux email/SMS.

10. `10_profile_edit.png`  
    Modification du profil utilisateur avec photo et telephone.

11. `11_docker.png`  
    Terminal montrant `docker compose up --build` puis les services demarres.

12. `12_smoke_test.png`  
    Terminal montrant `npm run test:smoke` avec les tests PASS.

## Captures preuves externes

13. `13_email_compte.jpg`  
    Email recu lors de la creation d'un compte etudiant/professeur avec identifiants temporaires.

14. `14_email_notification.jpeg`  
    Email recu pour une notification importante.

15. `15_sms_notification.jpg`  
    SMS recu sur telephone avec le message Twilio.

## Conseil rapide

Pour les captures SMS et email, masque les secrets inutiles : tokens, mots de passe apres lecture, identifiants Twilio, cles SMTP. L'adresse email et le numero de telephone peuvent etre partiellement visibles si tu veux prouver l'envoi.
