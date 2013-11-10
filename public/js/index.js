$(document).ready(function() {

	// Set up Fancy box to display larger product pictures
	$(".fancybox").fancybox();

	// Handle flockPack special add to cart
	$('#flockPackAddButton').click(function(event) {
		event.preventDefault();
		var size = $('#SPEC_flockpack_size').val();
		var prod_id;

		if (!size) {
			alert('Please select your Flock Pack size');
			return false;
		}

		switch (size) {
			case 'Large':
				prod_id = 71;
				break;
			case 'Medium':
				prod_id = 72;
				break;
			case 'Small':
				prod_id = 73;
				break;
			case 'X-Small':
				prod_id = 74;
				break;
		}

		CART.cartItems.push({
			prod_id: prod_id,
			qty: 1,
			name: 'Flock Pack',
			prodSize: size,
			desc: 'Feather Guard',
			price: 38,
			on_hand: 10
		});

		CART.updateCartState();

	});


	// Handle Christmas special add to cart
	$('#christmasAddButton').click(function(event) {
		event.preventDefault();
		var size = $('#SPEC_christmas_size').val();
		var prod_id;

		if (!size) {
			alert('Please select your Flock Pack size');
			return false;
		}

		switch (size) {
			case 'Large':
				prod_id = 6;
				break;
			case 'Medium':
				prod_id = 11;
				break;
			case 'Small':
				prod_id = 17;
				break;
			case 'X-Small':
				prod_id = 64;
				break;
		}

		CART.cartItems.push({
			prod_id: prod_id,
			qty: 1,
			name: 'Holiday Chicken Diaper',
			prodSize: size,
			desc: 'Christmas Present',
			price: 14.95,
			on_hand: 1
		});

		CART.updateCartState();

	});

});
