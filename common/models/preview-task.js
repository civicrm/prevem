/* jshint maxlen:180 */
module.exports = function(PreviewTask) {
    PreviewTask.claim = function(renderer, cb) {
    var time = new Date().getTime()/1000;
    PreviewTask.findOne({where: {and : [{renderer: renderer}, {or: [{expireTime : null},{expireTime: {lte: time}}]}, {result: null}] }}, function (err, model) {
      if (err) {
        console.log(err);
      }
      else {
        if (model === undefined) {
          console.log('No tasks pending');
          cb (err, null);
        }
        else {
          var task = model.toJSON();
          var TaskTTL= 5*60;    //expiration time in seconds
          // seconds since midnight, 1 Jan 1970
          model.updateAttribute('startTime', new Date().getTime()/1000);
          // task expires after the specified TTL
          model.updateAttribute('expireTime',new Date().getTime()/1000 + TaskTTL);
          cb(err, model);
        }
      }
   });
};

PreviewTask.remoteMethod(
  'claim', 
  {
     accepts: {arg: 'renderer', type: 'string'},
     returns: {arg: 'newTask', type: 'object'},
     http: {path: '/claim', verb: 'get'}
   });
};