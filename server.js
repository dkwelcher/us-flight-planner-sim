const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8888;

app.use(cors());

app.use(express.json());

app.post("/create-aircraft", (req, res) => {
  const { id, name, range } = req.body;

  console.log(req.body);

  res.json({ message: "Aircraft created successfully!" });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
