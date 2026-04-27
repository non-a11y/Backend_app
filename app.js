// 1. นำเข้าโมดูล express ซึ่งเป็น framework สำหรับสร้าง Web Server และ API ใน Node.js
const express = require("express");

// 2. นำเข้าโมดูล cors เพื่ออนุญาตให้ Frontend หรือ Mobile App (จากโดเมนหรือพอร์ตอื่น) สามารถเรียกใช้ API ได้โดยไม่ติดบล็อก
const cors = require("cors");

// 3. โหลดค่าตัวแปรระบบ (Environment Variables) จากไฟล์ .env มาใช้งาน เช่น พอร์ตของเซิร์ฟเวอร์, หรือ Token ต่างๆ
require("dotenv").config();

// 4. สร้างตัวแปรแอปพลิเคชัน Express
const app = express();

// 5. สั่งให้แอปพลิเคชันเปิดรับการเรียกใช้จากโดเมนอื่น (Cross-Origin Resource Sharing)
app.use(cors());

// 6. ตั้งค่าให้เซิร์ฟเวอร์สามารถแปลงข้อมูลที่ส่งมาในรูปแบบ JSON ให้อ่านและใช้งานได้ (เช่น req.body)
app.use(express.json());

// 7. กำหนดเส้นทาง (Routes) ของ API
// หมายความว่า ถ้ามี request เรียกมาที่ "/api/..." ให้ส่งต่อไปจัดการที่ไฟล์ routes/robotRoutes.js
app.use("/api", require("./routes/robotRoutes"));

// 8. สั่งให้เซิร์ฟเวอร์เริ่มทำงาน (listen) และรอรับข้อมูลผ่าน Port ที่ระบุไว้ในไฟล์ .env
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
