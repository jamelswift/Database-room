"""Concrete program-opening actions and short worked activities for beginners."""
from docx.shared import Pt

def step(action, result, code=None):
    return (action, code, result)

STARTER = {1:'Case01_Data_Problems.sql',2:'Case02_Students.sql',3:'Case03_Coffee_Shop.sql',7:'Case07_DML_Starter.sql',8:'Case08_Master_Script.sql',9:'Case09_Query_Practice.sql',10:'Case10_Aggregate_Data.sql',11:'Case11_Join_Scenarios.sql',12:'Case12_Subquery_Exercises.sql',13:'Case13_Performance_Script.sql',14:'Case14_Procedures_Triggers.sql',15:'Case15_Security_Data.sql'}

def opening(case):
    steps=[
      step('คลิกปุ่ม Start ของ Windows พิมพ์ Microsoft Edge หรือ Google Chrome แล้วกด Enter คลิกช่องที่อยู่ด้านบน พิมพ์ URL เว็บวิชาที่ครูแจ้งแล้วกด Enter','เห็นหน้าเว็บ Database City ถ้ายังเข้าไม่ได้ให้ตรวจ URL กับครูก่อน'),
      step(f'คลิกเข้าสู่ระบบ กรอกบัญชีที่ครูจัดให้ แล้วคลิกด่านหน่วยที่ {case} หากด่านยังล็อกให้แจ้งครู คลิกปุ่มดาวน์โหลดทั้งชุดของด่านนี้','ไฟล์ Case'+f'{case:02d}'+'_Resources.zip อยู่ในโฟลเดอร์ Downloads'),
      step(f'กด Windows + E เพื่อเปิด File Explorer คลิก Downloads คลิกขวาไฟล์ ZIP เลือก Extract All หรือแยกทั้งหมด เลือก Browse ไป Desktop แล้วสร้างโฟลเดอร์ Case{case:02d}_รหัสนักเรียน จากนั้นกด Extract','เห็นไฟล์ที่แยกแล้วในโฟลเดอร์งาน ไม่เปิดทำงานภายใน ZIP'),
      step(f'ในโฟลเดอร์งาน ดับเบิลคลิก Worksheet_{case:02d}.docx เพื่อเปิด Word หากเป็น Protected View ให้กด Enable Editing เมื่อยืนยันว่าเป็นไฟล์จากเว็บวิชา แล้วเลือก File > Save As > Browse บันทึกชื่อ Answer{case:02d}_รหัสนักเรียน.docx','มีสำเนาใบงานสำหรับพิมพ์คำตอบ ให้เปิด Word ค้างไว้และกด Ctrl + S เป็นระยะ'),
    ]
    steps += [
      step('คลิก Start พิมพ์ MySQL Workbench แล้วกด Enter ใบงานนี้ใช้หน้าจอ Workbench 8.0 ตามชุดที่ครูจัดให้ หากหาโปรแกรมไม่พบให้แจ้งครูเพื่อเตรียมเครื่องก่อน','เห็นหน้าแรกที่มีหัวข้อ MySQL Connections'),
      step('ดับเบิลคลิก Connection ที่ครูเตรียมไว้ เช่น Local Classroom หรือ Local instance ใส่รหัสผ่านเมื่อโปรแกรมถามแล้วกด OK ห้ามพิมพ์รหัสจริงลงใบงาน','เห็นหน้าต่าง SQL Editor ด้านซ้ายมี Navigator และ Schemas'),
    ]
    if case==4:
      # Connection creation is itself this unit's beginner activity.
      steps=steps[:-1]
    elif case in (5,6):
      filename=f'Case{case:02d}_'+('DDL_Template.sql' if case==5 else 'Script_Template.sql')
      steps.append(step(f'คลิก File > Open SQL Script ไปโฟลเดอร์งาน เลือก {filename} แล้วกด Open อ่านเป็นแนวทางก่อน ยังไม่กดรันไฟล์แม่แบบ','เห็นแม่แบบ หน่วย 5 เป็นคอมเมนต์ ส่วนหน่วย 6 มีช่อง ___ ที่ยังรันไม่ได้ ให้ใช้คำสั่งตัวอย่างด้านล่างก่อน'))
    elif case in STARTER:
      filename=STARTER[case]
      steps += [
        step(f'คลิก File > Open SQL Script เลือก {filename} จากโฟลเดอร์ที่ดาวน์โหลดแล้วกด Open อ่านบรรทัดชื่อฐานข้อมูลและคำเตือนก่อนรัน','ไฟล์เปิดในแท็บ SQL ของ Workbench'),
        step('ถ้าเป็นการเริ่มชุดฝึกครั้งแรกและไม่มีงานที่ต้องเก็บ ให้คลิกในโค้ด กด Ctrl + A แล้วคลิกปุ่มสายฟ้า Execute All or Selection บนแถบเครื่องมือ รอ Action Output ด้านล่าง หากมี error สีแดงให้หยุดและแจ้งครู','ตารางและข้อมูลตัวอย่างพร้อมใช้ การรันไฟล์ตั้งต้นซ้ำจะเริ่มข้อมูลฝึกใหม่ อย่ารันซ้ำหลังทำคำตอบโดยไม่สำรอง'),
      ]
    if case in STARTER:
      steps.append(step('ในแถบ Navigator คลิก Schemas แล้วคลิกขวาเลือก Refresh All ขยายชื่อ db_city_case ของหน่วยนี้และ Tables หากหน่วย 15 ให้ใช้ db_city_case10 ซึ่งเป็นข้อมูลยอดขายชุดเดียวกับหน่วย 10','เห็นตารางจากชุดข้อมูล หากไม่พบ ให้ตรวจ Action Output ก่อนรันไฟล์ซ้ำ'))
    if case!=4 and case!=16:
      schema='db_city' if case==5 else f'db_city_case{10 if case==15 else case:02d}'
      code=None if case in (5,6) else f'USE {schema};'
      steps.append(step('คลิก File > New Query Tab เพื่อเปิดแท็บคำตอบแยกจากไฟล์ตั้งต้น ต่อไปให้พิมพ์ทีละกล่องโค้ด ลากคลุมเฉพาะกล่องนั้น แล้วกดปุ่มสายฟ้า Execute All or Selection','เห็นแท็บว่างสำหรับคำตอบ '+('รัน USE สำเร็จและไม่มี error' if code else 'ยังไม่ต้องรัน USE จนกว่าจะสร้างฐานข้อมูลในขั้นถัดไป'),code))
    return steps

TASKS={
1:[
 step('คลิกแถบ Customer ที่ด้านล่าง แล้วดูคอลัมน์ A หารหัส C001 เปรียบเทียบชื่อและเบอร์โทรของรหัสนี้ทีละแถว','พบรหัสเดิมหลายแถวและมีข้อมูลบางค่าต่างกัน เขียนตัวอย่างเพียง 2 จุดในตารางบันทึกผล'),
 step('คลิกแถบ Orders ดูค่า CustomerID ในคอลัมน์ B เมื่อพบ C999 ให้กลับ Customer แล้วกด Ctrl + F พิมพ์ C999 กด Find All','ค้นไม่พบ C999 ใน Customer จึงมีคำสั่งซื้ออ้างถึงลูกค้าที่ไม่มีข้อมูล'),
 step('คลิกแถบ Products ดูแถวที่ ProductCode เป็น P001 เปรียบเทียบ UnitPrice แล้วจดราคาที่เห็นก่อนแก้','สินค้ารหัสเดียวกันมีราคาหลายค่า'),
 step('ในไฟล์สำเนา คลิกช่องราคาของ P001 เพียงหนึ่งช่อง พิมพ์ 70 แล้วกด Enter จากนั้นดูแถว P001 อื่น ๆ','ราคาในแถวอื่นไม่เปลี่ยนเอง บันทึกสิ่งที่เห็นสั้น ๆ 1–2 ประโยค'),
],
2:[
 step('ใน Word เลื่อนลงส่วน 6 คลิกในช่องผลจริง พิมพ์ชื่อตารางว่า Students แล้วกด Enter คลิก Insert > Table เลือก 4 คอลัมน์ 4 แถว','ได้ตารางว่าง 4 คอลัมน์ มีหนึ่งแถวหัวตารางและสามแถวข้อมูล'),
 step('พิมพ์หัวตารางทีละช่องตามตัวอย่าง ใช้ปุ่ม Tab ไปช่องถัดไป แล้วเติมข้อมูลตัวอย่างด้านล่าง','มีชื่อฟิลด์ 4 ชื่อและนักศึกษา 3 คน', 'StudentID | FullName | Classroom | Phone\n67001 | Mali | 1/1 | 0812340001\n67002 | Somchai | 1/1 | 0812340002\n67003 | Mali | 1/2 | 0812340003'),
 step('พิมพ์ใต้ตารางว่า Entity = นักศึกษา, Attribute = ชื่อคอลัมน์ทั้ง 4, Tuple = ข้อมูลนักศึกษาหนึ่งแถว แล้วพิมพ์ PK = StudentID','จำแนกคำศัพท์ได้จากตารางของตน ไม่ต้องวาดอินโฟกราฟิกใหม่'),
 step('เปรียบเทียบสองคนที่ชื่อ Mali ดูว่ารหัสเหมือนกันหรือไม่ แล้วเขียนเหตุผลสั้น ๆ ว่าทำไมจึงใช้ StudentID แทน FullName เป็น PK','แม้ชื่อซ้ำ แต่รหัสต่างกันและระบุคนได้ชัดเจน'),
],
3:[
 step('ดับเบิลคลิก ERD_Template.pdf ในโฟลเดอร์งาน กด Ctrl + P แล้ว Print หากไม่มีเครื่องพิมพ์ใช้กระดาษเปล่าและดินสอได้','มีกระดาษสำหรับวาด ไม่บังคับให้ติดตั้งโปรแกรมวาดเพิ่ม'),
 step('วาดสี่เหลี่ยม 4 กล่อง เขียน Employees, Drinks, Sales และ SaleItems ตามลำดับ ใช้ชื่อที่ให้มาได้เลย','มีกล่องข้อมูลหลักครบ 4 กล่อง'),
 step('วาดวงรีรอบแต่ละกล่องและใส่ชื่อฟิลด์ตามรายการ ขีดเส้นใต้ฟิลด์ที่มีคำว่า PK และใช้ SaleID กับ DrinkID เป็นคีย์ผสมใน SaleItems','ได้ฟิลด์พื้นฐาน ไม่ต้องออกแบบชื่อใหม่ทั้งหมด','Employees: EmployeeID (PK), FullName\nDrinks: DrinkID (PK), DrinkName, CurrentPrice\nSales: SaleID (PK), EmployeeID, SaleDate\nSaleItems: SaleID (PK), DrinkID (PK), Quantity, UnitPrice'),
 step('ลากเส้นเชื่อม Employees กับ Sales แล้วเขียน 1 ที่ฝั่ง Employees และ N ที่ฝั่ง Sales ทำเช่นเดียวกันระหว่าง Sales กับ SaleItems และ Drinks กับ SaleItems','มีความสัมพันธ์ 1 ต่อหลาย 3 คู่'),
 step('ใส่ข้าวหลามตัดและชื่อความสัมพันธ์บนเส้นตาม Legend เช่น ทำรายการขาย หรือ มีรายการ แล้วลองเล่าเรื่อง Coffee 2 แก้วในหนึ่งใบขายจากภาพของตน','อธิบายได้ว่าพนักงานหนึ่งคนทำรายการขายหลายครั้ง และรายการขายเก็บรายละเอียดสินค้า'),
 step('ใช้มือถือหรือ Snipping Tool ถ่ายภาพให้เห็นทั้งแผ่น ส่งภาพเข้าโฟลเดอร์งาน ใน Word คลิก Insert > Pictures > This Device เลือกภาพแล้ว Insert','แนบ ERD ลงใบงานได้ ไม่ต้องสร้างระบบฐานข้อมูลจริงในหน่วยนี้'),
],
4:[
 step('ที่หน้าแรก Workbench คลิกเครื่องหมาย + ข้าง MySQL Connections','เห็นหน้าต่าง Setup New Connection'),
 step('พิมพ์ชื่อ Connection ว่า Local Classroom เลือก Standard TCP/IP กรอก Hostname 127.0.0.1 และ Port 3306 หรือค่าที่ครูแจ้ง ส่วน Username ใช้บัญชีที่ครูจัดให้','ช่องข้อมูลครบ รหัสผ่านยังไม่ต้องเปิดเผยในเอกสาร'),
 step('คลิก Test Connection ใส่รหัสผ่านเมื่อถามแล้วกด OK ถ้าสำเร็จให้กด OK เพื่อบันทึก Connection','เห็นข้อความยืนยันว่าเชื่อมต่อสำเร็จ หาก Access denied ให้ตรวจบัญชีและรหัสกับครู'),
 step('กลับหน้าแรกแล้วดับเบิลคลิก Local Classroom คลิก File > New Query Tab พิมพ์คำสั่งด้านล่าง ลากคลุมแล้วคลิกสายฟ้า','มี Result Grid หนึ่งแถว แสดงเวอร์ชันและชื่อบัญชี','SELECT VERSION(), CURRENT_USER();'),
 step('กด Windows + Shift + S ลากจับภาพบริเวณ Connection และผลลัพธ์ เปิด Word คลิกช่องหลักฐานในส่วน 6 แล้วกด Ctrl + V','ภาพไม่เห็นรหัสผ่าน ถ้าใช้ Snipping Tool ไม่ได้ให้เปิด Start ค้นชื่อโปรแกรมนี้'),
],
5:[
 step('ในแท็บคำตอบ พิมพ์และรันคำสั่งแรก ถ้ามี db_city ของงานเดิมอยู่ ให้หยุดและใช้ชื่อ db_city_รหัสนักเรียนตามที่ครูกำหนดแทนทุกจุด','สร้างฐานข้อมูลสำเร็จ ไม่มี error สีแดง','CREATE DATABASE db_city CHARACTER SET utf8mb4;'),
 step('พิมพ์และรันคำสั่งเลือกฐานข้อมูล แล้วตรวจชื่อที่แสดง','SELECT DATABASE() แสดง db_city','USE db_city;\nSELECT DATABASE();'),
 step('คัดลอกตัวอย่างสร้างตารางลงแท็บคำตอบ ตรวจวงเล็บ comma และ semicolon ก่อนรัน','มีตาราง tb_users หนึ่งตาราง','CREATE TABLE tb_users (\n  id INT PRIMARY KEY,\n  username VARCHAR(50) NOT NULL\n);'),
 step('พิมพ์และรันคำสั่งตรวจทีละคำสั่ง ไม่ต้องลบตารางเมื่อเสร็จ','SHOW TABLES พบ tb_users และ DESCRIBE พบ id กับ username','SHOW TABLES;\nDESCRIBE tb_users;'),
],
6:[
 step('ในแท็บคำตอบ พิมพ์สร้างฐานข้อมูลฝึกและเลือกใช้งานตามกล่องนี้','ฐานข้อมูล db_city_case06 พร้อมใช้','CREATE DATABASE IF NOT EXISTS db_city_case06;\nUSE db_city_case06;'),
 step('พิมพ์ตัวอย่างสร้างตารางแม่ Customers ตามนี้ทั้งหมด แล้วรันเพียงกล่องนี้ก่อน','Customers สร้างสำเร็จ Phone เป็นข้อความจึงเก็บเลขศูนย์นำหน้าได้','CREATE TABLE Customers (\n  CustomerID INT PRIMARY KEY,\n  CustomerName VARCHAR(100) NOT NULL,\n  Phone VARCHAR(20)\n);'),
 step('พิมพ์ตัวอย่างสร้างตารางลูก Orders แล้วรัน ถ้ามีตารางเดิมจากการฝึกก่อนหน้าให้ให้ครูช่วยตรวจ ห้ามลบงานโดยเดาเอง','Orders สร้างสำเร็จและมี FK เชื่อมลูกค้า','CREATE TABLE Orders (\n  OrderID INT PRIMARY KEY,\n  CustomerID INT NOT NULL,\n  OrderDate DATE,\n  TotalAmount DECIMAL(10,2),\n  FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)\n);'),
 step('เพิ่มลูกค้าก่อน แล้วเพิ่มคำสั่งซื้อ รันสองคำสั่งตามลำดับ จากนั้นตรวจข้อมูล','เห็นลูกค้า 1 คนและคำสั่งซื้อ 1 แถว','INSERT INTO Customers VALUES (1,\'Mali\',\'0812340001\');\nINSERT INTO Orders VALUES (101,1,\'2026-11-24\',250.00);\nSELECT * FROM Customers;\nSELECT * FROM Orders;'),
 step('ทดลองเพิ่มคำสั่งซื้อที่ใช้ CustomerID 999 ซึ่งไม่มีอยู่ รันเฉพาะคำสั่งนี้ การขึ้น error ในขั้นนี้เป็นผลที่ต้องการ ให้บันทึกข้อความ','ระบบปฏิเสธเพราะ FK ไม่พบลูกค้า 999','INSERT INTO Orders VALUES (102,999,\'2026-11-24\',100.00);'),
 step('เปิดแม่แบบที่มี ___ แล้วใช้ตัวอย่างที่ทำสำเร็จช่วยเติมชนิดข้อมูลและชื่อคีย์ บันทึกแม่แบบที่เติมแล้ว ไม่ต้องรัน CREATE TABLE ซ้ำอีก','มีแม่แบบที่เติมครบและเข้าใจว่ารหัสใช้ INT ชื่อใช้ VARCHAR วันที่ใช้ DATE และเงินใช้ DECIMAL'),
],
7:[
 step('ตรวจข้อมูลเริ่มต้นก่อนลงมือ','เห็นสินค้า 5 รายการ ProductID 3 ราคา 1000','SELECT * FROM Products ORDER BY ProductID;'),
 step('คัดลอกตัวอย่างเพิ่มสินค้าใหม่ 2 รายการแล้วรัน','เพิ่ม ProductID 6 และ 7 สำเร็จ ตอนนี้มี 7 รายการ',"INSERT INTO Products VALUES\n(6,'Pen',20.00,1),\n(7,'Folder',40.00,1);\nSELECT * FROM Products ORDER BY ProductID;"),
 step('ลดราคาสินค้ารหัส 3 ตามตัวอย่าง รัน UPDATE เพียงครั้งเดียว แล้วรัน SELECT ตรวจ','ราคาเปลี่ยนจาก 1000 เป็น 500 ถ้ากดซ้ำจะลดลงอีก จึงไม่กดรันซ้ำ','UPDATE Products SET Price=Price*0.5 WHERE ProductID=3;\nSELECT * FROM Products WHERE ProductID=3;'),
 step('ตรวจสินค้าที่ยังไม่เคยขายก่อนลบ','พบ ProductID 4 และ 5 ให้จดรหัสทั้งสองก่อน','SELECT * FROM Products WHERE SalesCount=0;'),
 step('ลบเฉพาะรหัสที่ตรวจแล้วตามตัวอย่างนี้','เหลือสินค้า 5 แถว และไม่มีรหัส 4 กับ 5','DELETE FROM Products\nWHERE ProductID IN (4,5) AND SalesCount=0;\nSELECT * FROM Products ORDER BY ProductID;'),
],
8:[
 step('หลังนำเข้า Master Script ให้เพิ่ม FK ตามตัวอย่างทีละคำสั่ง ไม่ต้องวาดเส้นด้วยมือในรอบแรก','มีความสัมพันธ์ Customers → Orders → OrderItems และ Products → OrderItems', 'ALTER TABLE Orders ADD FOREIGN KEY (CustomerID)\nREFERENCES Customers(CustomerID);\nALTER TABLE OrderItems ADD FOREIGN KEY (OrderID)\nREFERENCES Orders(OrderID);\nALTER TABLE OrderItems ADD FOREIGN KEY (ProductID)\nREFERENCES Products(ProductID);'),
 step('คลิกเมนู Database > Reverse Engineer เลือก Connection เดิม แล้วคลิก Next','เห็นขั้นตอนเชื่อมต่อสำเร็จ'),
 step('ในรายการ Schemas ติ๊ก db_city_case08 แล้วคลิก Next ไปตามหน้าจอ เลือกทั้ง 4 ตาราง','รายการวัตถุที่จะนำเข้าแสดง Customers, Products, Orders และ OrderItems'),
 step('ติ๊ก Place imported objects on a diagram แล้วคลิก Execute หรือ Next ตามที่แสดง จนคลิก Finish ได้','เห็น EER Diagram 4 กล่องและเส้นเชื่อมที่อ่านจาก FK'),
 step('ลากกล่องจัดตำแหน่งให้อ่านง่าย คลิก File > Save Model As ตั้งชื่อ Case08_รหัสนักเรียน.mwb แล้วจับภาพลง Word','บันทึกแบบจำลองและภาพเรียบร้อย รอบนี้ยังไม่ต้องใช้เครื่องมือสร้างเส้นเอง'),
],
9:[
 step('พิมพ์และรันคำสั่งแสดงชื่อพนักงาน','เห็น FirstName และ LastName ทั้งหมด 50 แถว','SELECT FirstName, LastName FROM Employees;'),
 step('ค้นเฉพาะเงินเดือนมากกว่า 25000','เงินเดือนทุกแถวในผลลัพธ์มากกว่า 25000','SELECT EmployeeID, FirstName, Salary\nFROM Employees WHERE Salary > 25000;'),
 step('ค้นชื่อลูกค้าที่ขึ้นต้น S ตามตัวอย่าง เครื่องหมาย % อยู่หลัง S','พบ Suda, Somchai และ Siri',"SELECT CustomerID, CustomerName\nFROM Customers WHERE CustomerName LIKE 'S%';"),
 step('ค้นสินค้าในช่วงราคา 100 ถึง 500','ทุกแถวอยู่ในช่วง รวมราคา 100 และ 500 ด้วย','SELECT ProductID, ProductName, Price\nFROM Products WHERE Price BETWEEN 100 AND 500;'),
 step('ค้นพนักงาน IT แล้วเรียงเงินเดือนจากมากไปน้อย','ผลลัพธ์มีเฉพาะแผนก IT และ Salary เรียงจากมากไปน้อย',"SELECT FirstName, Salary FROM Employees\nWHERE Department='IT' ORDER BY Salary DESC;"),
],
10:[
 step('ตรวจจำนวนข้อมูลยอดขายก่อน','COUNT(*) แสดง 24 รายการ','SELECT COUNT(*) FROM Sales;'),
 step('หายอดรวมตามตัวอย่าง จดค่าที่แสดง ไม่ต้องคิดสูตรใหม่','ได้ยอดรวมหนึ่งค่า ใช้กรอกส่วนบันทึกผล','SELECT SUM(Amount) AS TotalSales FROM Sales;'),
 step('เปลี่ยน SUM เป็น AVG ตามกล่องนี้ แล้วรัน','ได้ยอดขายเฉลี่ยต่อหนึ่งรายการ','SELECT AVG(Amount) AS AverageSale FROM Sales;'),
 step('นับพนักงานแผนก IT จาก Employees','ได้ 12 คน',"SELECT COUNT(*) AS ITCount FROM Employees\nWHERE Department='IT';"),
 step('คัดลอกคำสั่งจัดกลุ่มสาขาแล้วรัน บันทึกชื่อสาขาและยอดรวมทั้งสาม','ได้ยอดรวมแยก 3 สาขา เมื่อบวกทั้งสามต้องเท่ากับ TotalSales','SELECT Branch, SUM(Amount) AS BranchTotal\nFROM Sales GROUP BY Branch;'),
],
11:[
 step('เริ่มจากเชื่อมลูกค้ากับใบสั่งซื้อสองตารางตามตัวอย่าง','เห็นเฉพาะลูกค้าที่มีคำสั่งซื้อ ชื่อลูกค้าซ้ำได้เมื่อซื้อหลายครั้ง','SELECT c.CustomerName, o.OrderID\nFROM Customers c\nINNER JOIN Orders o ON c.CustomerID=o.CustomerID;'),
 step('ดูว่าสินค้าใดเป็นรายการซื้อของ Suda โดยคัดลอกคำสั่งครบทั้งกล่อง','ได้ 3 บรรทัดรายการซื้อจาก 2 ใบสั่งซื้อ',"SELECT o.OrderID, p.ProductName, oi.Quantity\nFROM Customers c\nJOIN Orders o ON c.CustomerID=o.CustomerID\nJOIN OrderItems oi ON o.OrderID=oi.OrderID\nJOIN Products p ON oi.ProductID=p.ProductID\nWHERE c.CustomerName='Suda';"),
 step('ใช้ LEFT JOIN แล้วกรองใบสั่งซื้อว่างเพื่อหาลูกค้าที่ไม่เคยซื้อ','ได้ CustomerID 4, 5 และ 6 รวม 3 คน','SELECT c.CustomerID, c.CustomerName\nFROM Customers c\nLEFT JOIN Orders o ON c.CustomerID=o.CustomerID\nWHERE o.OrderID IS NULL;'),
],
12:[
 step('เริ่มจากหาค่าเฉลี่ยเงินเดือนด้วยคำสั่งเดียวก่อน','ได้ค่าเฉลี่ยหนึ่งตัวเลข ให้จดลงบันทึกผล','SELECT AVG(Salary) AS AverageSalary FROM Employees;'),
 step('คัดลอกคำสั่งค้นเงินเดือนสูงกว่าค่าเฉลี่ยทั้งกล่อง วงเล็บด้านในคือคำสั่งจากขั้นก่อน','ทุกแถวที่ได้มี Salary สูงกว่าค่าเฉลี่ยที่จดไว้','SELECT EmployeeID, FirstName, Salary\nFROM Employees\nWHERE Salary > (SELECT AVG(Salary) FROM Employees);'),
 step('ใช้ตัวอย่าง IN เพื่อหาลูกค้าที่มีการสั่งซื้อ รอบนี้ยังไม่ต้องเขียน EXISTS','ได้ลูกค้า 3 คน ไม่มีรายชื่อซ้ำในผลลัพธ์','SELECT CustomerID, CustomerName\nFROM Customers\nWHERE CustomerID IN (SELECT CustomerID FROM Orders);'),
],
13:[
 step('หลังรันไฟล์ตัวอย่าง ให้เริ่มจากอ่าน View ที่ไฟล์สร้างไว้แล้ว','เห็นสรุปยอดตามลูกค้า ไม่ต้องสร้างคำสั่งสรุปหลายตารางเอง','SELECT * FROM vw_sales_summary;'),
 step('สร้าง View ง่าย ๆ อีกหนึ่งตัวตามตัวอย่าง ไม่ต้องคิดระบบใหม่','สร้าง vw_my_customers สำเร็จ หากเคยมีชื่อนี้ในชุดฝึกจะปรับนิยามให้ตรงตัวอย่าง','CREATE OR REPLACE VIEW vw_my_customers AS\nSELECT CustomerID, CustomerName FROM Customers;'),
 step('พิมพ์คำสั่งอ่าน View ที่เพิ่งสร้าง แล้วกด Refresh ใน Schemas และขยาย Views ของ db_city_case13','เห็นรายชื่อลูกค้า 6 คนและชื่อ vw_my_customers ใน Navigator','SELECT * FROM vw_my_customers;'),
 step('ดูว่าตาราง Customers มี Index อะไร แล้วลอง EXPLAIN หนึ่งคำสั่งตามนี้ บันทึกชื่อ key ที่เห็นได้ ไม่ต้องวิเคราะห์ความเร็วเชิงลึก','SHOW INDEX พบ idx_customer_name; EXPLAIN อาจเลือกหรือไม่เลือก Index เพราะข้อมูลมีน้อย',"SHOW INDEX FROM Customers;\nEXPLAIN SELECT * FROM Customers WHERE CustomerName='Suda';"),
],
14:[
 step('ไฟล์ตั้งต้นสร้าง Procedure และ Trigger พร้อมตัวอย่างไว้แล้ว ให้เรียก Procedure ตามนี้ก่อน','ได้สินค้า Coffee ราคา 65','CALL GetProductPrice(1);'),
 step('เปลี่ยนเลขในวงเล็บจาก 1 เป็น 2 แล้วรัน ไม่แก้โครงสร้าง Procedure','ได้สินค้า Tea ราคา 50 แสดงว่าเลขในวงเล็บเป็นค่าที่ส่งให้ Procedure','CALL GetProductPrice(2);'),
 step('เปลี่ยนเป็นรหัส 999 ที่ไม่มีในตารางแล้วรัน','ได้ผลลัพธ์ว่าง ไม่ใช่ราคา 0','CALL GetProductPrice(999);'),
 step('อ่าน Log ที่ Trigger สร้างจากการลบสินค้า 5 ในไฟล์ตั้งต้น','พบ ProductID 5 และเวลาที่ลบ ไม่ต้อง DELETE ซ้ำอีก','SELECT ProductID, ProductName, DeletedAt\nFROM ProductDeleteLog;'),
 step('คลิกแท็บไฟล์ตั้งต้น เลื่อนหา CREATE PROCEDURE กับ CREATE TRIGGER วงหรือจับภาพบรรทัด CALL และ OLD.ProductID มาอธิบายสั้น ๆ','ระบุได้ว่า Procedure ต้อง CALL ส่วน Trigger ทำงานเองเมื่อมีเหตุการณ์ รอบนี้ไม่ต้องเขียน Trigger ใหม่จากศูนย์'),
],
15:[
 step('ใน Connection ผู้ดูแลเฉพาะเครื่องฝึก ตรวจจำนวน Sales หากยังไม่มีตาราง ให้ครูช่วยนำเข้า Case10 ก่อนเริ่ม','มี Sales 24 แถว','SELECT COUNT(*) FROM db_city_case10.Sales;'),
 step('ให้ครูยืนยันว่าชื่อบัญชี report_admin เป็นบัญชีฝึกใหม่ จากนั้นรัน CREATE USER กับ GRANT ตามตัวอย่าง หากมีบัญชีเดิมหรือรหัสถูกปฏิเสธให้หยุดถามครู ไม่แก้สิทธิ์บัญชีเดิมเอง','มีบัญชีฝึกอ่านได้เฉพาะ Sales รหัส 1234 เป็นตัวอย่างเฉพาะห้องทดลอง',"CREATE USER 'report_admin'@'localhost' IDENTIFIED BY '1234';\nGRANT SELECT ON db_city_case10.Sales\nTO 'report_admin'@'localhost';\nSHOW GRANTS FOR 'report_admin'@'localhost';"),
 step('คลิกไอคอนบ้านของ Workbench กด + ที่ MySQL Connections ตั้งชื่อ Report Training ใช้ Host และ Port เดิม แต่ Username เป็น report_admin กด Test Connection แล้ว OK จากนั้นเปิด Connection ใหม่นี้','กำลังใช้บัญชี report_admin ไม่ใช่บัญชีผู้ดูแล'),
 step('เปิด New Query Tab ใน Report Training แล้วรันสองคำสั่งนี้','เห็นชื่อบัญชี report_admin และอ่าน Sales ได้','SELECT CURRENT_USER();\nSELECT * FROM db_city_case10.Sales;'),
 step('ลองเขียนข้อมูลตามตัวอย่าง ลากคลุมรันทีละคำสั่ง การขึ้น error ว่าไม่มีสิทธิ์เป็นผลที่ต้องการ ไม่ต้องแก้ให้ผ่าน','INSERT UPDATE DELETE ถูกปฏิเสธ หากกลับสำเร็จให้หยุดและแจ้งครู',"UPDATE db_city_case10.Sales SET Amount=Amount WHERE SaleID=1;\nDELETE FROM db_city_case10.Sales WHERE SaleID=-1;\nINSERT INTO db_city_case10.Sales\nVALUES (9001,'Training','2027-02-09',1);"),
 step('สลับกลับ Connection ผู้ดูแลแล้วถอนสิทธิ์ตามกล่องนี้ จากนั้นปิด Report Training และเปิดใหม่ ลอง SELECT Sales อีกครั้ง','หลังเชื่อมต่อใหม่ SELECT ถูกปฏิเสธ บันทึกผลก่อนและหลังถอนสิทธิ์',"REVOKE SELECT ON db_city_case10.Sales\nFROM 'report_admin'@'localhost';"),
],
16:[
 step('ในโฟลเดอร์งาน ดับเบิลคลิก Portfolio_Template.docx เพื่อเปิดใน Word เลือก File > Save As > Browse ตั้งชื่อ Portfolio_รหัสนักเรียน.docx','มีสำเนา Portfolio สำหรับกรอกข้อมูลของตน'),
 step('กรอกเฉพาะหน้าปก ชื่อระบบ และวัตถุประสงค์ก่อน เลือกระบบที่เคยฝึก เช่น ลูกค้ากับการสั่งซื้อ ไม่ต้องเริ่มระบบใหม่ที่ใหญ่กว่าเดิม','อธิบายระบบของตนได้สั้น ๆ 2–3 ประโยค'),
 step('เปิด File Explorer ไปโฟลเดอร์ใบงานก่อนหน้า เลือก SQL ที่ทำสำเร็จหนึ่งชุด และภาพตารางหรือ EER หนึ่งภาพ คัดลอกมารวมในโฟลเดอร์ Case16 โดยไม่ลบต้นฉบับ','มีไฟล์ SQL และภาพหลักฐานสำหรับจัดแฟ้ม'),
 step('เปิด MySQL Workbench ตามขั้นเปิดโปรแกรมข้างต้น เปิด Connection เดิม คลิก File > Open SQL Script แล้วเลือก SQL ของตน อ่านก่อนและเลือกเฉพาะ SELECT ที่ใช้ตรวจงาน ไม่รันคำสั่งล้างข้อมูลซ้ำ','เปิดดูข้อมูลที่เคยทำสำเร็จได้ ถ้ายังไม่มีชิ้นงานให้ใช้ตัวอย่างหน่วย 11 ตามที่ครูอนุมัติ'),
 step('คัดลอกชื่อฟิลด์จากตารางที่ใช้งานจริง 1–2 ตารางลง Data Dictionary ใน Portfolio แล้ว Insert > Pictures แนบภาพ EER หรือตาราง','พจนานุกรมข้อมูลกับภาพตรงกับงานจริง'),
 step('ใส่ SQL ที่ทำสำเร็จและภาพผลหนึ่งตัวอย่าง เขียนบันทึกปัญหาที่แก้ได้หนึ่งเรื่อง ถ้างานยังไม่ครบให้ระบุสิ่งที่ต้องทำต่อ ไม่เติมผลที่ยังไม่ได้ทดลอง','Portfolio ฉบับเริ่มต้นมีชื่อระบบ ตาราง ภาพ SQL และผลทดสอบครบ'),
 step('คลิก File > Save ปิดแล้วเปิดไฟล์ตรวจอีกครั้ง ส่ง Portfolio, SQL, ภาพ และใบงานตามช่องทางครู ส่วนโครงงานปลายภาคค่อยต่อยอดตามรูบริก 100 คะแนน','ส่งชิ้นงานย่อยที่ทำได้จริงก่อน ไม่บังคับให้ทำระบบใหญ่ให้จบในครั้งเดียว'),
],
}

SIMPLE_QUESTIONS={
1:(['หลังแก้ราคาของ P001 หนึ่งช่อง ราคาในแถวอื่นเปลี่ยนตามหรือไม่','CustomerID ใดใน Orders ที่ค้นไม่พบใน Customer ยกมา 1 รหัส'],['หาวิธีใช้ Find ใน Excel เพิ่มอีกหนึ่งอย่างที่ช่วยตรวจข้อมูล','ถ้าจะแก้ข้อมูลซ้ำให้เป็นระเบียบ ควรแยกตารางเรื่องใดบ้าง']),
2:(['ชื่อคอลัมน์ในตารางของตนมีอะไรบ้าง','ทำไมจึงเลือก StudentID แทน FullName เป็น PK'],['หาตัวอย่าง Entity อีกหนึ่งอย่างในโรงเรียน','หาตัวอย่างข้อมูลที่ใช้เป็นรหัสไม่ซ้ำได้หนึ่งชนิด']),
3:(['กล่องใดในภาพเก็บข้อมูลพนักงาน','ทำไม Sales หนึ่งรายการจึงมี SaleItems ได้หลายแถว'],['ถ้าจะเพิ่มเบอร์โทรพนักงาน ควรใส่ Entity ใด','หาตัวอย่างระบบเล็ก ๆ อื่นที่ใช้ ERD ได้หนึ่งระบบ']),
4:(['ต้องเปิดโปรแกรมอะไรเพื่อพิมพ์ SQL ในใบงานนี้','ผล SELECT VERSION() แสดงข้อมูลอะไร'],['หาความหมายของคำว่า localhost','หาวิธีตรวจว่า MySQL Server เริ่มทำงานอยู่หรือไม่']),
5:(['ใช้คำสั่งใดเลือกฐานข้อมูลก่อนสร้างตาราง','tb_users ที่สร้างมีคอลัมน์อะไรบ้าง'],['หาคำสั่งที่ใช้ดูรายชื่อฐานข้อมูล','ถ้าจะเพิ่ม email ในตาราง ควรเริ่มค้นคำสั่ง SQL ชื่ออะไร']),
6:(['Phone ใช้ VARCHAR แทน INT เพราะอะไร','เมื่อเพิ่ม CustomerID 999 เกิดอะไรขึ้น'],['หาตัวอย่างข้อมูลอีกหนึ่งอย่างที่ควรใช้ DATE','หาความหมายของ PRIMARY KEY ด้วยภาษาง่าย ๆ']),
7:(['สินค้า ProductID 3 มีราคาเท่าใดหลัง UPDATE หนึ่งครั้ง','หลังลบรหัส 4 และ 5 เหลือสินค้าในตารางกี่แถว'],['ถ้าจะเปลี่ยนชื่อสินค้า ควรใช้คำสั่งกลุ่มใด','หาวิธีตรวจแถวเป้าหมายก่อนใช้ DELETE']),
8:(['ภาพ EER ที่ได้มีตารางกี่กล่อง','Orders เชื่อมกับ Customers ด้วยคอลัมน์ใด'],['หาความหมายของความสัมพันธ์ 1 ต่อหลาย','ยกตัวอย่างความสัมพันธ์ 1 ต่อหลายในชีวิตประจำวัน']),
9:(['คำสั่ง Salary > 25000 เลือกพนักงานแบบใด','LIKE S% ในตัวอย่างค้นชื่อที่มีลักษณะอย่างไร'],['หาความหมายของ ORDER BY ASC','ถ้าต้องการค้นราคาน้อยกว่า 100 ควรเปลี่ยนเงื่อนไขอย่างไร']),
10:(['SUM และ AVG ให้ผลต่างกันอย่างไร','COUNT พนักงาน IT ในชุดฝึกได้กี่คน'],['ค้นว่าฟังก์ชันใดใช้หาค่าสูงสุด','ค้นว่าฟังก์ชันใดใช้หาค่าต่ำสุด']),
11:(['คำสั่งหาลูกค้าไม่เคยซื้อได้ลูกค้ากี่คน','INNER JOIN แสดงลูกค้าที่ไม่มี Orders หรือไม่'],['หาความหมายของคำว่า NULL ในผล LEFT JOIN','ยกตัวอย่างงานโรงเรียนที่ต้องเชื่อมสองตาราง']),
12:(['คำสั่งในวงเล็บใช้หาค่าอะไร','ผลค้นเงินเดือนสูงกว่าค่าเฉลี่ยมี Salary มากกว่าหรือน้อยกว่าค่าที่จดไว้'],['หาความหมายภาษาไทยของ Subquery','ถ้าจะค้นต่ำกว่าค่าเฉลี่ย ควรเปลี่ยนเครื่องหมายใด']),
13:(['View ที่ตนสร้างชื่ออะไร','SELECT จาก vw_my_customers แสดงคอลัมน์อะไรบ้าง'],['ค้นเหตุผลหนึ่งข้อที่คนนิยมใช้ View','ค้นข้อดีหนึ่งข้อและข้อจำกัดหนึ่งข้อของ Index']),
14:(['เปลี่ยนเลขใน CALL จาก 1 เป็น 2 แล้วได้สินค้าอะไร','Trigger ในตัวอย่างบันทึกเหตุการณ์ชนิดใด'],['หาความหมายของคำว่า parameter','ยกตัวอย่างเหตุการณ์อีกหนึ่งอย่างที่อาจให้ Trigger ช่วยบันทึก']),
15:(['report_admin อ่าน Sales ได้ก่อนถอนสิทธิ์หรือไม่','ตอนทดลอง UPDATE โปรแกรมยอมให้ทำหรือปฏิเสธ'],['ค้นว่าคำสั่งใดใช้ให้สิทธิ์ และคำสั่งใดใช้ถอนสิทธิ์','ทำไมจึงไม่ควรส่งรหัสผ่านจริงไปพร้อมใบงาน']),
16:(['ใน Portfolio ของตนมีชื่อระบบอะไร','ยกตัวอย่างไฟล์หนึ่งไฟล์ที่ได้ตรวจเปิดก่อนส่ง'],['หาวิธีสำรองไฟล์งานที่ทำได้ง่ายหนึ่งวิธี','ถ้าจะพัฒนางานต่อครั้งหน้า จะเพิ่มอะไรเป็นอย่างแรก']),
}

def prepare_lessons(lessons):
    for case,lesson in enumerate(lessons,1):
        lesson['skill'],lesson['research']=SIMPLE_QUESTIONS[case]
        lesson['steps']=[x[0] for x in opening(case)+TASKS[case]]
    # Keep objectives, required evidence and assessment consistent with the easier tasks.
    changes={
     1:dict(checks=['พบรหัสลูกค้าซ้ำและยกตัวอย่าง 2 จุด','ค้น C999 ใน Customer ไม่พบ','จดราคา P001 ก่อนแก้','แก้หนึ่งช่องแล้วตรวจแถวอื่น']),
     2:dict(goals=['สร้างตารางนักศึกษาตามตัวอย่างได้','ชี้ Entity Attribute และ Tuple จากตารางของตนได้','เลือก StudentID เป็น PK พร้อมเหตุผลง่าย ๆ ได้'],checks=['สร้างตาราง 4 คอลัมน์ 3 แถวข้อมูล','ระบุชื่อ Entity และ Attribute','ชี้ข้อมูลหนึ่งแถวเป็น Tuple','เลือก StudentID พร้อมเหตุผล'],criteria=['เปิดโปรแกรมและสร้างตารางตัวอย่าง','เติมข้อมูลตามตัวอย่าง','ระบุคำศัพท์และเลือก PK','บันทึกผลและสรุปด้วยตนเอง','ตอบคำถามและค้นคว้าแบบง่าย']),
     3:dict(criteria=['เตรียมกระดาษและกล่องข้อมูล','ใส่ฟิลด์และ PK ตามแบบ','เชื่อมความสัมพันธ์ 3 คู่','แนบภาพและบันทึกผล','อธิบายภาพและตอบคำถามง่าย ๆ']),
     6:dict(checks=['สร้าง Customers และ Orders ได้','Phone ยังคงเลขศูนย์นำหน้า','เพิ่มลูกค้าและ Orders ที่ถูกต้องได้','CustomerID 999 ถูกปฏิเสธ'],criteria=['เปิดโปรแกรมและทำตามตัวอย่าง','เลือกชนิดข้อมูลตามแบบ','สร้างและทดสอบ FK','เติมแม่แบบและบันทึกผล','สรุปและตอบคำถามง่าย ๆ']),
     8:dict(goals=['เพิ่ม FK ตามคำสั่งตัวอย่างได้','ใช้ Reverse Engineer เปิดภาพ EER ได้','บอกชื่อคู่ตารางที่เชื่อมกันได้'],checks=['สร้าง FK ครบ 3 คู่ตามตัวอย่าง','เลือก schema ถูกใน wizard','เห็น EER ครบ 4 ตาราง','บันทึก mwb และแนบภาพ'],criteria=['เตรียมตารางตามไฟล์ตัวอย่าง','เพิ่ม FK ตามแบบ','เปิด EER ด้วย Reverse Engineer','บันทึกแบบจำลองและภาพ','อธิบายความสัมพันธ์แบบง่าย']),
     10:dict(goals=['ใช้ SUM AVG และ COUNT ตามตัวอย่างได้','ใช้ GROUP BY แสดงยอด 3 สาขาได้','บันทึกผลเป็นตัวเลขพร้อมความหมายสั้น ๆ ได้'],criteria=['หาผลรวมด้วย SUM','หาค่าเฉลี่ยและนับ IT','สรุป 3 สาขาด้วย GROUP BY','บันทึกและตรวจตัวเลข','สรุปและตอบคำถามง่าย ๆ']),
     12:dict(goals=['รันคำสั่ง AVG และอ่านค่าเฉลี่ยได้','รัน Subquery เงินเดือนตามตัวอย่างได้','ใช้ IN ค้นลูกค้าที่มีรายการซื้อได้'],checks=['อ่านค่าเฉลี่ยจาก AVG ได้','เงินเดือนในผลสูงกว่าค่าเฉลี่ย','IN คืนลูกค้า 3 คน','บันทึกคำสั่งและผลได้'],criteria=['เปิดข้อมูลตัวอย่างถูกชุด','อ่านค่าเฉลี่ยจาก AVG','รัน Subquery และ IN ตามแบบ','บันทึกผลและสรุปง่าย ๆ','ตอบคำถามและค้นคว้าต่อยอด']),
     13:dict(goals=['อ่าน View ที่เตรียมไว้ได้','สร้าง View ง่าย ๆ ตามตัวอย่างได้','ดูชื่อ Index และบันทึก EXPLAIN ตามจริงได้'],checks=['อ่าน vw_sales_summary ได้','สร้าง vw_my_customers ได้','View ใหม่คืนลูกค้า 6 คน','เห็น Index และบันทึกแผน'],criteria=['เปิดข้อมูลและอ่าน View เดิม','สร้าง View ตามตัวอย่าง','อ่าน Index และแผนที่เห็น','บันทึกภาพและสรุปง่าย ๆ','ตอบคำถามและค้นคว้าแบบง่าย']),
     14:dict(goals=['เรียก Procedure ด้วย CALL ตามตัวอย่างได้','เปลี่ยนรหัสที่ส่งเข้า Procedure แล้วอ่านผลได้','เปิดดู Log ที่ Trigger เตรียมไว้ได้'],checks=['CALL รหัส 1 ได้ Coffee 65','CALL รหัส 2 ได้ Tea 50','CALL รหัส 999 ได้ผลว่าง','Log มีการลบ ProductID 5'],criteria=['เปิดและรันไฟล์ตัวอย่าง','เรียก CALL สองรหัสได้','ทดสอบรหัสที่ไม่พบ','เปิด Log และบันทึกผล','สรุปและตอบคำถามง่าย ๆ']),
     16:dict(goals=['เปิดและบันทึกสำเนา Portfolio ได้','รวบรวม SQL และภาพที่ทำสำเร็จไว้ในโฟลเดอร์เดียวได้','กรอกเอกสารฉบับเริ่มต้นและตรวจไฟล์ก่อนส่งได้'],theory=['Portfolio คือแฟ้มรวบรวมสิ่งที่ผู้เรียนทำสำเร็จ ใบงานนี้ให้เริ่มจากระบบตัวอย่างที่เคยฝึก เลือก 1–2 ตาราง อธิบายชื่อระบบและแนบหลักฐานที่อ่านได้ ไม่ต้องเริ่มสร้างระบบใหญ่ใหม่ทั้งหมด','Data Dictionary บอกชื่อฟิลด์ ชนิดข้อมูล และความหมาย ส่วน EER แสดงตารางที่สัมพันธ์กัน ใบงานเริ่มต้นนี้ประเมิน 20 คะแนน โครงงานปลายภาคเป็นงานต่อยอดแยกต่างหากตามรูบริก 100 คะแนน'],checks=['กรอกชื่อระบบและวัตถุประสงค์','รวบรวม SQL กับภาพสำเร็จ','Data Dictionary ตรงกับงาน','เปิดเอกสารตรวจและส่งครบ'],criteria=['เปิดและบันทึกสำเนาเอกสาร','กรอกข้อมูลระบบแบบง่าย','รวบรวมชิ้นงานที่ทำได้จริง','ตรวจไฟล์และบันทึกผล','สรุปและบอกสิ่งที่จะพัฒนาต่อ']),
    }
    for case,values in changes.items():lessons[case-1].update(values)
    from workbench_resources import align_lessons
    align_lessons(lessons, TASKS, step)
    for case,lesson in enumerate(lessons,1):
        lesson['steps']=[x[0] for x in opening(case)+TASKS[case]]

def render_steps(doc,case,ptext,set_font):
    ptext(doc,'ทำตามทีละข้อ ไม่ต้องจำคำสั่งทั้งหมด พิมพ์หรือคัดลอกตัวอย่างได้ และอ่านผลที่ควรเห็นก่อนก้าวต่อไป')
    ptext(doc,'ช่วงที่ 1 เปิดเว็บ ดาวน์โหลด และเปิดโปรแกรม',True)
    steps=opening(case)
    def show(number,item):
        action,code,result=item
        p=ptext(doc,f'ขั้นที่ {number}  {action}')
        p.paragraph_format.keep_with_next=True
        for r in p.runs:set_font(r,11)
        if code:
            p=doc.add_paragraph()
            p.paragraph_format.keep_with_next=True
            p.paragraph_format.space_after=Pt(4)
            p.paragraph_format.left_indent=Pt(9)
            r=p.add_run(code);r.font.name='Consolas';r.font.size=Pt(10)
        p=ptext(doc,'ผลที่ควรเห็น  '+result)
        for r in p.runs:set_font(r,10)
        p.paragraph_format.space_after=Pt(10)
    for n,item in enumerate(steps,1):show(n,item)
    doc.add_page_break()
    ptext(doc,'ช่วงที่ 2 ทดลองจากตัวอย่างสั้น ๆ',True)
    for n,item in enumerate(TASKS[case],len(steps)+1):show(n,item)
    ptext(doc,'ช่วงที่ 3 บันทึกหลักฐานและส่งงาน',True)
    last=len(steps)+len(TASKS[case])
    show(last+1,step('เมื่อตรวจผลสำเร็จ ให้กด Windows + Shift + S ลากจับเฉพาะตารางหรือผลลัพธ์ สลับไป Word คลิกช่องหลักฐานในส่วน 6 แล้วกด Ctrl + V','มีภาพหลักฐานอย่างน้อย 1 ภาพ หากไม่มีเครื่องมือจับภาพ ให้ใช้ Snipping Tool จาก Start หรือเขียนชื่อไฟล์หลักฐานแทนตามครูกำหนด'))
    next_number=last+2
    if case!=4 and case!=16:
        show(next_number,step(f'กลับ Workbench คลิกแท็บคำตอบ เลือก File > Save Script As ไปโฟลเดอร์งาน ตั้งชื่อ Case{case:02d}_รหัสนักเรียน.sql แล้วกด Save','มีไฟล์ SQL คำตอบแยกจากไฟล์ตั้งต้น'))
        next_number+=1
    show(next_number,step('กลับ Word กรอกส่วน 6 และ 7 ด้วยประโยคสั้น ๆ ตอบคำถามส่วน 8 ค้นเพิ่มเพียงแหล่งละสั้น ๆ แล้วกด Ctrl + S ส่งไฟล์ตามช่องทางที่ครูแจ้ง','ส่งใบงานที่ตอบครบและไฟล์งานของตนได้ ไม่ต้องเขียนรายงานยาว'))
    ptext(doc,'เมื่อทำไม่ได้ ให้ตรวจว่ากดถูกแท็บและใช้ไฟล์ถูกชุด หากยังมี error ให้บันทึกภาพและถามครู ไม่ต้องลองลบตารางหรือเริ่มติดตั้งใหม่เอง',True)
