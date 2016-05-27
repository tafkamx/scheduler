(function($) {

  $.bitsByHour = [];
  $.getBitmask = function() {
    var bitMask = 0;

    for(var a in arguments)
      if(arguments.hasOwnProperty(a))
        bitMask += $.bitsByHour[arguments[a]];

    return bitMask;
  };

  for(var i = 0; i < 23; i++) {
    $.bitsByHour[i] = Math.pow(2, i + 1);
  }

})(module.exports);

/*
var bitmask1 = module.exports.getBitmask(11, 13, 14);
var bitmask2 = module.exports.getBitmask(11, 12, 13);

if((bitmask1 & bitmask2) === bitmask1) console.log('yes');
else console.log('no');
*/
