# pipeline.js

pipeline.js is a flow-control library that simplifies coordination of 
asynchronous tasks.

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

var pipeline = require('./pipeline.js');
var sequence = pipeline.sequence;
var parallel = pipeline.parallel;
var forEach = pipeline.forEach;

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

## building

### pipeline.sequence( functions, callback, context )
### pipeline.sequence( functions ) -> f( callback, context )

TODO

### pipeline.parallel( functions, callback, context )
### pipeline.parallel( functions ) -> f( callback, context )

TODO

### pipeline.forEach( collection, iterator, callback, context )
### pipeline.forEach( functions, iterator ) -> f( callback, context )

TODO

# dependencies

none

# license

pipeline.js is MIT licensed.
