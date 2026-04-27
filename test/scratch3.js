const axios = require("axios");
const config = require("../config/robint");

const test = async () => {
  try {
    const robintService = require("../services/robintService");
    
    console.log("--- TEST /api/maps ---");
    const maps = await robintService.getMapList();
    console.log(JSON.stringify(maps, null, 2));

    console.log("\n--- TEST /api/robots/:uuid ---");
    // Get uuid of first robot
    const robots = await robintService.getRobotList();
    if (robots.length > 0) {
      const detail = await robintService.getRobotDetail(robots[0].uuid);
      console.log(JSON.stringify(detail, null, 2));
    }
  } catch (err) {
    console.error(err);
  }
};

test();
