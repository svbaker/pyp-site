var ORDER_FUNC = {

	ops_function: 'order',
	domFieldPrefix: '#order_fields_',

	init: function() {
		// Set up function specific event handlers
	},

	invoice: function(order_num) {
		$('#invoiceForm_order_num').val(order_num);
		$('#invoiceForm').submit();
	},

	loadForm: function(edit_id) {
		// Load edit form form server

		var order_num = edit_id;

		$.ajax({
			url: "/ops/ajax/getorder",
			type: 'POST',
			timeout: 10000,
			dataType: 'json',
			cache: false,
			data: {order_num: order_num, ACCESS_TOKEN: ACCESS_TOKEN},
			success: function(data) {
				if (data.status == 'OK') {
					populateDOM(data.payload.order_header, data.payload.order_detail);
				} else {
					alert('Debug warning: ' + data.status_text);
				}
			},
			error: function(a, b, c) {
				alert('Debug warning: Could not reach server to get menus ' + b);
			}
		});

		$('#orderForm_order_num_data').html('<strong>' + order_num + '</strong>');


		function populateDOM(order_header, order_detail) {
			var thisVal;
			var order_tot = 0;
			var tableHtml = '';
			var shipping_cost = order_header['shipping_cost'];

			// Order Header info
			$('#orderForm').find('input,select,textarea').each(function(i) {
				thisVal = order_header[$(this).attr('id').slice(ORDER_FUNC.ops_function.length + 8)];
				thisVal = formatField($(this).attr('id'), thisVal);
				$('#' + $(this).attr('id')).val(thisVal);
			});

			$('#orderForm_form').find('.displayOnly_data').each(function(i) {
				thisVal = order_header[$(this).attr('id').slice(ORDER_FUNC.ops_function.length + 8)];
				thisVal = formatField($(this).attr('id'), thisVal);
				$('#' + $(this).attr('id')).html(thisVal);
			});


			// Order detail info
			$('#ordered_products_table tbody').remove();

			for (var i = 0; i < order_detail.length; i++) {
				tableHtml += '<tr>';
				tableHtml += '<td align="center">' + order_detail[i].qty + '</td>';
				tableHtml += '<td>' + order_detail[i].item_desc + '</td>';
				tableHtml += '<td align="right">$' + formatCurrency(order_detail[i].sell_price) + '</td>';
				tableHtml += '</tr>';
				order_tot += order_detail[i].sell_price * order_detail[i].qty;
			}


			tableHtml += '<tr><td colspan=2 align="right">Shipping:&nbsp&nbsp</td>';
			tableHtml += '<td style="color: #800; font-weight: bold; text-align: right;">';
			tableHtml += '$' + formatCurrency(shipping_cost) + '</td></tr>';
			order_tot += shipping_cost;

			tableHtml += '<tr><td colspan=2 align="right">Total:&nbsp&nbsp</td>';
			tableHtml += '<td style="color: #800; font-weight: bold; text-align: right;">';
			tableHtml += '$' + formatCurrency(order_tot) + '</td></tr>';

			$('#ordered_products_table').append(tableHtml);


			function formatField(field, val) {
				switch (field) {
					case 'order_fields_order_date':
						return formatDateTime(val);
						break;
					case 'order_fields_gift_message':
						return formatText(val);
						break;
					case 'order_fields_email':
						return formatEmailLink(val);
						break;
					case 'order_fields_card_number':
						if (val.length == 16) {
							return val.slice(0,4) + '-' + val.slice(4,8) + '-' + val.slice(8,12) + '-' + val.slice(12,16);
						} else {
							return val;
						}
						break;
					default:
						return val;
						break;
				}
			}

		}

	},


	postForm: function() {
		// Post form to server

		var ops_function = ORDER_FUNC.ops_function;
		var domPrefix = ORDER_FUNC.domFieldPrefix;

		// Validate form data
		var is_valid = true;

		// Check all standard required fields

		// Warn user and end process if any validation failed
		if (!is_valid) {
			alert('You are missing required data.');
			return false;
		}

		// Form data is ready to be posted to server
		var post_data = {};

		// Load each standard field into the post_data object
		$('#' + ops_function +'Form').find('input,select,textarea').each(function(i) {
			post_data[$(this).attr('id').slice(ops_function.length + 8)] = $('#' + $(this).attr('id')).val();
		});

		// Set edit id value to support update process
		post_data.order_num = APP_STATE.current_function_form_edit_id;
		post_data.ACCESS_TOKEN = ACCESS_TOKEN;

		// Post data to server
		$.ajax({
			url: "/ops/ajax/updateOrder",
			type: 'POST',
			timeout: 10000,
			dataType: 'json',
			data: JSON.stringify(post_data),
			processData: false, // Send JSON to server, not post key/val pairs

			success: function(data) {
				if (data.status == 'OK') {
					// Mark form as unchanged
					$('#' + ops_function + 'Form').data('changePending', false);

					// Go to list page
					filterList(ops_function);

				} else {
					alert('Debug warning: ' + data.status_text);
				}

			},
			error: function(a, b, c) {
				alert('Debug warning: Could not reach server to get menus ' + b);
			}
		});

	}

};
