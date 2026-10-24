from pathlib import Path
import json, zipfile
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/case-resources'
QA=ROOT/'tmp/worksheet-build'
items=json.loads((QA/'resource-manifest.json').read_text(encoding='utf-8'))
assert len(items)==40, len(items)
notes={
1:'เปิด Case01_Data_Problems.sql ใน MySQL Workbench แล้วสำรวจข้อมูลซ้ำและรหัสอ้างอิงผิดด้วย SELECT',
2:'เปิด Case02_Students.sql ใน MySQL Workbench แล้วอ่านตาราง Students และคีย์หลัก',
3:'เปิด Case03_Coffee_Shop.sql แล้วใช้ Reverse Engineer ดู EER ใน MySQL Workbench',
4:'อ่านคู่มือติดตั้ง แล้วแนบภาพการเชื่อมต่อสำเร็จโดยไม่เปิดเผยรหัสผ่าน',
5:'ไฟล์ SQL เป็นแม่แบบคอมเมนต์ ให้เติมคำสั่งเองก่อนรัน',
6:'ไฟล์ SQL มีช่อง ___ ต้องเติมชนิดข้อมูลและคีย์ก่อนรัน',
7:'รัน Starter ใน schema ฝึกก่อนทำภารกิจ ข้อมูลตั้งต้นมีสินค้า 5 รายการ',
8:'รอบเริ่มต้นเพิ่ม FK ตามโค้ดตัวอย่าง แล้ว Reverse Engineer เพื่อดู EER โดยยังไม่ต้องลากเส้นเอง',
9:'รัน SQL เพื่อเตรียมพนักงาน 50 คน ลูกค้า และสินค้า 100 รายการก่อนทำใบงาน',
10:'รัน SQL เพื่อเตรียม Sales และ Employees ให้ครบทั้งโจทย์ยอดขายและ COUNT แผนก IT',
11:'มีลูกค้าที่ยังไม่เคยสั่งซื้อสำหรับเปรียบเทียบ INNER JOIN กับ LEFT JOIN',
12:'ทำ Subquery เงินเดือนและ IN ตามตัวอย่างสั้น ๆ ในใบงาน รอบแรกยังไม่ต้องเขียน EXISTS',
13:'สร้าง View ง่าย ๆ ตามโค้ดที่ให้ แล้วเปิดดูชื่อ Index และแผน โดยยังไม่วิเคราะห์ความเร็วเชิงลึก',
14:'รันไฟล์ตัวอย่าง แล้วฝึก CALL เปลี่ยนรหัสสินค้าและเปิดดู Log ยังไม่ต้องเขียน Trigger ใหม่จากศูนย์',
15:'ใช้ Case15_Security_Data.sql ในชุดนี้เตรียม Sales บน db_city_case10 ก่อนฝึกบัญชี read-only ในเครื่องที่ครูจัดให้',
16:'เริ่มจาก Portfolio ของงานเล็กที่เคยทำ รวบรวม SQL และภาพที่สำเร็จก่อนต่อยอดโครงงานปลายภาค',
}
resources={}
for case in range(1,17):
    files=[item for item in items if item['case']==case]
    assert 2 <= len(files) <= 4,(case,len(files))
    assert any(x['file']==f'Worksheet_{case:02d}.docx' for x in files),case
    files.sort(key=lambda x: (not x['file'].endswith('.docx') or not x['file'].startswith('Worksheet_'),x['file']))
    for item in files:assert (OUT/item['file']).is_file(),item['file']
    zipname=f'Case{case:02d}_Resources.zip'
    with zipfile.ZipFile(OUT/zipname,'w',zipfile.ZIP_DEFLATED) as z:
        for item in files:z.write(OUT/item['file'],item['file'])
    resources[case]=dict(note=notes[case],files=[dict(name=x['name'],file=x['file']) for x in files],bundle=zipname)
with zipfile.ZipFile(OUT/'Database_City_All_Cases.zip','w',zipfile.ZIP_DEFLATED) as z:
    for item in items:z.write(OUT/item['file'],f"Case{item['case']:02d}/{item['file']}")
(ROOT/'components/case-resources.ts').write_text('export const CASE_RESOURCES: Record<number, { note: string; files: { name: string; file: string }[]; bundle: string }> = '+json.dumps(resources,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
readme='''# ชุดใบงาน Database City

ใบงานสำหรับ 16 หน่วยเรียน สัปดาห์ 1–8 และ 10–17 สัปดาห์ 9 และ 18 เป็นการสอบ
มีใบงานหลัก Word ครบ 16 หน่วย หน่วยละ 9 ส่วน พร้อมเอกสารและข้อมูลประกอบ รวม 40 ไฟล์
ใบงานมีวัตถุประสงค์ อุปกรณ์ ทฤษฎี ขั้นตอนตั้งแต่เปิดโปรแกรม พร้อมโค้ดตัวอย่างและผลที่ควรเห็น
มีบันทึกผล สรุปผล คำถามง่ายสองประเภท และรูบริก 20 คะแนน
มี ZIP แยกหน่วยและ ZIP รวมทั้งหมด

ข้อมูลทั้งหมดเป็นข้อมูลสมมติ Case01 จงใจมีข้อมูลซ้ำ ไม่สอดคล้อง และรหัสอ้างอิงผิด
SQL สำเร็จรูปใช้ schema db_city_caseXX แยกหน่วย การรันซ้ำล้างตารางฝึกใน schema นั้น
ชุดข้อมูลใช้ไฟล์ .sql เปิดผ่าน File > Open SQL Script ใน MySQL Workbench แล้วรันตามใบงาน
Word ใช้บันทึกผลและตอบคำถาม ส่วน PDF ใช้อ่านประกอบ
Case05 และ Case06 เป็นแม่แบบที่ผู้เรียนต้องเติมก่อนรัน
คู่มือติดตั้งอิง Installer 8.0 ส่วนขั้นตอนติดตั้งรุ่นอื่นอาจต่างกันตามที่ระบุในคู่มือ
แบบฝึก EER เริ่มจากตารางที่ยังไม่ประกาศ FK เพื่อให้ผู้เรียนเชื่อมในแบบจำลองเอง
การแก้แบบจำลองไม่เปลี่ยน Server จนกว่าจะ Forward Engineer หรือรัน ALTER TABLE
ใบงานความปลอดภัยใช้บัญชีทดลองในเครื่องเท่านั้น ไม่เผยแพร่รหัสผ่านจริง
การผ่านเกมไม่ถือเป็นการส่งเอกสาร ให้ส่งงานตามช่องทางที่ครูกำหนด
'''
(OUT/'README.txt').write_text(readme,encoding='utf-8')
print('Verified 40 files including 16 nine-section worksheets; created 16 unit ZIPs and one complete ZIP')
