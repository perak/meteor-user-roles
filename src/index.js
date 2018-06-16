export const Users = Meteor.users;

Users.isInRole = function (userId, role) {
  let user = Users.findOne({_id: userId});
  return !!(user && user.roles && user.roles.indexOf(role) != -1);
};

Users.isInRoles = function (userId, roleList) {
	let user = Users.findOne({_id: userId});
	if(!user || !user.roles) {
		return false;
	}

//	let granted = new Set([...roleList].filter(x => user.roles.has(x)));
	let granted = roleList.filter(function(value) { 
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
	let _extendFilter = function(originalFilter, extraOptions) {
		originalFilter = originalFilter || {};
		extraOptions = extraOptions || {};

		let searchText = extraOptions.searchText || "";
		let searchFields = extraOptions.searchFields || [];

		let addFilter = {};

		// search
		if(searchText && searchFields && searchFields.length) {
			let searchList = [];
			let searchRegExp = new RegExp(searchText, "i");
			searchFields.map(function(fieldName) {
				let searchItem = {};
				searchItem[fieldName] = searchRegExp;
				searchList.push(searchItem);
			});
			addFilter["$or"] = searchList;
		}

		let filter = originalFilter;
		if(!_.isEmpty(addFilter) && !_.isEmpty(originalFilter)) {
			filter = { "$and": [ originalFilter, addFilter ] };
		} else {
			if(!_.isEmpty(addFilter)) {
				filter = addFilter;
			} else {
				filter = originalFilter;
			}
		}

		return filter;
	};

	let _extendOptions = function(originalOptions, extraOptions) {
		originalOptions = originalOptions || {};
		extraOptions = extraOptions || {};

		let sortBy = extraOptions.sortBy || "";
		let pageNo = typeof extraOptions.pageNo == "undefined" ? -1 : extraOptions.pageNo;
		let pageSize = extraOptions.pageSize || 0;
		let doSkip = extraOptions.doSkip || false;

		let addOptions = {};

		// sort
		if(sortBy) {
			addOptions.sort = {};
			addOptions.sort[sortBy] = (typeof extraOptions.sortAscending == "undefined" || exraOptions.sortAscending) ? 1 : -1;
		}

		// skip & limit
		if(!extraOptions.noPaging && pageNo >= 0 && pageSize > 0) {
			if(doSkip) {
				addOptions.skip = pageNo * pageSize;
			}
			addOptions.limit = pageSize;
		}

		let options = originalOptions;

		if(!_.isEmpty(addOptions)) {
			objectUtils.mergeObjects(options, addOptions);
		}

		return options;
	};

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
		let user = Meteor.users.find({ _id: _id });
		if(Users.publishJoinedCursors) {
			return Users.publishJoinedCursors(user);
		}
		return user;
	});

	Meteor.publish("admin_users", function () {
		if(!Users.isAdmin(this.userId)) {
			return this.ready();
		}
		let users = Meteor.users.find({});
		if(Users.publishJoinedCursors) {
			return Users.publishJoinedCursors(users);
		}
		return users;
	});

	Meteor.publish("admin_users_paged", function(extraOptions) {
		extraOptions.doSkip = true;
		if(!Users.isAdmin(this.userId)) {
			return this.ready();
		}
		let users = Meteor.users.find(_extendFilter({}, extraOptions), _extendOptions({}, extraOptions));
		if(Users.publishJoinedCursors) {
			return Users.publishJoinedCursors(users);
		}
		return users;
	});

	Meteor.publish("admin_users_paged_count", function(extraOptions) {
		if(typeof Counts == "undefined" || !Users.isAdmin(this.userId)) {
			return this.ready();
		}
		Counts.publish(this, "admin_users_paged_count", Meteor.users.find(_extendFilter({}, extraOptions), { fields: { _id: 1 }} ));
	});

	Meteor.publish("current_user_data", function () {
		let user = Meteor.users.find({ _id: this.userId }, { fields: { username: 1, profile: 1, private: 1, public: 1, roles: 1, emails: 1 } });
		if(Users.publishJoinedCursors) {
			return Users.publishJoinedCursors(user);
		}
		return user;
	});
}
