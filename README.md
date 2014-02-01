app-router
==============

routing for expressjs

###### usage

```javascript
var express= require("express");
var app = express();
var router = require("app-router");
router(app).route("./route.json");

```

sample <b> route.json </b>

```javascript
{
    "GLOBAL":{
        "cp":"./controllers/my_controller",
		"other_controller":"./controllers/other_controller.js"
	},
	"GET":{
		"/" : ["{cp}:myMiddleWareFunction" , "{cp}:myMethod"],
		"/:id" : ["{cp}:myClass.myMethod"]
	},
	"POST":{
		"/":["./controllers/my_controller:createApp"]
	},
	"PUT":{
		"/":["{other_controller}:helloPut"]
	},
	"DELETE":{
		"/":["./controllers/other_controller.js:destroyApp"]
	},
	"RESOURCE":{
		"/res":"{cp}",
		"/user":"./controllers/user_controller.js"
	}
}

```
Resource action mapping

Actions are mapped accordingly:

```javascript

"RESOURCE":{

	"/user":"./controllers/user_controller.js"
}

GET     /user               		->  index
GET     /user.:format               ->  index
GET     /user/new                   ->  new
GET     /user/new.:format           ->  new
POST    /user                       ->  create
POST    /user.:format           	->  create
GET     /user/:id           		->  show
GET     /user/:id.:format       	->  show
GET     /user/:id/edit              ->  edit
GET     /user/:id/edit.:format      ->  edit
PUT     /user/:id                   ->  update
PUT     /user/:id.:format           ->  update
DELETE  /user/:id                   ->  destroy
DELETE  /user/:id.:format           ->  destroy

```
Basic syntax for config.json

```javascript
{"/app_route" : [ "path_to_controller:method_name" ]}
```
OR
```javascript
{"/app_route" : [ "path_to_controller:class_name.method_name" ]}
```
OR

```javascript
{"/app_route" : [
	"path_to_controller:middleware_one", 
	"path_to_controller:middleware_two", 
	"path_to_controller:method_name" 
	]
}
```

