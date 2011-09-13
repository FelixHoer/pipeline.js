# pipeline.js

pipeline.js is a flow-control library that simplifies coordination of 
asynchronous tasks. It can be used in the browser as well as in 
[node.js](http://nodejs.org/).

# usage

The basic blocks of our pipeline are functions that take a callback (`next`) as 
argument and call it as soon as they are done.

```javascript
var asyncFunction = function(next){
	console.log('starting job!');
	setTimeout(function(){
		console.log('finally done!');
		next(); // signal that async function is done
	}, 1000);
};
```

So let's build a pipeline! `sequence` and `parallel` take an array of such 
asynchronous functions and - like their names suggest - start them one after 
another or all at the same time.

```javascript
// load functions into scope
var pipeline = require('./pipeline.js'); // not needed in the browser
var sequence = pipeline.sequence;
var parallel = pipeline.parallel;

// create a pipeline
var pipe = sequence([
	generateAsyncFunction('a', 500),
	parallel([
		generateAsyncFunction('b-1', 900),
		generateAsyncFunction('b-2', 400),
		generateAsyncFunction('b-3', 600)
	]),
 	generateAsyncFunction('c', 500),
	generateAsyncFunction('d', 500)
]);

// execute the pipeline and call the given function when finished
pipe(function(){
	console.log('all jobs have finished');
});
```

```
starting job a!
finally done with a!
starting job b-1!
starting job b-2!
starting job b-3!
finally done with b-2!
finally done with b-3!
finally done with b-1!
starting job c!
finally done with c!
starting job d!
finally done with d!
all jobs have finished
```

`generateAsyncFunction` just automates the process of creating async test 
functions.

```javascript
var generateAsyncFunction = function(name, time){
	return function(next){
		console.log('starting job ' + name + '!');
		setTimeout(function(){
			console.log('finally done with ' + name + '!');
			next(); // signal that async function is done
		}, time);
	};
};
```

# api

### pipeline.sequence( functions, callback, [context] )
### pipeline.sequence( functions ) -> f( callback, [context] )

```
functions: [ function(next) ]
	next: function(err)
callback: function(err)
context: {}
```

`sequence` calls the given `functions` one after another, waiting for the 
predecessor to signal that it is done before executing the next function.

Once all are done the `callback` is executed.

If a `context` is provided all `functions` and the `callback` will be executed 
with `this` assigned to it.

To show that something went wrong one of the `functions` can either throw an 
exception (just possible at the top level) or execute it's callback with the 
error as first argument. The following functions won't be called and the 
`callback` will receive the error as first argument.

ie `examples/sequence.html`:

```javascript
// load functions into scope
var sequence = pipeline.sequence;

// create a pipeline
var pipe = sequence([
	generateAsyncFunction('a', 700),
	generateAsyncFunction('b', 500),
	generateAsyncFunction('c', 800)
]);

// execute the pipeline and call the given function when finished
pipe(function(){
	log('all jobs have finished');
});
```

```
starting job a!
finally done with a!
starting job b!
finally done with b!
starting job c!
finally done with c!
all jobs have finished
```

### pipeline.parallel( functions, callback, [context] )
### pipeline.parallel( functions ) -> f( callback, [context] )

```
functions: [ function(next) ]
	next: function(err)
callback: function(err[])
context: {}
```

`parallel` starts the given `functions` all at the same time and doesn't wait 
for the predecessor's callback.

Once all `functions` are done the `callback` is executed.

If a `context` is provided all `functions` and the `callback` will be executed 
with `this` assigned to it.

To show that something went wrong one of the `functions` can either throw an 
exception (just possible at the top level) or execute it's callback with the 
error as first argument. The other functions will still be executed and 
`callback` will receive an array of all occured errors when all are done.

ie `examples/parallel.html`:

```javascript
// load functions into scope
var parallel = pipeline.parallel;

// create a pipeline
var pipe = parallel([
	generateAsyncFunction('a', 700),
	generateAsyncFunction('b', 500),
	generateAsyncFunction('c', 800)
]);

// execute the pipeline and call the given function when finished
pipe(function(){
	log('all jobs have finished');
});
```

```
starting job a!
starting job b!
starting job c!
finally done with b!
finally done with a!
finally done with c!
all jobs have finished
```

### pipeline.forEach( collection, iterator, callback, context )
### pipeline.forEach( functions, iterator ) -> f( callback, context )

```
collection: [ any ]
iterator: function(item, next)
	item: any
	next: function(err)
callback: function(err[])
context: {}
```

`forEach` calls `iterator` with each `item` in the collection.

Once the `next`-function of all `iterator`s / `item`s has been called the 
`callback` is executed.

If a `context` is provided each `iterator` and the `callback` will be executed 
with `this` assigned to it.

To show that something went a `iterator` can either throw an exception (just 
possible at the top level) or execute it's `next`-callback with the 
error as first argument. The other items will still be processed and 
`callback` will receive an array of all occured errors when all are done.

ie `examples/forEach.html`:

```javascript
// simulate long running processing
var processAsync = function(item, next){
	var time = parseInt(Math.random() * 1000);
	log(item + ': start processing');
	setTimeout(function(){
		log(item + ': done processing after ' + time + 'ms');
		next(); // signal that async function is done
	}, time);
};

// load functions into scope
var forEach = pipeline.forEach;

// a collection of items that have to be processed in parallel
var collection = ['a', 'b', 'c', 'd'];

// create a pipeline
var pipe = forEach(collection, function(item, done){
	processAsync(item, done);
});

// execute the pipeline and call the given function when finished
pipe(function(){
	log('all items processed');
});
```

Your results will differ due to random delay.

```
a: start processing
b: start processing
c: start processing
d: start processing
b: done processing after 77ms
d: done processing after 176ms
a: done processing after 706ms
c: done processing after 832ms
all items processed
```

# dependencies

none

# license

pipeline.js is MIT licensed.
