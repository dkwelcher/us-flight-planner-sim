const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
const PORT = 8888;

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
  databaseURL: "https://us-flight-planner-sim-default-rtdb.firebaseio.com/",
});

const db = admin.database();

// CREATE AIRCRAFT

app.post("/create-aircraft", (req, res) => {
  const { id, name, range } = req.body;

  const ref = db.ref(`aircrafts/${id}`);

  ref.set({ id, name, range }, (error) => {
    if (error) {
      res.status(500).json({ message: "Failed to create aircraft" });
    } else {
      res.json({ message: "SUCCESS" });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

// SEARCH AIRCRAFT(S)

app.post("/search-aircraft", async (req, res) => {
  const query = req.body.query.trim().toLowerCase();

  if (query === "") {
    return;
  }

  let results = [];

  // Exact ID search
  const idRef = db.ref("aircrafts").child(query);
  const idSnapshot = await idRef.once("value");
  const idMatch = idSnapshot.val();
  if (idMatch) {
    results.push(idMatch);
    return res.json(results);
  }

  // Name search
  const aircraftsRef = db.ref("aircrafts");
  const snapshot = await aircraftsRef.once("value");
  snapshot.forEach((childSnapshot) => {
    const aircraft = childSnapshot.val();
    const aircraftKey = childSnapshot.key;
    if (aircraft.name && aircraft.name.toLowerCase().includes(query)) {
      results.push({
        id: aircraftKey,
        name: aircraft.name,
        range: aircraft.range,
      });
    }
  });

  res.json(results);
});

// UPDATE AIRCRAFT

app.put("/update-aircraft", (req, res) => {
  const { id, name, range } = req.body;

  if (!id || !name || !range) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const ref = db.ref(`aircrafts/${id}`);

  ref.update({ name, range }, (error) => {
    if (error) {
      res.status(500).json({ message: "Failed to update aircraft." });
    } else {
      res.json({ message: "Aircraft updated successfully." });
    }
  });
});

// DELETE AIRCRAFT

app.delete("/delete-aircraft/:id", (req, res) => {
  const aircraftId = req.params.id;

  const ref = db.ref(`aircrafts/${aircraftId}`);

  ref.remove((error) => {
    if (error) {
      res.status(500).json({ message: "Failed to delete aircraft" });
    } else {
      res.json({ message: "SUCCESS" });
    }
  });
});

// SEARCH ALL AIRCRAFTS

app.get("/aircrafts", async (req, res) => {
  const query = req.query.term ? req.query.term.trim().toLowerCase() : "";

  let results = [];

  const aircraftsRef = db.ref("aircrafts");
  const snapshot = await aircraftsRef.once("value");
  snapshot.forEach((childSnapshot) => {
    const aircraft = childSnapshot.val();
    const aircraftKey = childSnapshot.key;
    if (
      query === "" ||
      (aircraft.name && aircraft.name.toLowerCase().includes(query))
    ) {
      results.push({ id: aircraftKey, text: aircraft.name });
    }
  });

  res.json(results);
});

// SEARCH ALL AIRPORTS

app.get("/airports", async (req, res) => {
  const query = req.query.term ? req.query.term.trim().toLowerCase() : "";

  let results = [];

  const airportsRef = db.ref("airports");
  const snapshot = await airportsRef.once("value");
  snapshot.forEach((childSnapshot) => {
    const airport = childSnapshot.val();
    const airportKey = childSnapshot.key;
    if (
      query === "" ||
      (airport.name && airport.name.toLowerCase().includes(query))
    ) {
      results.push({ id: airportKey, text: airport.name });
    }
  });

  res.json(results);
});

// CREATE FLIGHT PLAN

app.post("/create-flight-plan", async (req, res) => {
  const { aircraftId, startingAirportICAO, destinationAirportICAO } = req.body;

  try {
    const airportsRef = db.ref("airports");
    const airportsSnapshot = await airportsRef.once("value");
    const airportsData = airportsSnapshot.val();

    const start = {
      ...airportsData[startingAirportICAO],
      latitude: parseFloat(airportsData[startingAirportICAO].latitude),
      longitude: parseFloat(airportsData[startingAirportICAO].longitude),
    };

    const destination = {
      ...airportsData[destinationAirportICAO],
      latitude: parseFloat(airportsData[destinationAirportICAO].latitude),
      longitude: parseFloat(airportsData[destinationAirportICAO].longitude),
    };

    const icaoToAirport = new Map(Object.entries(airportsData));

    const airplaneRef = db.ref(`aircrafts/${aircraftId}`);
    const airplaneSnapshot = await airplaneRef.once("value");
    const airplane = {
      ...airplaneSnapshot.val(),
      range: parseFloat(airplaneSnapshot.val().range),
    };

    const graph = createGraph(airportsData, airplane);
    const path = findShortestPath(
      graph,
      startingAirportICAO,
      destinationAirportICAO,
      airportsData
    );

    if (path) {
      res.json({ status: "success", data: path });
    } else {
      res.status(400).json({ status: "error", message: "No path found" });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
      error: error.message,
    });
  }
});

// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 0.621371; // Convert km to miles and return
}

function createGraph(airportsData, airplane) {
  const graph = new Map();

  for (const icao1 in airportsData) {
    graph.set(icao1, {});
    for (const icao2 in airportsData) {
      if (icao1 !== icao2) {
        const distance = calculateDistance(
          parseFloat(airportsData[icao1].latitude),
          parseFloat(airportsData[icao1].longitude),
          parseFloat(airportsData[icao2].latitude),
          parseFloat(airportsData[icao2].longitude)
        );
        if (distance <= airplane.range) {
          graph.get(icao1)[icao2] = distance;
        }
      }
    }
  }

  return graph;
}

function buildDetailedPath(path, airportsData) {
  const detailedPath = [];
  for (let i = 0; i < path.length; i++) {
    const currentICAO = path[i];

    detailedPath.push({
      ICAO: currentICAO,
      AirportName: airportsData[currentICAO].name,
      Latitude: parseFloat(airportsData[currentICAO].latitude),
      Longitude: parseFloat(airportsData[currentICAO].longitude),
    });
  }

  return detailedPath;
}

// Dijkstra's Algorithm
function findShortestPath(graph, startICAO, destICAO, airportsData) {
  const shortestDist = {};
  const prev = {};
  const unseenNodes = new Map();

  for (const airport of graph.keys()) {
    shortestDist[airport] = Infinity;
    unseenNodes.set(airport, graph.get(airport));
  }

  shortestDist[startICAO] = 0;

  while (unseenNodes.size) {
    const currAirport = [...unseenNodes.entries()].reduce((a, b) =>
      shortestDist[a[0]] < shortestDist[b[0]] ? a : b
    )[0];

    for (const neighbor in unseenNodes.get(currAirport)) {
      const alt =
        shortestDist[currAirport] + unseenNodes.get(currAirport)[neighbor];
      if (alt < shortestDist[neighbor]) {
        shortestDist[neighbor] = alt;
        prev[neighbor] = currAirport;
      }
    }
    unseenNodes.delete(currAirport);
  }

  const path = [];
  let u = destICAO;
  while (u) {
    path.unshift(u);
    u = prev[u];
  }

  return buildDetailedPath(path, airportsData);
}
