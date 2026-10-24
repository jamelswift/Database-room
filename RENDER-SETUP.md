# Render

## ใช้ฐานข้อมูล Neon

โปรเจกต์ที่เลือก: `lucky-haze-69139303` ในองค์กร `org-soft-band-12486356` และ branch `production`

1. เข้าสู่ระบบ CLI ด้วย `npx.cmd --yes neon@latest login`
2. ผูกโปรเจกต์: `npx.cmd --yes neon@latest init -y --no-agent-setup --org-id org-soft-band-12486356 --project-id lucky-haze-69139303 --branch production --services postgres`
3. ใช้ `npx.cmd --yes neon@latest deploy` เพื่อปรับบริการตาม `neon.ts` และดึงค่าลง `.env.local` (หรือ `.env` หากมีอยู่แล้ว)
4. บน Render เพิ่ม `DATABASE_URL` และ `DATABASE_URL_UNPOOLED` จากไฟล์ env ดังกล่าว และตั้ง `NEXT_PUBLIC_LOCAL_MODE=false` ก่อน rebuild
5. แอปใช้ไดรเวอร์ `pg` ฝั่ง Node.js โดยอ่าน/เขียนผ่าน `DATABASE_URL` แบบ pooled ส่วนการสร้างตารางใช้ `DATABASE_URL_UNPOOLED` แบบ direct

คำสั่ง `neon deploy` ตั้งค่าบริการ Neon และไฟล์ env ในเครื่อง ไม่ได้อัปเดต Environment ของ Render อัตโนมัติ

ทดสอบด้วย `npm.cmd run build` แล้ว `npm.cmd run start` จากนั้นรัน `node scripts/test-postgres-live.cjs` โดยตั้ง `TEST_REQUIRE_NEON=true` เพื่อยืนยันว่าทดสอบกับ Neon จริง ตั้ง `TEST_BASE_URL` หากเว็บเปิดบนพอร์ตอื่น

`npm.cmd run dev` จะใช้ฐานภายนอกที่กำหนดไว้ และไม่สลับกลับไปฐาน Windows เมื่อ `DATABASE_URL` ชี้ Neon ไฟล์ค่าการเชื่อมต่อเดิมสำรองอยู่ใน `.env.before-neon-setup.local`

## แก้ข้อความ Set DATABASE_URL

ข้อความนี้หมายถึง Render เรียกโค้ดเริ่มเว็บรุ่นใหม่แล้ว แต่ Web Service ยังไม่ได้รับค่าการเชื่อมต่อฐานข้อมูล การกด Deploy ซ้ำอย่างเดียวยังไม่แก้ปัญหา

1. ใน Render Dashboard เปิดฐาน PostgreSQL ที่จะใช้ หากยังไม่มี เลือก New > Postgres และสร้างในภูมิภาคเดียวกับเว็บ
2. ในหน้าฐานข้อมูล เปิด Connect แล้วคัดลอก Internal Database URL
3. กลับไปหน้า Web Service ของเว็บ เลือก Environment > Add Environment Variable
4. ใส่ Key เป็น `DATABASE_URL` และ Value เป็น URL ที่คัดลอกจากฐานข้อมูล โดยไม่ใส่เครื่องหมายคำพูด
5. ตั้ง `NEXT_PUBLIC_LOCAL_MODE` เป็น `false` แล้วเลือก Save, rebuild, and deploy
6. เมื่อสำเร็จ Log จะแสดง `PostgreSQL connected; starting web server.` ตามด้วย `Ready`

ใส่ URL ใน Environment ของ Web Service โดยตรง ไม่ใช่ใส่เฉพาะในไฟล์ `.env.local` ของเครื่อง และไม่ต้องส่ง URL ที่มีรหัสผ่านในแชต

ฐาน PostgreSQL ที่สร้างในเครื่อง Windows เป็นคนละฐานกับ Render หากใช้แพ็กเกจ Free ของ Render Postgres ฐานจะหมดอายุหลังสร้าง 30 วัน จึงต้องเลือกแผนให้เหมาะกับการเก็บข้อมูลนักเรียนระยะยาว: https://render.com/docs/free#30-day-limit

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
