-- Database City | MySQL 8.0+ | UTF-8
-- ข้อมูลสมมติสำหรับฝึกในเครื่องเท่านั้น
-- สร้างหรือเริ่มข้อมูลฝึกใหม่เฉพาะ db_city_case08
-- รันทั้งไฟล์จะล้างตารางฝึกใน schema นี้ ให้สำรองงานที่ทำแล้วก่อน
CREATE DATABASE IF NOT EXISTS db_city_case08 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_city_case08;
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Customers;
CREATE TABLE Customers (CustomerID INT PRIMARY KEY, CustomerName VARCHAR(100) NOT NULL);
CREATE TABLE Products (ProductID INT PRIMARY KEY, ProductName VARCHAR(100) NOT NULL, Price DECIMAL(10,2));
CREATE TABLE Orders (OrderID INT PRIMARY KEY, CustomerID INT NOT NULL, OrderDate DATE NOT NULL);
CREATE TABLE OrderItems (OrderID INT NOT NULL, ProductID INT NOT NULL, Quantity INT NOT NULL,
 UnitPrice DECIMAL(10,2) NOT NULL, PRIMARY KEY(OrderID,ProductID));
-- ยังไม่ประกาศ FK เพื่อให้ผู้เรียนเชื่อมในแบบจำลอง EER ด้วยตนเอง
-- Orders.CustomerID -> Customers.CustomerID
-- OrderItems.OrderID -> Orders.OrderID
-- OrderItems.ProductID -> Products.ProductID
INSERT INTO Customers VALUES (1,'Suda'),(2,'Somchai'),(3,'Mali');
INSERT INTO Products VALUES (1,'Coffee',65),(2,'Tea',50),(3,'Cocoa',60);
INSERT INTO Orders VALUES (101,1,'2026-11-01'),(102,2,'2026-11-02');
INSERT INTO OrderItems VALUES (101,1,2,65),(101,2,1,50),(102,3,1,60);
