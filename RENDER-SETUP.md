# Render

ตั้งค่า Web Service ของ Next.js:

- Build Command: `pnpm install --frozen-lockfile && pnpm run build`
- Start Command: `pnpm run start`
- Environment: `DATABASE_URL` เป็น Internal Database URL ของ PostgreSQL บน Render ที่อยู่บัญชีและภูมิภาคเดียวกับเว็บ
- Environment: `NEXT_PUBLIC_LOCAL_MODE=false` (ตั้งก่อน build)

หากใช้ PostgreSQL ภายนอก Render ให้ใช้ URL ของเซิร์ฟเวอร์นั้นพร้อมการตั้งค่า TLS ตามผู้ให้บริการ ห้ามใช้ `localhost:5433` เพราะเป็นฐานในเครื่องพัฒนา

คำสั่ง start เชื่อมต่อ PostgreSQL และสร้างตารางที่ยังไม่มีแบบไม่ลบข้อมูล ก่อนเริ่ม Next.js บน `0.0.0.0` และพอร์ต `PORT` ที่ Render กำหนด บัญชีใน DATABASE_URL ต้องสร้างตารางได้ในการเริ่มครั้งแรก หรือให้ผู้ดูแลรัน `database/schema.sql` ก่อน

PostgreSQL ของ Windows เริ่มผ่าน `npm.cmd run dev` หรือ `npm.cmd run db:start` ในเครื่องพัฒนาเท่านั้น Production start ไม่เรียกโปรแกรม Windows

ข้อมูลและบัญชีในเครื่องไม่ได้ถูกส่งไป Render อัตโนมัติ หากฐานบน Render ว่าง ต้องย้ายข้อมูลหรือสร้างบัญชีใหม่ที่นั่น

เอกสาร: https://render.com/docs/deploy-nextjs-app และ https://render.com/docs/postgresql-creating-connecting
