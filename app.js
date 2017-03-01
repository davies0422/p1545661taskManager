// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express')
    , cors = require('cors')
    , app = express();//https://github.com/expressjs/cors#simple-usage-enable-all-cors-requests

app.use(cors());
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var TaskItem     = require('./app/models/TaskItem');
var firebase = require('firebase');
var moment = require('moment');
var https = require('https');
var request = require('request');
moment = require('moment-timezone');
require('moment-duration-format');

// SETUP FIREBASE
// =============================================================================
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCbaExC4j-v1P2DKMA8195xxOvckTLHOyI",
    authDomain: "task-manager-b9d83.firebaseapp.com",
    databaseURL: "https://task-manager-b9d83.firebaseio.com",
    storageBucket: "task-manager-b9d83.appspot.com",
    messagingSenderId: "806320697979"
};
firebase.initializeApp(config);
var databaseReference = firebase.database();
var locationsDbRef = databaseReference.ref('tasks');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());//Enable cors for all routes
var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router



// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});
router.route('/TaskManager/addTaskItem')

// create a Location (accessed at POST http://localhost:8080/api/TaskManager/addTaskItem)
    .post(function(req, res) {
        // create a new instance of the Location model
        var location = new TaskItem(locationsDbRef,req.body.taskName);
        // save the bear and check for errors
        location.saveToFirebase(function(err) {
            if (err)
                res.send(err);
            res.json({ message: 'Task Item data created in Firebase' });
        });

    });
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/TaskManager/testingonly', function(req, res) {

    // create a new instance of the Location model
    var taskItem = new TaskItem(locationsDbRef,'omg');
    // save the bear and check for errors
    taskItem.saveToFirebase(function(err) {
        if (err)
            res.send(err);
        res.json({ message: 'Task Item data created in Firebase' });
    });

});
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });

});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);