var expect = function(condition, description){
    if (condition){
        console.info(description);
    } else {
        console.error(description);
    }
}

var it = function(description, func){
    func();
}

var xit = function(description, func){
    // statte xit
    console.log('[IGNORED] - ' + description)
}

it('synchronously resolved promises work', function(){

    var p = new BarneyPromise(function(resolve, reject){
        resolve(47);
    });

    var passedValue;
    p.then(function(data){
        passedValue = data;
    });

    expect(passedValue == 47, 'then passes the value of the promise after resolve');

    var thenConcatValue;

    var thenPromise = p.then(function(data){
        return data + 1;
    }).then(function(data){
        thenConcatValue = data + 1;
    });

    expect(thenConcatValue == 49, 'concatenated then correctly pass data after resolve');
});


it('should catch exceptions in then', function(){

    var pAsync = new BarneyPromise(function(resolve, reject){
        setTimeout(function(){
            resolve({test: 666});
        }, 10);
    }).then(function(obj){
        expect(obj.test === 666, 'async then are managed correctly');
        throw 'testError';
    }, function(reason){
        expect(reason === 'testError', 'catch after then ok');
    });

});

it('should catch errors after reject in executor', function(){
    var pAsync1 = new BarneyPromise(function(resolve, reject){
        setTimeout(function(){
            reject('errorTest');
        }, 100);
    }).then(function(obj){
        expect(true == false, 'should never enter here');
    }, function(reason){
        expect(reason === 'errorTest', 'catch after reject ok');
    });
});

it('should handle chains of catches correctly', function(){

    var pAsync2 = new BarneyPromise(function(resolve, reject){
        setTimeout(function(){
            reject('errorTest');
        }, 100);
    })
    .then(function(obj){
        expect(true == false, 'should never enter here');
    }, function(reason){
        expect(reason === 'errorTest', 'catch (as second argument of then) after reject ok');
        return reason + '1';
    })
    .then(function(obj){
        expect(true == false, 'should never enter here');
    })
    .fail(function(reason){
        expect(pAsync2.isRejected(), 'promise is rejected ');
        expect(reason === 'errorTest1', 'fail after chain ok');
    });

});

it('should not fail if an exception is thrown before the last catch', function(){
    var pAsync3 = new BarneyPromise(function(resolve, reject){
        setTimeout(function(){
            resolve(0);
        }, 100);
    })
    .then(function(num){
        throw 'testThrow';
    }, function(reason){
        expect(reason === 'testThrow', 'catch (as second argument of then) after throw in then');
        return reason + 'Catched';
    })
    .then(function(obj){
        expect(true == false, 'should never enter here');
    })
    .fail(function(reason){
        console.log(reason);
        expect(reason === 'testThrowCatched', 'fail after chain ok');
    });

});

it('should raise exception if there are no catches', function(){
    var pAsync4 = new BarneyPromise(function(resolve, reject){
        setTimeout(function(){
            resolve(0);
        }, 100);
    })
    .then(function(num){
        throw 'throwTest';
    })
    .fail(function(reason){
        console.log(reason);
    });

});
