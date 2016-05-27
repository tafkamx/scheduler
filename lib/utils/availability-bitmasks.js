(function($) {

  $.bitsByHour = [];

  /* Retrieves a bitmask from the bitsByHour, or multiple (via arguments) and adds them together for a single int */
  $.getBitmask = function() {
    var bitMask = 0;

    for(var a in arguments)
      if(arguments.hasOwnProperty(a))
        bitMask += $.bitsByHour[arguments[a]];

    return bitMask;
  };

  /* Finds if a is in b (at the bit scale) */
  $.isIn = function(a, b) {
    return (a & b) === a;
  };

  for(var i = 0; i <= 23; i++) {
    $.bitsByHour[i] = Math.pow(2, i + 1);
  }

})(module.exports);
