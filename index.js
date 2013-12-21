// mongoose-pusher/index.js
// Allow a pusher which is like a setter but for .push

// vendor
var mongoose = require('mongoose')

// --------- Modify the push function on an array to call a pusher

var slice = Array.prototype.slice
  , map = Array.prototype.map
  , MongooseArray = mongoose.Types.Array
  , MongooseSchemaArray = mongoose.Schema.Types.Array
  , mgpush = MongooseArray.prototype.push
  , mgnonAtomicPush = MongooseArray.prototype.nonAtomicPush
  , mgsplice = MongooseArray.prototype.splice
  , mgunshift = MongooseArray.prototype.unshift
  , mgaddToSet = MongooseArray.prototype.addToSet
  , mgset = MongooseArray.prototype.set
  , mgpull = MongooseArray.prototype.pull
  , mgpop = MongooseArray.prototype.pop
  , mg$pop = MongooseArray.prototype.$pop
  , mgshift = MongooseArray.prototype.shift
  , mg$shift = MongooseArray.prototype.$shift;

function identity (x) {
  return x;
}

function wrapFunctions(arr, pusher, puller) {
  var bpusher = (pusher || identity).bind(arr._parent)
    , bpuller = (puller || identity).bind(arr._parent);

  arr.push = function () {
    return mgpush.apply(arr, map.call(arguments, bpusher));
  };

  arr.nonAtomicPush = function () {
    return mgnonAtomicPush.apply(arr, map.call(arguments, bpusher));
  }

  arr.unshift = function () {
    return mgunshift.apply(arr, map.call(arguments, bpusher));
  };

  // Note that addToSet may call pusher for elements that don't end up being added.
  arr.addToSet = function () {
    return mgaddToSet.apply(arr, map.call(arguments, bpusher));
  };

  arr.splice = function () {
    var arg12 = slice.call(arguments, 0, 2)
      , argrest = slice.call(arguments, 2);
    slice.apply(arr, arg12).forEach(bpuller); // These elements are being pulled
    return mgsplice.apply(arr, arg12.concat(argrest.map(bpusher)));
  };

  arr.set = function (i, v) {
    bpuller(arr[i]); // pulled element
    return mgset.call(arr, i, bpusher(v));
  };

  // Puller could be called on elements that arent in the set
  arr.pull = function () {
    map.call(arguments, function (v) {
      return bpuller(arr._cast(v));
    });
    // Call pull without mapping the arguments, puller isn't supposed to be used that way
    return mgpull.apply(arr, arguments);
  };

  arr.pop = function () {
    return bpuller(mgpop.call(arr));
  };

  arr.$pop = function () {
    return bpuller(mg$pop.call(arr));
  };

  arr.shift = function () {
    return bpuller(mgshift.call(arr));
  };

  arr.$shift = function () {
    return bpuller(mg$shift.call(arr));
  };
}

// ---- Now build the plugin that modifies the push function for all desired paths

function pusherPlugin(schema) {
  // Iterate through each path, searching for {type: [Type], push: function(){} }
  schema.eachPath(function (path, schemaType) {

    if (schemaType instanceof mongoose.Schema.Types.Array &&
        (typeof schemaType.options.push === 'function' ||
          typeof schemaType.options.pull === 'function')) {
      var pusher = schemaType.options.push
        , puller = schemaType.options.pull
        , defaultArr = schemaType.defaultValue;

      schemaType.default(function() {
        var arr = defaultArr.call(this);
        wrapFunctions(arr, pusher, puller);
        return arr;
      });

      if (pusher && !schemaType.options.set /* dont override their setter */) {
        schemaType.set(function (vals) {
          return vals.map(pusher.bind(this));
        });
      }
    }
  });
}

module.exports = pusherPlugin;