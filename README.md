# README #

This README would normally document whatever steps are necessary to get your application up and running.

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


To be implemented (soon).


## PromiseLite.race


To be implemented (soon).
