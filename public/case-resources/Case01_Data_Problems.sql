-- Database City | MySQL 8.0+ | UTF-8
-- ข้อมูลสมมติสำหรับฝึกในเครื่องเท่านั้น
-- สร้างหรือเริ่มข้อมูลฝึกใหม่เฉพาะ db_city_case01
-- รันทั้งไฟล์จะล้างตารางฝึกใน schema นี้ ให้สำรองงานที่ทำแล้วก่อน
CREATE DATABASE IF NOT EXISTS db_city_case01 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_city_case01;

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
