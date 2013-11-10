var normalized_ccnum;
var card_type;

$(document).ready(function() {

	// Continue shopping button
    $('.backNav').click(function(event) {
		event.preventDefault();
		backToCart();
    });

    $('.placeOrder').click(function(event) {
    	event.preventDefault();
    	placeOrder();
    });

});


// Save state and redirect for back to cart
function backToCart() {
	saveFormChanges();
	window.location.href = 'cart.html';
}


// Load form data from storage or cookies into DOM
function loadFormData() {

	// Shipping and contact form
	$('#shippingForm').find('.postData').each(function() {
		$(this).val(ORDERFORM.form_data[$(this).attr('id').slice(10)]);
	});

	// Payment form
	$('#paymentForm').find('.postData').each(function() {
		$(this).val(ORDERFORM.form_data[$(this).attr('id').slice(10)]);
	});

	// Billing form
	$('#billingForm').find('.postData').each(function() {
		$(this).val(ORDERFORM.form_data[$(this).attr('id').slice(10)]);
	});

}

// Save any form state changes to local object and to local storage or cookies
function saveFormChanges() {

	// Shipping and contact form
	$('#shippingForm').find('.postData').each(function() {
		var field = $(this).attr('id').slice(10);
		var val = $(this).val();
		ORDERFORM.form_data[field] = val;
	});

	// Payment form
	$('#paymentForm').find('.postData').each(function() {
		var field = $(this).attr('id').slice(10);
		var val = $(this).val();
		ORDERFORM.form_data[field] = val;
	});

	// Billing form
	$('#billingForm').find('.postData').each(function() {
		var field = $(this).attr('id').slice(10);
		var val = $(this).val();
		ORDERFORM.form_data[field] = val;
	});

	ORDERFORM.saveState();
}


// Called from global.js once user state has loaded from cookies or local storage
function localInitFunc() {

	backURL = getCookie('backURL');
	if (!backURL) {
		backURL = ''; // Home page
	}

	var itemsTot = CART.itemsCostTot();
	var shipping = CART.calcShipping(ORDERFORM.form_data.country_code).cost;

	// Load order summary
	$('#orderSummary_itemsTot').html('$' + formatCurrency(itemsTot));
	$('#orderSummary_shipping').html('$' + formatCurrency(shipping));
	$('#orderSummary_orderTot').html('$' + formatCurrency(itemsTot + shipping));

	// Default billing country if not already set
	if (!ORDERFORM.form_data.bill_country_code) {
		ORDERFORM.form_data.bill_country_code = ORDERFORM.form_data.country_code;
	}

	// Load shipping and contact data
	$('#orderForm_country_code').val(ORDERFORM.form_data.country_code);

	// Load billing data
	$('#orderForm_bill_country_code').val(ORDERFORM.form_data.bill_country_code);

	// Set initial state menu versions
	setStateMenuVersion($('#orderForm_country_code').val(), $('#shippingForm'));
	setStateMenuVersion($('#orderForm_bill_country_code').val(), $('#billingForm'));

	// Load form data from cookies or local storage
	loadFormData();


	// ----------- Set up event handlers --------------

	// Handle country code changes
	$('#orderForm_country_code').change(function() {
		setStateMenuVersion($('#orderForm_country_code').val(), $('#shippingForm'));
	});

	$('#orderForm_bill_country_code').change(function() {
		setStateMenuVersion($('#orderForm_bill_country_code').val(), $('#billingForm'));
	});


	// ------ Billing same as shipping checkbox -------------------
	$('#billingSameAsShipping').change(function() {
		if ($('#billingSameAsShipping').attr('checked')) {
			$('#orderForm_bill_country_code').val($('#orderForm_country_code').val());
			$('#orderForm_bill_add1').val($('#orderForm_add1').val());
			$('#orderForm_bill_add2').val($('#orderForm_add2').val());
			$('#orderForm_bill_city').val($('#orderForm_city').val());
			$('#orderForm_bill_state_code').val($('#orderForm_state_code').val());
			$('#orderForm_bill_state').val($('#orderForm_state').val());
			$('#orderForm_bill_zip').val($('#orderForm_zip').val());

			setStateMenuVersion($('#orderForm_bill_country_code').val(), $('#billingForm'));
		}
	});


	// Save form updates to cookies/storage and handle per-form validation cues
    $('body').on('blur', '.validated-input', function() {

        var msg_dom_id = '#' + $(this).attr('id') + '-msg';
        if ($(this).val().length == 0) {
            $(msg_dom_id).show();
            $(this).css('border-color', '#d00');
        } else {
            $(msg_dom_id).hide();
            $(this).css('border-color', '#959595');
        }

        if ($(this).attr('id') == 'orderForm_email') {
            if (!validEmail($('#orderForm_email').val())) {
                $('#orderForm_email-msg').show();
                $('#orderForm_email').css('border-color', '#d00');
            }
        }

        saveFormChanges();

    });


	// Save state input fields form updates to cookies/storage and handle per-form validation cues
    $('body').on('blur', '.stateField-input', function() {

        var msg_dom_id = '#' + $(this).attr('id') + '-msg';
        if ($(this).val().length == 0) {
            $(msg_dom_id).show();
            $(this).css('border-color', '#d00');
        } else {
            $(msg_dom_id).hide();
            $(this).css('border-color', '#959595');
        }

        saveFormChanges();

    });


}


function setStateMenuVersion(country_code, formElement) {
	if (country_code == CART.united_states_country_code) {
		// To USA
		formElement.find('.non-us').hide();
		formElement.find('.us-only').show();
	} else {
		// From US
		formElement.find('.us-only').hide();
		formElement.find('.non-us').show();
	}
}


// Save form, validate, and place order
function placeOrder() {
	var validator = new CCNumberValidator();
	var isValid = true;

	saveFormChanges();

	// Validate basic form elements
	$('.validated-input').each(function() {
		var msg_dom_id = '#' + $(this).attr('id') + '-msg';
        if ($(this).val().length == 0) {
            $(msg_dom_id).show();
            $(this).css('border-color', '#d00');
            isValid = false;
        } else {
            $(msg_dom_id).hide();
            $(this).css('border-color', '#959595');
        }
	});

	if (!validEmail($('#orderForm_email').val())) {
    	$('#orderForm_email-msg').show();
		$('#orderForm_email').css('border-color', '#d00');
		isValid = false;
	}




	if ($('#orderForm_country_code').val() == CART.united_states_country_code) {
		if ($('#orderForm_state_code').val().length == 0) {
			$('#orderForm_state_code-msg').show();
			$('#orderForm_state_code').css('border-color', '#d00');
			isValid = false;
		} else {
			$('#orderForm_state_code-msg').hide();
			$('#orderForm_state_code').css('border-color', '#959595');
		}
	} else {
		if ($('#orderForm_state').val().length == 0) {
			$('#orderForm_state-msg').show();
			$('#orderForm_state').css('border-color', '#d00');
			isValid = false;
		} else {
			$('#orderForm_state-msg').hide();
			$('#orderForm_state').css('border-color', '#959595');
		}
	}


	if ($('#orderForm_bill_country_code').val() == CART.united_states_country_code) {
		if ($('#orderForm_bill_state_code').val().length == 0) {
			$('#orderForm_bill_state_code-msg').show();
			$('#orderForm_bill_state_code').css('border-color', '#d00');
			isValid = false;
		} else {
			$('#orderForm_bill_state_code-msg').hide();
			$('#orderForm_bill_state_code').css('border-color', '#959595');
		}
	} else {
		if ($('#orderForm_bill_state').val().length == 0) {
			$('#orderForm_bill_state-msg').show();
			$('#orderForm_bill_state').css('border-color', '#d00');
			isValid = false;
		} else {
			$('#orderForm_bill_state-msg').hide();
			$('#orderForm_bill_state').css('border-color', '#959595');
		}
	}


    // -----Payment validation ------------
    if ($('#orderForm_card_number').val().length > 0) {
	    
	    validator.validate($('#orderForm_card_number').val(), function(result) {
		    if (result.error) {
		        alert("There was an error validating your card, please try again.");
		        $('#orderForm_card_number-msg').show();
	        	$('#orderForm_card_number').css('border-color', '#d00');
	        	isValid = false;
		    } else {
		    	if (result.luhn_valid && result.length_valid) {
		    		normalized_ccnum = result.ccnum;
		    		card_type = result.type
		    	} else {
		    		normalized_ccnum = null;
		    		$('#orderForm_card_number-msg').show();
	        		$('#orderForm_card_number').css('border-color', '#d00');
	        		isValid = false;
		    	}
		    }
		});
	}


	if (!validCVV($('#orderForm_ccv').val())) {
		$('#orderForm_ccv-msg').show();
        $('#orderForm_ccv').css('border-color', '#d00');
        isValid = false;
	}

    if (!isValid) {
        alert('We are missing some information.\n   Please review the fields in red.');
    } else {
    	submitToServer();
    } 

}


function submitToServer() {

	// Load form and cart data into object to be sent to server
	var formVals = ORDERFORM.form_data;

	// Normalize state data depending on country code
	if (ORDERFORM.form_data.country_code == CART.united_states_country_code) {
		formVals.state = ORDERFORM.form_data.state_code;
	}

	if (ORDERFORM.form_data.bill_country_code == CART.united_states_country_code) {
		formVals.bill_state = ORDERFORM.form_data.bill_state_code;
	}

	delete formVals.state_code;
	delete formVals.bill_state_code;

	// Save cart summary data
	formVals.items_total_cost = CART.itemsCostTot();
	formVals.shipping_cost = CART.calcShipping(ORDERFORM.form_data.country_code).cost;

	// Payment data and cart items
	formVals.card_number = normalized_ccnum;
	formVals.card_type = card_type;
	formVals.cart = CART.cartItems;

    $.ajax({
      url: '/site/ajax/post_order',
      type: 'POST',
      data: JSON.stringify(formVals),
      processData: false,
      dataType: 'json',
      jsonp: false, // Work around issue where jQuery replaces ?? in JSON data with timestamp (Ticket #8417)
      timeout: 10000,

      success: function(data) {

      	if (data.status != 'OK') {
      		alert('There was an problem sending your order to the server, please try again.');
      		return false;
      	}

      	// Clear cart and order form data
      	CART.resetCart();
      	CART.saveCartState();
      	ORDERFORM.resetFormData();
      	ORDERFORM.saveState();

      	// Save order confirmation number
      	setCookie('order_conf_num', data.payload.order_num);
      	window.location.href = thisSiteFullurl + 'order_confirmation.html';

      },

      error: function(a, b, c) {
        alert('There was an problem sending your order to the server, please try again.');
      }
    });

}
