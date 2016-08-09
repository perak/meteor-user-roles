# meteor-user-roles

This package will add simple user access management to <a href="https://www.meteor.com" target="_blank">Meteor</a> application.

Package is used by <a href="http://www.meteorkitchen.com" target="_blank">Meteor Kitchen</a> - source code generator for Meteor.


### Instalation

```
meteor npm install meteor-user-roles 
```


## Users collection

Collection `Users` extends `Meteor.users` collection. When user is created, `roles: []` array is added to the user document. You can add / remove multiple role names to this array:

```javascript
{
	...user's document...

	roles: ["admin", "user"]

	...
}

```

### Users.isInRole(userId, role)

Check if user is in given role. Example:

```javascript
if(Users.isInRole(Meteor.userId(), "admin")) {
	// user is admin
	...
} else {
	// user is not admin
	...
}
```

### Users.isInRoles(userId, roleList)

Check if user is in any of listed roles. Example:

```javascript
if(Users.isInRoles(Meteor.userId(), ["admin", "staff"])) {
	// user is admin or staff
	...
} else {
	// user is not admin or staff
	...
}
```

### Users.isAdmin(userId)

Check if user is admin. Example:

```javascript
if(Users.isAdmin(Meteor.userId()) {
	// user is admin
	...
} else {
	// user is not admin
	...
}
```

### Users.isAdminOrInRole(userId, role)

Check if user is admin or in given role. Example:

```javascript
if(Users.isAdminOrInRole(Meteor.userId(), "staff") {
	// user is admin or staff
	...
} else {
	// user is not admin or staff
	...
}
```

## Permisions to Users collection

Only admins can update user roles via the client


## Global functions

### isUserAdmin()

returns true if current user is admin

```javascript
if(isAdmin()) {
	// user is admin
	...
} else {
	// user is not admin
	...
```

### isUserInRole(role)

returns true if current user is in given role

```javascript
if(isUserInRole("staff")) {
	// user is "staff"
	...
} else {
	// user is not "staff"
	...
```

### isUserInRoles(roleList)

returns true if current user is in any of roles given as array of strings. Example:

```javascript
if(isUserInRoles(["admin", "staff"])) {
	// user is admin or staff
	...
} else {
	// user is not admin or staff
	...
```

## Publications

### Meteor.subscribe("admin_user", userId)

Data from user with given userId. Only user with "admin" role can subscribe. Complete user document is exposed to admin.


### Meteor.subscribe("admin_users")

Data from all users. Only user with role "admin" role can do subscribe. Following fields are exposed to admin:

- profile
- roles
- emails


### Meteor.subscribe("current_user_data")

Data from current user. Any user can do that (subscribe to own data). 

- profile
- roles
- emails

