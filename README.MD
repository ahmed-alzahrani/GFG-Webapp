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


### Change-log

__24/05/18__

- Added switch statement in playerService to map player positions correctly ie: G --> Goalkeeper, M --> Midfielder etc

__25/05/18__

- fixed linter errors in playerService

- used async fetch/wait in playerService to add /getPlayer/:playerID route so client could populate playerDetails page

- added a charitiesBuild and charitiesService, now hard-coded JSON info on different charities will be written to Resources on prestart, and is served at the route /charities

__31/05/18__

- fixed linter errors in teamService

- added adminService to handle communication with Firebase, currently authenticates new users and writes them to the realtime DB with empty subscription array provided a proper Post request

- added POST route for /addUser that expects to be provided a JSON object with the following fields:
              {
                email: 'userEmail',
                password: 'userPassword'
              }

- added generation of custom token when a user is created, need to fix callback structure of user creation to serve token to client
