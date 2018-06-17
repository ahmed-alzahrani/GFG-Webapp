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

__01/06/18__

- call to postUser and callback structure has been fixed, the route now creates the user and writes them in the DB, but serves up their custom JWT token in response

- removed deprecated Dependency 'xmlhttprequest', all reqs now down with request-promise or fetch, would like to migrate all calls rp --> fetch

__02/06/18__

- Migrated auth to client, admin addUser route now just handles writing to Firestore NoSQL server

- added POST routes for /amISubscribed, /subscribe, and /unsubscribe to allow users to add and remove players from their subscription list

- simplified certain API endpoints ie: getPlayers -> players

__05/06/18__

- added boolean result value to response object passed back to client from

__07/06/18__

- added charityId field to subscriptions that are added to the Firestore NoSQL DB through the server

__08/06/18__

- Migrated changelog from README --> CHANGELOG

- Added Setup instructions to README in it's place

- Moved Service Account path from actual instantiating of admin in adminService to config to generalize the repo

__12/06/18__

- Added Route for /subscriptions/:userId to return a user their list of subscriptions

- Added npm quickstart command to just run `node app.js` and launch the server without going through the JSON building process as is with `npm start`

- Flattened subscriptions response to put id and data on the root level together

__13/06/18__

- Fixed linter errors in util

- Added liveTestMatches to .gitignore to allow for population of test JSON info. With this, we can test the sever's ability to query for, and act upon, live match and goal data at will without relying on waiting for live matches to resume in August.

- Changed route that adds subscriptions to a user to include the player's team ID

- Began adding /matches/:userId route that will return all matches to be played by player's the user is subscribed to for the following month

- Included teamName in subscription object

__14/06/18__

- Added `moment` dependency for gathering dates to be used in querying for matches.

- finished route for GET request on /matches/:userId that returns JSON response array of all matches for players that user is subscribed to that will be played in the next month

- added util functions for generating a URL to query matches with, which includes functionality for getting date strings for the current date, and one month in the future formatted as `dd.mm.yyyy`.

- Also added util function to sort matches by id (and thus, date) once they have been gathered from the Football api

- added getTeamIds and getMatches functionality in adminService to perform the two steps involved in querying for a user's matches, gathering the team Ids of the players subscribed to, and then querying with those for match data

__15/06/18__

- fixed minor linter errors

- added commenting into all files of codebase


__16/06/18__

- Added a route at `/playerMatches/:teamId`in order to get the matches being played in the next month for a specific player using that player's team id