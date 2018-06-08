# GFG-Webapp

### Purpose

This web-application, is to serve in conjunction with the GFG-IOS client in order to facilitate donations from users.


### Responsibilities

1. Query the Api-Football.com service and store JSON information pertaining to different leagues, teams and players on-hand, to be served to the client when necessary, this drastically
reduces the work-load of the client.

2. Route requests from the client to present them with information on players, charities, and matches depending  on which UIView the client is accessing.

3. Facilitate user authentication and CRUD operations on the Google Firestore DB when the user makes changes to their player subscription list

4. Continually check with the football api service for live match information and store live matches to be compared with the latest information in order to alert users of live goals

5. When a live goal is found, iterate over the user DB and alter the appropriate users, then send them push notifications on their device.

### Dependencies

1. Users should ensure they have [node js](https://nodejs.org/en/) installed

2. Users need to create a [Firebase](https://firebase.google.com/) project in order to retrieve a service account and access an instance of Firebase Firestore NoSQL DB.

        1. Create an account, navigate to the Firebase console and use the 'Add Project' dialog.

        2. Navigate to the [Service Accounts](https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk) tab in your project's settings page.

        3. Click the 'Generate New Private Key' button at the bottom of the Firebase Admin SDK section of the Service Accounts tab.

        4. Once the button is clicked, a JSON file containing your service account credentials will be downloaded. You'll need this file as part of the config required to run the server as detailed below.


3. Along with the Service Account info, you will need to include in a directory called 'config' at the root of the project a config.js and charities.json files that include the football service Api Key and competition IDs, urlPath to the service account and baseUrl for the football query. The charities file includes all relevant information on the charities that users can donate to.


### Installation / Running

- After cloning the repo, navigate into the root of the project and run the following command in order to install necessary packages
`npm install`

Once the packages have been installed, the following npm commands are available for you:

- Populate the /Resources directory with all of the competition, team, and player JSON information without actually launching the server:
`npm prestart`

- Clean out any information in the /Resources directory
`npm run clean`

- Populate the /Resources directory and then launch the app to listen on localhost:8080
`npm start`

- Clean out the /Resources directory, then re-populate it and launch the app to listen on localhost:8080 `npm restart`





ayyyyyyyy 