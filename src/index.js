const express = require('express');
const usersRepo = require('./repositories/usersJSON');
//const bodyParser = require("body-parser");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//route handler
app.get('/', (req, res) => {
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

//Middleware: Functions that does some kind of processing on the `req` and `res` objects before we actually call our route handlers.
//`next()`: callback function provided by Express framework that runs the actual route handler callback when our middlewars is done doing its business.

// const bodyParser = (req, res, next) => {
//   // get access to email, password, passwordConfirmation
//   if (req.method === "POST") {
//     req.on("data", data => {
//       const parsed = data.toString("utf8").split("&");
//       const formData = {};

//       for(let pair of parsed) {
//         const [key, value] = pair.split("=");
//         formData[key] = value;
//       }
//       req.body = formData;
//       next();
//     });
//   } else {
//     next();
//   }
// };

app.post('/', async (req, res) => {
  const { email, password, passwordConfirmation } = req.body;

  const existingUser = await usersRepo.getOneBy({ email });
  if (existingUser) {
    return res.send('Email in use');
  }

  if (password !== passwordConfirmation) {
    return res.send('Password must match');
  }

  res.send('Account created!!!');
});

//listener
app.listen(3000, () => {
  console.log('Listening on port 3000...');
});

//`npm run dev` to run the program
