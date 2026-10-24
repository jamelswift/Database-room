export const CASE_RESOURCES: Record<number, { note: string; files: { name: string; file: string }[]; bundle: string }> = {
  "1": {
    "note": "เปิด Case01_Data_Problems.sql ใน MySQL Workbench แล้วสำรวจข้อมูลซ้ำและรหัสอ้างอิงผิดด้วย SELECT",
    "files": [
      {
        "name": "ใบงาน 01 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_01.docx"
      },
      {
        "name": "ชุดข้อมูล SQL จำลองข้อมูลซ้ำและรหัสอ้างอิงผิด เปิดด้วย MySQL Workbench",
        "file": "Case01_Data_Problems.sql"
      }
    ],
    "bundle": "Case01_Resources.zip"
  },
  "2": {
    "note": "เปิด Case02_Students.sql ใน MySQL Workbench แล้วอ่านตาราง Students และคีย์หลัก",
    "files": [
      {
        "name": "ใบงาน 02 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_02.docx"
      },
      {
        "name": "ชุดข้อมูลนักศึกษา SQL สำหรับเรียนรู้ตารางและคีย์หลัก",
        "file": "Case02_Students.sql"
      },
      {
        "name": "ภาพสรุป Entity Attribute Tuple และ Primary Key",
        "file": "Case02_Table_Structure.pdf"
      }
    ],
    "bundle": "Case02_Resources.zip"
  },
  "3": {
    "note": "เปิด Case03_Coffee_Shop.sql แล้วใช้ Reverse Engineer ดู EER ใน MySQL Workbench",
    "files": [
      {
        "name": "ใบงาน 03 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_03.docx"
      },
      {
        "name": "ชุดข้อมูลร้านกาแฟ SQL พร้อมความสัมพันธ์ สำหรับเปิด EER ใน Workbench",
        "file": "Case03_Coffee_Shop.sql"
      },
      {
        "name": "โจทย์กรณีศึกษาร้านกาแฟ Database City Coffee",
        "file": "Case03_Requirements.pdf"
      },
      {
        "name": "กระดาษกราฟวาด ERD พร้อมคำอธิบายสัญลักษณ์",
        "file": "ERD_Template.pdf"
      }
    ],
    "bundle": "Case03_Resources.zip"
  },
  "4": {
    "note": "อ่านคู่มือติดตั้ง แล้วแนบภาพการเชื่อมต่อสำเร็จโดยไม่เปิดเผยรหัสผ่าน",
    "files": [
      {
        "name": "ใบงาน 04 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_04.docx"
      },
      {
        "name": "คู่มือติดตั้งและเชื่อมต่อ MySQL พร้อมภาพหน้าจออ้างอิง",
        "file": "Installation_Guide_MySQL.pdf"
      }
    ],
    "bundle": "Case04_Resources.zip"
  },
  "5": {
    "note": "ไฟล์ SQL เป็นแม่แบบคอมเมนต์ ให้เติมคำสั่งเองก่อนรัน",
    "files": [
      {
        "name": "ใบงาน 05 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_05.docx"
      },
      {
        "name": "แม่แบบ SQL สร้างฐานข้อมูลและตาราง",
        "file": "Case05_DDL_Template.sql"
      },
      {
        "name": "สรุปไวยากรณ์ DDL สำหรับใช้คู่กับแม่แบบ SQL",
        "file": "Worksheet_05.pdf"
      }
    ],
    "bundle": "Case05_Resources.zip"
  },
  "6": {
    "note": "ไฟล์ SQL มีช่อง ___ ต้องเติมชนิดข้อมูลและคีย์ก่อนรัน",
    "files": [
      {
        "name": "ใบงาน 06 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_06.docx"
      },
      {
        "name": "สรุปชนิดข้อมูล MySQL พร้อม PK FK",
        "file": "Case06_DataTypes_Reference.pdf"
      },
      {
        "name": "แม่แบบเติมชนิดข้อมูลและ PK FK",
        "file": "Case06_Script_Template.sql"
      }
    ],
    "bundle": "Case06_Resources.zip"
  },
  "7": {
    "note": "รัน Starter ใน schema ฝึกก่อนทำภารกิจ ข้อมูลตั้งต้นมีสินค้า 5 รายการ",
    "files": [
      {
        "name": "ใบงาน 07 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_07.docx"
      },
      {
        "name": "ข้อมูลสินค้า 5 รายการสำหรับ INSERT UPDATE DELETE",
        "file": "Case07_DML_Starter.sql"
      }
    ],
    "bundle": "Case07_Resources.zip"
  },
  "8": {
    "note": "รอบเริ่มต้นเพิ่ม FK ตามโค้ดตัวอย่าง แล้ว Reverse Engineer เพื่อดู EER โดยยังไม่ต้องลากเส้นเอง",
    "files": [
      {
        "name": "ใบงาน 08 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_08.docx"
      },
      {
        "name": "คู่มือ Reverse Engineer และสร้างความสัมพันธ์พร้อมภาพอ้างอิง",
        "file": "Case08_EER_Guide.pdf"
      },
      {
        "name": "ข้อมูล 4 ตารางสำหรับฝึกสร้างความสัมพันธ์ EER",
        "file": "Case08_Master_Script.sql"
      }
    ],
    "bundle": "Case08_Resources.zip"
  },
  "9": {
    "note": "รัน SQL เพื่อเตรียมพนักงาน 50 คน ลูกค้า และสินค้า 100 รายการก่อนทำใบงาน",
    "files": [
      {
        "name": "ใบงาน 09 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_09.docx"
      },
      {
        "name": "ข้อมูลพนักงาน 50 คนและสินค้า 100 รายการสำหรับ SELECT WHERE",
        "file": "Case09_Query_Practice.sql"
      }
    ],
    "bundle": "Case09_Resources.zip"
  },
  "10": {
    "note": "รัน SQL เพื่อเตรียม Sales และ Employees ให้ครบทั้งโจทย์ยอดขายและ COUNT แผนก IT",
    "files": [
      {
        "name": "ใบงาน 10 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_10.docx"
      },
      {
        "name": "ข้อมูลยอดขายและพนักงานสำหรับ SUM AVG COUNT GROUP BY",
        "file": "Case10_Aggregate_Data.sql"
      }
    ],
    "bundle": "Case10_Resources.zip"
  },
  "11": {
    "note": "มีลูกค้าที่ยังไม่เคยสั่งซื้อสำหรับเปรียบเทียบ INNER JOIN กับ LEFT JOIN",
    "files": [
      {
        "name": "ใบงาน 11 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_11.docx"
      },
      {
        "name": "ฐานข้อมูลลูกค้าและการสั่งซื้อสำหรับ INNER JOIN LEFT JOIN",
        "file": "Case11_Join_Scenarios.sql"
      }
    ],
    "bundle": "Case11_Resources.zip"
  },
  "12": {
    "note": "ทำ Subquery เงินเดือนและ IN ตามตัวอย่างสั้น ๆ ในใบงาน รอบแรกยังไม่ต้องเขียน EXISTS",
    "files": [
      {
        "name": "ใบงาน 12 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_12.docx"
      },
      {
        "name": "ข้อมูลพร้อมโจทย์สำหรับ Subquery และ Nested Queries",
        "file": "Case12_Subquery_Exercises.sql"
      }
    ],
    "bundle": "Case12_Resources.zip"
  },
  "13": {
    "note": "สร้าง View ง่าย ๆ ตามโค้ดที่ให้ แล้วเปิดดูชื่อ Index และแผน โดยยังไม่วิเคราะห์ความเร็วเชิงลึก",
    "files": [
      {
        "name": "ใบงาน 13 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_13.docx"
      },
      {
        "name": "ตัวอย่าง CREATE VIEW CREATE INDEX และ EXPLAIN",
        "file": "Case13_Performance_Script.sql"
      }
    ],
    "bundle": "Case13_Resources.zip"
  },
  "14": {
    "note": "รันไฟล์ตัวอย่าง แล้วฝึก CALL เปลี่ยนรหัสสินค้าและเปิดดู Log ยังไม่ต้องเขียน Trigger ใหม่จากศูนย์",
    "files": [
      {
        "name": "ใบงาน 14 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_14.docx"
      },
      {
        "name": "ตัวอย่าง Procedure รับพารามิเตอร์และ Trigger บันทึก Log",
        "file": "Case14_Procedures_Triggers.sql"
      }
    ],
    "bundle": "Case14_Resources.zip"
  },
  "15": {
    "note": "ใช้ Case15_Security_Data.sql ในชุดนี้เตรียม Sales บน db_city_case10 ก่อนฝึกบัญชี read-only ในเครื่องที่ครูจัดให้",
    "files": [
      {
        "name": "ใบงาน 15 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_15.docx"
      },
      {
        "name": "ชุดข้อมูล Sales สำหรับฝึกสิทธิ์ ใช้ schema db_city_case10 เช่นเดียวกับหน่วย 10",
        "file": "Case15_Security_Data.sql"
      },
      {
        "name": "คู่มือ CREATE USER GRANT FLUSH PRIVILEGES และ REVOKE",
        "file": "Case15_Security_Guide.pdf"
      }
    ],
    "bundle": "Case15_Resources.zip"
  },
  "16": {
    "note": "เริ่มจาก Portfolio ของงานเล็กที่เคยทำ รวบรวม SQL และภาพที่สำเร็จก่อนต่อยอดโครงงานปลายภาค",
    "files": [
      {
        "name": "ใบงาน 16 ฉบับเริ่มต้น เปิดโปรแกรมทีละขั้น พร้อมตัวอย่างและรูบริก 20 คะแนน",
        "file": "Worksheet_16.docx"
      },
      {
        "name": "รูบริกประเมินโครงงานฉบับสมบูรณ์ 100 คะแนน",
        "file": "Final_Project_Rubric.pdf"
      },
      {
        "name": "โครงร่าง Portfolio พร้อมหน้าปก Data Dictionary EER และ SQL",
        "file": "Portfolio_Template.docx"
      }
    ],
    "bundle": "Case16_Resources.zip"
  }
};
