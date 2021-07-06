const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

/*The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence,
 so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...)
 because Express will think that new is a route parameter*/

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: req.params.longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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

//DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  console.log(`Deleting ${urlDatabase[shortURL]} from the database...`);
  delete urlDatabase[shortURL];

  res.redirect("/urls"); //After deletion, the client is being redirected back to the urls_index page ("/urls").
});


app.post("/urls", (req, res) => {
  let dataReceived = req.body;
  let newShortUrl = generateRandomString();

  urlDatabase[newShortUrl] = dataReceived.longURL;

  console.log(dataReceived); // Log the POST request body to the console
  console.log(urlDatabase);
  
  res.redirect(`/urls/${newShortUrl}`); // Redirecting client to new URL's (/urls/:shortURL) page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});