var userModels = require('./userModels');
var key = 'aRandomStringAndItNeedsToBeLonger';
var encryptor = require('simple-encryptor')(key);

// Create a new user in the database
module.exports.createUserDBService = (userDetails) => {
   return new Promise(async (resolve, reject) => {
       // Preparing user data for storage, including encrypting the password
       var userModelsData = new userModels({
           name: userDetails.name,
           email: userDetails.email,
           password: encryptor.encrypt(userDetails.password)  // Encrypt pwd
       });

       try {
           // Attempt to save the new user to the database
           await userModelsData.save();
           resolve(true);  // Resolve the promise positively if successful
       } catch (error) {
           console.error(error); // Log any error for debugging purposes

           // Check if the error is due to a duplicate key (i.e., email)
           if (error.code === 11000) {
               reject({ status: false, msg: "Email already exists" }); // Return message 
           } else {
               reject({ status: false, msg: "An error occurred during registration" }); // General error message
           }
       }
   });
}

//  authenticate a user during login
module.exports.loginuserDBService = (userDetails) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Attempt to find the user by email
            const user = await userModels.findOne({ email: userDetails.email });

            // If no user is found, reject the promise with a message
            if (!user) {
                reject({ status: false, msg: "user details unavailable" });
                return;
            }

            // Decrypt the stored password for comparison
            var decrypted = encryptor.decrypt(user.password);

            // Check if the provided password matches the stored password
            if (decrypted === userDetails.password) {
                resolve({ status: true, msg: "user validated successfully" }); // Positive response if passwords match
            } else {
                reject({ status: false, msg: "user validated failed" }); // Negative response if passwords don't match
            }
        } catch (error) {
            console.error(error); // Log any error for debugging purposes
            reject({ status: false, msg: "Invalid Data" }); // General failure, possibly due to database issues
        }
    });
}
