const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3003, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

convertPlayerDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

convertMatchDbObjectToResponseObject = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

//API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `select * from player_details;`;
  const getPlayer = await database.all(getPlayersQuery);
  response.send(
    getPlayer.map((eachPlayer) =>
      convertPlayerDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API 2
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `select * from player_details where player_id = ${playerId};`;
  const getPlayer = await database.get(getPlayerQuery);
  response.send(convertPlayerDbObjectToResponseObject(getPlayer));
});

//API 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `update player_details set player_name = '${playerName}' where player_id = ${playerId};`;
  await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//API 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `select * from match_details where match_id = ${matchId};`;
  const matchDetails = await database.get(matchDetailsQuery);
  response.send(convertMatchDbObjectToResponseObject(matchDetails));
});

//API 5
app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerPlayedQuery = `select * from match_details natural join player_match_score where player_id = ${playerId};`;
  const getPlayerPlayedDetails = await database.all(getPlayerPlayedQuery);
  response.send(
    getPlayerPlayedDetails.map((eachMatch) => {
      return convertMatchDbObjectToResponseObject(eachMatch);
    })
  );
});

//API 6
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailsQuery = `select * from player_details natural join player_match_score where match_id = ${matchId};`;
  const getMatchDetails = await database.all(matchDetailsQuery);
  response.send(
    getMatchDetails.map((eachPlayer) => {
      return convertPlayerDbObjectToResponseObject(eachPlayer);
    })
  );
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScoreQuery = `select player_details.player_id as playerId, player_details.player_name as playerName, sum(player_match_score.score) as totalScore, sum(player_match_score.fours) as totalFours, sum(player_match_score.sixes) as totalSixes  from player_details natural join player_match_score where player_id = ${playerId};`;
  const getPlayerScore = await database.get(getPlayerScoreQuery);
  response.send(getPlayerScore);
});

module.exports = app;
