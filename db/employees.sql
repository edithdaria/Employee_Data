drop database if exists employees_db;

create database employees_db;

use employees_db;

create table department(
    id int not null auto_increment,
    name varchar(30) not null,
    primary key(id)
);

create table role(
    id int not null auto_increment,
    title varchar(30) not null,
    salary decimal(15,2) not null,
    department_id int(6) not null,
    primary key(id)
);

create table employee(
    id int not null auto_increment,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id int(10) not null,
    manager_id int(10),
    primary key(id)
);
