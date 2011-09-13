(function(ext){

	//----------------------------------------------------------------------------
	var forEach = ext.forEach = function(collection, iterator, callback, context){
		var executor = function(callback, context){
			var results = [];
			results.length = collection.length;
			var errors = [];

			var setDone = function(index, err){
				results[index] = true;
				if(err !== undefined)
					errors.push(err);

				for(var i = 0; i < results.length; i++)
					if(results[i] !== true)
						return;

				callback(errors.length === 0 ? undefined : errors);
			};

			var generateSetDone = function(index){
				return function(err){
					setDone(index, err);
				};
			};

			if(collection.length <= 0)
				callback();
			else
				for(var i = 0; i < collection.length; i++)
					try{
						iterator.call(context, collection[i], generateSetDone(i));
					}catch(err){
						setDone(i, err);
					}
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
					return function(err){
						if(err){
							callback(err);
							return;
						}

						try{
							functions[index].call(context, createCallback(index + 1));
						}catch(err){
							callback(err);
						}
					};
				else
					return function(err){
						callback.apply(context, arguments);
					};
			};

			createCallback(0)();
		};

		if(arguments.length === 1)
			return executor;
		else
			executor(callback, context || this);
	};

})(typeof exports === 'undefined' ? (this.pipeline = {}) : exports);