const robintService = require("../services/robintService");

const test = async () => {
  const robots = await robintService.getRobotList();
  console.log(JSON.stringify(robots, null, 2));
};

test();
