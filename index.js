let inquirer = require("inquirer");
let mysql = require("mysql");
require("console.table");

let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "employees_db",
    multipleStatements:"true"
});

var myqry = require("util").promisify(connection.query).bind(connection);

connection.connect(async function (err) {
    //console.log("inside connect");
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
            "Update Employee Manager",
            "Quit"
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

        case "Quit":
            quit();
            break;
        }

});
}

function allEmployees() {

    let query = "select a.id, a.first_name, a.last_name, title, c.name as department, salary, concat(m.first_name, ' ', m.last_name) as manager";
    query += " from employee a left join role b on a.role_id = b.id left join department c on department_id = c.id";
    query += " left join employee m on a.manager_id = m.id;";

    connection.query(query, function(err, res){

        if (err) throw err;
        console.log("\n");
        console.table(res);
        init();
    });

}

async function allDepartments(){
    res = await myqry("select name from department");
    return res.map(d => d.name);
}


async function employeeByDept() {
    
    deptChoices = await allDepartments();

    inquirer.prompt({

        name: "department",
        type: "rawlist",
        message: "Select Department: ",
        choices: deptChoices

    }).then(function(res) {
        
    connection.query("select a.id, a.first_name, a.last_name, title, c.name as department, salary, concat(m.first_name,' ',m.last_name) as manager from employee a left join role b on a.role_id = b.id left join department c on department_id = c.id left join employee m on a.manager_id = m.id where c.name = ?;",  
    
    [(res.department)], function(err, res){

        if (err) throw err;
        console.table(res);
        
    init();
    });

});
}

async function allManagers(){
    res = await myqry("select concat(m.first_name,' ',m.last_name) as manager from employee a join employee m on a.manager_id = m.id;");
    return res.map(d => d.manager);
}


async function employeeByManager() {
    
    managerChoices = await allManagers();

    inquirer.prompt({

        name: "manager",
        type: "rawlist",
        message: "Select Manager: ",
        choices: managerChoices

    }).then(function(res) {

        let manager_first_name = res.manager.split(" ").shift();
        let manager_last_name = res.manager.split(" ").pop();
        
    connection.query("select a.id, a.first_name, a.last_name, title, c.name as department, salary, concat(m.first_name,' ',m.last_name) as manager from employee a left join role b on a.role_id = b.id left join department c on department_id = c.id left join employee m on a.manager_id = m.id where m.first_name = ? and m.last_name = ?;",  
    
    [manager_first_name, manager_last_name], function(err, res){

        if (err) throw err;
        console.table(res);
        
    init();
    });

});
}

async function removeEmployee() {

    employees = await myqry("select concat(id, ' ', first_name, ' ', last_name) as emp from employee");

    inquirer.prompt({
        name: "emp",
        type: "list",
        message: "Select Employee: ",
        choices: employees.map(e => e.emp)
    
    }).then(async function (res) {

    let delete_id = res.emp.split(" ").shift();

    await myqry("update employee set manager_id = null where manager_id = ?", delete_id);
    await myqry("delete from employee where id = ?", delete_id);
        
    allEmployees();
    init();

});
}

async function addEmployee() {

    res = await inquirer.prompt(
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
        name: "manager",
        type: "rawlist",
        message: "Select Manager: ",
        choices: await allManagers()
    },

    {
        name: "department",
        type: "rawlist",
        message: "Select Department: ",
        choices: await allDepartments()
    }

]
    );

    res2 = await inquirer.prompt([ {
        name: "role",
        type: "rawlist",
        message: "Select Manager: ",
        choices: (await myqry("select concat(id, ' ', title) as role from role where department_id = \
                    (select id from department where name = ?)", res.department)).map(t => t.role)
    } ]); 

    let manager_first_name = res.manager.split(" ").shift();
    let manager_last_name = res.manager.split(" ").pop();

    console.log(manager_first_name);
    console.log(manager_last_name);

    manager_id = await myqry("select id from employee where first_name = ? and last_name = ?", 
            [manager_first_name, manager_last_name]);

    console.dir(res2.role);
    
    await myqry("insert into employee (first_name, last_name, role_id, manager_id) values " +
            " (?, ?, ?, ? ) ", [res.firstName, res.lastName, res2.role.split(" ").shift(), manager_id.map(m => m.id)]);

    allEmployees();
    init();

}


function quit() {
    
    console.log("Thank you!");        
    connection.end();
    };





