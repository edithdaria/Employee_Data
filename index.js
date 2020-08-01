let inquirer = require("inquirer");
let mysql = require("mysql");
require("console.table");

let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    port: 3306,
    database: "employees_db"
});

connection.connect(function (err) {
    console.log("inside connect");
    if(err) throw err;
    console.log("Connection id: " + connection.threadId);
    init();
})

function init() {
    inquirer.prompt({
        name: "action",
        type: "rawlist",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Employees By Department",
            "View All Employees By Manager",
            "Add Employee",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Manager"
        ]
    }).then(function(answer){

        switch (answer.action){

        case "View All Employees":
            allEmployees();
            break;

        case "View All Employees By Department":
            employeeByDept();
            break;

        case "View All Employees By Manager":
            employeeByManager();
            break;
        
        case "Add Employee":
            addEmployee();
            break;

        case "Remove Employee":
            removeEmployee();
            break;

        case "Update Employee Role":
            updateEmployeeRole();
            break;

        case "Update Employee Manager":
            updateEmployeeManager();
            break;
        }

});
}

function allEmployees() {
    
    connection.query("select a.id, first_name, last_name, title, c.name as department, salary  from employee a left join role b on a.role_id = b.id left join department c on department_id = c.id;", 
    
    function(err, res){

        if (err) throw err;
        console.log("\n")
        console.table(res);
        
    init();
    });

}

function employeeByDept() {

    inquirer.prompt({
        name: "department",
        type: "input",
        message: "Enter Department name: "

    }).then(function (res) {
        
    connection.query("select a.id, first_name, last_name, title, c.name as department, salary, m.first_name as m_first_name, m.last_name as m_last_name  from employee a left join role b on a.role_id = b.id left join department c on department_id = c.id left join employee m on a.manager_id = m.id;",  
    
    [(res.department)], function(err, res){

        if (err) throw err;
        console.table(res);
        
    init();
    });

});
}

function removeEmployee() {

    inquirer.prompt(
        [{
        name: "firstName",
        type: "input",
        message: "Enter first name: "

    },
    {
        name: "lastName",
        type: "input",
        message: "Enter last name: " 
    }]
    
    ).then(function (res) {
        
    connection.query("delete from employee where first_name = ? and last_name = ?", 
    
    [res.firstName, res.lastName], function(err, res){

        if (err) throw err;
        console.table(res);  
        allEmployees();
        init();
    });

});
}

function addEmployee() {

    inquirer.prompt(
        [{
        name: "firstName",
        type: "input",
        message: "Enter first name: "

    },

    {
        name: "lastName",
        type: "input",
        message: "Enter last name: " 
    },

    {
        name: "title",
        type: "input",
        message: "Enter the title: " 
    },

    {
        name: "salary",
        type: "input",
        message: "Enter salary name: " 
    }

]
    
    ).then(function (res) {
        
    connection.query("delete from employee where first_name = ? and last_name = ?", 
    
    [res.firstName, res.lastName], function(err, res){

        if (err) throw err;
        console.table(res);  
        allEmployees();
        init();
    });

});
}





