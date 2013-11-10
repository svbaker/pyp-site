// Flag to prevent slider clicks while slide is animating
var slideEnabled = true;

$(document).ready(function() {

	// Set up Fancy box to display larger product pictures
	$(".fancybox").fancybox();

	// Handle product slider arrow clicks left and right
	$('.prod_slideButton').click(function(event) {
		var slide_distance = 179;
		var directionMult;
		event.preventDefault();

		if ($(this).hasClass('prod_slideButton_Disabled')) {
			return false;
		}

		if ($(this).hasClass('prod_slideButtonLeft')) {
			directionMult = 1;
		} else {
			directionMult = -1;
		}

		if (slideEnabled) {
			slideEnabled = false;
			var sliderDiv = $(this).parent().find('.prod_slider');
			var thisLeftButton = $(this).parent().find('.prod_slideButtonLeft');
			var thisRightButton = $(this).parent().find('.prod_slideButtonRight');
			
			sliderDiv.animate({
				marginLeft: (parseInt(sliderDiv.css('margin-left').replace('px', '')) + (slide_distance * directionMult)) + 'px'
			}, 300, function() {
				slideEnabled = true;
				var cur_slider_index = parseInt(sliderDiv.css('margin-left')) / (-1 * slide_distance);
				var tot_slider_cnt = sliderDiv.find('.prod_callout').length;

				// Check if left/right button disable is needed
				if (directionMult == 1) {
					if (cur_slider_index == 0) {
						thisLeftButton.addClass('prod_slideButton_Disabled');

					}
				} else {
					if (cur_slider_index > (tot_slider_cnt - 4)) {
						thisRightButton.addClass('prod_slideButton_Disabled');
					}
				}

				// Check if left/right button re-enable is needed
				if (directionMult == 1) {
					if (cur_slider_index == (tot_slider_cnt - 4)) {
						thisRightButton.removeClass('prod_slideButton_Disabled');
					}
				} else {
					if (cur_slider_index == 1) {
						thisLeftButton.removeClass('prod_slideButton_Disabled');
					}
				}

			});
		}

	});

});


function getProducts(cat_code) {

	$.ajax({
		async: false, // Load products into DOM before showing user the page
	    url: "/site/ajax/getProducts",
	    type: 'POST',
	    timeout: 10000,
	    dataType: 'json',
	    cache: false,
	    data: {cat_code: cat_code},
	    success: function(data) {
	        if (data.status == 'OK') {
	            loadProdDOM(data.payload);
	        } else {
	            window.location.href = thisSiteFullurl + '500.html';
	        }
	    },
	    error: function(a, b, c) {
	        alert('Sorry, there was a problem loading the products - please try again.');
	    }
    });

	function loadProdDOM(products) {

		var html = '';
		var right_button_class;

		for(var prop in products) {
    		html += '<div class="global_header_section" style="margin-top: 20px;">';
    		html += '<span>' + prop + ' -</span><span style="font-size: 14px;">' + getSizeText(prop) + '</span></div>';

    		if (products[prop].length < 4) {
    			right_button_class = ' prod_slideButton_Disabled';
    		} else {
    			right_button_class = '';
    		}

    		html += '<div class="prod_row_container">';
    		html += '<div class="prod_slideButton prod_slideButtonLeft prod_slideButton_Disabled"><span title="See more chocies" class="prod_chevron_left"></span></div>';
    		html += '<div class="prod_slideButton prod_slideButtonRight' + right_button_class + '"><span title="See more chocies" class="prod_chevron_right"></span></div>';
    		html += '<div class="prod_slide_container"><div class="prod_slider">';

    		for (var i = 0; i < products[prop].length; i++) {
	    		html += '<div class="prod_callout" id="prodID_' + products[prop][i].id + '">';
	    		html += '<p class="prod_callout_title"><span class="prodSize">' + prop + '</span>';
	    		html += '<span class="prodDesc">' + products[prop][i].color + '</span>';
	    		html += '<span class="prodName">' + products[prop][i].name + '</span></p>';
	    		
	    		html += '<a class="fancybox" title="' + prop + '-' + products[prop][i].color + '" href="' + products[prop][i].file_url + '">';

	    		html += '<img src="' + products[prop][i].thumb_url + '" alt="' + products[prop][i].color + ' ' + products[prop][i].name + '"></a>';
	    		html += '<span class="global_qtyEntry"><input class="global_qtyBox" type="text" name="qty" autocomplete="off" size=2>Qty</span><br>';
	    		html += '<input type="hidden" class="maxQty" value="' + products[prop][i].on_hand + '">';
	    		html += '<a href="" name="' + products[prop][i].id + '" class="global_addCart_button addCartAction" rel="nofollow">Add</a>';
	    		html += '<div class="prod_callout_price">';
	    		html += '$<span class="prodPrice">' + formatCurrency(products[prop][i].price) + '</span></div>';
	    		html += '</div>';
    		}

    		html += '</div></div></div>';

		}

		document.write(html);

		// Set display format based on product set
		if (cat_code == 'CHICKEN-ATTIRE') {
			// This page displays product name as well as color/description
		} else {
			// This page does not display product names - just color/decription
			$('.prodName').css('display', 'none');
		}

	}

}

// ---------- Formatting functions --------------
function getSizeText(size) {
	var html = '';
	switch(size) {
		case 'Large':
			html += 'Sized for large breeds and roosters. Breastbone to tail: 8-14&quot;';
			return html;
			break;

		case 'Medium':
			html += 'Sized for most egg layers. Breastbone to tail: 7-12&quot;';
			return html;
			break;

		case 'Small':
			html += 'Sized for most bantam chickens. Breastbone to tail: 6-10&quot;';
			return html;
			break;

		case 'X-Small':
			html += 'Sized for the smallest chickens Breastbone to tail: 5-8&quot;';
			return html;
			break;

		default:
			return size;
			break;
	}
}

function formatCurrency(num) {
    num = isNaN(num) || num === '' || num === null ? 0.00 : num;
    return parseFloat(num).toFixed(2);
}
