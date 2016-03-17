export const Users = Meteor.users;

Users.isInRole = function (userId, role) {
  var user = Users.findOne({_id: userId});
  return !!(user && user.roles && user.roles.indexOf(role) != -1);
};

Users.isInRoles = function (userId, roleList) {
	var user = Users.findOne({_id: userId});
	if(!user || !user.roles) {
		return false;
	}

	var granted = new Set([...roleList].filter(x => user.roles.has(x)));

	if(!granted || granted.length == 0) {
		return false;
	}
	return true;
};

Users.isAdmin = function (userId) {
  return Users.isInRole(userId, "admin");
};

Users.isAdminOrInRole = function (userId, role) {
  return Users.isInRole(userId, "admin") || Users.isInRole(userId, role);
};


export const isAdmin = function() {
	return Users.isAdmin(Meteor.userId());
};

export const isUserInRole = function (role, options) {
	return Users.isInRole(Meteor.userId(), role);
};

export const isUserInRoles = function (roleList, options) {
	return Users.isInRoles(Meteor.userId(), roleList);
};


if(Meteor.isServer) {

	Users.allow({
		// doesn't allow insert or removal of users from untrusted code
		update: function (userId, doc, fieldNames, modifier) {
			// only admins can update user roles via the client
			return Users.isAdmin(userId) || (doc._id === userId && fieldNames.indexOf("roles") < 0);
		}
	});

	Meteor.publish("admin_user", function(_id){
		return Users.isAdmin(this.userId) ? Users.find({_id: _id}) : this.ready();
	});

	Meteor.publish("admin_users", function() {
		return Users.isAdmin(this.userId) ? Meteor.users.find({}, {fields: {profile: 1, roles: 1, emails: 1}}) : this.ready();
	});

	Meteor.publish("current_user_data", function () {
		return Meteor.users.find( { _id: this.userId }, { fields: {profile: 1 , roles: 1} } );
	});
}
