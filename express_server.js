const express = require("express");
const app = express(); //app is jus a f that represents the express module & we bind that to the word app;'app' word is referring to the Express module

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

const cookieParser = require("cookie-parser");

const bcrypt = require('bcryptjs');

const {
  authenticate,
  emailLookup
} = require("./views/helper");
app.use(cookieParser());

//Generating random aplfanumeric string
const generateRandomString = () => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const amount = 6;
  let output = "";
  for (let i = 0; i < amount; i++) {
    let newCharIndex = Math.floor(Math.random() * chars.length);
    output += chars[newCharIndex];
  }
  return output;
};

//Using 'urlDatabase' object as a database for urls with 'shortURL' as key and 'longURL' as value
const urlDatabase = {

};


//'usersDatabase' object to store & access the users in the app

const usersDatabase = {};


//Res when GET request gets triggered at the location ("/" here).
app.get("/", (req, res) => {
  res.send("Hello there!");
});

//REGISTER
/*-------GET /register endpoint---------*/
app.get("/register", (req, res) => {
  const templateVars = {};

  const password = "purple-monkey-dinosaur"; // found in the req.params object
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);

  res.render("urls_register", templateVars);
});

/*-----POST /register endpoint-----*/
app.post("/register", (req, res) => {
  const dataReceived = req.body;
  const newId = generateRandomString();
  if (!(dataReceived && dataReceived.email && dataReceived.password)) {
    return res.status(400).send({
      message: 'Error! Email or/and Password input are invalid!'
    });
  }
  const newUserEmail = dataReceived.email;
  const emailAlreadyInUse = emailLookup(newUserEmail, usersDatabase);
  console.log("Email already in use: ", emailAlreadyInUse);
  if (emailAlreadyInUse) {
    return res.status(400).send({
      message: 'Error! Email already in use!'
    });
  }
  // const newPassword = dataReceived.password;
  const newPassword = bcrypt.hashSync(dataReceived.password);

  const newUserObj = {
    id: newId,
    email: newUserEmail,
    password: newPassword
  };

  usersDatabase[newId] = newUserObj;

  console.log("Data received: ", dataReceived);
  console.log("New user created: ", usersDatabase[newId]);
  // res.cookie('user_id', usersDatabase[newId]); // Setting cookie
  // res.redirect(`/urls`);
  res.redirect(`/login`);
});

//Login
/*-----------------Login-------------------*/

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const userData = req.body;
  const userValidation = authenticate(userData, usersDatabase);
  if (typeof userValidation === "undefined") {
    return res.status(403).send({
      message: 'Incorrect Email or password!'
    });
  }
  console.log(userData, " Logged in");
  res.cookie('user_id', usersDatabase[userValidation.id]); // Setting cookie
  const templateVars = {
    user: userData,
    urls: urlDatabase,
    usercookie: req.cookies["user_id"]
  };
  console.log(req.body);
  res.render("urls_index", templateVars);
});


/*-----------------lOGOUT-------*/
app.post("/logout", (req, res) => {
  console.log("Deleting cookie for user");
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});

//
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    usercookie: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let dataReceived = req.body;
  let newShortUrl = generateRandomString();
  let userCookie = req.cookies["user_id"];
  urlDatabase[newShortUrl] = {
    longURL: dataReceived.longURL,
    userID: userCookie.id
  };

  console.log("Data received: ", dataReceived); // Logging the POST request body to the console
  console.log(urlDatabase);

  res.redirect(`/urls/${newShortUrl}`); // Redirecting client to new URL's (/urls/:shortURL) page
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    usercookie: req.cookies["user_id"] // user_id is the cookie's name
  };
  res.render("urls_new", templateVars);
});

/*The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence,
 so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...)
 because Express will think that new is a route parameter*/

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    usercookie: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL; //getting the parameters passed in the GET req, then we R getting shortURL parameter/property
  const longURL = urlDatabase[shortUrl].longURL;
  // if (longURL === undefined) {
  //   //Give 404 response
  // }

  console.log("Redirecting client to: " + longURL);
  res.redirect(301, longURL);
});



/*--------------------------------------------------------------------------------------------*/
//DELETE

app.post("/urls/:shortURL/delete", (req, res) => {
  const usercookie = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  const userID = urlDatabase[shortURL].userID;
  if (userID === usercookie.id) {
    console.log(`Deleting ${urlDatabase[shortURL].longURL} from the database...`);
    delete urlDatabase[shortURL];
  }

  res.redirect("/urls"); //After deletion, the client is being redirected back to the urls_index page ("/urls").
});

//EDIT

app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    usercookie: req.cookies["user_id"]
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {

  const usercookie = req.cookies["user_id"];
  const shortURL = req.params.shortURL;
  const userID = urlDatabase[shortURL].userID;
  const newURL = req.body.newURL;
  if (userID === usercookie.id) {
    console.log("Replacing", urlDatabase[shortURL].longURL, "with", newURL);
    urlDatabase[shortURL].longURL = newURL;
  }

  res.redirect(`/urls`);
});



app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

//one of app(i.e. express) methods called listen which tells it to listen on a specific port(here variable PORT ===8080) to any http req sent to the server(if any browsers are trying to get in touch with it)
//added a callback f to the method listen & is called back using console.log()--the server will tell 'Tiny app...'

/*const express = require("express");
const app = express();
app.listen(8080);

This literally built a server
*/