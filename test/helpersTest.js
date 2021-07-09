const { assert } = require('chai');

const { emailLookup, generateRandomString, authenticate } = require('../views/helper');
const bcrypt = require('bcryptjs');
const usersDatabase = {};
const urlDatabase = {};


const user1 = {email: "user@exapmle.com", password: "bazinga"};
const user2 = {email: "user2@example.com", password: "whatever"};

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};
usersDatabase[testUsers.userRandomID.id] = testUsers.userRandomID;
usersDatabase[testUsers.user2RandomID.id] = testUsers.user2RandomID;

describe('emailLookup', function() {
  it('should return a user with valid email', function() {

    const userID = emailLookup("user@example.com", usersDatabase);
    const expectedOutput = "user@example.com";
    assert.deepEqual(userID, expectedOutput);
  });

  it('should return undefined for email not in the database', function() {

    const userID = typeof emailLookup("notInDB@example.com", usersDatabase);
    const expectedOutput = "undefined";
    assert.deepEqual(userID, expectedOutput);
  });
});