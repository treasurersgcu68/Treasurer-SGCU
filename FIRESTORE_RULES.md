# Firestore Rules & Audit Log Schema

ไฟล์นี้สรุปโครงสร้างข้อมูลและแนวทางใช้งาน `firestore.rules` สำหรับระบบจองห้องประชุม
พร้อม Audit Log ที่เพิ่มในฝั่ง Web App

## Collections ที่ใช้

1. `meetingRoomBookings`
2. `meetingRooms`
3. `meetingRoomHolidays`
4. `auditLogs`

## Audit Log Schema (`auditLogs`)

แต่ละเอกสารมีฟิลด์หลักดังนี้

- `action`: ประเภทการกระทำ เช่น `booking.created`, `booking.status_updated_by_staff`
- `entityType`: ประเภทข้อมูล เช่น `meetingRoomBooking`, `meetingRoom`, `meetingRoomHoliday`
- `entityId`: document id ของข้อมูลหลัก
- `before`: snapshot ก่อนแก้ไข (nullable)
- `after`: snapshot หลังแก้ไข (nullable)
- `actorUid`: uid ของผู้กระทำ
- `actorEmail`: อีเมลผู้กระทำ
- `actorRole`: `member` หรือ `staff`
- `source`: แหล่งที่มา (`web_app`, `web_app_staff`)
- `metadata`: object เสริม เช่น context ของ action
- `timestamp`: `serverTimestamp()`

## Action ที่ถูก log แล้ว

### ฝั่งผู้ใช้งานจองห้อง (`app.meeting-room-booking.js`)

- `booking.created`
- `booking.status_updated` (กรณี staff ปรับจาก modal รายละเอียด)
- `booking.cancelled_by_requester`
- `booking.reschedule_requested`

### ฝั่ง Staff (`app.meeting-room-staff.js`)

- `booking.status_updated_by_staff`
- `booking.deleted_by_staff`
- `meeting_room.created`
- `meeting_room.deleted`
- `meeting_room.renamed`
- `meeting_room.booking_access_updated`
- `meeting_holiday.created`
- `meeting_holiday.deleted`

## ข้อสำคัญด้านความปลอดภัย

- ปัจจุบัน Audit Log ถูกเขียนจาก Client และถูกบังคับด้วย Firestore Rules
- สำหรับระบบ Production ที่ต้องการความน่าเชื่อถือสูง แนะนำให้ย้ายการเขียน Audit Log ไปที่ Cloud Functions
  เพื่อป้องกันการปลอม payload จาก client

## หมายเหตุเรื่องสิทธิ์ Staff

ไฟล์ `firestore.rules` นี้อ้างอิง custom claims เช่น

- `request.auth.token.staff == true`
- `request.auth.token.isStaff == true`
- `request.auth.token.role in ["staff", "admin"]`

หากโปรเจกต์ยังไม่ได้ตั้ง custom claims ต้องเพิ่มขั้นตอนตั้งค่าในฝั่ง Auth backend ก่อน
หรือปรับ rules ให้สอดคล้องกับโมเดลสิทธิ์ที่ใช้อยู่จริง
