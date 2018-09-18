# promiselite

[![Build Status](https://travis-ci.org/D-Mobilelab/promiselite.svg?branch=master&v=1)](https://travis-ci.org/D-Mobilelab/promiselite)
[![Coverage Status](https://coveralls.io/repos/github/D-Mobilelab/promiselite/badge.svg?branch=master&v=1)](https://coveralls.io/github/D-Mobilelab/promiselite?branch=master)
[![npm version](https://badge.fury.io/js/promiselite.svg)](https://badge.fury.io/js/promiselite)
[![Bower version](https://badge.fury.io/bo/promiselite.svg)](https://badge.fury.io/bo/promiselite)
[![GitHub version](https://badge.fury.io/gh/D-Mobilelab%2Fpromiselite.svg?v=1)](https://badge.fury.io/gh/D-Mobilelab%2Fpromiselite) [![Greenkeeper badge](https://badges.greenkeeper.io/D-Mobilelab/promiselite.svg)](https://greenkeeper.io/)

*PromiseLite* is a light, browser-friendly implementation of JavaScript promises. 

## Installation

### NPM
```
npm install --save promiselite
```
You can found the library ready for production on <i>node_modules/promiselite/dist/dist.js</i>

### Bower
```
bower install --save promiselite
```
You can found the library ready for production on <i>bower_components/promiselite/dist/dist.js</i>

## Documentation

To read documentation, go to:

[http://d-mobilelab.github.io/promiselite/1.3.0](http://d-mobilelab.github.io/promiselite/1.3.0)

Replace <i>1.3.0</i> with the version of the documentation you want to read.


## Usage

### Executors, then and fail

See the documentation of JavaScript *Promise* [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

The name *fail* was used instead of *catch* for compatibility reasons. since some browsers do not allow bare keywords in dot notation.

**Example**

```
#!JavaScript

var p = new PromiseLite(function(resolve, reject){
    setTimeout(function(){
        if (Math.random() > 0.5){
            resolve('It worked!');
        } else {
            reject('It failed!');
        }
    });
}).then(function(value){
    console.info('Yay! ' + value); // outputs 'Yay! It worked!'
}).fail(function(reason){
    console.error('Ops! ' + reason); // outputs 'Ops! It failed!'
});;
```

### Forced blocks

The method *force* corresponds to a *finally* block applied to a chain of promises. It is executed both when a *PromiseLite* instance is both in a fulfilled or rejected state. 

The name *force* was used instead of *finally* for compatibility reasons since some browsers do not allow bare keywords in dot notation.

**Example**

```
#!javascript

var p = new PromiseLite();

p.then(function(value){
   // do something if resolved
   // i.e. read data from an open file
}).fail(function(reason){
   // do something if rejected (or if an Error is raised)
   // i.e. show an error message on screen - "missing file"
}).force(function(){
   // do something both if resolved or rejected
   // i.e. close the file
});
```

### Resolving a Promise created without an executor


```
#!JavaScript

var p = new PromiseLite();

p.then(function(value){
    console.log('The answer is ' + value);
});

// since p has no executor, it won't be resolved until we invoke p.resolve

p.resolve(42); // outputs 'The answer is 42'

```


### PromiseLite.all 


*PromiseLite.all* takes an *Array* of *PromiseLite* as argument and is resolved if and only if all such promises are fulfilled.


```
#!javascript

var p1 = new PromiseLite();
var p2 = new PromiseLite();
var p3 = new PromiseLite();

var pAll = new PromiseLite.all([p1, p2, p3]);

```



### PromiseLite.race


*PromiseLite.race* takes an Array of *PromiseLite* as argument, then

* if the first promise that is settled is fulfilled, the promise returned by *PromiseLite.race* is resolved

* if the first promise that is settled is rejected, the promise returned by *PromiseLite.race* is rejected


```
#!javascript

var p1 = new PromiseLite();
var p2 = new PromiseLite();
var p3 = new PromiseLite();

var pRace = new PromiseLite.race([p1, p2, p3]);

```


### PromiseLite.any



*PromiseLite.any* takes an Array of *PromiseLite* as argument, then

* if at least one of such promises is fulfilled, the promise returned by *PromiseLite.any* is resolved

* if all the promises are rejected, the promise returned by *PromiseLite.any* is rejected


```
#!javascript

var p1 = new PromiseLite();
var p2 = new PromiseLite();
var p3 = new PromiseLite();

var pAny = new PromiseLite.any([p1, p2, p3]);

```
