/**
 * HTTP Request Methods.
 */
var path = require('path');
var tasks = require(path.resolve("./apis/Tasks.js")).api;
var moment = require('moment');
/* Variable 'tasksWebAPIController' is a function that is being exported when
   another file is attempting to imported it. Refer to the last line to
   have the evidence that the variable 'tasksWebAPIController' is being exported.
*/

var tasksWebAPIController = function(app) {
    app.get("/api/getTasks", function(req, res) {
      // Retrieving the parameters of a URL. Source: https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
        var projectList = [];
        Promise.resolve(tasks.getPrioritiesMap().then(function(prioMap){
            console.log(prioMap);
            Promise.resolve(tasks.getAllTasks(prioMap)).then(function(allTasks){
                console.log(allTasks);
                res.json(allTasks);
            })
        }))
    });

    app.post('/api/addPriority', function(req, res){

        //var priorityName = req.body.priorityName;

        var onePriority = {
            ['priorityName']: req.body.priorityName
        }

        tasks.addPriority(onePriority).then(function(result){
            res.send('Added priority with the key '+ result);
        })
    });

    app.get('/api/getPriorities', function(req, res){
        Promise.resolve(tasks.getPrioritiesForControl()).then(function (result){
            console.log(result);
            res.send(JSON.stringify(result));
        });
    });

    app.get('/api/getTask/:taskId', function(req, res){
        var taskId = req.params.taskId;
        Promise.resolve(tasks.getPrioritiesMap()).then(function(priorityMap){
            Promise.resolve(tasks.getOneTask(taskId, priorityMap)).then(function(taskItem){
                res.json(taskItem);
            })
        })
    });

    app.post("/api/addTask", function(req, res) {
        // POST request
        // ...
        try {
          /* Initializing an instance of a task with the respective JSON
             data. Take note of the statement 'req.body', it reads the request
             body to enable extraction of respective data.
          */
          // var local  = moment(req.body.time).toDate();
          // console.log("JS Date: " + new Date());
          // console.log("Local: " + local);
          // var UTC = moment.utc(local).valueOf();
          // console.log("UTC: " + UTC);
            var oneTask = {
                ['taskName']: req.body.taskName,
                ['priorityId']: req.body.priorityId,
                ['taskCreateDate']: new Date().getTime()
            }
            /* Performing postTask function from tasks API.
               Expect a callback from the function where it returns
               a key from the newly-created project in firebase.
               Concept can be seen from url: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
            */
            //console.log(oneProject);
            tasks.addOneTask(oneTask).then(function(key) {
                Promise.resolve(tasks.getPrioritiesMap()).then(function(prioMap){
                    Promise.resolve(tasks.getOneTask(key, prioMap)).then(function(oneTask){
                        res.json(oneTask);
                    })
                })
                // res.send('Added task with the key '+ key);
            })

        } catch (err) {
            res.send(err.message);
        }
    });

    app.put("/api/updateTask/:taskId", function(req, res) {
        // Duly note that variable 'updates' is an object
          // var updates = {};
          // variable 'updates' sample -> { '/tasks/-KV2qedFylLZf74tM6bz/id': '-KV2qedFylLZf74tM6bz' }
          // updates['/tasks/' + key + '/id'] = key;
        var oneTask = {
            ['taskName']: req.body.taskName,
            ['priorityId']: req.body.priorityId
        }
        var projectKey = req.params.taskId;
        tasks.updateOneTask(oneTask,projectKey).then(function(key) {
            Promise.resolve(tasks.getPrioritiesMap()).then(function(prioMap){
                Promise.resolve(tasks.getOneTask(key, prioMap)).then(function(oneTask){
                    res.json(oneTask);
                })
            })
        });

    });

    app.delete("/api/deleteTask/:taskId", function(req, res) {
        var taskKey = req.params.taskId;
        console.log(taskKey);
        Promise.resolve(tasks.deleteOneTask(taskKey)).then(function(result) {
            res.send({message: result})
        });;

    });
}
// Exporting variable 'taskController' when external file is importing TasksWebAPIController.js
module.exports = tasksWebAPIController;
