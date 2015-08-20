module.exports = function(app) {
  var User = app.models.User;
  var Role = app.models.Role;
  var RoleMapping = app.models.RoleMapping;

  User.create([
    {email: 'renderers@prevem.prevem', password: 'RendererIsHere'}
  ], function(err, Users) {
    if (err) throw err;
  });
}
