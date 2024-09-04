const express = require("express");

const app = express();

//route handler
app.get("/", (req, res) => {
  res.send(`
    <div>
      <form>
        <input placeholder="email" />
        <input placeholder="password" />
        <input placeholder="password confirmation" />
        <button>Sign Up</button>
      </form>
    </div>
  `);
});

//listener
app.listen(3000, () => {
  console.log("Listening on port 3000...");
});