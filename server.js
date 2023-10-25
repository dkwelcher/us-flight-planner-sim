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
      res.status(500).json({ message: "FAILURE" });
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
