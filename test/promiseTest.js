var PromiseLite = require('../src/promiselite');

describe('Promises without executor', function(){

	it('should be resolved manually', function(){
		var p = new PromiseLite();

		expect(p.isSettled()).toBe(false);

		p.resolve();

		expect(p.isSettled()).toBe(true);
	});

	it('should execute then-chains added before they\'re resolved', function(){
		var p = new PromiseLite();

		var thenValue = 42;

		p.then(function(value){
			return value + 1;
		}).then(function(value){
			thenValue = value + 1;
		});

		expect(thenValue).toBe(42);

		p.resolve(0);

		expect(thenValue).toBe(2);
	});

	it('should execute then-chains added after they\'re resolved', function(){
		var p = new PromiseLite();

		var thenValue = 42;

		expect(thenValue).toBe(42);

		p.resolve(0);

		p.then(function(value){
			return value + 1;
		}).then(function(value){
			return value + 1;
		}).then(function(value){
			thenValue = value + 1;
		});

		expect(thenValue).toBe(3);
	});

	it('should execute fail if then raises an error', function(){
		var p = new PromiseLite();
		
		var testReason;

		p.then(function(value){
			throw 'testError';
		}).fail(function(reason){
			testReason = reason;
		});

		expect(testReason).toBeUndefined();

		p.resolve();

		expect(testReason).toEqual('testError');
	});

	it('should throw an exception if then raises an error and there is no fail to catch it', function(){
		var p = new PromiseLite();
		
		var testError;

		p.then(function(value){
			throw 'testError';
		});

		try {
			p.resolve();
		} catch (err){
			testError = err;
		}

		expect(testError).toEqual('testError');
	});

	it('should throw an exception if fail raises an error and there is no other fail to catch it', function(){
		var p = new PromiseLite();
		
		var testError;

		p.fail(function(reason){
			throw 'testError';
		});

		try {
			p.reject();
		} catch (err){
			testError = err;
		}
		
		expect(testError).toEqual('testError');
	});

	/*it('should execute correctly then/fail-chains', function(){
		var p = new PromiseLite();
		
		var testError;

		p.then(function(value){
			expect(value).toEqual(1);
			return value + 1;
		}).fail(function(reason){
			expect(undefined).toBe(null); // this should not be executed
		}).then(function(value){
			expect(value).toEqual(2);
			throw 'testError';
		}).then(function(value){
			expect(true).toBe(false); // this should not be executed
		}).fail(function(reason){
			expect(reason).toEqual('testError');
		});

		p.resolve(1);
		
		expect(testError).toEqual('testError');
	});*/

});

describe('Promises with executor', function(){

	it('should be resolved automatically if resolve is invoked in the executor', function(){
		var p = new PromiseLite(function(resolve, reject){
			resolve();
		});

		expect(p.isFulfilled()).toBe(true);
	});

	it('should be rejected automatically if reject is invoked in the executor', function(){
		var p = new PromiseLite(function(resolve, reject){
			reject();
		});

		expect(p.isRejected()).toBe(true);
	});

	it('should throw an exception if the executor raises an error and there is no  fail to catch it', function(){
		
		var testError;

		try {
			var p = new PromiseLite(function(resolve, reject){
				throw 'testError';
			});
		} catch (err){
			testError = err;
		}
		
		expect(testError).toEqual('testError');
	});
});