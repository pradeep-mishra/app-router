var fs=require("fs");

var interPolate = function (str, iObj) {
    return str.replace(/{([^{}]+)}/g,
        function (a, b) {
        	var interObject=iObj;
        	b.split(".").forEach(function(item){
        		if(typeof interObject[item] != 'undefined'){
        			interObject=interObject[item];
        		}
        	});
            return (typeof interObject != 'undefined' && typeof interObject != 'object' ? interObject : a) ;
        }
    );
};

var interPolateArray = function(arry, obj){
	return arry.map(function(item){
		return interPolate(item, obj);
	});	
}

var startRouting= function(routes, expressApp){
	var _GLOBAL= routes.GLOBAL || {};
	Object.keys(routes).forEach(function(item){
        if(item.match(/get|post|put|delete|options|resource/i)){
        	routeMethod(routes[item], item, _GLOBAL, expressApp);   
        }
    });
}

var routeMethod = function(obj, methodType, _GLOBAL, expressApp){
	obj.forEach(function(thisRoute){
		Object.keys(thisRoute).forEach(function(item){
			routeThis(item, methodType, thisRoute[item], expressApp, _GLOBAL);
		});
	});
}

var routeThis = function(route, methodType, controllers, expressApp, _GLOBAL){
	methodType=methodType.toLowerCase();
	if(methodType=="resource"){
		return resourceThis(route, controllers, expressApp, _GLOBAL);
	}
	controllers=interPolateArray(controllers, _GLOBAL);
	var actionArray= controllers.map(resolveThisMethod);
	actionArray.unshift(route);
	if(methodType=="delete"){
		methodType="del";
	}
	expressApp[methodType].apply(expressApp, actionArray);
}

var resolveThisMethod =function(item){
	var c_a=item.split(":");
	if(c_a.length != 2){
		throw new Error("Invalid routing: "+ item);
	}
	var controller= require(c_a[0]);
	c_a[1].split(".").forEach(function(item){
		if(typeof controller[item] != 'undefined'){
			controller=controller[item];
		}else{
			throw new Error("Method " + item + " not found in controller, " + c_a[0]);
		}
	});
	return controller;
}

var resourceThis= function(route, controller, expressApp, _GLOBAL){
	var resourcing={
		index:{
			verb:"get",
			method:"index",
			route:""
		},
		create:{
			verb:"post",
			method:"create",
			route:""
		},
		update:{
			verb:"put",
			method:"update",
			route:"/:id"
		},
		destroy:{
			verb:"del",
			method:"destroy",
			route:"/:id"
		},
		"new":{
			verb:"get",
			method:"new",
			route:"/new"
		},
		edit:{
			verb:"get",
			method:"edit",
			route:"/:id/edit"
		},
		show:{
			verb:"get",
			method:"show",
			route:"/:id"
		}
	}
	controller=interPolate(controller, _GLOBAL);
	Object.keys(resourcing).forEach(function(item){
		var action = require(controller)[item];
		if(typeof action != "function"){
			throw new Error("cannot not found method "+ item + " in controller " + controller);
		}
		expressApp[resourcing[item].verb]((route + resourcing[item].route), action);
	});
}

var router=module.exports= function(expressApp){
	var exp= expressApp;
	return {
		route:function(jsonPath){
			var pathObj = fs.statSync(jsonPath)	
			if(pathObj.isFile()){
				var routes = require(jsonPath);
				startRouting(routes, expressApp);
			}
			return Error("Routing JSON is not valid");	
		}
	}
	
}

