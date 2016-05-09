var promiseStatus = {
    0: 'pending',
    1: 'fulfilled',
    2: 'rejected'
}

var Promise = function(executor){

    // executor called at the end of the definition of Promise
    if (typeof executor !== 'undefined' && typeof executor !== 'function'){
        throw 'BarneyPromise :: executor must be a function, got ' + typeof executor;
    }
    
    var promiseInstance = this;
    var promiseStatusIndex = 0;
    var promiseValue;
    var promiseReason;
    var next;

    var NOOP = function(){};

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

    var immediatelyFulfill = function(success, error, next){

        if (typeof success === 'undefined'){
            success = NOOP;
        }
        if (typeof error === 'undefined'){
            error = NOOP;
        }

        var toReturn = new Promise(function(res, rej){
            try {
                res(success(promiseValue));
            } catch (err){
                rej(error(err));
            }
        });

        if (next){
            toReturn.then(next.onSuccess, next.onError, next.next);
        }

        return toReturn;

    }

    var immediatelyReject = function(error, next){

        if (typeof error === 'undefined'){
            error = NOOP;
        }

        var toReturn = new Promise(function(res, rej){ 
            rej(error(promiseReason));
        });

        if (next){
            toReturn.fail(next.onError, next.next);
        }

        return toReturn;

    }

    this.resolve = function(value){
        if (promiseStatusIndex === 1){
            return;
        }
        promiseStatusIndex = 1;
        promiseValue = value;

        if (next){
            try {
                immediatelyFulfill(next.onSuccess, next.onError, next.next);
            } catch (err){
                return promiseInstance.reject(err);
            }
        }
    }

    this.reject = function(reason){
        if (promiseStatusIndex === 2){
            return;
        }
        promiseStatusIndex = 2;
        promiseReason = reason;

        if (next){
            immediatelyReject(next.onSuccess, next.onError, next.next);
        }
    }

    var createNext = function(onSuccess, onError){
        var toReturn = {
            next: undefined,
            onSuccess: onSuccess,
            onError: onError,
        }
        toReturn.then = function(onSuc, onErr){
            toReturn.next = createNext(onSuc, onErr);
        }
        return toReturn;
    }

    this.then = function(onSuccess, onError){
        if (promiseInstance.isPending()){
            if (typeof next === 'undefined') { 
                next = createNext(onSuccess, onError);
                return promiseInstance;
            } else {
                next.then(onSuccess, onError);
                return promiseInstance;
            }
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
        try {
            executor(promiseInstance.resolve, promiseInstance.reject);
        } catch (err){
            promiseInstance.reject(err);
        }
    }
}