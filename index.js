const md5 = require("md5");
require("dotenv").config();
const _ = require("lodash");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const athena = require("./src/DB/athena");
const rds = require("./src/DB/rds");
const mailchimpkeys = require("./src/DB/mailchimpkeys");

exports.handler = async (event, context, callback) => {
  const secret = await mailchimpkeys();
  mailchimp.setConfig({
    apiKey: secret.MAILCHIMP_API_KEY,
    server: secret.MAILCHIMP_SERVER,
  });
  try {
    const athena_Data = await athena();
    const rds_Data = await rds();
    //const listId = "0534f1d179";
    const listId = rds_Data.rows[0].list_id;
    async function run() {
      const operation = athena_Data.Items.map((members) => {
        let data1 = rds_Data.rows.map((data) => {
          let merge_tags = data.merge_tag;
          let obj = { name: data.athena_column, value: merge_tags };
          return obj;
        });
        let object = data1.reduce(
          (obj, item) => Object.assign(obj, { [item.name]: item.value }),
          {}
        );
        const output = {};
        _.forIn(object, (value1, key1) => {
          _.forIn(members, (value, key) => {
            if (key1 === key) {
              return (output[value1] = value);
            }
          });
        });
        return output;
      });
      const operations = operation.map((members, i) => ({
        method: "PUT",
        path: `/lists/${listId}/members/${md5(members.TG41)}`,
        //operation_id: members.person_id,
        body: JSON.stringify({
          email_address: members.TG41,
          email_type: "text",
          status: "subscribed",
          merge_fields: {
            ...members,
          },
        }),
      }));
      const response = await mailchimp.batches.start({
        operations,
      });
      console.log(response);
      const batchId = response.id;
      async function runs() {
        const responses = await mailchimp.batches.status(batchId);
        console.log("total_insertion", responses);
      }
      runs();
    }
    run();

    callback(null, "success");
  } catch (e) {
    callback(e, null);
  }
};
