// นำเข้า Express เพื่อใช้งานระบบ Routing
const express = require("express");
const router = express.Router();

// นำเข้า Service ที่รวมคำสั่งสำหรับยิง API ไปหา Robint
const robint = require("../services/robintService");

// ============================================================
// ── หุ่นยนต์ (Robot) ──────────────────────────────────────
// ============================================================

/**
 * GET /api/robots
 * ดึงรายชื่อหุ่นยนต์ทั้งหมด (รวมจากทุกบัญชี)
 */
router.get("/robots", async (req, res) => {
  try {
    const result = await robint.getRobotList();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/robots/:uuid
 * ดูข้อมูลโดยละเอียดของหุ่นยนต์ 1 ตัว (สถานะ, แบตเตอรี่, ชั้น ฯลฯ)
 */
router.get("/robots/:uuid", async (req, res) => {
  try {
    const result = await robint.getRobotDetail(req.params.uuid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/robots/:uuid/realtime
 * ดูพิกัดหุ่นยนต์แบบเรียลไทม์ (X, Y, มุม, ชั้น)
 * หมายเหตุ: มี Rate Limit 1 ครั้ง/วินาที
 */
router.get("/robots/:uuid/realtime", async (req, res) => {
  try {
    const result = await robint.getRobotRealTimePoint(req.params.uuid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ── แผนที่ (Map) ───────────────────────────────────────────
// ============================================================

/**
 * GET /api/maps
 * ดึงรายชื่อแผนที่ทั้งหมด (รวมจากทุกบัญชี)
 */
router.get("/maps", async (req, res) => {
  try {
    const result = await robint.getMapList();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/maps/:mapUuid/points
 * ดูจุดต่างๆ ภายในแผนที่ 1 แผนที่ (พร้อมพิกัด X, Y)
 */
router.get("/maps/:mapUuid/points", async (req, res) => {
  try {
    const result = await robint.getMapPoints(req.params.mapUuid);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/rooms
 * ดึงรายชื่อห้องและจุดทั้งหมดในโปรเจกต์ (แบ่งตามตึก/ชั้น)
 * ใช้หาชื่อห้องและ pointUuid เพื่อประกอบการสั่ง Order
 */
router.get("/rooms", async (req, res) => {
  try {
    const result = await robint.getProjectRooms();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ── Order (การส่งของ) ──────────────────────────────────────
// ============================================================

/**
 * POST /api/order
 * สั่งให้หุ่นยนต์ไปส่งของ
 * Body (ส่งของในโรงแรม):
 *   { source, thridOrderNum, phone, roomNum, callBackUrl, description?, robotUuid?, orderDetails }
 * Body (ช่วยรับ-ส่งของ):
 *   { source, thridOrderNum, phone, callBackUrl, deliveryType, fromPointName, toPointName, ... }
 */
router.post("/order", async (req, res) => {
  try {
    const result = await robint.createOrder(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/order/info
 * ดูข้อมูล Order ตามเลข orderNum
 * Body: { orderNum }
 */
router.post("/order/info", async (req, res) => {
  try {
    const { orderNum } = req.body;
    if (!orderNum) return res.status(400).json({ error: "orderNum is required" });
    const result = await robint.getOrderInfo(orderNum);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/order/operation
 * ยกเลิก หรือเปลี่ยนเป็นส่งโดยพนักงาน
 * Body: { orderNum, state }  (state: "CANCELLED" | "PEOPLE_DELIVERY")
 */
router.post("/order/operation", async (req, res) => {
  try {
    const { orderNum, state } = req.body;
    if (!orderNum || !state) {
      return res.status(400).json({ error: "orderNum and state are required" });
    }
    const result = await robint.operationOrder(orderNum, state);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/order/pending-count
 * ดูจำนวน Order ที่รอการจัดส่งอยู่ในขณะนี้
 */
router.get("/order/pending-count", async (req, res) => {
  try {
    const result = await robint.getPendingDeliveryOrder();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/order/actions
 * ดูประวัติการเคลื่อนไหวของ Order (Delivery Tracking)
 * Body: { orderNum }
 */
router.post("/order/actions", async (req, res) => {
  try {
    const { orderNum } = req.body;
    if (!orderNum) return res.status(400).json({ error: "orderNum is required" });
    const result = await robint.getOrderActions(orderNum);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ── เรียกหุ่นยนต์ (Summon) ────────────────────────────────
// ============================================================

/**
 * POST /api/call
 * เรียกหุ่นยนต์ให้มาหา (Customer Call)
 * Body: { robotUuid, pointUuid, phone? }
 */
router.post("/call", async (req, res) => {
  try {
    const { robotUuid, pointUuid, phone } = req.body;
    if (!robotUuid || !pointUuid) {
      return res.status(400).json({ error: "robotUuid and pointUuid are required" });
    }
    const result = await robint.callRobot(robotUuid, pointUuid, phone);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ── โฆษณา (Advertisement) ─────────────────────────────────
// ============================================================

/**
 * POST /api/ad/push
 * ส่งไฟล์โฆษณา (รูปภาพ/วิดีโอ) ไปแสดงบนหุ่นยนต์
 * Body: { robotUuids, callBackUrl, files: [{ filePath, fileType, playTime, sort }] }
 */
router.post("/ad/push", async (req, res) => {
  try {
    const result = await robint.pushAdFileToRobots(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ── สถิติ (Statistics) ────────────────────────────────────
// ============================================================

/**
 * POST /api/stats/tasks
 * ดูสถิติงานของหุ่นยนต์ (จำนวนงาน / ระยะทาง / เวลา)
 * Body: { startTime, endTime, robotUuids? }
 */
router.post("/stats/tasks", async (req, res) => {
  try {
    const { startTime, endTime, robotUuids } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ error: "startTime and endTime are required" });
    }
    const result = await robint.getRobotTaskStatistic(startTime, endTime, robotUuids);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/stats/orders
 * ดูสถิติ Order (แยกตามประเภทคำสั่ง)
 * Body: { startTime, endTime, robotUuids? }
 */
router.post("/stats/orders", async (req, res) => {
  try {
    const { startTime, endTime, robotUuids } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ error: "startTime and endTime are required" });
    }
    const result = await robint.getOrderStatistic(startTime, endTime, robotUuids);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/stats/task-records
 * ดูประวัติงานของหุ่นยนต์แบบ record-by-record
 * Body: { robotUuidList?, taskTypeList?, taskStateList?, startTime?, endTime? }
 * หมายเหตุ: Rate Limit 1 ครั้ง/วินาที, ช่วงวันสูงสุด 1 เดือน
 */
router.post("/stats/task-records", async (req, res) => {
  try {
    const result = await robint.findRobotTaskRecords(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/stats/order-records
 * ดูประวัติ Order ของหุ่นยนต์แบบ record-by-record
 * Body: { robotUuidList?, startTime, endTime }
 * หมายเหตุ: Rate Limit 1 ครั้ง/วินาที, ช่วงวันสูงสุด 1 เดือน
 */
router.post("/stats/order-records", async (req, res) => {
  try {
    const { startTime, endTime, robotUuidList } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ error: "startTime and endTime are required" });
    }
    const result = await robint.findRobotOrderList(startTime, endTime, robotUuidList);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ── Callbacks (Webhook รับจาก Robint) ─────────────────────
// ============================================================

/**
 * POST /api/callback/order
 * Robint จะยิงมาที่นี่ทุกครั้งที่สถานะ Order เปลี่ยน
 * (ต้องกำหนด callBackUrl ตรงนี้ตอนสร้าง Order)
 */
router.post("/callback/order", (req, res) => {
  const { orderNum, thridOrderNum, state, msg, actionTime, orderDlvState } = req.body;
  console.log(`[Callback] Order: ${orderNum} | thrid: ${thridOrderNum} | state: ${state} | msg: ${msg}`);
  if (orderDlvState) {
    console.log(`[Callback] DlvState: point=${orderDlvState.pointName}, type=${orderDlvState.dlvType}, takeOut=${orderDlvState.takeOut}`);
  }
  // TODO: บันทึกลงฐานข้อมูล หรือแจ้งเตือน Frontend ต่อได้ที่นี่
  res.status(200).json({ success: true });
});

/**
 * POST /api/callback/ad
 * Robint จะยิงมาที่นี่เมื่อหุ่นยนต์ติดตั้งไฟล์โฆษณาเสร็จแล้ว
 */
router.post("/callback/ad", (req, res) => {
  const { playGroupName, playGroupNumber, state, actionTime } = req.body;
  console.log(`[Callback] Ad: ${playGroupName} (${playGroupNumber}) | state: ${state} | time: ${actionTime}`);
  // TODO: บันทึกสถานะโฆษณา หรือแจ้งเตือน Frontend ต่อได้ที่นี่
  res.status(200).json({ success: true });
});

// ส่งออก router ไปให้ app.js ใช้งาน
module.exports = router;