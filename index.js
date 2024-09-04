const express = require("express");

const app = express();

//route handler
app.get("/", (req, res) => {
  res.send("Hi there!");
});

//listener
app.listen(3000, () => {
  console.log("Listening on port 3000...");
});