var loopback = require('loopback');

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

};
