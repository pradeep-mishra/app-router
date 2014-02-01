var fs=require("fs"),
	util=require("util");

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

var routeMethod = function(routes, methodType, _GLOBAL, expressApp){
	if(util.isArray(routes)){
		return routes.forEach(function(thisRoute){
			processRoute(thisRoute, methodType, _GLOBAL, expressApp);
		});	
	}
	processRoute(routes, methodType, _GLOBAL, expressApp);
	
}

var processRoute = function(routes, methodType, _GLOBAL, expressApp ){
	Object.keys(routes).forEach(function(item){
		var controller =util.isArray(routes[item])?
						interPolateArray(routes[item], _GLOBAL):
						interPolate(routes[item], _GLOBAL);
		routeThis(item, methodType, controller, expressApp, _GLOBAL);
	});
}

var routeThis = function(route, methodType, controllers, expressApp, _GLOBAL){
	methodType=methodType.toLowerCase();
	if(methodType=="resource"){
		return resourceThis(route, controllers, expressApp, _GLOBAL);
	}
	var actions;
	if(util.isArray(controllers)){
		actions=controllers.map(resolveThisMethod)
	}else{
		actions=[resolveThisMethod(controllers)];
	}
	actions.unshift(route);
	if(methodType=="delete"){methodType="del"}
	expressApp[methodType].apply(expressApp, actions);
	//console.log(methodType,route);
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
			throw new Error("cant find action " + item + " in controller " + c_a[0]);
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
	Object.keys(resourcing).forEach(function(item){
		var action = require(controller)[item];
		if(typeof action != "function"){
			throw new Error("cant find action "+ item + " in controller " + controller);
		}
		var appRoute = route + resourcing[item].route;
		expressApp[resourcing[item].verb](appRoute+".:format", action);
		expressApp[resourcing[item].verb](appRoute, action);	
		//console.log(resourcing[item].verb,appRoute+".:format");
		//console.log(resourcing[item].verb,appRoute);	
	});
}

module.exports= function(expressApp){
	return {
		route:function(jsonPath){
			var routes = require(jsonPath);
			startRouting(routes, expressApp);
		}
	}
	
}

