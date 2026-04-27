// นำเข้าโมดูล axios ซึ่งทำหน้าที่ยิง HTTP Request (GET, POST) ไปยังเซิร์ฟเวอร์อื่น
const axios = require("axios");

// นำเข้าไฟล์ตั้งค่า (config) ที่เราเขียนไว้ก่อนหน้านี้ เพื่อดึง baseURL และ accounts มาใช้งาน
const config = require("../config/robint");

// ---------------------------------------------------------
// ฟังก์ชันที่ 1: ดึงรายชื่อหุ่นยนต์ทั้งหมด (ปรับให้รองรับหลายบัญชี)
// ---------------------------------------------------------
const getRobotList = async () => {
  let allRobots = [];

  // วนลูปยิง API ทีละบัญชีตามที่ตั้งค่าไว้ใน .env
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/getRobotList`,
        {},
        { headers: headers }
      );
      
      // ดึงข้อมูลหุ่นยนต์ออกมาจากโครงสร้าง JSON ของ Robint
      let dataList = [];
      if (Array.isArray(res.data.data)) {
        dataList = res.data.data;
      } else if (res.data.data && Array.isArray(res.data.data.list)) {
        dataList = res.data.data.list;
      } else if (Array.isArray(res.data.list)) {
        dataList = res.data.list;
      } else if (Array.isArray(res.data)) {
        dataList = res.data;
      }
      
      // นำหุ่นยนต์ที่ได้มาต่อกันใน Array หลัก
      allRobots = allRobots.concat(dataList);
    } catch (err) {
      console.error(`Error fetching robots for appId ${account.appId}:`, err.message);
      // ถ้าบัญชีไหนดึงข้อมูลไม่ได้ ก็ให้ข้ามไปทำบัญชีต่อไป (ไม่ให้ระบบพังทั้งหมด)
    }
  }

  return allRobots;
};

// ---------------------------------------------------------
// ฟังก์ชันที่ 2: ดูสถานะของหุ่นยนต์ 1 ตัว (ทดลองหาในทุกบัญชี)
// ---------------------------------------------------------
const getRobotDetail = async (robotUuid) => {
  // วนลูปหาในทุกบัญชี บัญชีไหนเจอข้อมูลก่อนให้รีเทิร์นกลับไปเลย
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.get(
        `${config.baseURL}/getRobotDetailInfo/${robotUuid}`,
        { headers: headers }
      );
      
      // ถ้าบัญชีนี้เจอข้อมูลหุ่นยนต์ตัวนี้ ให้ส่งกลับเลย
      if (res.data) return res.data;
    } catch (err) {
      // ไม่เจอในบัญชีนี้ ไม่เป็นไร ข้ามไปหาบัญชีถัดไป
    }
  }
  throw new Error("Robot not found in any account");
};

// ---------------------------------------------------------
// ฟังก์ชันที่ 3: ดึงรายชื่อแผนที่ทั้งหมด (รวมแผนที่จากทุกบัญชี)
// ---------------------------------------------------------
const getMapList = async () => {
  let allMaps = [];
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.get(`${config.baseURL}/getProjectMapList`, { headers });
      let dataList = [];
      if (Array.isArray(res.data.data)) {
        dataList = res.data.data;
      } else if (res.data.data && Array.isArray(res.data.data.list)) {
        dataList = res.data.data.list;
      } else if (Array.isArray(res.data.list)) {
        dataList = res.data.list;
      } else if (Array.isArray(res.data)) {
        dataList = res.data;
      }
      allMaps = allMaps.concat(dataList);
    } catch (err) {
      console.error(`Error fetching maps for appId ${account.appId}:`, err.message);
    }
  }
  return allMaps;
};

// ---------------------------------------------------------
// ฟังก์ชันที่ 4: ดึงจุดต่างๆ ในแผนที่ (ทดลองหาในทุกบัญชี)
// ---------------------------------------------------------
const getMapPoints = async (mapUuid) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.get(`${config.baseURL}/getMapPointList/${mapUuid}`, { headers });
      if (res.data) return res.data;
    } catch (err) { }
  }
  throw new Error("Map points not found");
};

// ---------------------------------------------------------
// ฟังก์ชันที่ 5: เรียกให้หุ่นยนต์มารับ (ลองสั่งทุกบัญชีจนกว่าจะสำเร็จ)
// ---------------------------------------------------------
const callRobot = async (robotUuid, pointUuid, phone) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(
        `${config.baseURL}/customerCall`,
        { robotUuid, pointUuid, phone },
        { headers }
      );
      // ถ้ายิงผ่าน ส่งผลลัพธ์กลับ
      return res.data;
    } catch (err) { }
  }
  throw new Error("Failed to call robot in all accounts");
};

// ---------------------------------------------------------
// ฟังก์ชันที่ 6: สั่งให้หุ่นยนต์ไปส่งของ (ลองสั่งทุกบัญชีจนกว่าจะสำเร็จ)
// ---------------------------------------------------------
const createOrder = async (body) => {
  for (const account of config.accounts) {
    try {
      const headers = config.createHeader(account.appId, account.secret);
      const res = await axios.post(`${config.baseURL}/createOrder/v2.0`, body, { headers });
      return res.data;
    } catch (err) { }
  }
  throw new Error("Failed to create order in all accounts");
};

// มัดรวมทุกฟังก์ชันใส่กล่องส่งออก (Export) เพื่อให้ไฟล์ robotRoutes.js นำไปใช้งานได้
module.exports = {
  getRobotList,
  getRobotDetail,
  getMapList,
  getMapPoints,
  callRobot,
  createOrder,
};
