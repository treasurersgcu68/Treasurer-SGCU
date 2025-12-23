/*
 * สารบัญไฟล์ JS (อัปเดตตามการแยกโมดูลปัจจุบัน)
 *
 * - app.core.js            : config + globals ที่ใช้ร่วมกันทุกโมดูล
 * - app.helpers.js         : helper ทั่วไป (parse/format/cache/background)
 * - app.data.js            : โหลดข้อมูลจาก Google Sheets + cache
 * - app.project-ui.js      : Project Status UI (filter/summary/table/KPI)
 * - app.project-modal.js   : โมดัลรายละเอียดโครงการ + PDF autofill
 * - app.charts.js          : กราฟสรุปสถานะ/แนวโน้ม (Chart.js)
 * - app.pie.js             : กราฟวงกลมสัดส่วนงบประมาณอนุมัติ
 * - app.sorting-auth.js    : sorting ตาราง + gating สิทธิ์เข้าถึง
 * - app.org.js             : แผนผังทีมเหรัญญิก (Org Structure)
 * - app.news.js            : ข่าว/ประกาศ + modal preview
 * - app.downloads.js       : รายการดาวน์โหลดเอกสารการเงิน
 * - app.scoreboard.js      : คะแนนโครงการ SGCU-10.001
 * - app.calendar.js        : ปฏิทินโครงการจากข้อมูล projects
 * - app.motion.js          : motion helpers (section appear / count up)
 * - app.init.js            : ผูกอีเวนต์ + init ทั้งระบบเมื่อ DOM พร้อม
 *
 * ลำดับการโหลดดูได้จาก index.html
 */
