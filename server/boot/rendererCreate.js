/* jshint maxlen:130 */
var fs = require('fs');
var path = require('path');

module.exports = function(app) {
	var User = app.models.User;
	var Role = app.models.Role;
	var RoleMapping = app.models.RoleMapping;
	var randomstring = Math.random().toString(36).slice(-8);

	User.create(
		{email: 'renderers@prevem.prevem', password: randomstring},
		function(err, Users) {
			if (err) throw err;
	});
	if (!fs.existsSync('../../node_modules/webmail-renderer/config.json')) {
		fs.createReadStream(path.join(__dirname,'../../node_modules/webmail-renderer/config.json.template'))
			.pipe(fs.createWriteStream(path.join(__dirname,'../../node_modules/webmail-renderer/config.json')));
	}
	setTimeout(function() {
		editConfig();
	},300);

	function editConfig() {
		var config = JSON.parse(fs.readFileSync(path.join(__dirname,'../../node_modules/webmail-renderer/config.json')));
		config.prevemCredentials.password = randomstring;
		fs.writeFileSync(path.join(__dirname,'../../node_modules/webmail-renderer/config.json'), JSON.stringify(config));
	}
};