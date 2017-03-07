var fbFnc = module.exports = {};
var path = require('path');
var credentials = require(path.resolve('./config.js')).credentials;
var firebase = require('firebase');
var HashMap = require('hashmap');
var moment = require('moment');
//var FCM = require('fcm-push');
// Initialize the app with a service account, granting admin privileges
console.log(credentials);
firebase.initializeApp(
    credentials
    /*I leave this statement here to remind myself that I need to generate the json file in firebase*/
    //serviceAccount: require(path.resolve('./NotyMe-c749063915e6.json'))
);
// Initialize firebase database instance
var db = firebase.database();
// Server logging purpose
var dbAppRef = db.ref('app/');

// Variable to store FCM credentials
//var serverKey = config.realtime_database_cloud_messaging_key;
// Initialize of firebase cloud messaging
//var fcm = new FCM(serverKey);

fbFnc.api = {
    getAllTasks : function(inPrioMap) {
        return new Promise((resolve, reject) => {
            var projectsRef = db.ref('/app/tasks');
            var result = [];
            projectsRef.orderByValue().on('value', function (snapshot) {
                snapshot.forEach(function (data) {
                    var taskName = data.val().taskName;
                    var taskId = data.key;
                    var priorityKey = data.val().priorityId;
                    var priorityName = inPrioMap.get(priorityKey);
                    var createdDate = data.val().taskCreateDate;
                    var date = new Date(createdDate);
                    var formattedDate = moment(date).format('L');
                    var taskItem = new TaskItemForDisplay(taskId, taskName, priorityName, formattedDate);
                    result.push(taskItem);
                    //console.log(taskItem);
                });
                console.log(result);
                resolve(result);
            });

        });
    },
    getPrioritiesMap : function(){
        return new Promise((resolve, reject) => {
            var prioritiesRef = db.ref('/app/priorities');
            var prioMap = new HashMap();
            prioritiesRef.on('value', function(snapshot){

                snapshot.forEach(function (data){
                    var priorityName = data.val().priorityName;
                    var priorityKey = data.key;
                    prioMap.set(priorityKey, priorityName);
                })

                resolve(prioMap);
            })
        })
    },
    addPriority: function(inPriority){
        return new Promise((resolve, reject) => {
            var prioritiesRef = db.ref('/app/priorities');
            var prioMap = new HashMap();
            prioritiesRef.on('value', function(snapshot){

                snapshot.forEach(function (data){
                    var priorityName = data.val().priorityName;
                    var priorityKey = data.key;
                    prioMap.set(priorityKey, priorityName);
                })

                resolve(prioMap);
            })
        })
    },
    getPrioritiesForControl: function(){
        return new Promise((resolve, reject) => {
            var prioritiesRef = db.ref('/app/priorities');
            var result = [];
            prioritiesRef.on('value', function(snapshot){
                snapshot.forEach(function (data){
                    var priorityName = data.val().priorityName;
                    var priorityKey = data.key;
                    var priorityItem = new PriorityItemForDisplay(priorityKey, priorityName);
                    result.push(priorityItem);
                })
                console.log(result);
                resolve(result);
            })
        })
    },
    // Firebase Functions.
    /*
    getTask: function(user) {
        // return db.ref('/tasks/' + idtask).once('value').then(function(snapshot) {
        //     var task_title = snapshot.val().task_title;
        //     console.log(task_title);
        // });
        var result = [];
        var taskRef = db.ref('user/' + user);
        taskRef.orderByValue().on("value", function(snapshot) {
            snapshot.forEach(function(data) {
                result.push(data);
                console.log("The " + data.key + " task's id is added");
            });
        });
        return result;
    },
    */
    getOneTask : function(inKey, inPrioMap){
      return new Promise((resolve, reject) => {
          var taskRef = db.ref('/app/tasks').child(inKey);
          taskRef.on('value', function(data){
              var taskName = data.val().taskName;
              var taskId = data.key;
              var priorityKey = data.val().priorityId;
              var priorityName = inPrioMap.get(priorityKey);
              var createdDate = data.val().taskCreateDate;
              var date = new Date(createdDate);
              var formattedDate = moment(date).format('L');
              var taskItem = new TaskItemForDisplay(taskId, taskName, priorityName, formattedDate);
              resolve(taskItem);
          })
      })
    },
    addOneTask : function(inTask) {
        return new Promise((resolve, reject) => {
            var taskRef = db.ref('/app/tasks').push(inTask);
            if (taskRef) {
                resolve(taskRef.key);
            } else {
                reject('Unable to save project record');
            }

        });
    },

    updateOneTask: function(inTask,inKey) {
    //Reference: http://stackoverflow.com/questions/38923644/firebase-update-vs-set
    return new Promise((resolve, reject) => {
      var taskRef = db.ref('/app/tasks/'+inKey).update(inTask);
      resolve(inKey);

    });
    },
    deleteOneTask: function(inKey) {
        //Reference: https://firebase.googleblog.com/2016/01/keeping-our-promises-and-callbacks_76.html
        //The following code pattern inside the Promise is all based on the above URL site
        return new Promise((resolve, reject) => {
            //var projectRef = db.ref("/app/tasks").child(inKey);
            var projectRef = db.ref('/app/tasks/' + inKey);
            projectRef.once('value').then(function(snapshot) {
                //Used the following code to see if the project node can be found.

                //I made a blunder using the code snapshot.remove(....
                //I also made a blunder using the command snapshot.ref().remove
                //It should be snapshot.ref.remove
                // snapshot.ref.remove(function (error) {
                //     if (!error) {
                //         resolve('Deleted Task');
                //     }else{
                //         reject('Failed to remove task');
                //     }
                // });
                snapshot.ref.remove();
                resolve('Deleted Task');
            }, function(error) {
                // Something went wrong.
                reject.error('Unable to find the task');
            });
        });
    },
    sendNotification: function(toKey, title, description) {
      var message = {
        to: toKey, // required fill with device token or topics
        data: {
            title: title,
            body: description
        }
      };

      //promise style
     /* fcm.send(message)
          .then(function(response){
              console.log("Successfully sent with response: ", response);
          })
          .catch(function(err){
              console.log("Something has gone wrong!");
              console.error(err);
          }); */
    }
}

function PriorityItemForDisplay(inId, inName){
    this.priorityId = inId;
    this.priorityName = inName;
}

function TaskItemForDisplay (inTaskId, inTaskName, inPriorityName, inDate){
    this.taskId = inTaskId;
    this.taskName = inTaskName;
    this.priorityName = inPriorityName;
    this.date = inDate;
}
