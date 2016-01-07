[![NPM](https://nodei.co/npm/app-router.svg?downloads=true&downloadRank=true)](https://nodei.co/npm/app-router/)&nbsp;&nbsp;
[![Build Status](https://travis-ci.org/pradeep-mishra/app-router.svg?branch=master)](https://travis-ci.org/pradeep-mishra/app-router)


app-router
==============

routing for expressjs

###### usage

```javascript
var express= require("express");
var app = express();
var router = require("app-router");
router(app).setCWD(__dirname).route("./routes/route.json");

```
Set current working directory (CWD) relative to all controllers path and route.json

```javascript
setCWD(__dirname)
```
Throwing Error on unresolved action of route (default is true)

```javascript
throwErrorOnWrongActionPath(false)

```

console.log all routing mapped by app-router (default is false)

```javascript
logRoute(true)

```
Attach action manually to route in application (useful for other frameworks) (optional) (not required in express) 

```javascript
letMeAttach(function(method, route, actions){
    // method {String} = get, post, delete etc
    // route {String} = given by user or created by resource eg /user
    // actions {Array} = an array of actions resolved
    // routing example in express
    actions.unshift(route);
    app[method].apply(app, actions);

})

```

Use .format route in resource routing , by falsing it no route for .format will attach to resource routing. (default is true)

```javascript
useFormatInResource(false)

```


sample <b> route.json </b>

```javascript
{
  "VARIABLE":{
    "cp":"./controllers/my_controller",
    "other_controller":"./controllers/other_controller.js"
  },
  "GET":{
    "/user" : ["{cp}:myMiddleWareFunction" , "{cp}:myMethod"],
    "/user/:id" : "{cp}:myClass.myMethod"
  },
  "POST":{
    "/hello" : "./controllers/my_controller:createApp"
  },
  "PUT":{
    "/hello" : "{other_controller}:helloPut"
  },
  "DELETE":{
    "/user" : "./controllers/other_controller.js:destroyApp"
  },
  "RESOURCE":{
    "/res"  : "{cp}",
    "/user" : "./controllers/user_controller.js"
  }
}

```
Resource action mapping

Actions are mapped accordingly:

```javascript

"RESOURCE":{
  "/user" : "./controllers/user_controller"
}

Method  Route                       Action (in controller ./controllers/user_controller.js)

GET     /user                       ->  index
GET     /user.:format               ->  index
GET     /user/new                   ->  new
GET     /user/new.:format           ->  new
POST    /user                       ->  create
POST    /user.:format               ->  create
GET     /user/:id                   ->  show
GET     /user/:id.:format           ->  show
GET     /user/:id/edit              ->  edit
GET     /user/:id/edit.:format      ->  edit
PUT     /user/:id                   ->  update
PUT     /user/:id.:format           ->  update
DELETE  /user/:id                   ->  destroy
DELETE  /user/:id.:format           ->  destroy

```
Basic syntax for route.json

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



<b>Yaml</b> routing in app-router

```javascript
router(app).setCWD(__dirname).route("./routes/route.yml");

```

sample  <b> route.yml </b>

```yml

VARIABLE: 
  cp: "./controllers/my_controller"
  other_controller: "./controllers/other_controller.js"
GET: 
  /user: 
    - "{cp}:myMiddleWareFunction"
    - "{cp}:myMethod"
  /user/:id: "{cp}:myClass.myMethod"
POST: 
  /hello: "./controllers/my_controller:createApp"
PUT: 
  /hello: "{other_controller}:helloPut"
DELETE: 
  /user: "./controllers/other_controller.js:destroyApp"
RESOURCE: 
  /res: "{cp}"
  /user: "./controllers/user_controller.js"

```


<b>Text</b> routing in app-router

```javascript
router(app).setCWD(__dirname).route("./routes/route.txt");

```

sample  <b> route.txt </b>

```javascript

VARIABLE  cp                    ./controllers/my_controller

VARIABLE  other_controller      ./controllers/other_controller.js

GET       /user_controller      {cp}:myMiddleWareFunction   {cp}:myMethod

GET       /user/:id             ./controllers/other_controller:myClass.myAction

POST      /hello                ./controllers/my_controller:createApp

PUT       /hello                ./controllers/my_controller:createApp

DELETE    /user                 ./controllers/other_controller.js:destroyApp

RESOURCE  /res                  {cp}

RESOURCE  /user                 ./controllers/user_controller.js


```

