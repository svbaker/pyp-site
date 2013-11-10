$(document).ready(function() {

	// Handle cart update button
	$('#update_cart').click(function(event) {
		updateCart();
	});

	// Show/hide gift message box when git status checkbox changes and save state
	$('#cartForm_gift_status').change(function() {
		saveFormChanges();
		if ($('#cartForm_gift_status').attr('checked')) {
			$('#giftMessage_container').show();
		} else {
			$('#giftMessage_container').hide();
		}
	});

	// Save state and re-render cart display if country changes
	$('#cartForm_shipto_country').change(function() {
		saveFormChanges();
		renderCart();
	});

	// Save state if gift message changes
	$('#cartForm_gift_message').change(function() {
		saveFormChanges();
	});

	// Save state on checkout
	$('.checkout').click(function() {
		saveFormChanges();
		window.location.href = 'checkout.html';
	});

	// Continue shopping button
    $('.backNav').click(function(event) {
		event.preventDefault();
		continueShopping();
    });

});



// Save changes and re-render cart display
function updateCart() {
	saveFormChanges();
	renderCart();
}

// Save state and redirect for continue shopping
function continueShopping() {
	saveFormChanges();
	window.location.href = thisSiteFullurl + backURL;
}


// Save any cart or form state changes to local object and to local storage or cookies
function saveFormChanges() {

	var custMsg = '';
	var msg;

	$('.cartpage_qty').each(function() {
		var prod_id = $(this).attr('id').slice(9);
		var qty = $(this).val();

		// Notify customer if they add more of an item to cart than are available in stock
		msg = CART.updateItem(prod_id, qty);
		if (msg) {
			custMsg += msg;
		}

	});

	ORDERFORM.form_data.country_code = $('#cartForm_shipto_country').val();

	if ($('#cartForm_gift_status').is(':checked')) {
		ORDERFORM.form_data.gift_status = 'Y';
	} else {
		ORDERFORM.form_data.gift_status = 'N';
	}

	ORDERFORM.form_data.gift_message = $('#cartForm_gift_message').val();

	ORDERFORM.saveState();

	if (custMsg) {
		alert(custMsg);
	}
}


// Called from global.js once user state has loaded from cookies or local storage
function localInitFunc() {
	backURL = getCookie('backURL');
	if (!backURL) {
		backURL = ''; // Home page
	}

	// Update cart on-hand values from server
	$.ajax({
		async: false, // Load products into DOM before showing user the page
	    url: "/site/ajax/updateCart_onhand",
	    type: 'POST',
	    timeout: 10000,
	    dataType: 'json',
	    cache: false,
	    data: JSON.stringify({cartItems: CART.cartItems}),
	    processData: false,
	    success: function(data) {
	        if (data.status == 'OK') {
	            var cartUpdates = data.payload;
	            for (var i = 0; i < cartUpdates.length; i++) {
	            	CART.update_onhand(cartUpdates[i].prod_id, cartUpdates[i].on_hand);
	            }
	            CART.saveCartState();
	            renderCart();
	        } else {
	            window.location.href = thisSiteFullurl + '500.html';
	        }
	    },
	    error: function(a, b, c) {
	        // Do not interupt user session for any possible timeout error here
	    }
    });

}


function renderCart() {
	var tot_amt = 0;
	var html = '';
	var prod_id;
	var totItems = CART.cartCnt();
	var shipping;

	if (CART.cartItems.length == 0) {
		// No items in cart
		window.location.href = thisSiteFullurl + backURL;
	}

	for (var i = 0; i < CART.cartItems.length; i++) {
		prod_id = CART.cartItems[i].prod_id;

		html += '<tr id="cartRow_prod_' + prod_id + '">';
		html += '<td class="cartpage_qty_col">';
		html += '<a class="global_control_button removeItem" name="' + prod_id + '" href="#">X</a>';
		html += '<input type="text" class="cartpage_qty" id="qty_prod_' + prod_id + '" size=2 value="' + CART.cartItems[i].qty + '"></td>';
		html += '<td class="cartpage_item_col"><span class="cartpage_prod_text">' + formatProductName(CART.cartItems[i]) + '</a></td>';
		html += '<td class="cartpage_value_col">$' + formatCurrency(CART.cartItems[i].price) + '</td>';
		html += '<td class="cartpage_amt_col"><span id="cartAmt_prod_' + prod_id + '">$' + formatCurrency(CART.cartItems[i].price * CART.cartItems[i].qty) + '</span></td>';
		html += '</tr>';
		tot_amt += CART.cartItems[i].price * CART.cartItems[i].qty;
	}

	shipping = CART.calcShipping($('#cartForm_shipto_country').val());
	html += '<tr><td colspan=3 class="cartpage_tot_label cartpage_summary_row">' + shipping.desc + ':</td>';
	html += '<td class="cartpage_amt_col cartpage_summary_row"><span id="cart_tot_amt">$' + formatCurrency(shipping.cost) + '</span></td></tr>';
	tot_amt += shipping.cost;

	html += '<tr>';
	html += '<td colspan=3 class="cartpage_tot_label cartpage_summary_row">Order Total:</td>';
	html += '<td class="cartpage_amt_col cartpage_summary_row"><span id="cart_tot_amt">$' +  formatCurrency(tot_amt) + '</span></td>';
	html += '<tr>';

	$('.cartpage_cartTable tbody').remove();
	$('.cartpage_cartTable').append(html);
	$('.cartpage_qty').change(function() {
		updateCart();
	});

	$('.removeItem').click(function(event) {
		event.preventDefault();
		CART.removeItem($(this).attr('name')); // Use name instead of href to work in older IE versions
		renderCart();
		return false;
	});

}


function formatProductName(item) {
	var formattedName = '';

	if(item.prodSize) {
		if (item.prodSize.length > 0) {
			formattedName += item.prodSize + ' ';
		}
	}

	if (item.desc) {
		if (item.desc.length > 0) {
			formattedName += item.desc + ' ';
		}
	}

	formattedName += item.name;
	return formattedName;
}
