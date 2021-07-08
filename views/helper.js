const bcrypt = require('bcryptjs');


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

const emailLookup = (userEmail, userDB) => {
  for (let userKey of Object.keys(userDB)) {
    const databaseUserEmail = userDB[userKey].email;
    if (userEmail === databaseUserEmail) {
      return true;
    }
  }
  return false;
};

module.exports = {authenticate, emailLookup};