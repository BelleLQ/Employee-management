const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let userSchema = new Schema({
    "userName" : {
        "type": String,
        "unique": true
    },
    "password": String,
    "email":String,
    "loginHistory":[{"dateTime":Date,"userAgent":String}]
});
let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://dbUser:dbUserPassword@cluster0.unjcd.mongodb.net/web322_assign5?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if(userData.password===userData.password2){
            bcrypt.genSalt(10)  // Generate a "salt" using 10 rounds
            .then(salt=>bcrypt.hash(userData.password,salt)) // encrypt the password: "myPassword123"
            .then(hash=>{
                // TODO: Store the resulting "hash" value in the DB
                userData.password=hash;
                let newUser = new User(userData); 
                newUser.save().then(() => {
                    resolve();
                }).catch((err) => {
                    if(err.code===11000) reject("User Name already taken");
                    else reject("There was an error creating the user: "+err);
                    return;
                });
                })
            .catch(err=>{
                console.log(err); // Show any errors that occurred during the process
            });

        }
        else{reject('Passwords do not match'); return;}
    });
};

module.exports.checkUser = (userData) => {
    console.log(userData)
    return new Promise((resolve, reject) => {
      User.find({ userName: userData.userName })
        .then(users => {
          bcrypt.compare(userData.password, users[0].password)
            .then((res) => {
               users[0].loginHistory.push({ dateTime: (new Date()).toString(), userAgent: userData.userAgent });
               User.update({ userName: users[0].userName },
                   { $set: { loginHistory: users[0].loginHistory } },
                   { multi: false })
                  .exec()
                  .then(() => {
                    resolve(users[0]);
                   })
                  .catch((err) => {
                  reject(`There was an error verifying the user: ${err}`);
                 });
               }).catch((err) => {
              reject(`Incorrect Password for user: ${userData.userName}`);
            })
        }).catch(err => {
          reject(`Unable to find user: ${userData.userName}`);
        })
    });
  }