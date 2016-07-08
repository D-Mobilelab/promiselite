(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PromiseLite = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var PROMISE_STATUS = {
    0: 'pending',
    1: 'fulfilled',
    2: 'rejected'
};

var pass = function(arg){
    return arg;
};

var PrivatePromise = function(executor, nextProm){

    // executor called at the end of the definition of Promise
    if (typeof executor !== 'undefined' && typeof executor !== 'function'){
        throw new Error('PromiseLite :: executor must be a function, got ' + typeof executor);
    }
    
    var promiseInstance = this;
    var promiseStatusIndex = 0;
    var promiseValue;
    var promiseReason;
    var next = nextProm || [];

    var getValue = function(){
        return promiseValue;
    };

    var getReason = function(){
        return promiseReason;
    };
    this.isPending = function(){
        return promiseStatusIndex === 0;
    };
    this.isFulfilled = function(){
        return promiseStatusIndex === 1;
    };
    this.isRejected = function(){
        return promiseStatusIndex === 2;
    };
    this.isSettled = function(){
        return (promiseStatusIndex === 1) || (promiseStatusIndex === 2);
    };
    this.getStatus = function(){
        return PROMISE_STATUS[promiseStatusIndex];
    };

    var getDeferredPromises = function(){
        var toReturn = next.slice(1, next.length);
        next.shift();
        return toReturn;
    };

    var immediatelyFulfill = function(success, error){       

        if (typeof success === 'undefined'){
            success = pass;
        }

        if (typeof error === 'undefined'){
            error = pass;
        }

        var deferred = getDeferredPromises();

        return new PrivatePromise(function(res, rej){
            try {
                res(success(getValue()));
            } catch (err){
                // if we're trying to pass the error to the next node of the chain
                // but the next node of the chain is undefined
                // throw error, otherwise pass it forward through the chain
                if (error === pass && deferred.length === 0){
                    throw err;
                } else {
                    rej(error(err));
                }
            }
        }, deferred);

    };

    var immediatelyReject = function(error){
        if (typeof error === 'undefined'){
            error = pass;
        }

        var deferred = getDeferredPromises(); 

        return new PrivatePromise(function(res, rej){
            try {
                if (error === pass && deferred.length === 0){
                    throw getReason();
                } else {
                    rej(error(getReason()));
                }
            } catch (err){

                if (deferred.length === 0){
                    throw err;
                } else {
                    rej(pass(err));
                }
            }
        }, deferred);
        
    };
    this.resolve = function(value){
        if (promiseInstance.isSettled()){
            return promiseInstance;
        }

        promiseStatusIndex = 1;
        promiseValue = value;

        if (next.length > 0){
            var toDo = next[0];
            if (toDo.onSuccess === toDo.onError){
                toDo.onError = pass;
            }
            return immediatelyFulfill(toDo.onSuccess, toDo.onError);   
        }
    };
    this.reject = function(reason){
        if (promiseInstance.isRejected()){
            return promiseInstance;
        }

        promiseStatusIndex = 2;
        promiseReason = reason;

        if (next.length > 0){
            var toDo = next[0];
            return immediatelyReject(toDo.onError);
        }
    };

    var addNext = function(onSuccess, onError){

        next.push({
            onSuccess: onSuccess,
            onError: onError
        });
    };
    this.then = function(onSuccess, onError){

        if (promiseInstance.isPending()){
            addNext(onSuccess, onError);
            return promiseInstance;
        }

        if (promiseInstance.isFulfilled() && !!onSuccess){
            return immediatelyFulfill(onSuccess, onError);
        }

        if (promiseInstance.isRejected() && !!onError){
            return immediatelyReject(onError);
        }
    };
    this.fail = function(onError){
        return promiseInstance.then(undefined, onError);
    };
    this.force = function(callback){
        return promiseInstance.then(callback, callback);
    };

    if (typeof executor === 'function'){
        executor(promiseInstance.resolve, promiseInstance.reject);
    }

};
var PublicPromise = function(executor){
    return new PrivatePromise(executor, undefined);
};
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

        if (counted === promiseCount){
            promiseAll.resolve(results);
        }
    };
    
    var promise;

    var innerFunction = function(num, prom){
        prom.then(function(value){
            fulfilled[num] = true;
            results[num] = value;
            checkAllFulfilled();
        }).fail(function(reason){
            fulfilled[num] = false;
            reasons[num] = reason;
            checkAllFulfilled();
        });
    };
    
    for (var i = 0; i < promiseList.length; i++){
        promise = promiseList[i];
        innerFunction(i, promise);
    }

    return promiseAll;
};
PublicPromise.race = function(promiseList){
    var promiseRace = new PublicPromise();
    var promiseCount = promiseList.length;
    var results = new Array(promiseCount);
    var reasons = new Array(promiseCount);
    
    var promise;
    var innerFunction = function(num, prom){
        prom.then(function(value){
            results[num] = value;
            promiseRace.resolve(results);
        }).fail(function(reason){
            reasons[num] = reason;
            promiseRace.reject(reasons);
        });
    };
    
    for (var i = 0; i < promiseList.length; i++){
        promise = promiseList[i];
        innerFunction(i, promise);
    }

    return promiseRace;
};
PublicPromise.any = function(promiseList){
    var promiseAny = new PublicPromise();
    var promiseCount = promiseList.length;

    var rejected = new Array(promiseCount);
    var reasons = new Array(promiseCount);
    var values = new Array(promiseCount);

    var allRejected = function(){
        for (var j = 0; j < promiseCount; j++){
            if (!rejected[j]){
                return false;
            }
        }
        return true;
    };

    var promise;
    var innerFunction = function(num, prom){
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
    };

    for (var i = 0; i < promiseList.length; i++){
        promise = promiseList[i];
        innerFunction(i, promise);
    }

    return promiseAny;
};

module.exports = PublicPromise;
},{}]},{},[1])(1)
});