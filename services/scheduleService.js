/*
    Author/s:
    Description: This is the file that is going to include the functions that will be scheduled to be called by the server 
*/

// Store pointers to the functions of the js file
module.exports = 
{
    checkLiveMatches: CheckLiveMatches,
    checkTeams: CheckTeamDatabase
};

// Check for live matches should occur every 5 mins
function CheckLiveMatches()
{
  console.log("checking live matches");
}

// Check for updating teams occurs once a day
function CheckTeamDatabase()
{
  console.log("checking team database");
}