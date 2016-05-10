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

    this.getValue = function(){
        return promiseValue;
    }

    this.getReason = function(){
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

    var immediatelyFulfill = function(success, error, next, getValue){

        if (typeof getValue === 'undefined'){
            getValue = promiseInstance.getValue;
        }

        if (typeof success === 'undefined'){
            success = NOOP;
        }
        if (typeof error === 'undefined'){
            error = NOOP;
        }

        return (function(){
            return new Promise(function(res, rej){
                try {
                    res(success(getValue()));
                } catch (err){
                    rej(error(err));
                }
            });

            if (next){
                toReturn.then(next.onSuccess, next.onError, next.next, next.getValue);
            }
        })();

    }

    var immediatelyReject = function(error, next, getReason){

        if (typeof getReason === 'undefined'){
            getReason = promiseInstance.getReason;
        }

        if (typeof error === 'undefined'){
            error = NOOP;
        }

        return (function(){
            return new Promise(function(res, rej){ 
                rej(error(getReason()));
            });

            if (next){
                toReturn.fail(next.onError, next.next, next.getReason);
            }
        })();
    }

    this.resolve = function(value){
        if (promiseStatusIndex === 1){
            return;
        }
        promiseStatusIndex = 1;
        promiseValue = value;

        if (next){
            try {
                immediatelyFulfill(next.onSuccess, next.onError, next.next, next.getValue);
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
            immediatelyReject(next.onError, next.next, next.getReason);
        }
    }

    var setNext = function(next, onSuccess, onError){
        while (typeof next !== 'undefined'){
            next = next.next;
        }

        next = {
            next: undefined,
            onSuccess: onSuccess,
            onError: onError,
            getValue: promiseInstance.getValue,
            getReason: promiseInstance.getReason
        }
    }

    this.then = function(onSuccess, onError){
        if (promiseInstance.isPending()){
            setNext(next, onSuccess, onError);
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
        try {
            executor(promiseInstance.resolve, promiseInstance.reject);
        } catch (err){
            promiseInstance.reject(err);
        }
    }
}