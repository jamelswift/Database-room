-- Database City | MySQL 8.0+ | UTF-8
-- ข้อมูลสมมติสำหรับฝึกในเครื่องเท่านั้น
-- สร้างหรือเริ่มข้อมูลฝึกใหม่เฉพาะ db_city_case07
-- รันทั้งไฟล์จะล้างตารางฝึกใน schema นี้ ให้สำรองงานที่ทำแล้วก่อน
CREATE DATABASE IF NOT EXISTS db_city_case07 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_city_case07;
DROP TABLE IF EXISTS Products;
CREATE TABLE Products (
 ProductID INT PRIMARY KEY, ProductName VARCHAR(100) NOT NULL,
 Price DECIMAL(10,2) NOT NULL, SalesCount INT NOT NULL DEFAULT 0
);
INSERT INTO Products VALUES
(1,'Notebook',120.00,8),(2,'Mouse',350.00,12),(3,'Keyboard',1000.00,6),
(4,'USB Cable',150.00,0),(5,'Headset',800.00,0);
SELECT * FROM Products ORDER BY ProductID;
