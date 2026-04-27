// นำเข้าโมดูล axios ซึ่งทำหน้าที่ยิง HTTP Request (GET, POST) ไปยังเซิร์ฟเวอร์อื่น
const axios = require("axios");

// นำเข้าไฟล์ตั้งค่า (config) ที่เราเขียนไว้ก่อนหน้านี้ เพื่อดึง baseURL และ accounts มาใช้งาน
const config = require("../config/robint");

// ============================================================
// Helper: ดึง data list จากโครงสร้าง JSON ที่อาจแตกต่างกัน
// ============================================================
const extractList = (resData) => {
  if (Array.isArray(resData.data)) return resData.data;
  if (resData.data && Array.isArray(resData.data.list)) return resData.data.list;
  if (Array.isArray(resData.list)) return resData.list;
  if (Array.isArray(resData)) return resData;
  return [];
};

// ============================================================
// 1. ดึงรายชื่อหุ่นยนต์ทั้งหมด (รวมจากทุกบัญชี)
// POST /getRobotList
// ============================================================
const getRobotList = async () => {
  let allRobots = [];
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(`${config.baseURL}/getRobotList`, {}, { headers });
      allRobots = allRobots.concat(extractList(res.data));
    } catch (err) {
      console.error(`[getRobotList] appId ${account.appId}:`, err.message);
    }
  }
  return allRobots;
};

// ============================================================
// 2. ดูสถานะโดยละเอียดของหุ่นยนต์ 1 ตัว
// GET /getRobotDetailInfo/{robotUuid}
// ============================================================
const getRobotDetail = async (robotUuid) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.get(
        `${config.baseURL}/getRobotDetailInfo/${robotUuid}`,
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ไม่พบในบัญชีนี้ ลองบัญชีถัดไป
    }
  }
  throw new Error("Robot not found in any account");
};

// ============================================================
// 3. ดึงพิกัดหุ่นยนต์แบบเรียลไทม์
// GET /getRobotRealTimePoint/{robotUuid}
// หมายเหตุ: API มี Rate Limit 1 ครั้ง/วินาที
// ============================================================
const getRobotRealTimePoint = async (robotUuid) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.get(
        `${config.baseURL}/getRobotRealTimePoint/${robotUuid}`,
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Robot real-time point not found in any account");
};

// ============================================================
// 4. ดึงรายชื่อแผนที่ทั้งหมด (รวมจากทุกบัญชี)
// GET /getProjectMapList
// ============================================================
const getMapList = async () => {
  let allMaps = [];
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.get(`${config.baseURL}/getProjectMapList`, { headers });
      allMaps = allMaps.concat(extractList(res.data));
    } catch (err) {
      console.error(`[getMapList] appId ${account.appId}:`, err.message);
    }
  }
  return allMaps;
};

// ============================================================
// 5. ดึงจุดต่างๆ ในแผนที่ตาม mapUuid
// GET /getMapPointList/{mapUuid}
// ============================================================
const getMapPoints = async (mapUuid) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.get(
        `${config.baseURL}/getMapPointList/${mapUuid}`,
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Map points not found");
};

// ============================================================
// 6. ดึงรายชื่อห้อง/จุดทั้งหมดในโปรเจกต์ (แบ่งตามตึก/ชั้น)
// POST /getProjectRooms
// ============================================================
const getProjectRooms = async () => {
  let allRooms = [];
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(`${config.baseURL}/getProjectRooms`, {}, { headers });
      const list = Array.isArray(res.data.data) ? res.data.data : [];
      allRooms = allRooms.concat(list);
    } catch (err) {
      console.error(`[getProjectRooms] appId ${account.appId}:`, err.message);
    }
  }
  return allRooms;
};

// ============================================================
// 7. สั่งให้หุ่นยนต์ไปส่งของ (สร้าง Order)
// POST /createOrder/v2.0
// รองรับทั้ง "ส่งของในโรงแรม" และ "ช่วยรับ-ส่งของ"
// ============================================================
const createOrder = async (body) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(`${config.baseURL}/createOrder/v2.0`, body, { headers });
      return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to create order in all accounts");
};

// ============================================================
// 8. ดูข้อมูล Order ตาม orderNum
// POST /getOrderInfo
// ============================================================
const getOrderInfo = async (orderNum) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/getOrderInfo`,
        { orderNum },
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Order not found in any account");
};

// ============================================================
// 9. ยกเลิก / เปลี่ยนสถานะ Order (เช่น CANCELLED, PEOPLE_DELIVERY)
// POST /operationOrder
// ============================================================
const operationOrder = async (orderNum, state) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/operationOrder`,
        { orderNum, state },
        { headers }
      );
      return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to operate order in all accounts");
};

// ============================================================
// 10. ดูจำนวน Order ที่รอการจัดส่งในขณะนี้
// POST /getPendingDeliveryOrder
// ============================================================
const getPendingDeliveryOrder = async () => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/getPendingDeliveryOrder`,
        {},
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to get pending delivery order in all accounts");
};

// ============================================================
// 11. ดูประวัติการเคลื่อนไหวของ Order (Tracking)
// POST /getOrderActions
// ============================================================
const getOrderActions = async (orderNum) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/getOrderActions`,
        { orderNum },
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Order actions not found in any account");
};

// ============================================================
// 12. เรียกหุ่นยนต์ให้มารับ (Customer Call / Summon)
// POST /customerCall
// ============================================================
const callRobot = async (robotUuid, pointUuid, phone) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/customerCall`,
        { robotUuid, pointUuid, phone },
        { headers }
      );
      return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to call robot in all accounts");
};

// ============================================================
// 13. ส่งโฆษณาไปยังหุ่นยนต์
// POST /pushAdFileToRobots
// ============================================================
const pushAdFileToRobots = async (body) => {
  // body = { robotUuids: [...], callBackUrl: "...", files: [...] }
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/pushAdFileToRobots`,
        body,
        { headers }
      );
      return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to push ad to robots in all accounts");
};

// ============================================================
// 14. สถิติงานของหุ่นยนต์ (แยกตามประเภทงาน/ระยะทาง/เวลา)
// POST /robotTaskStatistic
// ============================================================
const getRobotTaskStatistic = async (startTime, endTime, robotUuids = []) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const body = { startTime, endTime };
      if (robotUuids.length > 0) body.robotUuids = robotUuids;
      const res = await axios.post(
        `${config.baseURL}/robotTaskStatistic`,
        body,
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to get robot task statistic in all accounts");
};

// ============================================================
// 15. สถิติ Order (แยกตามประเภทคำสั่ง)
// POST /orderStatistic
// ============================================================
const getOrderStatistic = async (startTime, endTime, robotUuids = []) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const body = { startTime, endTime };
      if (robotUuids.length > 0) body.robotUuids = robotUuids;
      const res = await axios.post(
        `${config.baseURL}/orderStatistic`,
        body,
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to get order statistic in all accounts");
};

// ============================================================
// 16. ดูประวัติงานของหุ่นยนต์ (Task Records)
// POST /findRobotTaskRecords
// หมายเหตุ: Rate Limit 1 ครั้ง/วินาที, ช่วงวันสูงสุด 1 เดือน
// ============================================================
const findRobotTaskRecords = async (body) => {
  // body = { robotUuidList, taskTypeList, taskStateList, startTime, endTime }
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/findRobotTaskRecords`,
        body,
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to find robot task records in all accounts");
};

// ============================================================
// 17. ดูประวัติ Order ของหุ่นยนต์ (Order Records)
// POST /findRobotOrderList
// หมายเหตุ: Rate Limit 1 ครั้ง/วินาที, ช่วงวันสูงสุด 1 เดือน
// ============================================================
const findRobotOrderList = async (startTime, endTime, robotUuidList = []) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const body = { startTime, endTime };
      if (robotUuidList.length > 0) body.robotUuidList = robotUuidList;
      const res = await axios.post(
        `${config.baseURL}/findRobotOrderList`,
        body,
        { headers }
      );
      if (res.data) return res.data;
    } catch (err) {
      // ลองบัญชีถัดไป
    }
  }
  throw new Error("Failed to find robot order list in all accounts");
};

// มัดรวมทุกฟังก์ชันส่งออก เพื่อให้ robotRoutes.js นำไปใช้งานได้
module.exports = {
  // หุ่นยนต์
  getRobotList,
  getRobotDetail,
  getRobotRealTimePoint,
  // แผนที่
  getMapList,
  getMapPoints,
  getProjectRooms,
  // Order
  createOrder,
  getOrderInfo,
  operationOrder,
  getPendingDeliveryOrder,
  getOrderActions,
  // การเรียกหุ่นยนต์
  callRobot,
  // โฆษณา
  pushAdFileToRobots,
  // สถิติ
  getRobotTaskStatistic,
  getOrderStatistic,
  findRobotTaskRecords,
  findRobotOrderList,
};