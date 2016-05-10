var BarneyPromise = function(executor, nextProm){

    // executor called at the end of the definition of Promise
    if (typeof executor !== 'undefined' && typeof executor !== 'function'){
        throw 'BarneyPromise :: executor must be a function, got ' + typeof executor;
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

    this.printNext = function(){

        var printNode = function(node){
            if (typeof node === 'undefined'){
                return undefined
            }
            return {
                next: printNode(node.next),
                onSuccess: node.onSuccess && node.onSuccess.toString(),
                onError: node.onError && node.onError.toString(),
            }
        }

        return printNode(next);
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

        var nextToAdd = (typeof next === 'undefined') ? undefined : next;

        return new BarneyPromise(function(res, rej){
            try {
                res(success(_getValue()));
            } catch (err){
                rej(error(err));
            }
        }, nextToAdd);

    }

    var immediatelyReject = function(error, next, _getReason){

        if (typeof _getReason === 'undefined'){
            _getReason = getReason;
        }

        if (typeof error === 'undefined'){
            error = PASS;
        }

        var nextToAdd = (typeof next === 'undefined') ? undefined : next;

        return new BarneyPromise(function(res, rej){ 
            rej(error(_getReason()));
        }, nextToAdd);
        
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

if (typeof module === 'object' && module.exports) {
    module.exports = BarneyPromise;
} else {
    window.BarneyPromise = BarneyPromise;
}