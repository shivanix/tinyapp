const express = require("express");
const app = express(); //app used when refering to express module(best practice)
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

const cookieParser = require("cookie-parser");
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

//using 'urlDatabase' object as a database with 'shortURL' as key and 'longURL' as value
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Res when request gets triggered at the location ("/" here).
app.get("/", (req, res) => {
  res.send("Hello there!");
});

//REGISTER
app.get("/register", (req,res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});

/*The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence,
 so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...)
 because Express will think that new is a route parameter*/

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    username: req.cookies["username"],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>there!</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL; //getting the parameters passed in the GET req, then we R getting shortURL parameter/property
  const longURL = urlDatabase[shortUrl];
  if (longURL === undefined) {
    //Give 404 response
  }

  console.log("Redirecting client to: " + longURL);
  res.redirect(301, longURL);
});

app.post("/urls", (req, res) => {
  let dataReceived = req.body;
  let newShortUrl = generateRandomString();

  urlDatabase[newShortUrl] = dataReceived.longURL;

  console.log(dataReceived); // Log the POST request body to the console
  console.log(urlDatabase);
  
  res.redirect(`/urls/${newShortUrl}`); // Redirecting client to new URL's (/urls/:shortURL) page
});

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  console.log(`Deleting ${urlDatabase[shortURL]} from the database...`);
  delete urlDatabase[shortURL];

  res.redirect("/urls"); //After deletion, the client is being redirected back to the urls_index page ("/urls").
});

//EDIT
app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    username: req.cookies["username"],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;

  console.log(`Editing ${urlDatabase[shortURL]} from the database...`);

  res.redirect(`/urls/${shortURL}/edit`);
});


//Cookie

app.post("/login", (req, res) => {
  const usernameInput = req.body.username;
  res.cookie('username', usernameInput);
  console.log(req.body);
  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect(`/urls`);
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});

//one of app(express) methods called listen which tells it to listen on a specific port(here variable PORT ===8080) to any http req sent to the server(if any browsers are trying to get in touch with it)
//added a callback f to the method listen & is called back using console.log()--the server will tell 'Tiny app...'

/*const express = require("express");
const app = express();
app.listen(8080);

This literally built a server
*/