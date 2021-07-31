/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Yu-Hsuan Liao___ Student ID: __160096194_ Date: _Jul 30th, 2021_
*
*  Online (Heroku) Link: https://yliaoassign3.herokuapp.com/
*
********************************************************************************/ 

const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const data = require("./data-service.js");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require("multer");
const app = express();

app.engine('handlebars', exphbs({
    extname: '.handlebars',
    helpers: { 
    navLink: function(url, options){
        return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
            return options.inverse(this);
        } else {
            return options.fn(this);
        }
    }}
}));
app.set('view engine', 'handlebars');

const HTTP_PORT = process.env.PORT || 8080;

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      // we write the filename as the current date down to the millisecond
      // in a large web service this would possibly cause a problem if two people
      // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
      // this is a simple example.
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
  // tell multer to use the diskStorage function for naming files instead of the default.

  //add the property "activeRoute" to "app.locals" whenever the route changes
  const upload = multer({ storage: storage });
  app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req,res) => {
    res.render("home.handlebars");
});

app.get("/about", (req,res) => {
    res.render("about.handlebars");
});

app.get("/images/add", (req,res) => {
    res.render("addImage.handlebars");
});

app.get("/employees/add", (req,res) => {
    data.getDepartments().then((data) => {
        //res.json(data);
        res.render("addEmployee", { departments: data }); 
    }).catch((err) => {
        //res.json({message:"no results"});
        res.render("addEmployee", {departments: null});  
    });
});

app.get("/images", (req,res) => {
    fs.readdir("./public/images/uploaded", function(err, items) {
        //res.json({images:items});
        res.render("images", {images:items}); 
    });
});

app.get("/employees", (req, res) => {
    if (req.query.status) {
        data.getEmployeesByStatus(req.query.status).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        })
    } else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        })
    } else if (req.query.manager) {
        data.getEmployeesByManager(req.query.manager).then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    } else {
        data.getAllEmployees().then((data) => {
            if (data.length > 0) {
                res.render("employees", { employees: data });
            } else {
                res.render("employees", { message: "no results" });
            }
        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
});

app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data.getEmployeeByNum(req.params.empNum).then((data) => {
            if (data) {
                viewData.employee = data; //store employee data in the "viewData" object as "employee"
            } else {
                viewData.employee = null; // set employee to null if none were returned
            }
        }).catch(() => {
            viewData.employee = null; // set employee to null if there was an error 
        }).then(data.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching 
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].dataValues.departmentId == viewData.employee.dataValues.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { data: viewData }); // render the "employee" view
            }
        });
});

app.get("/employees/delete/:empNum", (req, res) => {
    data.deleteEmployeeByNum(req.params.empNum).then(() => {
        //res.json(data);
        res.redirect("/employees"); 
    }).catch((err) => {
        //res.json({message:"no results"});
        res.status(500).send("Unable to Remove Employee / Employee not found"); 
    });
});

/*app.get("/managers", (req,res) => {
    data.getManagers().then((data)=>{
        res.json(data);
    });
});*/

app.get("/departments", (req,res) => {
    data.getDepartments().then((data)=>{
        //res.json(data);
        if(data.length>0) res.render("departments", {departments: data});
        
        else res.render("departments", {message: "no results"});
    }).catch((err) => {
        //res.json({message:"no results"});
        res.render("departments",{message:"no results"});
    });
});

app.get("/departments/add", (req,res) => {
    res.render("addDepartment.handlebars");
});

app.get("/department/:departmentId", (req, res) => {
    data.getDepartmentById(req.params.departmentId).then((data) => {
        console.log(data);
        res.render("department", { department: data });
    }).catch((err) => {
        res.status(404).send("Department Not Found");
    });
});

app.get("/department/delete/:departmentId", (req, res) => {
    data.deleteDepartmentById(req.params.departmentId).then(() => {
        //res.json(data);
        res.redirect("/departments"); 
    }).catch((err) => {
        //res.json({message:"no results"});
        res.status(500).send("Unable to Remove Department / Department not found"); 
    });
});


app.post("/employees/add", (req, res) => {
    data.addEmployee(req.body).then(()=>{
      res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Add Employee");
    });
  });

app.post("/employee/update", (req, res) => {
    data.updateEmployee(req.body).then(()=>{
        res.redirect("/employees");
    }).catch((err) => {
        res.status(500).send("Unable to Update Employee");
    });
});


app.post("/images/add", upload.single("imageFile"), (req,res) =>{
    res.redirect("/images");
});

app.post("/departments/add", (req, res) => {
    data.addDepartment(req.body).then(()=>{
      res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Add Department");
    });
  });

app.post("/departments/update", (req, res) => {
    data.updateDepartment(req.body).then(()=>{
        res.redirect("/departments");
    }).catch((err) => {
        res.status(500).send("Unable to Update Department");
    });
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

data.initialize().then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});
