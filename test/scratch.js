const axios = require("axios");
const config = require("../config/robint");

const testGetRobotList = async () => {
  console.log("Active accounts:", config.accounts.length);
  for (const account of config.accounts) {
    try {
      console.log(`\nTesting account appId: ${account.appId}`);
      const headers = config.createHeader(account.appId, account.secret);

      const res = await axios.post(
        `${config.baseURL}/getRobotList`,
        {},
        { headers: headers },
      );

      console.log("Response status:", res.status);
      console.log("Response data:", JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error(`Error for appId ${account.appId}:`);
      if (err.response) {
        console.error("HTTP Status:", err.response.status);
        console.error("Response Data:", err.response.data);
      } else {
        console.error(err.message);
      }
    }
  }
};

testGetRobotList();
