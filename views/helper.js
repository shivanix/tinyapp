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
const authenticate = (userObj, userDB) => {
  if (!userObj) {
    return false;
  }
  //userObj is the data stored in the userId cookie, in this case an object
  // const {email, password} = userObj;
  //const userData = {email: userObj.email, password: userObj.password};
  for (let userKey of Object.keys(userDB)) {
    const databaseUser = userDB[userKey];
    if (userObj.email === databaseUser.email) {
      // if (userObj.password === databaseUser.password) {
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