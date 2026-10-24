-- Database City | MySQL 8.0+ | UTF-8
-- ข้อมูลสมมติสำหรับฝึกในเครื่องเท่านั้น
-- สร้างหรือเริ่มข้อมูลฝึกใหม่เฉพาะ db_city_case02
-- รันทั้งไฟล์จะล้างตารางฝึกใน schema นี้ ให้สำรองงานที่ทำแล้วก่อน
CREATE DATABASE IF NOT EXISTS db_city_case02 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_city_case02;

DROP TABLE IF EXISTS Students;
CREATE TABLE Students (StudentID INT PRIMARY KEY, FullName VARCHAR(80), Classroom VARCHAR(10), Phone VARCHAR(20));
INSERT INTO Students VALUES (67001,'Mali','1/1','0812340001'),(67002,'Somchai','1/1','0812340002'),(67003,'Mali','1/2','0812340003');
SELECT * FROM Students ORDER BY StudentID;
