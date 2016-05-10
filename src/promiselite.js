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

    PublicPromise.all = function(promiseList){
        var promiseAll = new Promise();
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
                }
            }

            if (counted == promiseCount){
                promiseAll.resolve(values);
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

    }

    PublicPromise.race = function(promiseList){
        var promiseRace = new Promise();
        
        var promise;
        for (var i=0; i<promiseList.length; i++){
            promise = promiseList[i];
            
            (function(num, prom){
                prom.then(function(value){
                    promiseRace.resolve(value);
                }).fail(function(reason){
                    promiseRace.reject(reason);
                });
            })(i, promise);
        }

    }

    PublicPromise.any = function(promiseList){
        var promiseAny = new Promise();
        var promiseCount = promiseList.length;

        var rejected = new Array(promiseCount);
        var reasons = new Array(promiseCount);

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
                    promiseAny.resolve(value);
                }).fail(function(reason){
                    rejected[num] = true;
                    reasons[num] = reason;

                    if (allRejected()){
                        promiseAny.reject(reasons);
                    }
                });
            })(i, promise);
        }

    }

 
    module.exports = PublicPromise;

})();

