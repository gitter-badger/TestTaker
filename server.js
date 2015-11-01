var version = '0.0.0'
console.log('Starting TestTaker Server v' + version);
var express = require('express');
var Firebase = require('firebase');
var bodyParser = require('body-parser');
var consolidate = require('consolidate');
var testCore = require('./test_core.js');
var app = express();
var root = new Firebase('http://testtaker.firebaseio.com')
var students = root.child('students');
var teachers = root.child('teachers');
var classes = root.child('classes');
var testData = root.child('testData');

app.listen(443);

app.engine('mustache', consolidate.mustache);
app.set('views', __dirname + '/public/views');
app.set('view engine', 'mustache');

var urlencodedParser = bodyParser.urlencoded({
    extended: true
});

app.use(express.static('public'));

// TODO: helper 'error' function to send back errors

app.get('/', function(req, res) {
    res.render('index', {
        title: 'TestTaker',
        scripts: ['https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js', 'https://cdn.firebase.com/js/client/2.3.1/firebase.js', '../js/index.js'],
        stylesheets: ['https://storage.googleapis.com/code.getmdl.io/1.0.5/material.blue-deep_purple.min.css', '../stylesheets/main.css']
    });
    console.log(req.method + ' request at ' + req.originalUrl)
});
app.get('/test', function(req, res) {
    //res.sendFile(__dirname + '/static/test/test.html');
});
app.get('/login', function(req, res) {
        res.render('login.mustache', {
            scripts: ['https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js', 'https://cdn.firebase.com/js/client/2.3.1/firebase.js', '../js/index.js'],
            stylesheets: ['https://storage.googleapis.com/code.getmdl.io/1.0.5/material.blue-deep_purple.min.css', '../stylesheets/main.css']
        });
    });
    /*app.get('/*', function(req, res) {
        res.sendFile(__dirname + '/public/' + req.originalUrl)
    });*/
app.post('/signUp', urlencodedParser, function(req, res) {
    if (req.body.type == 'student') {
        students.createUser({
            email: req.body.email,
            password: req.body.password
        }, function(error, userData) {
            if (error) {
                switch (error.code) {
                    case "EMAIL_TAKEN":
                        res.json({
                            error: "The new user account cannot be created because the email is already in use."
                        });
                        break;
                    case "INVALID_EMAIL":
                        res.json({
                            error: "The specified email is not a valid email."
                        });
                        break;
                    default:
                        res.json({
                            error: error
                        });
                }
            } else {
                students.push({
                    'name': req.body.name,
                    'uid': userData.uid,
                    classes: 0
                })
                res.redirect('/');
            }
        })
    } else if (req.body.type == 'teacher') {

    } else {
        res.redirect('/?error=invalid_form_submission')
    }
});
app.post('/login', urlencodedParser, function(req, res) {
    var user;
    console.log('req at login');
    if (req.body.type == 'student') {
        students
            .orderByChild("uid")
            .startAt(req.body.uid)
            .endAt(req.body.uid)
            .once('value', function(snap) {
                user = snap.val();
                console.log('USER VALUE ' + user);
                res.render('dashboard', {
                    userData: user[Object.keys(user)[0]],
                    title: 'Dashboard',
                    scripts: ['https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js', 'https://cdn.firebase.com/js/client/2.3.1/firebase.js', '../js/index.js', '../js/dashboard.js'],
                    stylesheets: ['https://storage.googleapis.com/code.getmdl.io/1.0.5/material.blue-deep_purple.min.css', '../stylesheets/main.css']
                });
            });
    } else if (req.body.type == 'teacher') {
        res.send('We\'r working on this feature');
    } else {
        res.send('Whoops! It looks like an error');
    }
});

// to think about: should a syncronizer do this automatically and populate student classes with the list  of students in the class
app.post('/addClass', urlencodedParser, function(req, res) {
    if (req.body.type == 'student') {
        var key;
        try {
            key = classes
                .orderByKey()
                .startAt(req.body.classID)
                .endAt(req.body.classID)
                .orderByChild('students')
                .startAt(req.body.studentID)
                .endAt(req.body.studentID)
                .key()
            var studentClasses = students.child(req.body.studentID + '/classes');
            studentClasses.push(key);
            res.json({
                'success': 'class added successfully'
            });
        } catch (err) {
            // TODO: error
            res.send('whoops! there was an error');
        }
    } else if (req.body.type == 'teacher') {

    } else {

    }
});

app.post('/test', urlencodedParser, function(req, res) {
    //verify that they can take the test
    //generate test, pulling from Firebase
    var questions = [];
    var randomArray = [];
    var testDataKey = tests
        .orderByKey()
        .startAt(req.body.testID)
        .endAt(req.body.testID)
        .child('testData');
    var thisTestData = testData.child(testDataKey).once('value', function(data){
        questions = Object.keys(data);
    });

    var i;
    while(i < 10){
        var value = Math.floor((Math.random() * questions.length) - 1);
        questions[i]
    }

    //send test to students
    res.render('test', {'class': data, 'teacher': data, 'name': data, 'questions': [{'prompt': data, 'img': data}]});
});

console.log('Finished starting TestTaker Server v' + version);
