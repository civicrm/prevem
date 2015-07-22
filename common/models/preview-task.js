module.exports = function(PreviewTask) {
    PreviewTask.claim = function(renderer, cb, next) {
    PreviewTask.findOne({where: {renderer: renderer,
                                or: [
                                  {expireTime: null},
                                  {expireTime: {lte: Date.now()/1000}}]
                                }

                        },
     function (err, model) {
        if (err) {
          console.error(err);
        }
        else {
          if (model != null) {
              var Task_TTL= 5*60;    //expiration time in seconds
              // seconds since midnight, 1 Jan 1970
              model.updateAttribute('startTime', new Date().getTime()/1000);
              // task expires after the specified TTL
              model.updateAttribute('expireTime',new Date().getTime()/1000 + Task_TTL);
          }
          else {
            console.log (new Error('No tasks pending'));
          }
        }
        cb(err, model);
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