/*********************************************************************************
* WEB700 – Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Hafsa Osman Student ID: 168312239 Date: 14/06/2024
* 
* Online (Heroku) Link: https://hafsa-app-f96696bff001.herokuapp.com
********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var path = require('path');
var app = express();
var exphbs = require('express-handlebars');
var collegeData = require('./modules/collegedata');

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options) {
            return '<li' + ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3) 
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));
app.set('view engine', '.hbs');




// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

// Use Express static middleware to serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.render('home');
});

app.get("/about", function (req, res) {
    res.render('about');
});

app.get("/htmlDemo", function (req, res) {
    res.render('htmlDemo');
});

// Route to display the add student form
app.get('/students/add', function (req, res) {
    res.render('addStudent');
});

// Route to handle form submission and add a new student
app.post('/students/add', function (req, res) {
    collegeData.addStudent(req.body).then(() => {
        res.redirect('/students');
    }).catch((err) => {
        res.send(err);
    });
});
app.post('/student/update', (req, res) => {
    collegeData.updateStudent(req.body)
        .then(() => {
            res.redirect('/students');
        })
        .catch(err => {
            res.send("Unable to update student");
        });
});


app.get("/students", function (req, res) {
    if (req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
            .then(function (students) {
                res.render('students', { students: students });
            })
            .catch(function (err) {
                res.json({ message: err });
            });
    } else {
        collegeData.getAllStudents()
            .then(function (students) {
                res.render('students', { students: students });
            })
            .catch(function (err) {
                res.json({ message: "No results" });
            });
    }
});

app.get("/tas", function (req, res) {
    collegeData.getTAs()
        .then(function (tas) {
            res.render('students', { students: tas });
        })
        .catch(function (err) {
            res.json({ message: "No results" });
        });
});

app.get('/courses', function (req, res) {
    collegeData.getCourses().then(function (data) {
        res.render('courses', { courses: data });
    }).catch(function (err) {
        res.json({ message: err });
    });
});

app.get('/course/:num', function (req, res) {
    var studentnum = req.params.num;
    collegeData.getCourseById(studentnum).then(function (data) {
        res.render('course', { course: data });
    }).catch(function (err) {
        res.json({ message: err });
    });
});

app.get('/student/:num', function (req, res) {
    var studentnum = req.params.num;
    collegeData.getStudentById(studentnum).then(function (data) {
        res.render('student', { student: data });
    }).catch(function (err) {
        res.json({ message: err });
    });
});

app.use(function (req, res, next) {
    res.status(404).sendFile(path.join(__dirname, 'views', 'errorpage.html'));
});

collegeData.initialize()
    .then(function () {
        app.listen(HTTP_PORT, function () {
            console.log("Server listening on port " + HTTP_PORT);
        });
    })
    .catch(function (err) {
        console.log(err);
    });
