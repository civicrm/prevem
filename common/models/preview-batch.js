/* jshint maxlen:130 */
var loopback = require('loopback');
var fs = require ('fs');
var pathToimageDirectory = 'images/';

var config = fs.readFileSync('server/config.json');

var configJSON = JSON.parse(config);

var prevemURL = 'http://'+configJSON.host+':'+configJSON.port;

module.exports = function(PreviewBatch) {

  PreviewBatch.observe('after save', function createChildTasks(ctx, done) {
    if (!ctx.isNewInstance || !ctx.instance.renderers) {
      // We only need to create child tasks for new batches.
      done();
      return;
    }

    var PreviewTask = loopback.findModel('PreviewTask');
    var taskId = 0;
    createNextTask();

    // Foreach requested renderer, create one task.
    // This would be much nicer if we could use promises or generators...
    function createNextTask() {
      if (taskId >= ctx.instance.renderers.length) {
        done();
        return;
      }

      var task = {
        consumerId: ctx.instance.consumerId,
        batchId: ctx.instance.batchId,
        renderer: ctx.instance.renderers[taskId],
        message: ctx.instance.message
      };
      taskId++;

      PreviewTask.create(task, function(err, obj) {
        if (err) {
          console.log('Failed to create new task', task, err);
          // Is there a better way to report this failure?
          done();
        }
        else {
          createNextTask();
        }
      });
    }
  });

  PreviewBatch.observe('before delete', function deleteChildTasks(ctx, cb) {
    //console.log(ctx.Model.instance);
    var PreviewTask = loopback.findModel('PreviewTask');
    PreviewTask.deleteAll({batchId : ctx.where.batchId}, function(err) {
      cb (err);
    });
  });

  PreviewBatch.status =function(batchId, cb) {
    var response = {};
    var counter = 0;
    var NumberOfTasksCompleted = 0;
    var PreviewTask = loopback.findModel('PreviewTask');
    PreviewTask.find({where: {batchId: batchId}}, function (err, models) {
      if (err) {
        console.log('Failed to check status');
      }
      else {
        models.forEach(function (model){
          var task = model.toJSON();
          counter = counter + 1;
          if (task.startTime == null) {
            response[task.renderer] = 'Unattended';
            //console.log(task.renderer + ' awaiting renderer.');
          }
          else {
            if (task.result == null) {
              response[task.renderer] = 'Processing';
              //console.log(task.renderer + ' is being processed.');
            }
            else {
              NumberOfTasksCompleted = NumberOfTasksCompleted + 1;
              if (task.result === 'Connection') {
                response[task.renderer] = 'Connection Refused';
              }
              else if (task.result === 'Element') {
                response[task.renderer] = 'Element Not Found';
              }
              else if (task.result === 'Unknown') {
                response[task.renderer] = 'Unknown Error';
              }
              else {
                var imageURL = pathToimageDirectory + task.batchId + task.renderer + '.png';
                base64Decode(task.result, imageURL);
                response[task.renderer] = prevemURL + '/' + task.batchId + task.renderer + '.png';
                //console.log(task.renderer + ' is ready.');
              }
            }
          }
        });
      }
      if (NumberOfTasksCompleted === counter) {
        response['finished'] = 1;
      }
      else {
        response['finished'] = 0;
      }
      cb(err, response);
    });

    // function to create file from base64 encoded string
    function base64Decode(base64str, file) {
      // create buffer object from base64 encoded string
      var bitmap = new Buffer(base64str, 'base64');
      // write buffer to file
      fs.writeFileSync(file, bitmap);
    }

  };

  PreviewBatch.remoteMethod(
    'status', 
    {
       accepts: {arg:'batchId', type: 'string'},
       returns: {arg: 'response', type: 'object'},
       http: {path: '/status', verb: 'get', res: 'response', target: 'status'}
     }
);
};