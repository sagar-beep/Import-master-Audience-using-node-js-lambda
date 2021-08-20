var AWS = require("aws-sdk"),
  region = "us-east-1",
  secretName = "",
  secret,
  decodedBinarySecret;

// Create a Secrets Manager client
var client = new AWS.SecretsManager({
  region: region,
});

const secretkey = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      client.getSecretValue({ SecretId: secretName }, function (err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          let secret = JSON.parse(data.SecretString);
          resolve(secret);
        }
      });
    } catch (error) {
      console.log("Something wentwrong with AWS Secret Manager");
      reject(error);
    }
  });
};

module.exports = secretkey;
