### What is PromiseLite? ###

PromiseLite is a light, browser-friendly implementation of JavaScript promises. 



### Setup ###

If you want to use PromiseLite in your project, just download 
```
#!JavaScript

dist/promiselite.min.js
```
 and import it into a HTML script tag.



```
#!HTML
<html>
    <head>
        <script src="path/to/promiselite/dist/promiselite.min.js></script>
    </head>
    <body>
        ...
    </body>
</html>
```


### Using PromiseLite ###


## Basic executors, then and fail*

```
#!JavaScript

var p = new PromiseLite(function(resolve, reject){
    setTimeout(function(){
        if (Math.random() > 0.5){
            resolve('It worked!');
        } else {
            reject('It failed!');
        }
    }).then(function(value){
        console.info('Yay! ' + value); // outputs 'Yay! It worked!'
    }).fail(function(reason){
        console.error('Ops! ' + reason); // outputs 'Ops! It failed!'
    });
});
```

*I used the name "fail" for compatibility reasons (catch is a keyword and in some cases a SyntaxError is raised if catch is used outside a try/catch block).

## Resolving a Promise created without an executor


```
#!JavaScript

var p = new PromiseLite();

p.then(function(value){
    console.log('The answer is ' + value);
});

// since p has no executor, it won't be resolved until we invoke p.resolve

p.resolve(42); // outputs 'The answer is 42'

```


## PromiseLite.all 


PromiseLite.all takes an Array of PromiseLite as argument and is resolved if and only if all such promises are fulfilled.


```
#!javascript

var p1 = new PromiseLite();
var p2 = new PromiseLite();
var p3 = new PromiseLite();

var pAll = new PromiseLite.all([p1, p2, p3]);

```



## PromiseLite.race


PromiseLite.race takes an Array of PromiseLite as argument, then
* if the first promise that is settled is fulfilled, the promise returned by PromiseLite.race is resolved
* if the first promise that is settled is rejected, the promise returned by PromiseLite.race is rejected


```
#!javascript

var p1 = new PromiseLite();
var p2 = new PromiseLite();
var p3 = new PromiseLite();

var pRace = new PromiseLite.race([p1, p2, p3]);

```


## PromiseLite.any



PromiseLite.any takes an Array of PromiseLite as argument, then
* if the at least one of such promises is fulfilled, the promise returned by PromiseLite.any is resolved
* if all such promises are rejected, the promise returned by PromiseLite.any is rejected


```
#!javascript

var p1 = new PromiseLite();
var p2 = new PromiseLite();
var p3 = new PromiseLite();

var pAny = new PromiseLite.any([p1, p2, p3]);

```



## force promises



"force"* corresponds to a "finally" block applied to a chain of promises. It is executed both when a PromiseLite instance is in a fulfilled or rejected state.


*I used the name "force" for compatibility reasons (finally is a keyword and in some cases a SyntaxError is raised if finally is used outside a try/catch/finally block)
```
#!javascript

var p = new PromiseLite();

p.then(function(value){
   // do something if resolved
   // i.e. read data from an open file
}).fail(function(reason){
   // do something if rejected (or if an Error is raised)
   // i.e. show an error message on screen - "missing file"
}).finally(function(){
   // do something both if resolved or rejected
   // i.e. close the file
});
```