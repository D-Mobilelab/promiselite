(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PromiseLite = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var PROMISE_STATUS = {
    0: 'pending',
    1: 'fulfilled',
    2: 'rejected'
}

var PASS = function(arg){
    return arg;
}

var PrivatePromise = function(executor, nextProm){

    // executor called at the end of the definition of Promise
    if (typeof executor !== 'undefined' && typeof executor !== 'function'){
        throw 'PromiseLite :: executor must be a function, got ' + typeof executor;
    }
    
    var promiseInstance = this;
    var promiseStatusIndex = 0;
    var promiseValue;
    var promiseReason;
    var next = nextProm || [];

    var getValue = function(){
        return promiseValue;
    }

    var getReason = function(){
        return promiseReason;
    }

    /**
    * Returns whether the current PromiseLite instance is in a "pending" state
    * @function isPending
    * @memberof PromiseLite#
    */
    this.isPending = function(){
        return promiseStatusIndex === 0;
    }

    /**
    * Returns whether the current PromiseLite instance is in a "fulfilled" state
    * @function isFulfilled
    * @memberof PromiseLite#
    */
    this.isFulfilled = function(){
        return promiseStatusIndex === 1;
    }

    /**
    * Returns whether the current PromiseLite instance is in a "rejected" state
    * @function isRejected
    * @memberof PromiseLite#
    */
    this.isRejected = function(){
        return promiseStatusIndex === 2;
    }

    /**
    * Returns whether the current PromiseLite instance is in a "settled" state (fulfilled or rejected)
    * @function isSettled
    * @memberof PromiseLite#
    */
    this.isSettled = function(){
        return (promiseStatusIndex === 1) || (promiseStatusIndex === 2);
    }

    /**
    * Returns the state of the current PromiseLite instance as a string
    * @function getStatus
    * @memberof PromiseLite#
    */
    this.getStatus = function(){
        return PROMISE_STATUS[promiseStatusIndex];
    }

    var immediatelyFulfill = function(success, error){

        return new PrivatePromise(function(res, rej){
            try {
                res(success(getValue()));
            } catch (err){
                // if we're trying to pass the error to the next node of the chain
                // but the next node of the chain is undefined
                // throw error, otherwise pass it forward through the chain
                if (error == PASS && next.length == 0){
                    throw err;
                } else {
                    rej(error(err));   
                }
            }
        }, next);

    }

    var immediatelyReject = function(error){

        return new PrivatePromise(function(res, rej){
            try {
                rej(error(getReason()));
            } catch (err){
                if (next.length == 0){
                    throw err;
                } else {
                    rej(PASS(err));   
                }
            }
        }, next);
        
    }

    /**
    * Resolves the current PromiseLite instance
    * @function resolve
    * @memberof PromiseLite#
    * @param {any} value to which the current PromiseLite instance is resolved
    */
    this.resolve = function(value){
        if (promiseStatusIndex !== 0){
            return;
        }
        promiseStatusIndex = 1;
        promiseValue = value;

        if (next.length > 0){
            var toDo = next.shift();

            if (toDo.onSuccess === toDo.onError){
                toDo.onError = PASS;
            }
            return immediatelyFulfill(toDo.onSuccess, toDo.onError);   
        }
    }

    /**
    * Rejects the current PromiseLite instance
    * @function reject
    * @memberof PromiseLite#
    * @param {any} reason the reason of the rejection
    */
    this.reject = function(reason){
        if (promiseStatusIndex === 2){
            return;
        }
        promiseStatusIndex = 2;
        promiseReason = reason;

        if (next.length > 0){
            var toDo = next.shift();
            return immediatelyReject(toDo.onError);
        }
    }

    var addNext = function(onSuccess, onError){

        if (typeof onError === 'undefined'){
            onError = PASS;
        }

        if (typeof onSuccess === 'undefined'){
            onSuccess = PASS;
        }

        next.push({
            onSuccess: onSuccess,
            onError: onError
        });
    }

    /**
    * Adds a then block to the current PromiseLite instance
    * @function then
    * @memberof PromiseLite#
    * @param {function} onSuccess function that will be executed if the PromiseLite is resolved
    * @param {function} onError function that will be executed if the PromiseLite is rejected
    */
    this.then = function(onSuccess, onError){
        if (promiseInstance.isPending()){
            addNext(onSuccess, onError);
            return promiseInstance;
        }

        if (promiseInstance.isFulfilled()){
            return immediatelyFulfill(onSuccess, onError);
        }

        if (promiseInstance.isRejected()){
            return immediatelyReject(onError);
        }
    }

    /**
    * Adds a fail (catch) block to the current PromiseLite instance
    * @function fail
    * @memberof PromiseLite#
    * @param {function} onError function that will be executed if the PromiseLite is rejected
    */
    this.fail = function(onError){
        return promiseInstance.then(undefined, onError);
    }

    /**
    * Adds a force (finally) block to the current PromiseLite instance
    * @function force
    * @memberof PromiseLite#
    * @param {function} callback function that will be executed both if the PromiseLite is resolved or rejected
    */
    this.force = function(callback){
        return promiseInstance.then(callback, callback);
    }

    if (typeof executor === 'function'){
        executor(promiseInstance.resolve, promiseInstance.reject);
    }

}

/**
* PromiseLite public constructor
* @class PromiseLite
*/
var PublicPromise = function(executor){
    return new PrivatePromise(executor);
}

/**
* Returns a promise that takes an array of promises as argument and 
* is fulfilled if and only if all of these are fulfilled 
* @function all
* @memberof PromiseLite
* @param {Array} promiseList a list of PromiseLite instances
*/
PublicPromise.all = function(promiseList){
    var promiseAll = new PublicPromise();
    var promiseCount = promiseList.length;

    var results = new Array(promiseCount);
    var reasons = new Array(promiseCount);
    var fulfilled = new Array(promiseCount);

    var checkAllFulfilled = function(){
        var counted = 0;
        for (var key in fulfilled){
            counted++;
            if (!fulfilled[key]){
                promiseAll.reject(reasons);
                return;
            }
        }

        if (counted == promiseCount){
            promiseAll.resolve(results);
        }
    }
    
    var promise;
    
    for (var i=0; i<promiseList.length; i++){
        promise = promiseList[i];
        
        (function(num, prom){
            prom.then(function(value){
                fulfilled[num] = true;
                results[num] = value;
                checkAllFulfilled();
            }).fail(function(reason){
                fulfilled[num] = false;
                reasons[num] = reason;
                checkAllFulfilled();
            });
        })(i, promise);
    }

    return promiseAll;
}

/**
* Returns a promise that takes an array of promises as argument and 
* is fulfilled if and only if the first of them that is settled is fulfilled (rejected otherwise) 
* @function race
* @memberof PromiseLite
* @param {Array} promiseList a list of PromiseLite instances
*/
PublicPromise.race = function(promiseList){
    var promiseRace = new PublicPromise();
    var promiseCount = promiseList.length;
    var results = new Array(promiseCount);
    var reasons = new Array(promiseCount);
    
    var promise;
    for (var i=0; i<promiseList.length; i++){
        promise = promiseList[i];
        
        (function(num, prom){
            prom.then(function(value){
                results[num] = value;
                promiseRace.resolve(results);
            }).fail(function(reason){
                reasons[num] = reason;
                promiseRace.reject(reasons);
            });
        })(i, promise);
    }

    return promiseRace;
}

/**
* Returns a promise that takes an array of promises as argument and 
* is fulfilled if at least one of them is fulfilled (rejected otherwise)
* @function any
* @memberof PromiseLite
* @param {Array} promiseList a list of PromiseLite instances
*/
PublicPromise.any = function(promiseList){
    var promiseAny = new PublicPromise();
    var promiseCount = promiseList.length;

    var rejected = new Array(promiseCount);
    var reasons = new Array(promiseCount);
    var values = new Array(promiseCount);

    var allRejected = function(){
        for (var j=0; j<promiseCount; j++){
            if (!rejected[j]){
                return false;
            }
        }
        return true;
    }

    var promise;
    for (var i=0; i<promiseList.length; i++){
        promise = promiseList[i];
        
        (function(num, prom){
            prom.then(function(value){
                values[num] = value;
                promiseAny.resolve(values);
            }).fail(function(reason){
                rejected[num] = true;
                reasons[num] = reason;

                if (allRejected()){
                    promiseAny.reject(reasons);
                }
            });
        })(i, promise);
    }

    return promiseAny;
}

module.exports = PublicPromise;


},{}]},{},[1])(1)
});