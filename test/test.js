var expect = function(condition, description){
    if (condition){
        console.info(description);
    } else {
        console.error(description);
    }
}

/*
var p = new BarneyPromise(function(resolve, reject){
    resolve(47);
});

expect(p.getValue() === 47, 'basic resolve works');


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


var pAsync1 = new BarneyPromise(function(resolve, reject){
    setTimeout(function(){
        reject('errorTest');
    }, 100);
}).then(function(obj){
    expect(true == false, 'should never enter here');
}, function(reason){
    expect(reason === 'errorTest', 'catch after reject ok');
});
*/

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
        expect(pAsync.isRejected(), 'promise is rejected ');
        expect(reason === 'errorTest1', 'fail after chain ok');
    });
