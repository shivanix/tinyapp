let cookieSession = require('cookie-session');
const express = require("express");
const app = express(); //app is jus a f that represents the express module & we bind that to the word app;'app' word is referring to the Express module

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));


const bcrypt = require('bcryptjs');

const {
  authenticate,
  emailLookup,
  generateRandomString
} = require("./views/helper");

app.use(cookieSession({
  name: 'session',
  keys: ["user_id"]
}));



//Using 'urlDatabase' object as a database for urls with 'shortURL' as key and 'longURL' as value
const urlDatabase = {};


//'usersDatabase' object to store & access the users in the app

const usersDatabase = {};


//Res when GET request gets triggered at the location ("/" here).
app.get("/", (req, res) => {
  if (typeof req.session.user_id === "undefined") {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }

});

/*- --------------------------------------------------------------------------REGISTER endpoint----------------------*/

//GET /register endpoint
app.get("/register", (req, res) => {
  const templateVars = {};

  const password = "purple-monkey-dinosaur"; // found in the req.params object
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);

  res.render("urls_register", templateVars);
});

// POST /register endpoint
app.post("/register", (req, res) => {
  const dataReceived = req.body;
  const newId = generateRandomString();
  if (!(dataReceived && dataReceived.email && dataReceived.password)) {
    return res.status(400).send(
      'Error! Email or/and Password input are invalid!  Please <a href="/register"> try again</a>'
    );
  }
  const newUserEmail = dataReceived.email;
  const emailAlreadyInUse = emailLookup(newUserEmail, usersDatabase);
  console.log("Email already in use: ", emailAlreadyInUse);
  if (typeof emailAlreadyInUse !== "undefined") {
    return res.status(400).send({
      message: 'Error! Email already in use!'
    });
  }

  const newPassword = bcrypt.hashSync(dataReceived.password);

  const newUserObj = {
    id: newId,
    email: newUserEmail,
    password: newPassword
  };

  usersDatabase[newId] = newUserObj;

  console.log("Data received: ", dataReceived);
  console.log("New user created: ", usersDatabase[newId]);
  
  res.redirect(`/login`);
});


/*-----------------------------------------------------------------------LOGIN-------------------*/
//Login

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  const userData = req.body;
  const userValidation = authenticate(userData, usersDatabase);
  if (typeof userValidation === "undefined") {
    return res.status(403).send("Incorrect Email or password! Please <a href='/login'> try again</a>"
    );
  }
  console.log(userData, " Logged in");
  req.session.user_id = usersDatabase[userValidation.id]; // Setting cookie
  const templateVars = {
    user: userData,
    urls: urlDatabase,
    usercookie: req.session.user_id
  };
  console.log(req.body);
  res.render("urls_index", templateVars);
});


/*---------------------------------------------------------------------------LOGOUT----------------------*/
//Logout
app.post("/logout", (req, res) => {
  console.log("Deleting cookie for user");
 
  req.session = null; // Destroys the session/removes the cookies
  res.redirect(`/login`);
});

/*----------------------------------------------------------------------/urls PAGE---------------------*/
app.get("/urls", (req, res) => {
  if (typeof req.session.user_id === "undefined") {
    return res.status(400).send(
      'Error! Cannot access URLs without logging in first! Please <a href="/login"> try again</a>'
    );
  }
  const templateVars = {
    urls: urlDatabase,
    usercookie: req.session.user_id
  };
  res.render("urls_index", templateVars);
    
});

app.post("/urls", (req, res) => {
  let dataReceived = req.body;
  let newShortUrl = generateRandomString();
  let userCookie = req.session.user_id;
  urlDatabase[newShortUrl] = {
    longURL: dataReceived.longURL,
    userID: userCookie.id
  };

  console.log("Data received: ", dataReceived); // Logging-the-POST-request-body-to-the-console
  console.log(urlDatabase);

  res.redirect(`/urls/${newShortUrl}`); // Redirecting client to new URL's (/urls/:shortURL) page
});

///urls/new
/*-------------------------------------------------------------/urls New PAGE--------------------------*/
app.get("/urls/new", (req, res) => {
  
  if (typeof req.session.user_id === "undefined") {
    console.log("ALERT !!!!!!!!!!!!!!!!!");
    res.redirect("/login");
  } else {
    const templateVars = {
      usercookie: req.session.user_id // user_id is the cookie's name
    };
    res.render("urls_new", templateVars);
  }
});

/*The GET /urls/new route needs to be defined before the GET /urls/:id route. Routes defined earlier will take precedence,
 so if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get("/urls/:id", ...)
 because Express will think that new is a route parameter*/


/*-------------------------------------------------------/urls/:shortcut-----------------------------*/

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (typeof urlDatabase[shortURL] === "undefined") {
    return res.status(400).send({
      message: 'Error! Invalid URL!'
    });
  }
  //case there is no cookie
  const usercookie = req.session.user_id;
  if (typeof req.session.user_id === "undefined") {
    return res.status(400).send({
      message: 'Error! You do not have access to this URL!'
    });
  }

  if (urlDatabase[shortURL].userID !== usercookie.id) {
    return res.status(400).send({
      message: 'Error! You do not have access to this URL!'
    });
  }
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    usercookie: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


/*-----------------------------------------------------/u/:id-------------------------------*/

app.get("/u/:shortURL", (req, res) => {
  const shortUrl = req.params.shortURL; //getting the parameters passed in the GET req, then we R getting shortURL parameter/property
  if (typeof urlDatabase[shortUrl] === "undefined") {
    return res.status(404).send(
      'Error! Invalid URL. '
    );
  }
  const longURL = urlDatabase[shortUrl].longURL;

  console.log("Redirecting client to: " + longURL);
  res.redirect(301, longURL);
});



/*-------------------------------------------------------Delete-------------------------------------*/
//DELETE

app.post("/urls/:shortURL/delete", (req, res) => {
  const usercookie = req.session.user_id;
  const shortURL = req.params.shortURL;
  
  if (typeof urlDatabase[shortURL] === "undefined") {
    return res.status(400).send({
      message: 'Error! Invalid URL!'
    });
  }
  //case there is no cookie
  
  if (typeof req.session.user_id === "undefined") {
    return res.status(400).send({
      message: 'Error! You do not have access to this URL!'
    });
  }


  
  if (urlDatabase[shortURL].userID !== usercookie.id) {
    return res.status(400).send({
      message: 'Error! You do not have access to this URL!'
    });
  }
  // if (userID === usercookie.id) {
  console.log(`Deleting ${urlDatabase[shortURL].longURL} from the database...`);
  delete urlDatabase[shortURL];
  // }

  res.redirect("/urls"); //After deletion, the client is being redirected back to the urls_index page ("/urls").
});

/*------------------------------------------------------Edit--------------------------------*/
//EDIT

app.get("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    usercookie: req.session.user_id
  };
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {

  const usercookie = req.session.user_id;
  const shortURL = req.params.shortURL;
  const userID = urlDatabase[shortURL].userID;
  const newURL = req.body.newURL;
  if (userID === usercookie.id) {
    console.log("Replacing", urlDatabase[shortURL].longURL, "with", newURL);
    urlDatabase[shortURL].longURL = newURL;
  }

  res.redirect(`/urls`);
});


/*------------------------------------------------------------------listen------------------*/

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