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

- Added a route at `/playerMatches/:teamId` in order to get the matches being played in the next month for a specific player using that player's team id

__17/06/18__

- Added a route at `/updateSubscription` in order to allow users to change the charity associated with a subscription

__18/06/18__

- Finished implementation of update subscription to update the charity and charityId field

__20/07/18__

- Added scheduled job to re-query and re-populate stored team / competition / player info every day at 2 am (this will have to be tweaked for game days to update right after live matches)

- Added scheduled job to run every minute and check for live goals by adding live match info to Resources as it becomes available. Every minute it queries the Football API feed for live match info, and either:

      1. There is no live match information available, in which case the job resets its matches array to empty in the relevant JSON resource

      2. There is live matches available, in which case the following process occurs:
          a) Trim any matches that were being held as live, but are now no longer live in the new call
          b) Add any new matches that may not have been previously held as live to the live matches in the JSON resource
          c) Update the events to reflect any new goal events in the live matches being held

(Next I need to add the adminService logic that is triggered when a goal is scored, should loop through the user DB and query to see if a user is subscribed to the scorer and contact them / update their stats in the firebase DB)

__22/07/18__

- Added handleGoal function in AdminService that can now iterate over the userDB and determine whether each user is subscribed to the playerId passed in as the goal scorer by scheduleService whenever the live match info includes a previously untracked goal

- tweaked storage of live match events to include the playerId and current match result ensuing after a goal

- Added updateStats() func to adminService that will update the users stats info in the Firestore DB to add in the most recent goal that the user has had occur

__23/07/18__

- Reverted storage of scorers and charities to be arrays instead of nested objects

- Added calculation of topScorer and topCharity on every new goal the user's subscriptions score

- Added route to return a specific user's stats at /stats/:userId

- Added generic e-mail trigger from gmail account to notify user of a triggered goal

- Added to clean.js script so npm restart resets each user's stats but NOT subscriptions upon call to npm restart

__24/07/18__

- Encapsulated clean.js JSON/Stats cleanup in their own functions which are then called, instead of just executed at file scope

- Removed deprecated packages, including mocha/chai for testing, added jest for testing and including 'it' as a global in package.json to avoid js-standard linter errors from defining tests

- made a tests directory and added one empty test that is blank (passes)

- changed npm test to execute jest across the project

__31/07/18__

- Removed node-schedule dependency and switched responsibility over to using cron tasks

- changed style of scheduleService public API to be consistent with rest of proj

__02/08/18__

- Added trimming of player objects passed back to client as a responsibility of playerService

__09/08/18__

- Added imagePath to charity resource json file

__10/08/18__

- Added check for blank playerId from Football Api

__14/08/18__

- Tweaked export player objects that are sent to the client to allow for temporary population for the detailed players page

- Added check for blank player number on data incoming from Football API service

- Added countriesBuild and countriesService to populate /Resources/Countries/countries.json with a list of country names as taken from [rest countries](https://restcountries.eu)

- Added route at /countries to return the full list of countries to the client

__15/08/18__

- Slight tweak to how a user object is stored in Firestore

- Changed route to get a user's stats to a route that gets a user's profile, with their stats contained there within

- Added a counter for goals in each subscription

- Server now also serves goal total when passing back subscription info

__16/08/18__

- Added route for participants/uid that fetches the participants of a match that a user is subscribed to

- Changed the util that develops dates for fetching user matches to start today and end 1 month from the current date when fetching matches

__17/08/18__

- Added route for updateProfile that lets a user update their first/last names and country of residence from a picker in the client.

- Seperated app and server so that the server won't listen on a local port after testing

__20/08/18__

- Refactored all the seperate build processes into one build script

- Each build occurs and triggers the following in the callback func that is called when the JSON resource file has been written. For instances where multiple files are written (standings for multiple competitions / multiple teams), the script counts how much it has written to know whether it is complete or not. The standings count is based on the length of the array in config that houses competition IDs and the # of teams is generated by appending a teamCount int with the length of each standings object

- Added script.js to test async flow to aid in writing of tests
