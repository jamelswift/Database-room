"""MySQL datasets and matching introductory Workbench activities."""
def build_datasets(sql, setup, out):
    sql(1,'Case01_Data_Problems.sql',setup(1)+'''
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Customer;
-- Deliberately unnormalised copies, with no FK, to demonstrate file-system problems.
CREATE TABLE Customer (RowID INT PRIMARY KEY, CustomerID VARCHAR(10), CustomerName VARCHAR(80), Phone VARCHAR(20));
INSERT INTO Customer VALUES (1,'C001','Mali','0812340001'),(2,'C001','Mali','0899999999'),(3,'C002','Suda','0812340002');
CREATE TABLE Orders (OrderID INT PRIMARY KEY, CustomerID VARCHAR(10));
INSERT INTO Orders VALUES (1,'C001'),(2,'C999');
CREATE TABLE Products (RowID INT PRIMARY KEY, ProductCode VARCHAR(10), ProductName VARCHAR(50), UnitPrice DECIMAL(10,2));
INSERT INTO Products VALUES (1,'P001','Coffee',65),(2,'P001','Coffee',60),(3,'P002','Tea',50);
SELECT * FROM Customer ORDER BY RowID;
''','ชุดข้อมูล SQL จำลองข้อมูลซ้ำและรหัสอ้างอิงผิด เปิดด้วย MySQL Workbench')
    sql(2,'Case02_Students.sql',setup(2)+'''
DROP TABLE IF EXISTS Students;
CREATE TABLE Students (StudentID INT PRIMARY KEY, FullName VARCHAR(80), Classroom VARCHAR(10), Phone VARCHAR(20));
INSERT INTO Students VALUES (67001,'Mali','1/1','0812340001'),(67002,'Somchai','1/1','0812340002'),(67003,'Mali','1/2','0812340003');
SELECT * FROM Students ORDER BY StudentID;
''','ชุดข้อมูลนักศึกษา SQL สำหรับเรียนรู้ตารางและคีย์หลัก')
    sql(3,'Case03_Coffee_Shop.sql',setup(3)+'''
DROP TABLE IF EXISTS SaleItems;
DROP TABLE IF EXISTS Sales;
DROP TABLE IF EXISTS Drinks;
DROP TABLE IF EXISTS Employees;
CREATE TABLE Employees (EmployeeID INT PRIMARY KEY, FullName VARCHAR(80)) ENGINE=InnoDB;
CREATE TABLE Drinks (DrinkID INT PRIMARY KEY, DrinkName VARCHAR(50), CurrentPrice DECIMAL(10,2)) ENGINE=InnoDB;
CREATE TABLE Sales (SaleID INT PRIMARY KEY, EmployeeID INT, SaleDate DATE,
 FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)) ENGINE=InnoDB;
CREATE TABLE SaleItems (SaleID INT, DrinkID INT, Quantity INT, UnitPrice DECIMAL(10,2),
 PRIMARY KEY (SaleID,DrinkID), FOREIGN KEY (SaleID) REFERENCES Sales(SaleID),
 FOREIGN KEY (DrinkID) REFERENCES Drinks(DrinkID)) ENGINE=InnoDB;
INSERT INTO Employees VALUES (1,'Mali');
INSERT INTO Drinks VALUES (1,'Coffee',65),(2,'Tea',50);
INSERT INTO Sales VALUES (1,1,'2026-11-02');
INSERT INTO SaleItems VALUES (1,1,2,65),(1,2,1,50);
SELECT * FROM SaleItems;
''','ชุดข้อมูลร้านกาแฟ SQL พร้อมความสัมพันธ์ สำหรับเปิด EER ใน Workbench')
    # Preserve the schema used by the existing GRANT/REVOKE lesson; include its own local copy.
    sql(15,'Case15_Security_Data.sql',(out/'Case10_Aggregate_Data.sql').read_text(encoding='utf-8'),
        'ชุดข้อมูล Sales สำหรับฝึกสิทธิ์ ใช้ schema db_city_case10 เช่นเดียวกับหน่วย 10')

def align_lessons(lessons, tasks, step):
    lessons[0].update(files='Case01_Data_Problems.sql',
      goals=['รันชุดข้อมูลตัวอย่างใน MySQL Workbench ได้','ค้นข้อมูลซ้ำและรหัสอ้างอิงผิดจากผล SELECT ได้','แก้ราคาหนึ่งแถวแล้วอธิบายความไม่สอดคล้องได้'],
      theory=['ข้อมูลซ้ำและข้อมูลไม่สอดคล้องเกิดได้เมื่อเก็บสำเนาเรื่องเดียวกันหลายตำแหน่ง ใบงานนี้จำลองปัญหาระบบไฟล์ด้วยตารางใน MySQL เพื่อสังเกตผลผ่าน Workbench',
      'ชุดฝึกมี Customer Orders และ Products โดยจงใจไม่กำหนด FK และใช้ RowID แยกแต่ละสำเนา จึงพบรหัส C001 ซ้ำ เบอร์โทรต่างกัน และ Orders อ้าง C999 ที่ไม่มีจริง โครงสร้างนี้มีไว้ทดลองปัญหา ไม่ใช่แบบฐานข้อมูลที่ควรนำไปใช้งานจริง'],
      checks=['SELECT พบ C001 สองแถวและเบอร์โทรต่างกัน','พบ Orders อ้าง C999 แต่ Customer ไม่มี','จดราคา P001 ก่อนแก้เป็น 65 และ 60','UPDATE RowID 1 เป็น 70 แถวอื่นยังเป็น 60'],
      skill=['เมื่อ UPDATE RowID 1 แล้วราคา P001 อีกแถวเปลี่ยนตามหรือไม่','รหัสลูกค้าใดมีใน Orders แต่ไม่มีใน Customer'],
      research=['ค้นความหมายของ WHERE ใน SELECT พร้อมตัวอย่างสั้น ๆ','FK ช่วยตรวจข้อมูลอ้างอิงผิดอย่างไร'])
    tasks[1]=[
      step('ในแท็บคำตอบ คัดลอกคำสั่งนี้ ลากคลุมแล้วคลิกสายฟ้า อ่าน Result Grid ด้านล่าง จดเบอร์โทรทั้งสองค่า','พบ C001 สองแถว ชื่อเดียวกันแต่เบอร์โทรต่างกัน',"SELECT * FROM Customer WHERE CustomerID = 'C001';"),
      step('รันทีละคำสั่ง เปรียบเทียบ CustomerID ของ Orders กับผลค้นลูกค้า C999','Orders มี C999 แต่ SELECT จาก Customer คืน 0 แถว',"SELECT * FROM Orders;\nSELECT * FROM Customer WHERE CustomerID = 'C999';"),
      step('รันคำสั่งและจดราคาก่อนแก้ พร้อม RowID ของแต่ละแถว','P001 มีราคา 65 และ 60',"SELECT * FROM Products WHERE ProductCode = 'P001';"),
      step('รัน UPDATE เพียงครั้งเดียว จากนั้นรัน SELECT เพื่อเปรียบเทียบ บันทึกผลใน Word','RowID 1 เปลี่ยนเป็น 70 ส่วน RowID 2 ยังคง 60',"UPDATE Products SET UnitPrice = 70 WHERE RowID = 1;\nSELECT * FROM Products WHERE ProductCode = 'P001';")]
    lessons[1]['files']='Case02_Students.sql และ Case02_Table_Structure.pdf'
    lessons[1]['goals']=['เปิดชุดข้อมูล Students ใน MySQL Workbench ได้','ชี้ Entity Attribute และ Tuple จาก Result Grid ได้','เลือก StudentID เป็น PK พร้อมเหตุผลได้']
    tasks[2]=[
      step('คัดลอกคำสั่งนี้ลงแท็บคำตอบ ลากคลุมแล้วคลิกสายฟ้า ดูหัวคอลัมน์และนับแถวใน Result Grid','เห็น 4 คอลัมน์และนักศึกษา 3 คน','SELECT * FROM Students ORDER BY StudentID;'),
      step('รันคำสั่งดูโครงสร้าง อ่านช่อง Field Type และ Key แล้วจดชื่อคีย์หลักลงใบงาน','StudentID แสดง PRI ส่วน Phone เป็น varchar จึงเก็บเลขศูนย์นำหน้าได้','DESCRIBE Students;'),
      step('รันตัวอย่างค้นชื่อซ้ำ แล้วเปรียบเทียบ StudentID','Mali สองคนมีรหัส 67001 และ 67003',"SELECT * FROM Students WHERE FullName = 'Mali';"),
      step('ใน Word ส่วนบันทึกผล เขียน Entity = Students, Attribute = ชื่อคอลัมน์, Tuple = นักศึกษาหนึ่งแถว แล้วอธิบายว่าเหตุใดชื่อจึงใช้แทนรหัสไม่ได้','มีคำอธิบายที่อ้างอิงตารางจริงและภาพผลลัพธ์จาก Workbench')]
    lessons[1]['checks']=['SELECT พบ 4 คอลัมน์ 3 แถว','DESCRIBE แสดง StudentID เป็น PRI','พบ Mali สองคนรหัสต่างกัน','ระบุ Entity Attribute Tuple จากผลจริง']
    lessons[1]['criteria']=['เปิดและรันชุดข้อมูล','อ่านผล SELECT และโครงสร้าง','ระบุคำศัพท์และเลือก PK','บันทึกหลักฐานและสรุป','ตอบคำถามและค้นคว้า']
    lessons[2].update(files='Case03_Coffee_Shop.sql และ Case03_Requirements.pdf และ ERD_Template.pdf',
      goals=['เปิดชุดข้อมูลร้านกาแฟใน MySQL Workbench ได้','สร้างภาพ EER จากตารางตัวอย่างด้วย Reverse Engineer ได้','ชี้ PK FK และความสัมพันธ์ 3 คู่ได้'],
      theory=['ERD ใช้อธิบายข้อมูลและความสัมพันธ์ ส่วน EER ใน Workbench แสดงตาราง คอลัมน์ และคีย์จริง ใบงานนี้ให้เปิดภาพจากชุดข้อมูลที่เตรียมไว้ จึงไม่ต้องเขียนคำสั่งสร้างตารางเอง',
      'Employees เชื่อม Sales ผ่าน EmployeeID ส่วน Sales และ Drinks เชื่อม SaleItems ผ่าน SaleID และ DrinkID ตามลำดับ ชุดข้อมูลมีใบขายหนึ่งใบ เป็น Coffee 2 แก้วและ Tea 1 แก้ว เอกสาร ERD_Template เป็นตัวอย่างสัญลักษณ์เพิ่มเติม'],
      checks=['นำเข้าชุดข้อมูลครบ 4 ตาราง','เปิด EER จาก db_city_case03','ชี้ความสัมพันธ์ครบ 3 คู่','บันทึกไฟล์ mwb และภาพ EER'],
      criteria=['เปิดและรันข้อมูลร้านกาแฟ','ใช้ Reverse Engineer ตามขั้นตอน','ระบุ PK FK และความสัมพันธ์','บันทึกแบบจำลองและผล','สรุปและตอบคำถาม'])
    tasks[3]=[
      step('ในแท็บคำตอบ รันคำสั่งดูรายการตาราง แล้วรันดูรายการขาย','เห็น 4 ตารางและ SaleItems สองแถว Coffee จำนวน 2 กับ Tea จำนวน 1','SHOW TABLES;\nSELECT * FROM SaleItems;'),
      step('คลิกเมนู Database > Reverse Engineer เลือก Stored Connection ที่ใช้เปิดชุดข้อมูล แล้วกด Next ใส่รหัสผ่านเมื่อถาม กด Next หลังเชื่อมต่อสำเร็จ','wizard แสดงรายชื่อ schemas ที่อ่านได้'),
      step('เลือกเฉพาะ db_city_case03 แล้วกด Next รออ่านรายการตาราง จากนั้นกด Next ตรวจว่าติ๊ก Import MySQL Table Objects และ Place imported objects on a diagram แล้วกด Execute','ตารางทั้ง 4 ถูกนำเข้าในแบบจำลอง'),
      step('เมื่อเสร็จ กด Next แล้ว Finish ถ้าไม่เห็นภาพ ให้ดับเบิลคลิก EER Diagram ใต้ EER Diagrams ในหน้า Model','เห็น Employees Drinks Sales SaleItems พร้อมเส้นเชื่อม 3 เส้น'),
      step('ดู EmployeeID ใน Employees และ Sales จากนั้นดู SaleID และ DrinkID ที่เชื่อม SaleItems เขียนชื่อคู่ตารางทั้งสามคู่ลงใบงาน','ระบุได้ว่าฝั่งตารางแม่หนึ่งแถวมีข้อมูลในตารางลูกได้หลายแถว'),
      step('คลิก File > Save Model As เลือกโฟลเดอร์งาน ตั้งชื่อ Case03_รหัสนักเรียน.mwb แล้วกด Save จับภาพ EER แนบใน Word','มีไฟล์แบบจำลอง mwb และภาพที่อ่านชื่อทั้ง 4 ตารางได้')]
    lessons[14]['files']='Case15_Security_Data.sql และ Case15_Security_Guide.pdf'
