const admin = require("firebase-admin");
require("dotenv").config();

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
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.database();
const airportsRef = db.ref("airports");

const airports = [
  {
    icao: "KJFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    state: "NY",
    latitude: 40.6413,
    longitude: -73.7781,
  },
  {
    icao: "KLAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    state: "CA",
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    icao: "KCLT",
    name: "Charlotte Douglas International Airport",
    city: "Charlotte",
    state: "NC",
    latitude: 35.2139,
    longitude: -80.9431,
  },
  {
    icao: "KCMH",
    name: "John Glenn Columbus International Airport",
    city: "Columbus",
    state: "Ohio",
    latitude: 39.9974,
    longitude: -82.8919,
  },
  {
    icao: "KDEN",
    name: "Denver International Airport",
    city: "Denver",
    state: "Colorado",
    latitude: 39.8617,
    longitude: -104.6731,
  },
  {
    icao: "KDFW",
    name: "Dallas / Fort Worth International Airport",
    city: "Dallas",
    state: "Texas",
    latitude: 32.8975,
    longitude: -97.0378,
  },
  {
    icao: "KLAS",
    name: "McCarran International Airport",
    city: "Las Vegas",
    state: "Nevada",
    latitude: 36.0801,
    longitude: -115.1522,
  },
  {
    icao: "KMCO",
    name: "Orlando International Airport",
    city: "Orlando",
    state: "Florida",
    latitude: 28.4314,
    longitude: -81.3081,
  },
  {
    icao: "KORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    state: "Illinois",
    latitude: 41.9742,
    longitude: -87.9073,
  },
  {
    icao: "KSFO",
    name: "San Francisco International Airport",
    city: "San Francisco",
    state: "California",
    latitude: 37.6189,
    longitude: -122.375,
  },
  {
    icao: "KSTL",
    name: "St. Louis International Airport",
    city: "St. Louis",
    state: "Missouri",
    latitude: 38.7477,
    longitude: -90.3598,
  },
];

airports.forEach((airport) => {
  airportsRef.child(airport.icao).set(
    {
      name: airport.name,
      icao: airport.icao,
      city: airport.city,
      state: airport.state,
      latitude: airport.latitude,
      longitude: airport.longitude,
    },
    (error) => {
      if (error) {
        console.error(`Failed to set airport ${airport.icao}:`, error);
      } else {
        console.log(`Successfully set airport ${airport.icao}`);
      }
    }
  );
});

// Close the connection to the database after populating
airportsRef.once("value", () => {
  db.goOffline();
});
