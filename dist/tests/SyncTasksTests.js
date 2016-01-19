/// <reference path="dependencies.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var assert = require('assert');
var SyncTasks = require('../SyncTasks');
describe('SyncTasks', function () {
    it('Simple - null resolve after then', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            assert.equal(val, null);
            done();
        }, function (err) {
            assert(false);
        });
        task.resolve(null);
    });
    it('Simple - null then after resolve', function (done) {
        var task = SyncTasks.Defer();
        task.resolve(null);
        task.promise().then(function (val) {
            assert.equal(val, null);
            done();
        }, function (err) {
            assert(false);
        });
    });
    it('Simple - reject', function (done) {
        var task = SyncTasks.Defer();
        task.reject(2);
        task.promise().then(function (val) {
            assert(false);
        }, function (err) {
            assert.equal(err, 2);
            done();
        });
    });
    it('Chain from success to success with value', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            assert.equal(val, 3);
            return 4;
        }, function (err) {
            assert(false);
            return null;
        }).then(function (val) {
            assert.equal(val, 4);
            done();
        }, function (err) {
            assert(false);
        });
        task.resolve(3);
    });
    it('Chain from fail to success with value', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            assert(false);
            return 3;
        }, function (err) {
            assert.equal(err, 2);
            return 4;
        }).then(function (val) {
            assert.equal(val, 4);
            done();
        }, function (err) {
            assert(false);
        });
        task.reject(2);
    });
    it('Chain from success to success with promise', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            assert.equal(val, 3);
            return SyncTasks.Defer().resolve(4);
        }, function (err) {
            assert(false);
            return null;
        }).then(function (val) {
            assert.equal(val, 4);
            done();
        }, function (err) {
            assert(false);
        });
        task.resolve(3);
    });
    it('Chain from fail to success with promise', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            assert(false);
            return null;
        }, function (err) {
            assert.equal(err, 3);
            return SyncTasks.Resolved(4);
        }).then(function (val) {
            assert.equal(val, 4);
            done();
        }, function (err) {
            assert(false);
        });
        task.reject(3);
    });
    it('Chain from success to fail with promise', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            assert.equal(val, 2);
            return SyncTasks.Rejected(4);
        }, function (err) {
            assert(false);
            return void 0;
        }).then(function (val) {
            assert(false);
        }, function (err) {
            assert.equal(err, 4);
            done();
        });
        task.resolve(2);
    });
    it('Chain from fail to fail with promise', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            assert(false);
            return void 0;
        }, function (err) {
            assert.equal(err, 2);
            return SyncTasks.Rejected(4);
        }).then(function (val) {
            assert(false);
        }, function (err) {
            assert.equal(err, 4);
            done();
        });
        task.reject(2);
    });
    it('Chain from success to promise to success with promise', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            assert.equal(val, 3);
            var itask = SyncTasks.Resolved(4);
            return itask.then(function (val2) {
                assert.equal(val2, 4, 'inner');
                return 5;
            });
        }, function (err) {
            assert(false);
            return null;
        }).then(function (val) {
            assert.equal(val, 5, 'outer');
            done();
        }, function (err) {
            assert(false);
        });
        task.resolve(3);
    });
    it('Exception in success to fail', function (done) {
        var task = SyncTasks.Defer();
        SyncTasks.config.exceptionsToConsole = false;
        task.promise().then(function (val) {
            var blah = null;
            blah.blowup();
            return void 0;
        }, function (err) {
            assert(false);
        }).then(function (val) {
            assert(false);
        }, function (err) {
            SyncTasks.config.exceptionsToConsole = true;
            done();
        });
        task.resolve(3);
    });
    it('Exception in fail to fail', function (done) {
        var task = SyncTasks.Defer();
        SyncTasks.config.exceptionsToConsole = false;
        task.promise().then(function (val) {
            assert(false);
        }, function (err) {
            var blah = null;
            blah.blowup();
            return void 0;
        }).then(function (val) {
            assert(false);
        }, function (err) {
            SyncTasks.config.exceptionsToConsole = true;
            done();
        });
        task.reject(3);
    });
    it('Finally basic', function (done) {
        var task = SyncTasks.Defer();
        task.promise().then(function (val) {
            return 4;
        }, function (err) {
            assert(false);
            return void 0;
        }).finally(function (val) {
            assert.equal(val, 4);
            return 2; // should be ignored
        }).then(function (val) {
            assert.equal(val, 4);
            done();
        }, function (err) {
            assert(false);
        });
        task.resolve(3);
    });
    it('Finally with success chaining', function (done) {
        var task = SyncTasks.Defer();
        var innerWorked = false;
        task.promise().then(function (val) {
            return 4;
        }, function (err) {
            assert(false);
            return void 0;
        }).finally(function (val) {
            assert.equal(val, 4);
            var newtask = SyncTasks.Defer();
            newtask.resolve(5); // should be ignored
            return newtask.promise().then(function (val2) {
                // this must run before the outer resolution
                innerWorked = true;
            });
        }).then(function (val) {
            assert(innerWorked);
            assert.equal(val, 4);
            done();
        }, function (err) {
            assert(false);
        });
        task.resolve(3);
    });
    it('Finally with failure chaining', function (done) {
        var task = SyncTasks.Defer();
        var innerWorked = false;
        task.promise().then(function (val) {
            assert(false);
            return void 0;
        }).finally(function (val) {
            assert.equal(val, 3);
            var newtask = SyncTasks.Defer();
            newtask.resolve(5); // should be ignored
            return newtask.promise().then(function (val2) {
                // this must run before the outer resolution
                innerWorked = true;
            });
        }).then(function (val) {
            assert(false);
        }, function (err) {
            assert(innerWorked);
            assert.equal(err, 3);
            done();
        });
        task.reject(3);
    });
    it('whenAll basic success', function (done) {
        var task = SyncTasks.Defer();
        var task2 = SyncTasks.Defer();
        var task3 = SyncTasks.Defer();
        var task4 = SyncTasks.Defer();
        SyncTasks.whenAll([task.promise(), task2.promise(), task3.promise(), task4.promise()]).then(function (rets) {
            assert.equal(rets.length, 4);
            assert.equal(rets[0], 1);
            assert.equal(rets[1], 2);
            assert.equal(rets[2], 3);
            assert.equal(rets[3], 4);
            done();
        }, function (err) {
            assert(false);
        });
        task.resolve(1);
        task2.resolve(2);
        task3.resolve(3);
        task4.resolve(4);
    });
    it('whenAll basic failure', function (done) {
        var task = SyncTasks.Defer();
        var task2 = SyncTasks.Defer();
        SyncTasks.whenAll([task.promise(), task2.promise()]).then(function (rets) {
            assert(false);
        }, function (err) {
            done();
        });
        task.resolve(1);
        task2.reject(2);
    });
    it('whenAll zero tasks', function (done) {
        SyncTasks.whenAll([]).then(function (rets) {
            done();
        }, function (err) {
            assert(false);
        });
    });
    it('whenAll single null task', function (done) {
        SyncTasks.whenAll([null]).then(function (rets) {
            done();
        }, function (err) {
            assert(false);
        });
    });
    it('whenAll tasks and nulls', function (done) {
        var task = SyncTasks.Defer();
        SyncTasks.whenAll([null, task.promise()]).then(function (rets) {
            done();
        }, function (err) {
            assert(false);
        });
        task.resolve(1);
    });
    it('extend SyncTasks Internal', function (done) {
        var ExtendedSyncTask = (function (_super) {
            __extends(ExtendedSyncTask, _super);
            function ExtendedSyncTask() {
                _super.apply(this, arguments);
            }
            ExtendedSyncTask.prototype.extendedResolved = function () {
                return _super.prototype.resolve.call(this, true);
            };
            ExtendedSyncTask.prototype.extendedFailed = function () {
                return _super.prototype.reject.call(this, false);
            };
            return ExtendedSyncTask;
        })(SyncTasks.Internal.SyncTask);
        var resolveTask = new ExtendedSyncTask();
        var failTask = new ExtendedSyncTask();
        var resolveDone = false;
        var failDone = false;
        resolveTask.promise().then(function () {
            assert(true);
            resolveDone = true;
        }, function () {
            assert(false);
        });
        failTask.promise().then(function () {
            assert(false);
        }, function () {
            assert(true);
            failDone = true;
        });
        SyncTasks.whenAll([failTask.promise(), resolveTask.promise()]).always(function () {
            assert(resolveDone);
            assert(failDone);
            done();
        });
        resolveTask.extendedResolved();
        failTask.extendedFailed();
    });
});
