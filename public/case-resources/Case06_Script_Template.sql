-- Database City | MySQL 8.0+ | UTF-8
-- ข้อมูลสมมติสำหรับฝึกในเครื่องเท่านั้น
-- สร้างหรือเริ่มข้อมูลฝึกใหม่เฉพาะ db_city_case06
-- รันทั้งไฟล์จะล้างตารางฝึกใน schema นี้ ให้สำรองงานที่ทำแล้วก่อน
CREATE DATABASE IF NOT EXISTS db_city_case06 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_city_case06;
-- แม่แบบตั้งใจเว้นช่อง ___ ให้เติมก่อนรัน ไม่ใช่สคริปต์สำเร็จรูป
-- เติมชนิดข้อมูล คีย์หลัก และคีย์นอกตามเงื่อนไข
-- CustomerID เป็นเลขจำนวนเต็ม, CustomerName ยาวไม่เกิน 100 ตัวอักษร
-- Phone ต้องรักษาเลขศูนย์นำหน้า, OrderDate เก็บวันที่, TotalAmount มีทศนิยม 2 ตำแหน่ง
CREATE TABLE Customers (
  CustomerID ___,
  CustomerName ___ NOT NULL,
  Phone ___,
  PRIMARY KEY (___)
);
CREATE TABLE Orders (
  OrderID ___,
  CustomerID ___ NOT NULL,
  OrderDate ___,
  TotalAmount ___,
  PRIMARY KEY (___),
  FOREIGN KEY (___) REFERENCES ___(___)
);
-- ทดสอบ: เพิ่มลูกค้า 1 คน และใบสั่งซื้อที่อ้างอิงลูกค้านั้น
-- ทดลองเพิ่ม Orders ที่ CustomerID = 999 ซึ่งไม่มีใน Customers
-- บันทึกผลว่าฐานข้อมูลปฏิเสธข้อมูลอ้างอิงผิดอย่างไร
