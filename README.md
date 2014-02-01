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
		{"/my" : ["{cp}:myClass.myMethod"]}
	],
	"POST":[
		{"/":["./controllers/my_controller:createApp"]}
	],
	"PUT":[
		{"/":["{cp}:helloPut"]}
	],
	"DELETE":[
		{"/":["{cp}:destroyApp"]}
	],
	"RESOURCE":[
		{"/res":"{cp}"},
        {"/user":"./controllers/user_controller.js"}
	]
}

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

