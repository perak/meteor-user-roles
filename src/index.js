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

//	var granted = new Set([...roleList].filter(x => user.roles.has(x)));
	var granted = roleList.filter(function(value) { 
		return user.roles.indexOf(value) > -1;
	});

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

	// Add roles array to user document
	Users.before.insert(function(userId, doc) {
		if(!doc.createdAt) doc.createdAt = new Date();
		if(!doc.modifiedAt) doc.modifiedAt = doc.createdAt;
		if(!doc.roles) doc.roles = [];
	});

	Users.before.update(function(userId, doc, fieldNames, modifier, options) {
		modifier.$set = modifier.$set || {};
		modifier.$set.modifiedAt = Date.now();
	});

	Meteor.publish("admin_user", function (_id) {
		if(!Users.isAdmin(this.userId)) {
			return this.ready();
		}
		var user = Meteor.users.find({ _id: _id });
		if(Users.publishJoinedCursors) {
			return Users.publishJoinedCursors(user);
		}
		return user;
	});

	Meteor.publish("admin_users", function () {
		if(!Users.isAdmin(this.userId)) {
			return this.ready();
		}
		var users = Meteor.users.find({});
		if(Users.publishJoinedCursors) {
			return Users.publishJoinedCursors(users);
		}
		return users;
	});

	Meteor.publish("current_user_data", function () {
		var user = Meteor.users.find({ _id: this.userId }, { fields: { username: 1, profile: 1, private: 1, public: 1, roles: 1, emails: 1 } });
		if(Users.publishJoinedCursors) {
			return Users.publishJoinedCursors(user);
		}
		return user;
	});

}
