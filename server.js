/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: __Yu-Hsuan Liao___ Student ID: __160096194_ Date: _Jul 16th, 2021_
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
    res.render("addEmployee.handlebars");
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
            //res.json(data);
            res.render("employees", {employees: data});
        }).catch((err) => {
            //res.json({ message: "no results" });
            res.render("employees", {message: "no results"});
        });
    } else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department).then((data) => {
            //res.json(data);
            res.render("employees", {employees: data});
        }).catch((err) => {
            //res.json({ message: "no results" });
            res.render("employees", {message: "no results"});
        });
    } else if (req.query.manager) {
        data.getEmployeesByManager(req.query.manager).then((data) => {
            //res.json(data);
            res.render("employees", {employees: data});
        }).catch((err) => {
            //res.json({ message: "no results" });
            res.render("employees", {message: "no results"});
        });
    } else {
        data.getAllEmployees().then((data) => {
            //res.json(data);
            res.render("employees", {employees: data});
        }).catch((err) => {
            //res.json({ message: "no results" });
            res.render("employees", {message: "no results"});
        });
    }
});

app.get("/employee/:empNum", (req, res) => {
    data.getEmployeeByNum(req.params.empNum).then((data) => {
        //res.json(data);
        res.render("employee", { employee: data }); 
    }).catch((err) => {
        //res.json({message:"no results"});
        res.render("employee",{message:"no results"}); 
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
        res.render("departments", {departments: data});
    });
});


app.post("/employees/add", (req, res) => {
    data.addEmployee(req.body).then(()=>{
      res.redirect("/employees");
    });
  });

  app.post("/employee/update", (req, res) => {
    data.updateEmployee(req.body).then(()=>{
        console.log(req.body);
    res.redirect("/employees");
    });
});


app.post("/images/add", upload.single("imageFile"), (req,res) =>{
    res.redirect("/images");
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
