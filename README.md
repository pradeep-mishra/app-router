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
	"GET":[
		{"/" : ["{cp}:myMiddleWareFunction" , "{cp}:myMethod"]},
		{"/:id" : ["{cp}:myClass.myMethod"]}
	],
	"POST":[
		{"/":["./controllers/my_controller:createApp"]}
	],
	"PUT":[
		{"/":["{other_controller}:helloPut"]}
	],
	"DELETE":[
		{"/":["./controllers/other_controller.js:destroyApp"]}
	],
	"RESOURCE":[
		{"/res":"{cp}"},
        {"/user":"./controllers/user_controller.js"}
	]
}

```
Resource action mapping

Actions are then mapped accordingly:
```javascript
GET     /route_given                ->  index
GET     /route_given/new            ->  new
POST    /route_given                ->  create
GET     /route_given/:id            ->  show
GET     /route_given/:id/edit       ->  edit
PUT     /route_given/:id            ->  update
DELETE  /route_given/:id            ->  destroy
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
{"/app_route" : ["path_to_controller:middleware_one", "path_to_controller:middleware_two", "path_to_controller:method_name" ]}
```

