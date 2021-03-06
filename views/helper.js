const bcrypt = require('bcryptjs');

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

//---------------------------------------------------------------
//Verifies if the user is in the database and if so checks if the submitted password matches with the one in the database
const authenticate = (userObj, userDB) => {
  if (!userObj) {
    return false;
  }
  //userObj is the data stored in the userId cookie, in this case an object

  for (let userKey of Object.keys(userDB)) {
    const databaseUser = userDB[userKey];
    if (userObj.email === databaseUser.email) {
    
      if (bcrypt.compareSync(userObj.password, databaseUser.password)) {
        return databaseUser;
      } else {
        return undefined;
      }
    }
  }
  return undefined;
};

//------------------------------------------------------------------------
//Compares user email to email stored in database
const emailLookup = (userEmail, userDB) => {
  for (let userKey of Object.keys(userDB)) {
    const databaseUserEmail = userDB[userKey].email;
    if (userEmail === databaseUserEmail) {
      return databaseUserEmail; // This email will be returned if the email was found in the database
    }
  }
  return undefined; // This value will be returned if the email was NOT found in the database
};

module.exports = {authenticate, emailLookup, generateRandomString};