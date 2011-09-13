(function(ext){
	
	//----------------------------------------------------------------------------
	var forEach = ext.forEach = function(collection, iterator, callback, context){
		var executor = function(callback, context){
			var dones = [];
			dones.length = collection.length;
			
			var generateSetDone = function(index){
				return function(){
					dones[index] = true;
					
					for(var i = 0; i < dones.length; i++)
						if(dones[i] !== true)
							return;
					
					callback();
				};
			};
			
			if(collection.length <= 0)
				callback();
			else
				for(var i = 0; i < collection.length; i++)
					iterator.call(context, collection[i], generateSetDone(i));
		};
		
		if(arguments.length === 2)
			return executor;
		else
			executor(callback, context || this);
	};

	//----------------------------------------------------------------------------
	var parallel = ext.parallel = function(functions, callback, context){
		var executor = function(callback, context){
			context = context || this;
			forEach(functions, function(func, done){
				func.call(context, done);
			}, callback, context);
		};

		if(arguments.length === 1)
			return executor;
		else
			executor(callback, context || this);
	};

	//----------------------------------------------------------------------------
	var sequence = ext.sequence = function(functions, callback, context){
		var executor = function(callback, context){
			context = context || this;
			
			var createCallback = function(index){
				if(index < functions.length)
					return function(){
						var oldArgs = Array.prototype.slice.call(arguments, 0);
						var newArgs = [createCallback(index+1)].concat(oldArgs);
						functions[index].apply(context, newArgs);
					};
				else if(callback)
					return function(){
						callback.apply(context, arguments);
					};
				else
					return function(){};
			};
			
			createCallback(0)();
		};
		
		if(arguments.length === 1)
			return executor;
		else
			executor(callback, context || this);
	};
	
})(typeof exports === 'undefined' ? (this.pipeline = {}) : exports);