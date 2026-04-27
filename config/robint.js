// เรียกใช้ dotenv เพื่อให้อ่านค่าจากไฟล์ .env ได้
require("dotenv").config();

// สร้างรายชื่อบัญชี (Array) ดึงข้อมูลมาจากไฟล์ .env
// หากในอนาคตมีบัญชีที่ 3, 4, 5 สามารถคัดลอกบรรทัด { appId: ..., secret: ... } เพิ่มต่อท้ายได้เลย
const accounts = [
  { appId: process.env.ROBINT_APP_ID_1, secret: process.env.ROBINT_SECRET_1 },
  { appId: process.env.ROBINT_APP_ID_2, secret: process.env.ROBINT_SECRET_2 },
  { appId: process.env.ROBINT_APP_ID_3, secret: process.env.ROBINT_SECRET_3 },
];

// กรองเอาเฉพาะบัญชีที่ตั้งค่ารหัสไว้แล้ว (ป้องกัน Error กรณีใส่ข้อมูลใน .env ไม่ครบ)
const activeAccounts = accounts.filter(acc => acc.appId && acc.secret);

// ส่งออก (export) การตั้งค่าต่างๆ เพื่อให้ไฟล์อื่นนำไปใช้งานต่อได้
module.exports = {
  // baseURL คือ URL หลักของ API ฝั่ง Robint
  baseURL: process.env.ROBINT_BASE_URL,
  
  // ส่งออกรายชื่อบัญชีทั้งหมดที่พร้อมใช้งาน
  accounts: activeAccounts,

  // สร้างฟังก์ชันช่วยสร้าง Header เพื่อให้เรียกใช้ได้ง่ายๆ ตามบัญชีที่ต้องการ
  createHeader: (appId, secret) => ({
    "Content-Type": "application/json;charset=UTF-8",
    appId: appId,
    secret: secret,
  })
};
