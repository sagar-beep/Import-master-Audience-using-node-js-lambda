const AthenaExpress = require("athena-express"),
  aws = require("aws-sdk");

/* AWS Credentials are not required here
    /* because the IAM Role assumed by this Lambda
    /* has the necessary permission to execute Athena queries
    /* and store the result in Amazon S3 bucket */

const athenaExpressConfig = {
  aws,
  db: process.env.DB || "",
  s3: process.env.S3 || "",
  getStats: true,
};

const athenaExpress = new AthenaExpress(athenaExpressConfig);

const athenaconnection = async () => {
  const sqlQuery =
    "select * from campaigns_v310pgdev where contact_email in (select contact_email from campaigns_v310pgdev GROUP BY contact_email HAVING COUNT(contact_email)=1);";
  try {
    let results = await athenaExpress.query(sqlQuery);
    return results;
  } catch (err) {
    console.log("something went wrong with athena");
  }
};

module.exports = athenaconnection;
