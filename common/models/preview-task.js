module.exports = function(PreviewTask) {
    PreviewTask.claim = function(renderer, cb) {
    PreviewTask.find({where: {renderer: renderer}}, function (err, models) {
      if (err) {
        console.log(err);
      }
      else {
        models.forEach(function (model){
          if (model != null) {
            var task = model.toJSON();
            if ((task.expireTime == null || task.expireTime <= new Date().getTime()/1000) && task.result == null) {
              var Task_TTL= 5*60;    //expiration time in seconds
              // seconds since midnight, 1 Jan 1970
              model.updateAttribute('startTime', new Date().getTime()/1000);
              // task expires after the specified TTL
              model.updateAttribute('expireTime',new Date().getTime()/1000 + Task_TTL);
              cb(err, model);
            }
            else {
              console.log (new Error('No Tasks Pending'));
              cb(err, null)
            }
          }
          else {
            console.log (new Error('No tasks pending'));
          }
        });
      }
   });
};

      PreviewTask.remoteMethod(
    'claim', 
    {
       accepts: {arg: 'renderer', type: 'string'},
       returns: {arg: 'newTask', type: 'object'},
       http: {path: '/claim', verb: 'get'}
     }
);
};