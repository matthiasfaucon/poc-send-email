# POC CRM - SEND EMAIL

Ce projet est un POC visant à tester la faisabilité de l'envoi de mail dans un projet d'étude. Ce projet consiste en la réalisation d'un CRM.  
Ici, nous testerons simplement l'envoi de mail

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

## Structure du Projet

- `back-end/`: Contient le code du back-end développé en Node.js.
