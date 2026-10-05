# Sisu — Learn English

แอปเรียนภาษาอังกฤษสำหรับผู้ใช้ภาษาไทย สำเนาจาก Learn Finnish โดยใช้หน้าตาและฟังก์ชันเดิม: พจนานุกรม บทเรียน 1–5, Test 1, Favorites, ประวัติการค้นหา, Flashcards, Multiple choice, Matching, Fill in the blank, เสียงอ่าน และ PWA

## เริ่มใช้งาน

```sh
cd "/Users/phawit/Projects/Learn English"
npm install
npm run dev
```

เปิด http://localhost:5175 — API ทำงานที่ http://127.0.0.1:4176 เพื่อเปิดคู่กับ Learn Finnish ได้

## API และข้อมูล

ใช้ Gemini รุ่น `gemini-3.1-flash-lite` ตามต้นฉบับ โดยอ่าน `GEMINI_API_KEY` จาก `.env` ในโปรเจกต์นี้ คัดลอก key เดิมไว้แล้วและไม่เก็บใน Git หรือส่งไปยัง browser

API รับ `direction` เป็น `auto`, `en-th`, `th-en` และส่งคืน `english`, `thai`, `exampleEnglish`, `exampleThai` พร้อมข้อมูลคำศัพท์

ข้อมูลการเรียนบันทึกใน browser ด้วย namespace `sisu-english:` แยกจากต้นฉบับ

ไฟล์ประกอบและเสียงใน `public/lesson1` และ `public/lesson5` เป็นฉบับอังกฤษ–ไทย ชื่อไฟล์และหมายเลขหน้าเดิมคงไว้เพื่อให้ลิงก์ทำงานต่อได้ ภาพสภาพอากาศที่ไม่ขึ้นกับภาษาคงตามต้นฉบับ ส่วนเอกสารใน `docs/superpowers` เป็นประวัติการออกแบบจากโปรเจกต์ต้นฉบับ

## ตรวจสอบและ build

```sh
npm test
npm run check
npm run build
npm start
```

หลัง build เปิด http://127.0.0.1:4176

Node.js 22 ขึ้นไป ชุดทดสอบปิด experimental web storage ของ Node เพื่อใช้ localStorage ของ jsdom
