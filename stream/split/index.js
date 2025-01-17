var through = require('../through');
var Decoder = require('string_decoder').StringDecoder;

module.exports = split;

function split(matcher, mapper, options) {
  var decoder = new Decoder();
  var soFar = '';
  var maxLength = options && options.maxLength;
  var trailing = options && options.trailing === false ? false : true;
  if ('function' === typeof matcher) (mapper = matcher), (matcher = null);
  if (!matcher) matcher = /\r?\n/;

  function emit(stream, piece) {
    if (mapper) {
      try {
        piece = mapper(piece);
      } catch (err) {
        return stream.emit('error', err);
      }
      if ('undefined' !== typeof piece) stream.queue(piece);
    } else stream.queue(piece);
  }

  function next(stream, buffer) {
    var pieces = ((soFar != null ? soFar : '') + buffer).split(matcher);
    soFar = pieces.pop();

    if (maxLength && soFar.length > maxLength)
      return stream.emit('error', new Error('maximum buffer reached'));

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      emit(stream, piece);
    }
  }

  return through(
    function (b) {
      next(this, decoder.write(b));
    }, //write
    function () {
      if (decoder.end) next(this, decoder.end());
      if (trailing && soFar != null) emit(this, soFar);
      this.queue(null);
    } // end
  );
}
