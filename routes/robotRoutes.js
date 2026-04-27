// นำเข้า Express เพื่อใช้งานระบบ Routing (กำหนดเส้นทาง API)
const express = require("express");
// สร้างตัวแปร router เพื่อใช้จัดการเส้นทางย่อยต่างๆ
const router = express.Router();
// นำเข้า Service ที่รวมคำสั่งสำหรับยิง API ไปหา Robint
const robint = require("../services/robintService");

// ---------------------------------------------------------
// 1. ดึงข้อมูลหุ่นยนต์ทั้งหมด
// ---------------------------------------------------------
// เมื่อมีคนเรียก GET /api/robots
router.get("/robots", async (req, res) => {
  try {
    // ไปเรียกใช้ฟังก์ชัน getRobotList ใน Service
    const result = await robint.getRobotList();
    // ส่งข้อมูลที่ได้กลับไปในรูปแบบ JSON
    res.json(result);
  } catch (err) {
    // ถ้าพัง ให้ส่ง HTTP Status 500 พร้อมข้อความแจ้งเตือน Error
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// 2. ดึงข้อมูลสถานะของหุ่นยนต์แบบเจาะจง 1 ตัว
// ---------------------------------------------------------
// :uuid คือตัวแปรใน URL เช่น /api/robots/1234
router.get("/robots/:uuid", async (req, res) => {
  try {
    // ดึงค่า uuid จาก URL (req.params.uuid) แล้วส่งไปให้ Service
    const result = await robint.getRobotDetail(req.params.uuid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// 3. ดูแผนที่ทั้งหมดของโปรเจกต์
// ---------------------------------------------------------
router.get("/maps", async (req, res) => {
  try {
    const result = await robint.getMapList();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// 4. ดูจุดต่างๆ ภายในแผนที่ 1 แผนที่
// ---------------------------------------------------------
// ต้องแนบ mapUuid ของแผนที่มาใน URL ด้วย
router.get("/maps/:mapUuid/points", async (req, res) => {
  try {
    const result = await robint.getMapPoints(req.params.mapUuid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// 5. เรียกหุ่นยนต์ให้มารับ (Call Robot)
// ---------------------------------------------------------
// ใช้ Method POST เพราะต้องมีการส่งข้อมูล (Body) มาด้วย
router.post("/call", async (req, res) => {
  try {
    // ดึงข้อมูล 3 อย่างจาก Body ที่ผู้ใช้ส่งมา
    const { robotUuid, pointUuid, phone } = req.body;
    // สั่งเรียกหุ่นยนต์ผ่าน Service
    const result = await robint.callRobot(robotUuid, pointUuid, phone);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// 6. สั่งให้หุ่นยนต์ไปส่งของ (Create Order)
// ---------------------------------------------------------
router.post("/order", async (req, res) => {
  try {
    // นำข้อมูล req.body ทั้งก้อน ส่งไปสร้าง Order ใน Service
    const result = await robint.createOrder(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------
// 7. รับการแจ้งเตือนกลับจากระบบ Robint (Callback)
// ---------------------------------------------------------
// เมื่อหุ่นยนต์ทำงานเสร็จหรือมีอัปเดต Robint จะยิงข้อมูลมาที่เส้นทางนี้ (Webhook)
router.post("/callback", (req, res) => {
  const { orderNum, state, power, taskStatus } = req.body;
  console.log(`Order: ${orderNum} → ${state}`); // แสดงสถานะใน Console
  // ส่งข้อมูลต่อไปยังผู้เชื่อมต่อผ่าน Socket.io (real‑time)
  try {
    const { io } = require("../../socket"); // ปรับ path ให้ตรงกับโครงสร้างของคุณ
    io.emit("robotUpdate", {
      uuid: orderNum,
      state,
      power,
      taskStatus,
    });
  } catch (e) {
    console.error("Socket emit error:", e);
  }
  // ตอบกลับระบบ Robint ว่าได้รับข้อมูลเรียบร้อยแล้ว
  res.status(200).json({ success: true });
});

// ส่งออก router ไปให้ app.js ใช้งานต่อ (ในคำสั่ง app.use("/api", ...))
module.exports = router;