# เผยแพร่ Database City บน GitHub Pages

โหมด GitHub Pages บันทึกบัญชี ความคืบหน้า ตัวละคร และคะแนนใน localStorage ของเบราว์เซอร์ คะแนนรวมแสดงเฉพาะบัญชีในเบราว์เซอร์เดียวกัน ไม่เชื่อมฐานข้อมูลเซิร์ฟเวอร์หรือบัญชีครูจากเซิร์ฟเวอร์เดิม รหัสผ่านเก็บเป็น PBKDF2 พร้อม salt; โหมดนี้ใช้เล่นและทบทวนในเครื่อง ไม่ใช่ระบบสอบที่ป้องกันแก้คะแนน

## เผยแพร่

1. อัปโหลดการแก้ไขนี้ไป branch main ของ jamelswift/Database-room
2. เปิด Settings → Pages → Build and deployment → Source และเลือก GitHub Actions
3. เปิด Actions → Publish Database City to GitHub Pages → Run workflow หาก workflow ยังไม่เริ่มจากการ push
4. รอ job deploy สำเร็จ แล้วเปิด https://jamelswift.github.io/Database-room/

Workflow สร้าง out/index.html, ไฟล์ JavaScript/CSS, รูป, ฟอนต์ และเสียง โดยใช้ base path /Database-room และ .nojekyll

## สร้างและตรวจในเครื่อง

- pnpm run test:local
- pnpm exec tsc --noEmit --incremental false
- pnpm run build:pages

สคริปต์สร้างสำเนาโปรเจคใน .pages-build-* โดยไม่รวม app/api และไม่คัดลอก data หรือไฟล์บัญชีจริง จากนั้นส่งเฉพาะ out/ เป็น artifact หน้าเว็บแสดงโหมดเก็บข้อมูลในเครื่องอย่างชัดเจน สามารถส่งออกคะแนนเป็น CSV ก่อนล้างข้อมูลเบราว์เซอร์

การใช้ pnpm run build และ pnpm start ตามปกติยังเป็นโหมดเซิร์ฟเวอร์เดิม โหมด Pages เปิดเฉพาะจาก build:pages
