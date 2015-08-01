var loopback = require('loopback');
var fs = require ('fs');

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

  PreviewBatch.status =function(batchId, cb) {
    var PreviewTask = loopback.findModel('PreviewTask');
    PreviewTask.find({where: {batchId: batchId}}, function (err, models) {
      if (err) {
        console.log('Failed to check status');
      }
      else {
        var response = {};
        var counter = 0;
        var NumberOfTasksCompleted = 0;
        models.forEach(function (model){
          var task = model.toJSON();
          counter = counter + 1;
          if (task.startTime == null) {
            response[task.renderer] = '0';
            //console.log(task.renderer + ' awaiting renderer.');
          }
          else {
            if (task.result == null) {
              response[task.renderer] = '1';
              //console.log(task.renderer + ' is being processed.');
            }
            else {
              NumberOfTasksCompleted = NumberOfTasksCompleted + 1;
              var imageURL = '/var/www/html/images/'+ task.batchId + task.renderer + '.png'
              base64_decode(task.result, imageURL);
              response[task.renderer] = 'http://localhost/images/' + task.batchId + task.renderer + '.png';
              //console.log(task.renderer + ' is ready.');
            }
          }
        });
      }
      if (NumberOfTasksCompleted == counter) {
        response['finished'] = 1;
      }
      else {
        response['finished'] = 0;
      }
      cb(err, response);
    });

    // function to create file from base64 encoded string
    function base64_decode(base64str, file) {
      // create buffer object from base64 encoded string, it is important to tell the constructor that the string is base64 encoded
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