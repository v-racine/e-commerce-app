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

//Middleware
const bodyParser = (req, res, next) => {
  // get access to email, password, passwordConfirmation
  if (req.method === "POST") {
    req.on("data", data => {
      const parsed = data.toString("utf8").split("&");
      const formData = {};

      for(let pair of parsed) {
        const [key, value] = pair.split("=");
        formData[key] = value;
      }
      req.body = formData;
      next();
    });
  } else {
    next();
  }
};

app.post("/", bodyParser, (req, res) => {
  console.log(req.body);
  res.send("Account created!!!");
});

//listener
app.listen(3000, () => {
  console.log("Listening on port 3000...");
});