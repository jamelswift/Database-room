-- Database City | MySQL 8.0+ | UTF-8
-- ข้อมูลสมมติสำหรับฝึกในเครื่องเท่านั้น
-- สร้างหรือเริ่มข้อมูลฝึกใหม่เฉพาะ db_city_case03
-- รันทั้งไฟล์จะล้างตารางฝึกใน schema นี้ ให้สำรองงานที่ทำแล้วก่อน
CREATE DATABASE IF NOT EXISTS db_city_case03 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_city_case03;

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
