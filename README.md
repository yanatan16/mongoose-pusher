# mongoose-pusher [![Build Status](https://travis-ci.org/yanatan16/mongoose-pusher.png)](https://travis-ci.org/yanatan16/mongoose-pusher)

Mongoose plugin to allow "pusher" and "puller" functions which acts like setters for arrays.

## Install

```
npm install mongoose-pusher --save
```

## Usage

```javascript
var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , pusherPlugin = require('mongoose-pusher');

var SomeSchema = new Schema({
  someArrayField: {
    type: [String], // can be any type
    push: function (val) { return modify(val); }
    pull: function (val) { this.notifyValueBeingPulled(val); }
  }
});

SomeSchema.plugin(pusherPlugin);

SomeSchmea.methods.notifyValueBeingPulled = function (val) {
  /*...*/
};

var SomeModel = mongoose.model('SomeModel', SomeSchema);

// These functions call the setter, which is custom from the plugin
var someObject = new SomeModel({
  someArrayField: ['a', 'b', 'c'] // called through modified setter
});
someObject.set('someArrayField', ['c', 'b', 'a']);

// These functions are modified to call the pusher
someObject.someArrayField.push('x', 'y', 'z');
someObject.someArrayField.nonAtomicPush('i', 'j', 'k');
someObject.someArrayField.unshift('xx', 'yy');

// These call pusher and puller (if necessary)
someObject.someArrayField.splice(1, 4, 'zj1', 'fix')
someObject.someArrayField.set(8, 'foo');

// These call the puller
someObject.someArrayField.pull('foo', 'bar');
someObject.someArrayField.pop();
someObject.someArrayField.$pop();
someObject.someArrayField.shift();
someObject.someArrayField.$shift();
```

## Notes

- `push` and `pull` are called for each element of the array and are never called with more than one element (no need to slice arguments).
- `push` is called for each element to be added to the array whenever the array is constructed with elements or one of `push`, `nonAtomicPush`, `set`, `addToSet`, `splice`, and `unshift` functions are called.
    - `addToSet` will call `push` for all elements regardless of whether its already in the set.
- `pull` is called for each element removed from the array whenever one of `pull`, `pop`, `$pop`, `shift`, `$shift`, `set`, or `splice` are called.
    - `pull`, like `addToSet`, might call the puller for elements that aren't in the set.
- `push` and `pull`, like `set`, are called with the context of the parent document.
- `push` or `pull` are not mutually required or exclusive, that is they do not have to both be specified, but they can be.
- Use of `push` will override the setter on the field, so if you put a setter in, `push` will not be called upon construction.

## Tests

```
npm install -g nodeunit
nodeunit tests
```

## License

MIT found in LICENSE file.