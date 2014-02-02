var fs=require("fs"),
	path=require("path"),
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

var startRouting= function(routes, expressApp, mainPath){
	var _VARIABLE= routes.VARIABLE || {};
	Object.keys(routes).forEach(function(item){
        if(item.match(/get|post|put|delete|options|resource/i)){
        	routeMethod(routes[item], item, _VARIABLE, expressApp, mainPath);   
        }
    });
}

var routeMethod = function(routes, methodType, _VARIABLE, expressApp, mainPath){
	if(util.isArray(routes)){
		return routes.forEach(function(thisRoute){
			processRoute(thisRoute, methodType, _VARIABLE, expressApp, mainPath);
		});	
	}
	processRoute(routes, methodType, _VARIABLE, expressApp, mainPath);	
}

var processRoute = function(routes, methodType, _VARIABLE, expressApp, mainPath){
	Object.keys(routes).forEach(function(item){
		var controller =util.isArray(routes[item])?
						interPolateArray(routes[item], _VARIABLE):
						interPolate(routes[item], _VARIABLE);
		routeThis(item, methodType, controller, expressApp, _VARIABLE, mainPath);
	});
}

var routeThis = function(route, methodType, controllers, expressApp, _VARIABLE, mainPath){
	methodType=methodType.toLowerCase();
	if(methodType=="resource"){
		return resourceThis(route, controllers, expressApp, _VARIABLE, mainPath);
	}
	var actions;
	if(util.isArray(controllers)){
		actions=controllers.map(function(item){
			return resolveThisMethod(item, mainPath);
		});
	}else{
		actions=[resolveThisMethod(controllers, mainPath)];
	}
	actions.unshift(route);
	if(methodType=="delete"){methodType="del"}
	expressApp[methodType].apply(expressApp, actions);
}

var resolveThisMethod =function(item, mainPath){
	var c_a=item.split(":");
	if(c_a.length != 2){
		throw new Error("Invalid routing: "+ item);
	}
	var controller= require(path.join(mainPath, c_a[0]));
	c_a[1].split(".").forEach(function(item){
		if(typeof controller[item] != 'undefined'){
			controller=controller[item];
		}else{
			throw new Error("cant find action " + item + " in controller " + c_a[0]);
		}
	});
	return controller;
}

var resourceThis= function(route, controller, expressApp, _VARIABLE, mainPath){
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
		var action = require(path.join(mainPath,controller))[item];
		if(typeof action != "function"){
			throw new Error("cant find action "+ item + " in controller " + controller);
		}
		var appRoute = route + resourcing[item].route;
		expressApp[resourcing[item].verb](appRoute+".:format", action);
		expressApp[resourcing[item].verb](appRoute, action);		
	});
}

var textToJSON=function(txtPath, mainPath){
	var text = fs.readFileSync(path.join(mainPath, txtPath), {encoding:"utf8"});
	var lines = text.split('\n');
	var strToObj={};
	lines.forEach(function(line, num){
		var cmds =line.split(/[\s\t]+/);
		if(cmds.length < 3){
			if(cmds.length > 1){
				throw new Error("Invalid Routing line number:" + (num+1) + " " +line);	
			}
			return false; 
		}
		var verb = cmds.shift().trim().toUpperCase(),
			route = cmds.shift().trim();
		strToObj[verb] = strToObj[verb] || {};
		strToObj[verb][route]= (cmds.length > 1 ? cmds : cmds[0]);
	});
	return strToObj; 
}

var router=module.exports= function(expressApp){
	return new (function(){
		this.route = function(jsonPath){
			if(!this.path){
				throw new Error("set working directory first , use setCWD() method");
			}
			var routes;
			if(path.extname(routePath) == ".txt"){
				routes =textToJSON(routePath, this.path);
			}else{
				routes = require(path.join(this.path, routePath));
			}
			startRouting(routes, expressApp, this.path);

		},
		this.setCWD = function(mainPath){
			this.path=mainPath;
			return this;
		}
	})();
	
}

