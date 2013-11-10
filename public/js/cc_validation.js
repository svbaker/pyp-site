// Routine derived from https://github.com/radekg/cc-validator-node

// IE does not support array indexOf - so add it if needed
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(elt /*, from*/)
  {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
         ? Math.ceil(from)
         : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++)
    {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

CCNumberValidator = function() {
	this.types = {
		amex: {
			pattern: /^3[47]/,
	        valid_length: [15] }
		, diners_club_carte_blanche: {
			pattern: /^30[0-5]/,
	        valid_length: [14] }
		, diners_club_international: {
			pattern: /^36/,
	        valid_length: [14] }
		, jcb: {
			pattern: /^35(2[89]|[3-8][0-9])/,
	        valid_length: [16] }
		, laser: {
			pattern: /^(6304|630[69]|6771)/,
	        valid_length: [16, 17, 18, 19] }
		, visa_electron: {
			pattern: /^(4026|417500|4508|4844|491(3|7))/,
	        valid_length: [16] }
		, visa: {
			pattern: /^4/,
	        valid_length: [16] }
		, mastercard: {
			pattern: /^5[1-5]/,
	        valid_length: [16] }
		, maestro: {
			pattern: /^(5018|5020|5038|6304|6759|676[1-3])/,
	        valid_length: [12, 13, 14, 15, 16, 17, 18, 19] }
		, discover: {
			pattern: /^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)/,
	        valid_length: [16] }
	};
	return this;
}
CCNumberValidator.prototype.get_card_type = function(number) {
	var ccnum = number || "";
	ccnum = this.normalize(ccnum);
	for (var key in this.types) {
		if ( ccnum.match( this.types[key].pattern ) ) {
			return key;
		}
	}
	return null;
};
CCNumberValidator.prototype.luhn = function(number) {
	var digit, n, sum, _len, _ref;
	sum = 0;
	_ref = number.split('').reverse().join('');
	for (n = 0, _len = _ref.length; n < _len; n++) {
		// digit = +_ref[n]; DOES NOT WORK IN EI7
		digit = +_ref.charAt(n);
		if (n % 2) {
			digit *= 2;
			sum += ( (digit < 10) ? digit : digit - 9 );
		} else {
			sum += digit;
		}
	}
	return sum % 10 === 0;
};
CCNumberValidator.prototype.normalize = function(number) {
	return number.replace(/[ -]/g, '');
};
CCNumberValidator.prototype.validate = function(number, callback) {
	var ccnum = number || "";
	ccnum = this.normalize( ccnum );
	var card_type = this.get_card_type( ccnum );
	if ( card_type == null ) {
		callback( { error: "type_unknown", input: number } );
		return;
	}

	var luhn_valid = this.luhn(ccnum);
	var length_valid = (this.types[card_type].valid_length.indexOf(ccnum.length) > -1);

	// alert('ccnum=' + ccnum);
	// alert('type=' + card_type);
	// alert('luhn_valid=' + luhn_valid);
	// alert('length_valid=' + length_valid);

	callback({ccnum: ccnum, type: card_type, luhn_valid: luhn_valid, length_valid: length_valid});
};
