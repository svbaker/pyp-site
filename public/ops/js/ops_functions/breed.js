var BREED_FUNC = {

	ops_function: 'breed',
	domFieldPrefix: '#breed_fields_',
	form_plumage_list: [], // Holds array list of selected plumage colors for a breed

	init: function() {
		// Set up function specific event handlers

		// Handle "add plumage" event
		$('#breedForm_form').on('click', '#add_plumage_code', function() {
			var selected_plumage_code = $('#selected_plumage_code').val();
			if (selected_plumage_code == parseInt(selected_plumage_code)) {
				// A color was chosen from the menu

				if ($('#add_plumage_menu_color').val().length > 0) {
					alert('You can not select from the menu when a new color is entered as well');
					return false;
				}

				var selected_plumage_text = $('#selected_plumage_code option:selected').text();

				BREED_FUNC.addPlumageDOM(selected_plumage_code, selected_plumage_text);

			} else {
				// No menu item selected - check for new menu addtion
				if ($('#add_plumage_menu_color').val().length > 0) {
					var new_color = $('#add_plumage_menu_color').val();

					// Load new plumage color choice to server
					$.ajax({
						url: "/ops/ajax/addPlumage",
						type: 'POST',
						cache: false,
						timeout: 10000,
						dataType: 'json',
						data: {add_plumage_menu_color: new_color, ACCESS_TOKEN: ACCESS_TOKEN},
						success: function(data) {
							if (data.status == 'OK') {
								$('#selected_plumage_code').append('<option value=' + data.payload.new_code + '>' + new_color + '</option>');
								$('#add_plumage_menu_color').val('');
								BREED_FUNC.addPlumageDOM(data.payload.new_code, new_color);
							} else {
								alert(data.status_text);
							}
						},
						error: function(a, b, c) {
							spinner.stop();
							alert('Debug AJAX error trying to send new plumage to server: ' + b);
						}
					});

				}
			}

		});

	},


	loadForm: function(edit_id) {
		// Load edit form form server

		$.ajax({
			url: "/ops/ajax/getBreed",
			type: 'POST',
			timeout: 10000,
			dataType: 'json',
			cache: false,
			data: {breed_id: edit_id, ACCESS_TOKEN: ACCESS_TOKEN},
			success: function(data) {
				if (data.status == 'OK') {
					populateDOM(data.payload.breed, data.payload.plumage_codes);
				} else {
					alert('Debug warning: ' + data.status_text);
				}
			},
			error: function(a, b, c) {
				alert('Debug warning: Could not reach server to get menus ' + b);
			}
		});

		$('#breedForm_breed_id_data').html('<strong>' + edit_id + '</strong>' + '&nbsp;&nbsp;&nbsp; <a id="breed_url" style="text-decoration:none;" onclick="BREED_FUNC.copyToClipboard();">http://www.feather-quest.com/breed/' + edit_id + '</a>');


		function populateDOM(breed_data, plumage_data) {
			$('#breedForm').find('input,select,textarea').each(function(i) {
				if (($(this).attr('id') != 'selected_plumage_code') && ($(this).attr('id') != 'add_plumage_menu_color')) {
					$('#' + $(this).attr('id')).val(breed_data[$(this).attr('id').slice(BREED_FUNC.ops_function.length + 8)]);
				}
			});

			for (var i = 0; i < plumage_data.length; i ++) {
				BREED_FUNC.addPlumageDOM(plumage_data[i].code, plumage_data[i].color, true);
			}

		}

	},


	addPlumageDOM: function(plumage_code, plumage_text, load_flag) {
		// load_flag will be set when loading form for EDIT process as opposed to INSERT new

		$('#plumage_ul').append('<li class="sublist" id="plumage_li_code_' + plumage_code + '"><a href="#" onclick="BREED_FUNC.remove_plumage(' + plumage_code + ');" class="small_delete_button">-</a>' + plumage_text + '</li>');
		
		if (($('#breedForm').data('mode') == 'INSERT') && (!load_flag)) {
			// Mark form as having changed
			$('#breedForm').data('changePending', true);

			$('.form_status').text('Change pending...');
		}

		BREED_FUNC.form_plumage_list.push({code: plumage_code, plumageText: plumage_text});
		localStorage.setItem('APP_STATE', JSON.stringify(APP_STATE));

		// If in EDIT mode and load_flag not set, then send new plumage assignment to server
		if ((APP_STATE.current_function_form_mode == 'UPDATE') && (!load_flag)) {
			var breed_id = APP_STATE.current_function_form_edit_id;
			$.ajax({
				url: "/ops/ajax/addBreedPlumage",
				type: 'POST',
				timeout: 10000,
				dataType: 'json',
				cache: false,
				data: {breed_id: breed_id, plumage_code: plumage_code, ACCESS_TOKEN: ACCESS_TOKEN},
				success: function(data) {
					if (data.status == 'OK') {
						alert('Update complete.');
						
					} else {
						alert('Debug warning trying to add plumage: ' + data.status_text);
					}
				},
				error: function(a, b, c) {
					alert('Debug warning: Could not reach server to add plumage color ' + b);
				}
			});
		}

	},

	
	remove_plumage: function(code) {
		// Handle remove plumage click event

		if (APP_STATE.current_function_form_mode == 'INSERT') {
			BREED_FUNC.remove_plumage_DOM(code);
		} else {
			// UPDATE mode, so remove from database right away

			var breed_id = APP_STATE.current_function_form_edit_id;
			$.ajax({
				url: "/ops/ajax/removePlumage",
				type: 'POST',
				timeout: 10000,
				dataType: 'json',
				cache: false,
				data: {breed_id: breed_id, plumage_code: code, ACCESS_TOKEN: ACCESS_TOKEN},
				success: function(data) {
					if (data.status == 'OK') {
						alert('Update complete.');
						BREED_FUNC.remove_plumage_DOM(code);
					} else {
						alert('Debug warning: ' + data.status_text);
					}
				},
				error: function(a, b, c) {
					alert('Debug warning: Could not reach server to remove plumage color ' + b);
				}
			});

		}
	},


	// Remove a plumage choice form the ul and form data object
	remove_plumage_DOM: function(code) {
		$('#plumage_li_code_' + code).remove();

		for(var i = BREED_FUNC.form_plumage_list.length - 1; i >= 0; i--) {
			if(BREED_FUNC.form_plumage_list[i].code == code) {
			   BREED_FUNC.form_plumage_list.splice(i, 1);
			   localStorage.setItem('APP_STATE', JSON.stringify(APP_STATE));
			   break;
			}
		}

	},


	getMenus: function(callback) {
		// Load form specific menus from server and populate DOM with results

		$.ajax({
			url: "/ops/ajax/getBreedMenus",
			type: 'GET',
			timeout: 10000,
			dataType: 'json',
			success: function(data) {
				if (data.status == 'OK') {
					$('#breed_fields_breed_class_code').html(data.payload.breed_class_menu);
					$('#breed_filter_breed_class_code').html('<option value="">-Breed Class-</option>' + data.payload.breed_class_menu);
					$('#breed_fields_comb_name').html(data.payload.comb_menu);
					$('#selected_plumage_code').html(data.payload.plumage_menu);
					if (callback) {
						callback();
					}
				} else {
					alert('Debug warning: ' + data.status_text);
				}

			},
			error: function(a, b, c) {
				alert('Debug warning: Could not reach server to get menus ' + b);
			}
		});
	},



	postForm: function() {
		// Post EDIT or INSERT form to server

		var ops_function = BREED_FUNC.ops_function;
		var domPrefix = BREED_FUNC.domFieldPrefix;

		// Validate form data
		var is_valid = true;

		// Check all standard required fields
		$('#' + ops_function + 'Form').find('.required').each(function(i) {
			if ($(this).val().length == 0) {
				// Missing data, highlight element
				$(this).css('border-color', '#d00');
				is_valid = false;
			} else {
				// Good data, remove any validation warning style
				$(this).css('border-color', '');
			}
		});

		// Require at least one plumage color
		if (BREED_FUNC.form_plumage_list.length == 0) {
			is_valid = false;
		}

		// Check each number field for numeric values
		if (!isNumber($(domPrefix + 'weight_lbs_cock').val())) {
			$(domPrefix + 'weight_lbs_cock').css('border-color', '#d00');
			is_valid = false;
		} else {
			$(domPrefix + 'weight_lbs_cock').css('border-color', '');
		}

		if (!isNumber($(domPrefix + 'weight_lbs_hen').val())) {
			$(domPrefix + 'weight_lbs_hen').css('border-color', '#d00');
			is_valid = false;
		} else {
			$(domPrefix + 'weight_lbs_hen').css('border-color', '');
		}

		if (!isNumber($(domPrefix + 'weight_lbs_cockerel').val())) {
			$(domPrefix + 'weight_lbs_cockerel').css('border-color', '#d00');
			is_valid = false;
		} else {
			$(domPrefix + 'weight_lbs_cockerel').css('border-color', '');
		}

		if (!isNumber($(domPrefix + 'weight_lbs_pullet').val())) {
			$(domPrefix + 'weight_lbs_pullet').css('border-color', '#d00');
			is_valid = false;
		} else {
			$(domPrefix + 'weight_lbs_pullet').css('border-color', '');
		}

		// Warn user and end process if any validation failed
		if (!is_valid) {
			alert('You are missing required data.');
			return false;
		}


		// Form data is ready to be posted to server
		var post_data = {}
		var handler;

		// Load each standard field into the post_data object
		$('#' + ops_function +'Form').find('input,select,textarea').each(function(i) {
			if (($(this).attr('id') != 'selected_plumage_code') && ($(this).attr('id') != 'add_plumage_menu_color')) {
				post_data[$(this).attr('id').slice(ops_function.length + 8)] = $('#' + $(this).attr('id')).val();
			}
		});

		// Deal with selected list of plumage colors
		post_data.plumage_array = [];
		for (var i = 0; i < BREED_FUNC.form_plumage_list.length; i++) {
			post_data.plumage_array.push(BREED_FUNC.form_plumage_list[i].code);
		}

		// Pick server handler based on mode
		if (APP_STATE.current_function_form_mode == 'INSERT') {
			handler = 'addBreed';
		} else {
			handler = 'updateBreed';
			// Set edit id value to support update process
			post_data.breed_id = APP_STATE.current_function_form_edit_id;
		}

		post_data.ACCESS_TOKEN = ACCESS_TOKEN;

		// Post data to server
		$.ajax({
			url: "/ops/ajax/" + handler,
			type: 'POST',
			timeout: 10000,
			dataType: 'json',
			data: JSON.stringify(post_data),
			processData: false, // Send JSON to server, not post key/val pairs

			success: function(data) {
				if (data.status == 'OK') {
					// alert('Data saved to server.')

					// Mark form as unchanged
					$('#' + ops_function + 'Form').data('changePending', false);

					// Clear form plumage list
					BREED_FUNC.form_plumage_list.length = 0;

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

	},

	// Handle when user clicks on uploads count
	viewUploads: function(breed_id) {
		window.open('/ops/viewBreed/' + breed_id);
	},

	// Handle ability to copy link shortcut to clipboard
	copyToClipboard: function() {
		window.prompt ("Copy to clipboard: Ctrl+C, Enter", $('#breed_url').text());
	}


};
