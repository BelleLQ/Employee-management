// const fs = require("fs");

// let employees = [];
// let departments = [];
const Sequelize = require('sequelize');
var sequelize = new Sequelize('d6kt3llsnnb4i0', 'yuqnsaehehschv', 'fef3c951b5b1ce2f92f7ea50bc2b03e67b9339c172ab9541a91c8e7be6a4a1e2', {
    host: 'ec2-54-158-232-223.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    }
});
let Employee = sequelize.define('Employee', {
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true // automatically increment the value
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.TEXT,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState: Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    hireDate: Sequelize.STRING
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

let Department = sequelize.define('Department', {
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true, // use "project_id" as a primary key
        autoIncrement: true // automatically increment the value
    },
    departmentName: Sequelize.STRING
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});
Department.hasMany(Employee, {foreignKey: 'department'});



module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(() => {
            resolve();
        }).catch(() => {
            reject("unable to sync the database");
            return;
        });
    });

}

module.exports.getAllEmployees = function(){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.findAll({
                order: ["employeeNum"]
            }).then((data) => {        
                resolve(data);
            }).catch((err)=>{
                reject("no results returned"); return;
            });
        });
    })
}


module.exports.getEmployeeByNum = function (num) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.findAll({
                where: {
                    employeeNum: num
                }
            }).then((data) => {
                resolve(data[0]);
            }).catch((err)=>{
                reject("no results returned"); return;
            });
        });
    })
    

};

module.exports.getEmployeesByStatus = function (status) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.findAll({
                where: {
                    status: status
                }
            }).then((data) => {
                resolve(data);
            }).catch((err)=>{
                reject("no results returned"); return;
            });
        });
    })

};


module.exports.getEmployeesByDepartment = function (department) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.findAll({
                where: {
                    department: department
                }
            }).then((data) => {
                resolve(data);
            }).catch((err)=>{
                reject("no results returned"); return;
            });
        });
    })

};

module.exports.getEmployeesByManager = function (manager) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.findAll({
                where: {
                    employeeManagerNum: manager
                }
            }).then((data) => {
                resolve(data);
            }).catch((err)=>{
                reject("no results returned"); return;
            });
        });
    })

};

module.exports.getManagers = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.findAll({
                where: {
                    isManager : true
                }
            }).then(function(data){        
                resolve(data);
            }).catch((err)=>{
                reject("no results returned"); return;
            });
        });
    })

};

module.exports.getDepartments = function(){
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Department.findAll().then(function(data){        
                resolve(data);
            }).catch((err)=>{
                reject("no results returned"); return;
            });
        });
    })

}
module.exports.addEmployee = function (employeeData) {
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (const attr in employeeData) {
        if (employeeData[attr] == "") {
            employeeData[attr] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.create({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                hireDate: employeeData.hireDate,
                department: employeeData.department
            }).then((data) => {        
                resolve(data);
            }).catch((err)=>{
                reject("unable to create employee"); return;
            });
        });
    })
};

module.exports.updateEmployee = function(employeeData){
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for (const attr in employeeData) {
        if (employeeData[attr] == "") {
            employeeData[attr] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.update({
                firstName: employeeData.firstName,
                lastName: employeeData.lastName,
                email: employeeData.email,
                SSN: employeeData.SSN,
                addressStreet: employeeData.addressStreet,
                addressCity: employeeData.addressCity,
                addressState: employeeData.addressState,
                addressPostal: employeeData.addressPostal,
                maritalStatus: employeeData.maritalStatus,
                isManager: employeeData.isManager,
                employeeManagerNum: employeeData.employeeManagerNum,
                status: employeeData.status,
                hireDate: employeeData.hireDate,
                department: employeeData.department
            }, {
                where: { employeeNum: employeeData.employeeNum }
            }).then((data) => {        
                resolve(data);
            }).catch((err)=>{
                reject("unable to update employee"); return;
            });
        });
    })

}
module.exports.deleteEmployeeByNum = function (empNum) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Employee.destroy({
                where: {
                    employeeNum: empNum
                }
            }).then(() => {
                resolve();
            }).catch((err)=>{
                reject("error"); return;
            });
        });
    })
};

module.exports.addDepartment = function (departmentData) {
    for (const attr in departmentData) {
        if (departmentData[attr] == "") {
            departmentData[attr] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Department.create({
                departmentName: departmentData.departmentName
            }).then((data) => {        
                resolve(data);
            }).catch((err)=>{
                reject("unable to create department"); return;
            });
        });
    })
};

module.exports.updateDepartment = function(departmentData){
    for (const attr in departmentData) {
        if (departmentData[attr] == "") {
            departmentData[attr] = null;
        }
    }
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Department.update({
                departmentName: departmentData.departmentName
            }, {
                where: { departmentId: departmentData.departmentId }
            }).then(() => {        
                resolve();
            }).catch((err)=>{
                reject("unable to update department"); return;
            });
        });
    })

}

module.exports.getDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Department.findAll({
                where: {
                    departmentId: id
                }
            }).then((data) => {
                resolve(data[0]);
            }).catch((err)=>{
                reject("no results returned"); return;
            });
        });
    })
};

module.exports.deleteDepartmentById = function (id) {
    return new Promise(function (resolve, reject) {
        sequelize.sync().then(function () {
            Department.destroy({
                where: {
                    departmentId: id
                }
            }).then(() => {
                resolve();
            }).catch((err)=>{
                reject("error"); return;
            });
        });
    })
};