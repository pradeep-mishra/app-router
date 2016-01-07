var fs = require("fs"),
	path = require("path"),
	util = require("util"),
    showRoute = false,
    throwError = true,
    handler = null,
    useFormat = true;

var interPolateStr = function (str, iObj) {
    return str.replace(/{([^{}]+)}/g,
        function (a, b) {
        	var interObject = iObj;
        	b.split(".").forEach(function(item){
        		if(typeof interObject[item] != 'undefined'){
        			interObject=interObject[item];
        		}
        	});
            return (typeof interObject != 'undefined' && typeof interObject != 'object' ? interObject : a) ;
        }
    );
};

var interPolateStrArray = function(arry, obj){
	return arry.map(function(item){
		return interPolateStr(item, obj);
	});	
}

var interPolateObj = function (str, iObj) {
	iObj = iObj || GLOBAL ;
    return str.replace(/<([^<>]+)>/,
        function (a, b) {
        	var interObject = iObj;
        	b.split(".").forEach(function(item){
        		if(typeof interObject[item] != 'undefined'){
        			interObject = interObject[item];
        		}
        	});
            return (typeof interObject == "function" ? interObject : a) ;
        }
    );
};

var interPolateObjArray = function(arry, obj){
	return arry.map(function(item){
		return interPolateObj(item, obj);
	});	
}



var startRouting = function(routes, expressApp, mainPath){
	var _VARIABLE = inrePolateVar(routes);
	Object.keys(routes).forEach(function(item){
        if(item.match(/get|post|put|delete|del|options|patch|resource/i)){
        	routeMethod(routes[item], item, _VARIABLE, expressApp, mainPath);   
        }
    });
}

var inrePolateVar = function(routes){
	var _VARIABLE = routes.VARIABLE || routes.variable || { };
    Object.keys(_VARIABLE).forEach(function(item){
        _VARIABLE[item] = interPolateStr(_VARIABLE[item], _VARIABLE);
    });
    return _VARIABLE;
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
		var controller = util.isArray(routes[item])?
						interPolateStrArray(routes[item], _VARIABLE):
						interPolateStr(routes[item], _VARIABLE);
		routeThis(item, methodType, controller, expressApp, _VARIABLE, mainPath);
	});
}

var routeThis = function(route, methodType, controllers, expressApp, _VARIABLE, mainPath){
	methodType = methodType.toLowerCase();
	if(methodType === "resource"){
		return resourceThis(route, controllers, expressApp, _VARIABLE, mainPath);
	}
	var actions;
	if(util.isArray(controllers)){
		actions = controllers.map(function(item){
			return resolveThisMethod(item, mainPath);
		});
	}else{
		actions = [resolveThisMethod(controllers, mainPath)];
	}
	
	if(handler){
		handler(methodType , route, actions);
	}else{
		//if(methodType === "delete"){methodType = "del"}
		actions.unshift(route);
		expressApp[methodType].apply(expressApp, actions);	
	}
    if(showRoute){
        console.log(methodType, route, controllers);
    }
}

var resolveThisMethod = function(item, mainPath){
	var c_a = item.split(":");
	if(c_a.length != 2){
		throw new Error("Invalid routing: "+ item);
	}
	var controller = require(path.join(mainPath, c_a[0]));
	c_a[1].split(".").forEach(function(item){
		if(typeof controller[item] != 'undefined'){
			controller = controller[item];
		}else{
            if(throwError){
                throw new Error("cant find action : " + c_a[1] + " in controller " + path.join(mainPath,c_a[1]));
            }else{
                controller = function(req, res){
                    res.send(400, "Action Not Found");
                }
                return false;
            }
		}
	});
    if(throwError && typeof controller != "function"){
        throw new Error("cant find action : " + c_a[1] + " in controller " + path.join(mainPath,c_a[1]));
    }
	return controller;
}

var resourceThis = function(route, controller, expressApp, _VARIABLE, mainPath){
	var resourcing = {
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
		var appRoute = route + resourcing[item].route;
        if(throwError && typeof action != "function"){
            throw new Error("cant find action : " + item + " in controller " + path.join(mainPath,controller));
        }
		if(handler){
			if(useFormat){
				handler(resourcing[item].verb, appRoute + ".:format" , [action]);	
			}
			handler(resourcing[item].verb, appRoute, [action]);
		}else{
			if(useFormat){
				expressApp[resourcing[item].verb](appRoute + ".:format", action);
			}
			expressApp[resourcing[item].verb](appRoute, action);	
		}
		
        if(showRoute){
            console.log(resourcing[item].verb, appRoute + ".:format", path.join(mainPath,controller) + "#" + item);
            console.log(resourcing[item].verb, appRoute, path.join(mainPath,controller) + "#" + item);
        }
	});
}

var textToJSON=function(txtPath, mainPath){
	var text = loadText(txtPath, mainPath);
	var lines = text.split('\n');
	var strToObj = { };
	lines.forEach(function(line, num){
		var cmds = line.split(/[\s\t]+/);
		if(cmds.length < 3){
			if(cmds.length > 1){
				throw new Error("Invalid Routing line number:" + (num + 1) + " " + line);	
			}
			return false; 
		}
		var verb = cmds.shift().trim().toUpperCase(),
			route = cmds.shift().trim();
		strToObj[verb] = strToObj[verb] || {};
		strToObj[verb][route] = (cmds.length > 1 ? cmds : cmds[0]);
	});
	return strToObj; 
}

var loadText = function(filePath, mainPath){
	return fs.readFileSync(path.join(mainPath, filePath), "utf8");	
}

var router = module.exports = function(expressApp){
	return new (function(){
		this.route = function(filePath){
			if(!this.path){
				throw new Error("set current working directory first , use setCWD() method");
			}
			var routes;
			if(path.extname(filePath) == ".txt"){
				routes = textToJSON(filePath, this.path);
			}else if(path.extname(filePath) == ".yml"){
				routes = require('js-yaml').load(loadText(filePath, this.path));
			}else{
				routes = require(path.join(this.path, filePath));
			}
			startRouting(routes, expressApp, this.path);

		},
        this.logRoute = function(bool){
            if(typeof bool == "undefined"){
               bool = true;
            }
            showRoute = Boolean(bool);
            return this;
        },
        this.throwErrorOnWrongActionPath = function(bool){
            if(typeof bool == "undefined"){
                bool = true;
            }
            throwError = Boolean(bool);
            return this;
        },
		this.setCWD = function(mainPath){
			this.path = mainPath;
			return this;
		},
		this.letMeAttach = function(handle){
			if(typeof handle == "function"){
				handler = handle;
			}
			return this;
		},
		this.useFormatInResource = function(bool){
			if(typeof bool == "undefined"){
                bool = true;
            }
            useFormat = Boolean(bool);
            return this;
		}
	})();	
}

