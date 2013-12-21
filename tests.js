// pusher tests
// use nodeunit (npm install -g nodeunit && nodeunit tests)

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , pusherPlugin = require('./index')

function createSchema(name, pusher, puller) {
  var schema = new Schema({
    array: { type: [Number], push: pusher, pull: puller }
  });
  schema.plugin(pusherPlugin);
  return mongoose.model(name, schema);
}

process.on('uncaughtException', function (err) {
  console.log(err.stack);
});

var tests = module.exports = {};

tests['push'] = function (test) {
  var pusherCalled = []
    , PushTest = createSchema('PushTest', pusher)
    , object = new PushTest();

  object.array.push(1, 2, 3);
  object.array.push(5);

  test.deepEqual([].slice.call(object.array), [1,2,3,5]);
  test.deepEqual(pusherCalled, [1,2,3,5]);
  test.done();

  function pusher (v) {
    pusherCalled.push(v);
    return v;
  }
};

tests['splice'] = function (test) {
  var pusherCalled = []
    , pullerCalled = []
    , SpliceTest = createSchema('SpliceTest', pusher, puller)
    , object = new SpliceTest();

  object.array.push(1, 2, 3);
  object.array.splice(0, 1, 5, 6);

  test.deepEqual([].slice.call(object.array), [5,6,2,3]);
  test.deepEqual(pusherCalled, [1,2,3,5,6]);
  test.deepEqual(pullerCalled, [1]);
  test.done();

  function pusher (v) {
    pusherCalled.push(v);
    return v;
  }

  function puller (v) {
    pullerCalled.push(v);
    return v;
  }
};

tests['unshift'] = function (test) {
  var pusherCalled = []
    , UnshiftTest = createSchema('UnshiftTest', pusher)
    , object = new UnshiftTest();

  object.array.push(1, 2, 3);
  object.array.unshift(5, 6);

  test.deepEqual([].slice.call(object.array), [5,6,1,2,3]);
  test.deepEqual(pusherCalled, [1,2,3,5,6]);
  test.done();

  function pusher (v) {
    pusherCalled.push(v);
    return v;
  }
};

tests['addToSet'] = function (test) {
  var pusherCalled = []
    , AddToSetTest = createSchema('AddToSetTest', pusher)
    , object = new AddToSetTest();

  object.array.push(1, 2, 3);
  object.array.addToSet(1, 5, 6);

  test.deepEqual([].slice.call(object.array), [1,2,3,5,6]);
  test.deepEqual(pusherCalled, [1,2,3,1,5,6]);
  test.done();

  function pusher (v) {
    pusherCalled.push(v);
    return v;
  }
};

tests['set'] = function (test) {
  var pusherCalled = []
    , pullerCalled = []
    , SetTest = createSchema('SetTest', pusher, puller)
    , object = new SetTest();

  object.array.push(1, 2, 3);
  object.array.set(1, 5);

  test.deepEqual([].slice.call(object.array), [1,5,3]);
  test.deepEqual(pusherCalled, [1,2,3,5]);
  test.deepEqual(pullerCalled, [2]);
  test.done();

  function pusher (v) {
    pusherCalled.push(v);
    return v;
  }

  function puller (v) {
    pullerCalled.push(v);
    return v;
  }
};

tests['pop'] = function (test) {
  var pullerCalled = []
    , PopTest = createSchema('PopTest', null, puller)
    , object = new PopTest();

  object.array.push(1, 2, 3);
  test.equal(object.array.pop(), 3);
  test.equal(object.array.pop(), 2);

  test.deepEqual([].slice.call(object.array), [1]);
  test.deepEqual(pullerCalled, [3, 2]);
  test.done();

  function puller (v) {
    pullerCalled.push(v);
    return v;
  }
};

tests['$pop'] = function (test) {
  var pullerCalled = []
    , $PopTest = createSchema('$PopTest', null, puller)
    , object = new $PopTest();

  object.array.push(1, 2, 3);
  test.equal(object.array.$pop(), 3);

  test.deepEqual([].slice.call(object.array), [1,2]);
  test.deepEqual(pullerCalled, [3]);
  test.done();

  function puller (v) {
    pullerCalled.push(v);
    return v;
  }
};

tests['shift'] = function (test) {
  var pullerCalled = []
    , ShiftTest = createSchema('ShiftTest', null, puller)
    , object = new ShiftTest();

  object.array.push(1, 2, 3);
  test.equal(object.array.shift(), 1);
  test.equal(object.array.shift(), 2);

  test.deepEqual([].slice.call(object.array), [3]);
  test.deepEqual(pullerCalled, [1, 2]);
  test.done();

  function puller (v) {
    pullerCalled.push(v);
    return v;
  }
};

tests['$shift'] = function (test) {
  var pullerCalled = []
    , $ShiftTest = createSchema('$ShiftTest', null, puller)
    , object = new $ShiftTest();

  object.array.push(1, 2, 3);
  test.equal(object.array.$shift(), 1);

  test.deepEqual([].slice.call(object.array), [2,3]);
  test.deepEqual(pullerCalled, [1]);
  test.done();

  function puller (v) {
    pullerCalled.push(v);
    return v;
  }
};

tests['pull'] = function (test) {
  var pullerCalled = []
    , PullTest = createSchema('PullTest', null, puller)
    , object = new PullTest();

  object.array.push(1, 2, 3);
  object.array.pull(4, "3");

  test.deepEqual([].slice.call(object.array), [1,2]);
  test.deepEqual(pullerCalled, [4,3]);
  test.done();

  function puller (v) {
    pullerCalled.push(v);
    return v;
  }
};