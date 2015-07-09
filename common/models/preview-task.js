module.exports = function(PreviewTask) {
    PreviewTask.claim = function(renderer, cb) {
    PreviewTask.findOne({where: {renderer: renderer, startTime: null}},
     function (err, model) {
          if (err) {
            console.error(err);
          }
          else {
            if (model != null) {
              model.updateAttribute('startTime', new Date().getTime() / 1000);
              // seconds since midnight, 1 Jan 1970
              model.updateAttribute('expireTime',new Date().getTime()/1000 + 2*1000);
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
       returns: {arg: 'Preview Task', type: 'object'},
       http: {path: '/claim', verb: 'get'}
     }
);
};