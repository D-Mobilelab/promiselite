(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PromiseLite = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(){

    var PrivatePromise = function(executor, nextProm){

        // executor called at the end of the definition of Promise
        if (typeof executor !== 'undefined' && typeof executor !== 'function'){
            throw 'PromiseLite :: executor must be a function, got ' + typeof executor;
        }
        
        var promiseInstance = this;
        var promiseStatusIndex = 0;
        var promiseValue;
        var promiseReason;
        var next, lastNext;

        if (nextProm){
            next = nextProm;
        }

        var promiseStatus = {
            0: 'pending',
            1: 'fulfilled',
            2: 'rejected'
        }

        var NOOP = function(){};
        var PASS = function(arg){
            return arg;
        }

        var getValue = function(){
            return promiseValue;
        }

        var getReason = function(){
            return promiseReason;
        }

        this.isPending = function(){
            return promiseStatusIndex === 0;
        }

        this.isFulfilled = function(){
            return promiseStatusIndex === 1;
        }

        this.isRejected = function(){
            return promiseStatusIndex === 2;
        }

        this.isSettled = function(){
            return (promiseStatusIndex === 1) || (promiseStatusIndex === 2);
        }

        this.getStatus = function(){
            return promiseStatus[promiseStatusIndex];
        }

        var immediatelyFulfill = function(success, error, next, _getValue){

            if (typeof _getValue === 'undefined'){
                _getValue = getValue;
            }

            if (typeof success === 'undefined'){
                success = NOOP;
            }
            if (typeof error === 'undefined'){
                error = PASS;
            }

            return new PrivatePromise(function(res, rej){
                try {
                    res(success(_getValue()));
                } catch (err){
                    // if we're trying to pass the error to the next node of the chain
                    // but the next node of the chain is undefined
                    // throw error, otherwise pass it forward through the chain
                    if (error == PASS && typeof next === 'undefined'){
                        throw err;
                    } else {
                        rej(error(err));   
                    }
                }
            }, next);

        }

        var immediatelyReject = function(error, next, _getReason){

            if (typeof _getReason === 'undefined'){
                _getReason = getReason;
            }

            if (typeof error === 'undefined'){
                error = PASS;
            }

            return new PrivatePromise(function(res, rej){ 
                rej(error(_getReason()));
            }, next);
            
        }

        this.resolve = function(value){
            if (promiseStatusIndex === 1){
                return;
            }
            promiseStatusIndex = 1;
            promiseValue = value;

            if (next){
                immediatelyFulfill(next.onSuccess, next.onError, next.next)
            }
        }

        this.reject = function(reason){
            if (promiseStatusIndex === 2){
                return;
            }
            promiseStatusIndex = 2;
            promiseReason = reason;

            if (next){
                immediatelyReject(next.onError, next.next)
            }
        }

        var setNext = function(onSuccess, onError){

            if (typeof onError === 'undefined'){
                onError = PASS;
            }

            var createNext = function(){
                return {
                    next: undefined,
                    onSuccess: onSuccess,
                    onError: onError
                }
            }

            if (typeof next === 'undefined'){
                next = createNext();
            } else {
                lastNext = next;        
                while (typeof lastNext.next !== 'undefined'){
                    lastNext = lastNext.next;
                }
                lastNext.next = createNext();
            }
        }

        this.then = function(onSuccess, onError){
            if (promiseInstance.isPending()){
                setNext(onSuccess, onError);
                return promiseInstance;
            }

            if (promiseInstance.isFulfilled()){
                return immediatelyFulfill(onSuccess, onError);
            }

            if (promiseInstance.isRejected()){
                return immediatelyReject(onError);
            }
        }

        this.fail = function(onError){
            return promiseInstance.then(undefined, onError);
        }

        if (typeof executor === 'function'){
            executor(promiseInstance.resolve, promiseInstance.reject);
        }
    
    }
    
    var PublicPromise = function(executor){
        return new PrivatePromise(executor);
    }
 
    module.exports = PublicPromise;

})();


},{}]},{},[1])(1)
});