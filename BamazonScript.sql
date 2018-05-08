DROP DATABASE IF EXISTS bamazon;

CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
	item_id integer(100) not null auto_increment primary key,
    product_name varchar(50) not null,
    department_name varchar(50) not null,
    price double not null,
    stock_quantity integer not null    
);
insert into bamazon.products(product_name, department_name, price, stock_quantity)
values ('MacBook', 'Electronics', 1399.99, 15),
('MS Surface', 'Electronics', 1150.65, 10),
('Electronic Keyboard', 'Music', 399.99, 5),
('Table Lamp', 'Home Decor', 25.00, 22),
('Theremin', 'Music', 499.99, 11),
('TVs', 'Electronics', 4999.99, 5),
('Stools', 'Home Decor', 28.99, 8),
('Slippers', 'Shoewear', 20.55, 16),
('Printers', 'Office', 499.99, 11),
('Office desks', 'Office', 150.00, 4)
