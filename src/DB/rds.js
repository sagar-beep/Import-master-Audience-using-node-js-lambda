const { Client } = require("pg");
const Secrets = require("./secretkeys");

const rdsconnection = async () => {
  const secret = await Secrets();
  const postgress = new Client({
    user: secret.username,
    host: secret.host,
    database: secret.dbName,
    password: secret.password,
    port: secret.port,
  });
  const Query = "select * from campaign_mailchimp_merge_tags";
  try {
    await postgress.connect();
    let query_res = await postgress.query(Query);
    postgress.end();
    return query_res;
  } catch {
    console.log("something went wrong with rds");
  }
};

module.exports = rdsconnection;
