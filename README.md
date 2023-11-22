# US-based Flight Planner Simulator for CSCI 225 Challenge Project

The challenge project's purpose is to demonstrate fundamental web development technologies and concepts such as:

- Fundamental knowledge of HTML, CSS, Javascript
- Implementing three-tier architecture and connecting to a database
  - Server: Node.js, Express.js
  - Database: Firebase

## How to Run

After cloning the repository:

1. Use command: `npm install` to install all dependencies.
2. Create a Firebase project, and acquire the API key.
3. Create a .env with the details of the Firebase API key using the provided .env.example.
4. Use command: `node populateAirports.js` to populate your database with airports.
5. Shut down the populateAirports server.
6. Use command: `node server.js` to run the application.

## Current Issues

- Layouts are not fully optimized.
