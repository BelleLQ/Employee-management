const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let userSchema = new Schema({
	userName: {
		type: String,
		unique: true
	},
	password: String,
	email: String,
	loginHistory: [
		{
			dataTime: Date,
			userAgent: String
		}
	]
});

let User;

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
		if (userData.password !== userData.password2) {
			reject("Passwords do not match");
		}

		bcrypt
			.genSalt(10) // Generate a "salt" using 10 rounds
			.then((salt) => bcrypt.hash(userData.password, salt)) // encrypt the password
			.then((hash) => {
				userData.password = hash;
			})
			.catch((err) => {
				reject("There was an error encrypting the password");
			});

		let newUser = new User(userData);
		newUser.save((err) => {
			if (err === 11000) {
				reject("User Name already taken");
			} else if (err) {
				reject("There was an error creating the user: ", err);
			} else {
				resolve();
			}
		});
	});
};

module.exports.checkUser = function (userData) {
	return new Promise(function (resolve, reject) {
		User.find({ userName: userData.userName })
			.exec()
			.then((users) => {
				bcrypt.compare(userData.password, users[0].password).then((result) => {
					if (!result) {
						if (!users || !users.length) {
							reject("Unable to find user: ", userData.userName);
						}
						users[0].loginHistory.push({ dateTime: new Date().toString(), userAgent: userData.userAgent });
						User.updateOne({ userName: users[0].userName }, { $set: { loginHistory: users[0].loginHistory } })
							.exec()
							.then(() => {
								resolve(users[0]);
							})
							.catch((err) => {
								reject("There was an error verifying the user: ", err);
							});
					} else {
						reject("Incorrect Password for user: ", userData.userName);
					}
				});
			})
			.catch((err) => {
				reject("Unable to find user: ", userData.userName);
			});
	});
};
