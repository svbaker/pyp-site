var localStorageEnabled = false;

// Cart state and functionality ----------------------
//     Shipping Rates set in calcShipping method:
//     Domestic: flat $1.95
//     Intl: flat $7.95 + $1 per each additional item
//     Note: shipping rates here must match rates used by back-end server calculation
var CART = {
	cartItems: [], // Hold user's cart items

	united_states_country_code: '228',

	resetCart: function() {
		this.cartItems.length = 0;
	},

	// Pass a prod_id in to filter request to single item, otherwise returns count of all items
	cartCnt: function(prod_id) {
		var cnt = 0;
		for (var i = 0; i < this.cartItems.length; i++) {
			if (prod_id) {
				if (this.cartItems[i].prod_id == prod_id) {
					cnt += +this.cartItems[i].qty;
				}
			} else {
				cnt += +this.cartItems[i].qty;
			}
		}
		return cnt;
	},

	itemsCostTot: function() {
		var cost = 0;
		for (var i = 0; i < this.cartItems.length; i++) {
			cost += this.cartItems[i].price * this.cartItems[i].qty;
		}
		return cost;
	},

	getState: function() {
		var USER_CART_STATEstr = getCookie('USER_CART_STATE');

		if (USER_CART_STATEstr) {
			this.cartItems = JSON.parse(USER_CART_STATEstr);
		} else {
	    	this.cartItems = [];
	    }
	},

	updateCartState: function() {
		var cnt = this.cartCnt();

		// Update cart display
		if (cnt > 0) {
			$('#cart_cnt_display').text(cnt);
			$('#global_cart_cnt').show();
			$('.global_menuCart').show();
		} else {
			$('#cart_cnt_display').text('');
			$('#global_cart_cnt').hide();
			$('.global_menuCart').hide();
		}

		// Save cart state
		this.saveCartState();

		window.scrollTo(0, 0);
		return;
	},

	saveCartState: function() {
		setCookie('USER_CART_STATE', JSON.stringify(this.cartItems));
	},

	addItem: function(prod_id) {
		var qty = 1; // Default
		var usrQty = $('#prodID_' + prod_id).find('.global_qtyBox').val(); // Get qty from input box
		$('#prodID_' + prod_id).find('.global_qtyBox').val('');
		var prod_on_hand, prodName, prodSize, prodDesc, prodPrice;
		var qty_already_in_cart = this.cartCnt(prod_id);
		var customer_qty_msg;

		if (usrQty == parseInt(usrQty)) {
			qty = +usrQty; // Only use user input if valid - otherwise use default
		}

		prod_on_hand = $('#prodID_' + prod_id).find('.maxQty').val();
		
		if ((qty + qty_already_in_cart) > prod_on_hand) {
			if (qty_already_in_cart >= prod_on_hand) {
				customer_qty_msg = 'Sorry, there are no more of that item available in stock.';
				alert(customer_qty_msg);
				return;
			} else {
				customer_qty_msg = 'Sorry, there are only ' + prod_on_hand + ' of that item in stock.';
				qty = prod_on_hand - qty_already_in_cart;
				alert(customer_qty_msg);
			}
			
		}

		// Add to cart qty if item already in cart
		for (var i = 0; i < this.cartItems.length; i++) {
			if (this.cartItems[i].prod_id == prod_id) {
				this.cartItems[i].qty += +qty;
				this.updateCartState();
				return;
			}
		}

		// Push new item to cart array if not already in cart
		prodName = $('#prodID_' + prod_id).find('.prodName').html();
		prodSize = $('#prodID_' + prod_id).find('.prodSize').html();
		prodDesc = $('#prodID_' + prod_id).find('.prodDesc').html();
		prodPrice = $('#prodID_' + prod_id).find('.prodPrice').html();

		if (!isNumber(prodPrice)) {
			alert('Sorry, the item you selected is no longer available - please select a different item.')
			return false;
		}

		this.cartItems.push({
			prod_id: prod_id,
			qty: qty,
			name: prodName,
			prodSize: prodSize,
			desc: prodDesc,
			price: +prodPrice,
			on_hand: prod_on_hand
		});

		this.updateCartState();
		return;

	},

	removeItem: function(prod_id) {
		this.updateItem(prod_id, 0);
	},

	updateItem: function(prod_id, qty) {
		var newQty = qty || 0;
		var custMsg = '';

		for (var i = 0; i < this.cartItems.length; i++) {
			if (this.cartItems[i].prod_id == prod_id) {
				if (qty == 0) {
					this.cartItems.splice(i, 1);
					break;
				} else {

					if (qty > this.cartItems[i].on_hand) {
						qty = this.cartItems[i].on_hand;
						custMsg += this.cartItems[i].prodSize + ' ' + this.cartItems[i].desc + ' ' + this.cartItems[i].name + ' ';
						custMsg += 'only has ' + this.cartItems[i].on_hand + ' in stock.\n';
					}

					this.cartItems[i].qty = qty;
					break;
				}
			}
		}

		this.updateCartState();
		return custMsg;
	},

	update_onhand: function(prod_id, on_hand) {
		for (var i = 0; i < this.cartItems.length; i++) {
			if (this.cartItems[i].prod_id == prod_id) {
				this.cartItems[i].on_hand = on_hand;
				break;
			}
		}
		return;
	},

	calcShipping: function(country_code) {
		var shipping = {};
		if (country_code == this.united_states_country_code) {
			shipping.desc = 'U.S. Shipping';
			shipping.cost = 1.95;
		} else {
			shipping.desc = 'International Shipping';
			shipping.cost = 6.95 + this.cartCnt();
		}
		return shipping;
	}

}


var ORDERFORM = {

	form_data: {gift_status: 'N', country_code: CART.united_states_country_code},

	resetFormData: function() {
		delete this.form_data;
		this.form_data = {gift_status: 'N', country_code: CART.united_states_country_code};
	},

	saveState: function() {

		if (localStorageEnabled) {
			localStorage.setItem('USER_ORDERFORM_STATE', JSON.stringify(this.form_data));
		} else {
			setCookie('USER_ORDERFORM_STATE', JSON.stringify(this.form_data));
		}
	},

	getState: function() {

		var USER_ORDERFORM_STATEstr;
		if (localStorageEnabled) {
			USER_ORDERFORM_STATEstr = localStorage.getItem('USER_ORDERFORM_STATE');
		} else {
			USER_ORDERFORM_STATEstr = getCookie('USER_ORDERFORM_STATE');
		}

		if (USER_ORDERFORM_STATEstr) {
			this.form_data = JSON.parse(USER_ORDERFORM_STATEstr);
		} 
	},

	loadCartPageDOM: function() {

		if (this.form_data.gift_status == 'Y') {
			$('#cartForm_gift_status').attr('checked', 'checked');
			$('#giftMessage_container').show();
		}

		$('#cartForm_gift_message').val(this.form_data.gift_message);
		$('#cartForm_shipto_country').val(this.form_data.country_code);
	}


}



// The following environment-dependant global vars are set in the env.js file:
// thisSiteFullurl; // Full NON-SSL domain name including protocol, port, and ending slash
// thisSiteFullHTTPSurl; // Full SSL domain name including protocol, port, and ending slash
// thisSiteDomain; // Domain to store cookies - no host name for site-wide (Ex: .mysite.com)

$(document).ready(function() {

	// Determine id local storage is available
	if (typeof(Storage) !== 'undefined') {
		localStorageEnabled = true;
	} else {
		localStorageEnabled = false;
	}

	// Get user order form state from cookies or local storage and load DOM
	ORDERFORM.getState();
	ORDERFORM.loadCartPageDOM();


	// Get cart from cookies
	CART.getState();

	// Set up cart object and cart basket display DOM
	CART.updateCartState();

	// Call local page init function if it exists
	if (typeof(localInitFunc) == "function") {
		localInitFunc();
	}

	$('#global_header_logo').click(function() {
		window.location.href = thisSiteFullurl;
	});

	// Handle add to cart clicks
	$('.addCartAction').click(function(event) {
		event.preventDefault();

		var prod_id = $(this).attr('name');
		CART.addItem(prod_id);
		return false;

		// Enable if you want to take user right to cart when they add an item:
		//     setCookie('backURL', getPageFilename());
		//     window.location.href = thisSiteFullHTTPSurl + 'secure/cart.html';

	});


	// Handle cart clicks
	$('#global_header_cart').click(function() {
		if (CART.cartItems.length > 0) {
			// Save current page for return
			setCookie('backURL', getPageFilename());
			window.location.href = thisSiteFullHTTPSurl + 'secure/cart.html';
		}
	});


});


// --------- General site functions ----------------------
function getPageFilename() {
	var url = document.location.href;
	url = url.substring(0, (url.indexOf("#") == -1) ? url.length : url.indexOf("#"));
	url = url.substring(0, (url.indexOf("?") == -1) ? url.length : url.indexOf("?"));
	url = url.substring(url.lastIndexOf("/") + 1, url.length);
	return url;
}

// Cookie management -----------------------
function setCookie(name, value) {
	var cookieStr = name + '=' + value + ';path=/;domain=' + thisSiteDomain;
	document.cookie = cookieStr;
}

function getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

// ------ Formatting  ------------------------
function formatCurrency(num) {
	num = isNaN(num) || num === '' || num === null ? 0.00 : num;
	return parseFloat(num).toFixed(2);
}

// ----- Validation  ------------------------
function validEmail(email) {  
	return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email));
} 

function validCVV(cvv) {
	return /^[0-9]{3,4}$/.test(cvv)
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
