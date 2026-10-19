# คะแนนนักเรียนเรียลไทม์บน GitHub Pages

โค้ดรองรับ Supabase Auth, PostgreSQL และ Realtime แล้ว แต่ต้องสร้างโปรเจคและตั้งค่าด้านล่างก่อนใช้ข้ามเครื่องจริง ไฟล์เว็บ GitHub Pages ไม่ได้เก็บฐานข้อมูลและไม่มีรหัสครูในไฟล์สาธารณะ

## 1. สร้างโปรเจค

เปิด https://supabase.com/dashboard สร้าง New project และรอพร้อมใช้งาน ตั้งรหัสฐานข้อมูลด้วยตัวเอง รหัสนี้ไม่ใช่รหัสเข้าเกมและไม่ต้องส่งมาในแชต

เปิด SQL Editor วางเนื้อหาทั้งไฟล์ supabase/setup.sql แล้วกด Run ก่อนสมัครบัญชีใด ๆ ไฟล์นี้สร้างตาราง ป้องกันนักเรียนอ่านข้อมูลคนอื่น ป้องกันการเปลี่ยนสิทธิ์ครู และเปิด Realtime ให้คะแนนที่บันทึกสำเร็จ

ใน Authentication → Providers → Email เปิด Email provider และปิด Confirm email เพราะระบบใช้ชื่อบัญชีในเกมแปลงเป็นอีเมลภายในรูปแบบ username@database-city.invalid ซึ่งไม่ได้เป็นกล่องจดหมายจริง ขั้นตอนนี้ทำให้เข้าใช้งานด้วยชื่อบัญชีและรหัสผ่านได้ทันที ระบบนี้ไม่มีการกู้รหัสผ่านทางอีเมล

## 2. เชื่อมเว็บ

จากหน้า Connect หรือ Project Settings → API คัดลอก Project URL และ Publishable key (หรือ anon key เดิม) แล้วตั้ง Repository variables ใน GitHub ที่ Settings → Secrets and variables → Actions → Variables:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

ทั้งสองค่านี้เป็นค่าฝั่งเว็บที่เผยแพร่ได้ สิทธิ์อ่านและเขียนถูกบังคับด้วย RLS และ Auth ห้ามใช้ secret key หรือ service_role key ในตัวแปร NEXT_PUBLIC ใด ๆ

ส่งเฉพาะ Project URL และ Publishable key มาให้ช่วยเชื่อมได้ ไม่ต้องส่งรหัสฐานข้อมูลหรือ secret key

## 3. สร้างครู

เตรียมชื่อ teacher และรหัสสุ่มไว้ในไฟล์ส่วนตัว .env.teacher.local แล้ว ไฟล์นี้ถูก Git ignore และไม่ถูกคัดลอกลง static build

วิธีผ่าน Dashboard:

1. ใน Authentication → Users → Add user / Create new user สร้างอีเมล teacher@database-city.invalid ใช้รหัสจาก .env.teacher.local และเลือกยืนยันอีเมลอัตโนมัติ
2. หลังสร้างบัญชีสำเร็จ เปิด SQL Editor แล้วรัน:

    update public.game_profiles
    set role = 'teacher', display_name = 'ครู'
    where username = 'teacher'
      and id = (select id from auth.users where email = 'teacher@database-city.invalid');

3. เข้าเกมด้วยชื่อ teacher และรหัสที่เตรียมไว้ ระบบจะเปิดแดชบอร์ดครูเอง นักเรียนที่สมัครผ่านเว็บเป็น student เสมอ

อีกวิธีสำหรับผู้ดูแลเครื่อง: ตั้ง NEXT_PUBLIC_SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY ใน .env.local ส่วนตัว แล้วรัน node scripts/create-cloud-teacher.cjs สคริปต์จะสร้างผู้ใช้ ยืนยันอีเมลและให้สิทธิ์ครู จากนั้นแสดงรหัสครั้งเดียว ห้ามอัปโหลด .env.local หรือ service_role key ขึ้น GitHub

หากชื่อ teacher ถูกใช้แล้ว อย่าเลื่อนสิทธิ์บัญชีนักเรียนที่ไม่ทราบเจ้าของ ใช้ชื่อครูใหม่และสร้างบัญชีใหม่แทน

## 4. เผยแพร่และตรวจใช้งานจริง

Push โค้ดขึ้น main หรือรัน workflow Publish Database City to GitHub Pages ใหม่ รอ deploy สำเร็จ แล้วรีเฟรชเกม แถบด้านบนต้องเป็นโหมดออนไลน์

เปิดเครื่องหรือเบราว์เซอร์หนึ่งด้วยบัญชีครู อีกเครื่องด้วยบัญชีนักเรียน สมัครนักเรียนด้วยรหัสอย่างน้อย 6 ตัวอักษร แล้วตอบคำถาม ตรวจว่าระบบส่งคะแนนสำเร็จและกราฟ/ตารางครูเปลี่ยนโดยไม่ต้องรีเฟรช นี่เป็นการตรวจบริการจริงที่ยังทำไม่ได้ก่อนสร้างโปรเจค

แดชบอร์ดฟัง database changes และโหลดรายงานใหม่ทันทีหลังบันทึก เมื่อเชื่อมต่อใหม่จะโหลดคะแนนล่าสุด หาก Realtime หลุดจะตรวจข้อมูลสำรองทุก 3 วินาที และมีการตรวจทวนทุก 30 วินาทีขณะเชื่อมต่อปกติ

บัญชีและคะแนนโหมด local เดิมไม่ได้ย้ายอัตโนมัติไป Supabase ยังอยู่ในเบราว์เซอร์เดิม ควรส่งออก CSV เก็บไว้ก่อนเปลี่ยนโหมด นักเรียนต้องสมัครบัญชีออนไลน์ใหม่ คะแนนในเกมตรวจคำตอบที่เบราว์เซอร์ จึงเหมาะกับการเรียนและทบทวน ไม่ใช่ระบบสอบที่ป้องกันการแก้คะแนน

## ทดสอบโค้ด

- pnpm run test:cloud: ทดสอบ adapter และการแจ้งเปลี่ยนแปลงด้วย mock client พร้อมรัน SQL จริงบน PostgreSQL ในเครื่องผ่าน PGlite เพื่อตรวจ RLS/สิทธิ์/คะแนน
- pnpm run test:local และ pnpm run test:database: ตรวจโหมดเดิม
- pnpm exec tsc --noEmit --incremental false
- pnpm run build:pages

เอกสารอ้างอิง: https://supabase.com/docs/guides/realtime/postgres-changes และ https://supabase.com/docs/guides/database/postgres/row-level-security

หาก build บน Windows ค้างกับ Turbopack สามารถใช้ node scripts/build-pages.cjs --webpack ได้ โดยยังสร้าง static export เดียวกัน ต้องใช้ CA certificates ที่ระบบเชื่อถือหากเครื่องมี HTTPS proxy ไม่ต้องปิดการตรวจใบรับรอง
