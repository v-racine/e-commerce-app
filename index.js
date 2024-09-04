const express = require("express");

const app = express();

//route handler
app.get("/", (req, res) => {
  res.send(`
    <div>
      <form method="POST">
        <input name="email" placeholder="email" />
        <input name="password" placeholder="password" />
        <input name= "passwordConfirmation" placeholder="password confirmation" />
        <button>Sign Up</button>
      </form>
    </div>
  `);
});

app.post("/", (req, res) => {
  res.send("Account created!!!");
});

//listener
app.listen(3000, () => {
  console.log("Listening on port 3000...");
});