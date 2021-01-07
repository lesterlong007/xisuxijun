/**
 * Created by Lester on 2021/1/7
 */

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function PromiseLester(executor) {
    const that = this;
    that.status = PENDING;
    that.value = null;
    that.reason = null;
    that.resolveCallbacks = [];
    that.rejectCallbacks = [];

    function resolve(value) {
        setTimeout(() => {
            if (that.status === PENDING) {
                that.status = FULFILLED;
                that.value = value;
                that.resolveCallbacks.forEach(fn => fn());
            }
        }, 0)
    }

    function reject(reason) {
        setTimeout(() => {
            if (that.status === PENDING) {
                that.status = REJECTED;
                that.reason = reason;
                that.rejectCallbacks.forEach(fn => fn());
            }
        }, 0);
    }

    try {
        executor(resolve, reject);
    } catch (e) {
        reject(e);
    }
}

PromiseLester.prototype.then = function (onFulfilled, onRejected) {
    const that = this;
    onFulfilled = Object.prototype.toString.call(onFulfilled) === '[object Function]' ? onFulfilled : value => value;

    return new PromiseLester((resolve, reject) => {
       if (that.status === PENDING) {
            that.resolveCallbacks.push(() => {
                setTimeout(() => {
                    try {
                        const nextValue = onFulfilled(that.value);
                        resolve(nextValue);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            });
            that.rejectCallbacks.push(() => {
                setTimeout(() => {
                    try {
                        if ( Object.prototype.toString.call(onRejected) === '[object Function]' ) {
                            const nextValue = onRejected(that.reason);
                            resolve(nextValue);
                        } else {
                            reject(this.reason);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            });
       }
    });
};

PromiseLester.prototype.catch = function (rejection) {
    return this.then(null, rejection);
};

PromiseLester.prototype.finally = function (fn) {
    fn = Object.prototype.toString.call(fn) === '[object Function]' ? fn : () => {};
    return this.then( value => {
        fn();
        return value
    }, reason => {
        fn();
        return reason;
    });
};

PromiseLester.resolve = function (value) {
    if (value instanceof PromiseLester) {
        return value;
    }
    return new PromiseLester((resolve, reject) => {
        // thenable对象指的是具有then方法的对象 返回的promise会“跟随”这个thenable的对象，采用它的最终状态
        if (value && Object.prototype.toString.call(value.then) === '[object Function]' ) {
            setTimeout(() => {
                value.then(resolve, reject);
            }, 0)
        } else {
            resolve(value);
        }
    })
};

PromiseLester.prototype.all = function (promises) {
    const that = this;
    return new PromiseLester(() => {
        try {
            const args = Array.prototype.slice.call(promises);
            if (args.length === 0) {
                return PromiseLester.resolve([]);
            }
            
        } catch (e) {

        }
    })
};

const myPromise = new PromiseLester((resolve, reject) => {
    setTimeout(() => {
        // resolve('go!');
        reject('error')
    }, 1000)
}).then(res => {
    console.log('lester 1-1', res);
    return 'res 123'
}, err => {
    console.log('error 1-1', err);
    return 'err 1'
}).catch(err => {
    console.log('catch', err)
    return err;
}).finally(() => {
    console.log('finally')
}).then(res => {
    console.log('lester 1-2', res);
    return 'res 2'
}, err => {
    console.log('error 1-2', err);
}).then(res => {
    console.log('lester 1-3', res)
});


/*const thePromise = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject({
            data: 'go'
        });
    }, 1000)
}).then(res => {
    console.log('2-1', res)
    return 1;
}, err => {
    console.log('err 2-1', err)
    return 2;
}).catch(err => {
    console.log('catch' ,err)
}).finally((res, err) => {

    console.log('finally', res, err)
    return 3;
}).then(res => {
    console.log('2-2', res)
    return 1;
}, err => {
    console.log('err 2-2', err)
    return 2;
})*/

// console.log(myPromise);