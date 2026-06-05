# Operations Monitoring

คู่มือนี้ใช้ตั้งค่า monitoring และ budget alert สำหรับ Firebase/Google Cloud ของ Treasurer SGCU

## Scope

Firebase project ปัจจุบัน:

```text
departmentwebsite-5aec1
```

ระบบนี้เป็น static web app ที่ใช้ Firebase Hosting, Firestore, Auth และ Analytics เป็นหลัก ความเสี่ยงค่าใช้จ่ายหลักอยู่ที่ Firestore document reads/writes และ storage/indexes

## Budget Alert Setup

ตั้งใน Google Cloud Console:

1. เปิด Google Cloud Console
2. เลือก project `departmentwebsite-5aec1`
3. ไปที่ Billing
4. เปิด Budgets & alerts
5. สร้าง budget ใหม่สำหรับ project นี้
6. ตั้ง budget รายเดือนตามวงเงินที่ทีมรับได้
7. ตั้ง alert threshold อย่างน้อย:
   - 50%: แจ้งเตือนเร็ว
   - 80%: เริ่มตรวจ usage
   - 100%: ต้องหยุด deploy/feature ที่เพิ่ม read จนกว่าจะตรวจ
8. ใส่อีเมล Head Staff และอีเมลกลางของทีมเหรัญญิกเป็น recipients

ถ้า budget alert ส่งไปแค่ billing admin ให้เพิ่ม email forwarding หรือ Google Group ของทีม เพื่อไม่ให้ alert ติดอยู่กับบัญชีคนเดียว

## Firestore Usage Review

ตรวจอย่างน้อยเดือนละครั้งใน Firebase Console:

1. เปิด Firebase Console
2. เลือก project `departmentwebsite-5aec1`
3. ไปที่ Firestore Database
4. ดู Usage tab
5. ตรวจแนวโน้ม:
   - document reads ต่อวัน
   - document writes ต่อวัน
   - storage size
   - index storage

สัญญาณที่ต้องตรวจทันที:

- reads เพิ่มขึ้นผิดปกติหลัง deploy
- หน้า staff เปิดครั้งเดียวแล้ว reads สูงหลายพัน
- storage/index โตต่อเนื่องทั้งที่ไม่มี workflow ใหม่
- มี error ให้สร้าง Firestore index ใน browser console

## Collection Watchlist

คอลเลกชันที่ควรจับตาก่อน:

| Collection | เหตุผล | แนวทางดูแล |
| --- | --- | --- |
| `meetingRoomBookings` | โตตามเวลาและ public อ่านได้ | จำกัดช่วงวันที่, archive ข้อมูลเก่า |
| `borrowAssetRequests` | มีทั้งคิวปัจจุบันและประวัติ | แยก active/history query, export ประวัติรายปี |
| `budgetApprovalRequests` | ข้อมูลการเงินสำคัญ | เคลียร์/backup รายปีตาม workflow |
| `auditLogs` | โตจากทุก workflow | เก็บตาม retention policy |
| `organizationRepresentativeApplications` | ใช้กับสิทธิ์องค์กร | ตรวจ query และสิทธิ์ staff |

## Monthly Checklist

1. ดู billing current month ว่าไม่เกิน threshold
2. ดู Firestore reads/writes/storage เทียบเดือนก่อน
3. เปิดหน้า workflow หลักและดู console error:
   - คำของบประมาณ
   - ยืมพัสดุ
   - จองห้องประชุม
   - Staff approval
   - อนุมัติตัวแทนองค์กร
4. Export/backup collection สำคัญถ้ามีการเปลี่ยนรุ่นหรือก่อนลบข้อมูลเก่า
5. บันทึก incident หรือ usage spike ในเอกสารส่งต่อรุ่น

## Incident Response

ถ้าได้รับ budget alert หรือพบ usage spike:

1. หยุด deploy feature ใหม่ชั่วคราว
2. เช็ก deploy ล่าสุดว่ามีการเพิ่ม `onSnapshot`, `getDocs`, หรือ query ที่อ่านทั้ง collection หรือไม่
3. เปิด Firebase Usage เพื่อตรวจช่วงเวลาที่ reads/writes พุ่ง
4. ตรวจ browser console ของหน้าที่เพิ่งแก้
5. ถ้าเกิดจาก query อ่านกว้าง ให้จำกัดด้วย `where`, `limit`, หรือโหลดเมื่อเปิด tab เท่านั้น
6. ถ้าเกิดจากข้อมูลเก่าสะสม ให้ export แล้ว archive/ลบตาม policy

## Retention Recommendation

คำแนะนำเริ่มต้น:

- `budgetApprovalRequests`: backup แล้วเคลียร์รายปี ถ้า workflow ทีมทำแบบนี้อยู่แล้ว
- `meetingRoomBookings`: เก็บ active/current year ในระบบหลัก, export ข้อมูลเก่ารายปี
- `borrowAssetRequests`: เก็บ active ในระบบหลัก, export history รายปีหรือรายเทอม
- `auditLogs`: เก็บ 1-2 ปี ถ้าไม่มีข้อกำหนดอื่น

ก่อนลบข้อมูล production ให้ export collection และยืนยันกับ Head Staff ทุกครั้ง
