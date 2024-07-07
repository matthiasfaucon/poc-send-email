# POC CRM - SEND EMAIL

Ce projet est une preuve de concept (POC) visant à tester la faisabilité de l'envoi de mails dans le cadre d'un projet d'étude. Il s'agit de la création d'un CRM pour simplifier la gestion des associations.  
Pour cette phase, nous nous concentrerons uniquement sur la fonctionnalité d'envoi de mails.

## Installation et Utilisation

1. Cloner le dépôt : `git clone https://github.com/matthiasfaucon/poc-send-email.git`

2. Installer les dépendances du back-end :
```
cd back-end
npm install
```

## Configuration

1. Configurer le back-end :

Dans le dossier `back-end`, renommer le fichier `.env.example` en `.env` et rajouter les informations pour l'émission de mail

Pour cela, veuillez consulter la documentation de NodeMailer [ici](https://nodemailer.com/).

## Lancer le projet
Après l'installation et la configuration, vous pourrez lancer le projet avec :  
```
npm start
```

## Tester le projet
Utiliser la bibliothèque de requête Postman transmise dans le rendu pour commencer à tester l'application.

## Structure du Projet

- `back-end/`: Contient le code du back-end développé en Node.js.
