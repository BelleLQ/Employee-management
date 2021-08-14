const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
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
        let db = mongoose.createConnection("mongodb+srv://dbUser:dbUserPassword@cluster0.unjcd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");

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
            let newUser = new User(userData); 
            newUser.save().then(() => {
                resolve();
            }).catch((err) => {
                  if(err.code===11000) reject("User Name already taken");
                  else reject("There was an error creating the user: "+err);
                  return;
            });
        }
        else{reject('Passwords do not match'); return;}
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        User.find({ userName: userData.userName })
        .exec()
        .then((users) => {
           /* users = users.map(value => value.toObject());*/
            if(users[0].password===userData.password){
                users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                User.updateOne(
                    { userName: users[0].userName },
                    { $set: { loginHistory : users[0].loginHistory } }
                  ).exec().then(()=>{
                        resolve(users[0]);
                  }).catch((err)=>{
                    reject("There was an error verifying the user: "+err);
                    return;  
                  })
            }
            else{ 
                reject("Incorrect Password");
                return;
            }
        }).catch((err) => {
            reject("Unable to find user: "+userData.userName);
            return;
      });
    });
};