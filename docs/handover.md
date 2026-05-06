# Handover Guide

เอกสารนี้เป็นคู่มือส่งต่อระบบ Treasurer SGCU ให้รุ่นถัดไป โดยเน้นสิ่งที่ต้องรู้ก่อนแก้เว็บหรือดูแลข้อมูล

## System Overview

เว็บนี้เป็น static web app ที่ใช้ JavaScript ฝั่ง browser เป็นหลัก และเชื่อมต่อ Firebase สำหรับ auth, Firestore, analytics และ workflow หลายส่วน

แหล่งข้อมูลหลัก:

- Google Sheets CSV: ข่าว, เอกสารดาวน์โหลด, Project Status, org filters, org structure, borrow asset catalog
- Firestore: staff/user profiles, คำขออนุมัติงบ, คำขอยืมพัสดุ, booking ห้องประชุม, app settings
- Firebase Auth: login ด้วยบัญชี Google/อีเมลที่ระบบรองรับ

ไฟล์สำคัญ:

- `js/core/app.config.js`: config หลักของ sheets, Firestore collections, feature flags
- `js/integrations/app.firebase-bootstrap.js`: Firebase initialization
- `js/integrations/app.runtime-config.js`: runtime config จาก `appSettings/global`
- `firestore.rules`: สิทธิ์อ่าน/เขียน Firestore
- `tools/build-static.mjs`: build static output

## Common Tasks

### เพิ่มหรือแก้ลิงก์ Google Sheets

แก้ที่ `SGCU_APP_CONFIG.sheets` ใน `js/core/app.config.js`

ถ้าเป็นลิงก์สำหรับ staff เปิดไปแก้ข้อมูล ให้แก้ที่ `SGCU_APP_CONFIG.managementLinks` ด้วย

### เพิ่ม Head Staff ชั่วคราว

แก้ `isBootstrapHeadStaff()` ใน `firestore.rules`

หลังแก้ rules ต้อง deploy Firestore rules ผ่าน Firebase CLI

### เพิ่ม Staff ถาวร

ให้ Head Staff อนุมัติผ่านระบบ staff approval เพื่อสร้าง/แก้เอกสารใน `staffProfiles`

ระบบตรวจ staff จาก:

- email ตรงกับ bootstrap head staff
- หรือมี document ใน `staffProfiles/{email}` ที่มี role/position code/division code/positions

### ตั้งค่า Runtime Config

ใช้ document:

```text
appSettings/global
```

ตัวอย่าง:

```json
{
  "enabled": true,
  "config": {
    "cache": {
      "ttlMs": 180000
    },
    "features": {
      "borrowAssets": {
        "allowedPickupDays": [1, 4]
      }
    }
  }
}
```

ตอนนี้ runtime config รองรับเฉพาะค่าที่ normalize ใน `js/integrations/app.runtime-config.js`

## Deployment Checklist

1. ตรวจ `git status` ว่ามีไฟล์ที่ไม่เกี่ยวข้องหรือไม่
2. รัน build/test ตาม workflow ของโปรเจกต์
3. ตรวจหน้าเว็บสำคัญหลัง build:
   - Home
   - Project Status
   - News
   - Financial Docs
   - Staff pages
   - Meeting room pages
4. ถ้าแก้ Firestore rules ให้ deploy rules และลอง login บัญชี staff จริง
5. บันทึกสิ่งที่เปลี่ยนใน PR หรือ release note

## Backup Checklist

อย่างน้อยก่อนเปลี่ยนรุ่นควร export:

- `staffProfiles`
- `userProfiles`
- `budgetApprovalRequests`
- `borrowAssetRequests`
- `meetingRoomBookings`
- Google Sheets ทุกชีตที่ยังเป็น source หลัก

สำหรับข้อมูลที่จะย้ายจาก Google Sheets ไป Firestore ควรเก็บ CSV ต้นฉบับไว้ทุกครั้งก่อน import

## Troubleshooting

### ข้อมูล Google Sheets ไม่ขึ้น

เช็กตามลำดับ:

1. ลิงก์ใน `js/core/app.config.js` ยังเปิดแบบ published CSV ได้หรือไม่
2. ชีตถูก unpublish หรือเปลี่ยน permission หรือไม่
3. column order ในชีตเปลี่ยนจากที่โค้ดอ่านหรือไม่
4. localStorage cache ยังเป็นข้อมูลเก่าหรือไม่

### Firestore อ่าน/เขียนไม่ได้

เช็กตามลำดับ:

1. login แล้วหรือยัง
2. บัญชีมี document ใน `staffProfiles/{email}` หรือไม่
3. rules อนุญาต operation นั้นหรือไม่
4. query ต้องใช้ index เพิ่มหรือไม่
5. console มี error `permission-denied` หรือไม่

### หน้า Staff ไม่ขึ้น

เช็ก:

- Firebase Auth ทำงานหรือไม่
- email ตรงกับ `staffProfiles` หรือไม่
- `firestore.rules` deploy ล่าสุดหรือยัง
- feature loader โหลด partial/script ครบหรือไม่

## Long-term Direction

เป้าหมายระยะยาวคือให้รุ่นต่อไปดูแลข้อมูลผ่าน Staff Admin UI แทนการแก้โค้ดหรือไล่ Google Sheets หลายไฟล์

ลำดับที่แนะนำ:

1. ย้าย `news` ไป `newsItems`
2. ย้าย `downloads` ไป `downloadDocuments`
3. ทำ import/export CSV สำหรับสอง collection แรก
4. ย้าย `borrowAssets` ไป `borrowAssetCatalog`
5. ย้าย `orgFilters` ไป `organizationCatalog`
6. ตัดสินใจเรื่อง Project Status หลังจาก workflow ของทีมชัดเจน
