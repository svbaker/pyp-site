// Persistant application state
var APP_STATE;
var ACCESS_TOKEN;
var UploaderTimerId;

$(document).ready(function() {

	ACCESS_TOKEN = localStorage.getItem('token');

	// Set layout width/heights based on current window size
	var wh = $(window).height(); /* window.screen.availHeight; */
	var ww = $(window).width();  /* window.screen.availWidth; */
	var mainWindow_height = wh - $('#shell_header').height();
	$('.shell_mainWindow').css('height', mainWindow_height + 'px');

	// Add handler to re-set width/heights whenever there is a window size change event
	$(window).resize(function() {
		var wh = $(window).height(); /* window.screen.availHeight; */
		var mainWindow_height = wh - $('#shell_header').height();
		$('.shell_mainWindow').css('height', mainWindow_height + 'px');
	});


	// Load DOM based on table specs
	var col_specs;
	var html;

	for (prop in TABLE_SPECS) {
		html = '<colgroup>';
		col_specs = TABLE_SPECS[prop];
		for (var i = 0; i < col_specs.length; i++) {
			if (col_specs[i].col_width) { // Ignore NULL column width fields - these are not for display
				html += '<col style="width:' + col_specs[i].col_width + ';">';
			}
		}

		html += '</colgroup>';
		$('#' + prop + 'ListTable').append(html)
	}


	// Init app state
	var app_state_string = localStorage.getItem('APP_STATE');

	if (app_state_string) {
		APP_STATE = JSON.parse(app_state_string);

		// Re-open prior open function if there was one
		if (APP_STATE.current_function) {
			open_func(APP_STATE.current_function);
		}

	} else {
		APP_STATE = {};
	}


	// Verify user's log in status
	var userid = localStorage.getItem('userid');

	// If there is no userid or if their session has expired, clear localStorage and have them log in
	if (userid === null) {
		localStorage.clear();
	} else {
		// User already logged in - hide login modal
		$('#shell_overlay').hide();
		$('#shell_login').hide();
		ACCESS_TOKEN = localStorage.getItem('token');
	}


	// Set up event handlers ***************************************

	// Mark form as "pending change" if any fields are changed
	$('.data_form').on('change', 'input, select, textarea', function() {
		var thisForm = $(this).closest('.shell_mainWindow');
		thisForm.find('.form_status').text('Change pending...');
		thisForm.data('changePending', true);

		// Remove potential validation style
		$(this).css('border-color', '');
	});

	// Login button
	$('#shell_login_button').click(function() {
		login();
	});

	$('.shell_login_form').focus(function() {
		$('#shell_loginMessage').hide(300);
	});

	// Logout button
	$('#logoutButton').click(function(event) {
		event.preventDefault();
		localStorage.clear();
		$('#shell_overlay').show(500);
		$('#shell_login').show(500, function() {
			window.location.reload();
		});
	});

	// Main OPS nav links
	$('.shell_nav_links').click(function(event) {
		event.preventDefault();
		open_func($(this).attr('href'), $(this));
	});

	// Close form button
	$('.closeForm').click(function(event) {
		event.preventDefault();
		close_form(APP_STATE.current_function);
	});

	// Add form button
	$('.addForm').click(function(event) {
		event.preventDefault();
		open_form(APP_STATE.current_function, 'INSERT');
	});



	// Handle remove uploaded image clicks
	$('.form_images-list').on('click', '.remove', function() {

		var ops_function = APP_STATE.current_function;
		var db_id = $(this).parent().parent().attr('data-dbid');
		var thisDomElem = $(this).parent().parent();

		// Deactivate database record
		$.ajax({
			url: "/ops/ajax/retireFileUpload",
			type: 'POST',
			timeout: 10000,
			dataType: 'json',
			data: JSON.stringify({id: db_id, ACCESS_TOKEN: ACCESS_TOKEN}),
			processData: false, // Send JSON to server, not post key/vals

			success: function(data) {
				if (data.status == 'OK') {
					finalizeDomCleanup();
				} else {
					alert('Error removing uploaded file from server: ' + data.status_text);
					return false;
				}
			},
			error: function(a, b, c) {
				alert('Error removing uploaded file from server: Could not reach server: ' + b);
				return false;
			}
		});

		function finalizeDomCleanup() {
			var imgUploadOpts = getImgUploadOpts(ops_function);
			var max_files = $("#" + ops_function + "_image_uploadForm input[name='max_files']").val();
			var current_uploads = $('#' + ops_function + 'Form_uploads_list' + ' .form_image-box.active').length;

			thisDomElem.remove();

			// If final image was removed, re-add upload form item
			// If !max_files then there was no add item, so it must have been removed
			if ((current_uploads == (max_files)) || (!max_files)) {

				// Only get the new add form list item
				imgUploadOpts.addFormOnly = true;

				$('#' + ops_function + 'Form_uploads_list').append(genImgUploadHtml(imgUploadOpts));

				UploaderTimerId = setInterval(function() {
					if($('#' + ops_function + '_userImageInput').val() !== '') {
						clearInterval(UploaderTimerId);
						$('#' + ops_function + '_image_uploadForm').submit();
					}
				}, 500);

				// Attache submit handler for new file upload form
				$('#' + ops_function + '_image_uploadForm').submit(imageUploadSubmitFunction);

			} else {
				$('#' + ops_function + 'Form_uploads_list').append('<li class="form_image-box empty" style="' + imgUploadOpts.styles.surroundSize + '"><div style="' + imgUploadOpts.styles.surroundSize + '"></div></li>');
			}
			return false;
		}


	});




	// Form submit
	$('.postForm').click(function(event) {
		event.preventDefault();

		switch (APP_STATE.current_function) {
			case 'breed':
				BREED_FUNC.postForm();
				break;

			case 'prod':
				PROD_FUNC.postForm();
				break;

			case 'order':
				ORDER_FUNC.postForm();
				break;
		}

	});

	// Filter button
	$('.filterButton').click(function(event) {
		event.preventDefault();
		filterList($(this).attr('href'), $(this));
	});


	// Initialize local functions
	BREED_FUNC.init();
	PROD_FUNC.init();

});


// Process login ****************************
function login() {

	var userid = $('#loginUserid').val();
	var pwd = $('#LoginPwd').val();

	var spinner = ajaxWaitingStatus(document.getElementById('shell_statusLocation'));

	$.ajax({
		url: "/ops/ajax/login",
		type: 'POST',
		cache: false,
		timeout: 10000,
		dataType: 'json',
		data: {userid: userid, pwd: pwd},
		success: function(data) {

			spinner.stop();

			if (data.status == 'OK') {

				localStorage.setItem('userid', userid);
				localStorage.setItem('token', data.payload.token);
				localStorage.setItem('email', data.payload.email);
				localStorage.setItem('name', data.payload.name);

				ACCESS_TOKEN = data.payload.token;

				$('#shell_loginMessage').html('');
				$('#shell_loginMessage').hide();

				$('#shell_login').hide(400);
				$('#shell_overlay').hide(400);

			} else {
				$('#shell_loginMessage').html(data.status_text);
				$('#shell_loginMessage').show(300);
			}

		},
		error: function(a, b, c) {
			spinner.stop();
			$('#shell_loginMessage').html('Could not reach server, please try again. ' + b);
			$('#shell_loginMessage').show(300);
			// alert('Could not reach server, please try again. ' + b);
		}
	});

}



// Route form edit link click
function edit(edit_id) {
	open_form(APP_STATE.current_function, 'UPDATE', edit_id);
}


// Change current app function
function open_func(ops_function, link) {

	// Hide current open function container
	if (APP_STATE.current_function) {
		$('#' + APP_STATE.current_function +'FunctionsContainer').hide();
	}
	
	// Get any dynamic menus needed by function
	getMenus(ops_function);

	// Refresh list page
	filterList(ops_function, 'init');

	// Show the new function's container
	$('#' + ops_function +'FunctionsContainer').show();

	// Update and save app state change
	APP_STATE.current_function = ops_function;

	// If first use of this function, default page to List
	if (!APP_STATE.current_function_page) {
		APP_STATE.current_function_page = 'List';
	}

	APP_STATE.current_function_form_mode = null; // Can become INSERT or EDIT
	APP_STATE.current_function_form_edit_id = null; // Can become record id to edit

	localStorage.setItem('APP_STATE', JSON.stringify(APP_STATE));

}



// Open a form in INSERT or UPDATE mode. UPDATE mode requires an edit_id to load.
function open_form(ops_function, mode, edit_id) {

	// Hide current function page
	$('#' + ops_function + APP_STATE.current_function_page).hide();

	// Call close_form to clear form contents, and pass callback to conitue the open process
	close_form(ops_function, function() {

		// Show form function
		$('#' + ops_function + 'Form').show();

		// Get any dynamic menus from server, and pass callback to continue the open process
		getMenus(ops_function, function() {
			if (mode == 'INSERT') {
				// Set form text and hide any fields specific to edit form only
				$('#' + ops_function + 'Form .func_title.verb').text('Add');
				$('#' + ops_function + 'Form .postFormVerb').text('Add');
				$('#' + ops_function + 'Form .editOnly').hide();
				// Hide file uploader section if present
				$('#' + ops_function + 'Form .form_file_upload_section').hide();

				// Call function soecific INSERT form load logic
				switch (ops_function) {
					case 'prod':
						PROD_FUNC.setupAddForm();
						break;
				}

			} else {
				// mode = UPDATE
				// Set form text, show any fields specific to edit mode
				$('#' + ops_function + 'Form .func_title.verb').text('Edit');
				$('#' + ops_function + 'Form .postFormVerb').text('Update');
				$('#' + ops_function + 'Form .editOnly').show();

				// Show file uploader section if present
				$('#' + ops_function + 'Form .form_file_upload_section').show();

				// Set control rec id for uploades
				$('#' + ops_function + '_control_rec_id').val(edit_id);

				// Call function soecific UPDATE form load logic
				switch (ops_function) {
					case 'breed':
						BREED_FUNC.loadForm(edit_id);
						break;

					case 'prod':
						PROD_FUNC.loadForm(edit_id);
						break;

					case 'order':
						ORDER_FUNC.loadForm(edit_id);
						break;
				}
				
			}

			// Clear pending changes flag for this form
			$('#' + ops_function + 'Form').data('changePending', false);

			// Update and save app state
			APP_STATE.current_function_page = 'Form';
			APP_STATE.current_function_form_mode = mode;
			if (edit_id) {
				APP_STATE.current_function_form_edit_id = edit_id;
			} else {
				APP_STATE.current_function_form_edit_id = null;
			}

			localStorage.setItem('APP_STATE', JSON.stringify(APP_STATE));
		});

	});

}


// Build dynamic menus for a given function by routing to function-specific coude
// Execute callback when complete
function getMenus(ops_function, callback) {
	switch (ops_function) {

		case 'breed':
			BREED_FUNC.getMenus(callback);
			break;

		case 'prod':
			PROD_FUNC.getMenus(callback);
			break;

		default:
			if (callback) {
				callback();
			}

	}
}



// Close form page ********************
// If callback is provided, this will be run once the form is cleared
// If no callback is provided, this funciton will finish by hiding the form and showing the list screen
function close_form(ops_function, callback) {

	var function_container_id = '#' + ops_function + 'Form';
	var form_ref = $('#' + ops_function + 'Form_form');

	// Warn user if they have pending form updates
	if ($(function_container_id).data('changePending')) {
		if (!confirm('You have changes pending, do you want to continue to close the form and lose your changes?')) {
			return false;
		}
	}

	// Clear form's standard field types
	$(function_container_id + ' .data_form').val('');

	// Clear form status text message
	$(function_container_id + ' .form_status').text('');

	// Clear any form validation styles
	$('#' + ops_function + 'Form').find('.required').css('border-color', '');

	// Clear "pending changes" flag for this form
	$('#' + ops_function + 'Form').data('changePending', false);

	// Clear any function specific form data
	switch (ops_function) {

		case 'breed':
			BREED_FUNC.form_plumage_list.length = 0;
			$('#plumage_ul').empty();
			$('#breedForm_breed_id_data').html('');
			break;

	}

	// Execute callback if there is one
	if (callback) {
		callback();
	} else {
		// No callback, so go to list page

		// Clear any form timers if they exist
		if (UploaderTimerId) {
			clearInterval(UploaderTimerId);
			UploaderTimerId = null;
		}

		// Update and save app state
		APP_STATE.current_function_form_mode = null;
		APP_STATE.current_function_form_edit_id = null;
		localStorage.setItem('APP_STATE', JSON.stringify(APP_STATE));

		filterList(ops_function);

	}

}


// Get list data from server based on c ontrol panel filter data
// Pass mode 'init' to include creation of table header row as well.
function filterList(ops_function, mode) {

	// If filter button clicked from form page, change to list page
	if (APP_STATE.current_function_page != 'List') {
		$('#' + ops_function + 'Form').hide();
		$('#' + ops_function + 'List').show();
		APP_STATE.current_function_page = 'List';
		localStorage.setItem('APP_STATE', JSON.stringify(APP_STATE));
	}

	
	var filterData = {};
	var filterVars = {};

	// Get query settings from list table column specifications
	filterData.query_settings = {
		ops_function: ops_function,
		cols: TABLE_SPECS[ops_function]
	}

	// Get filter variables from control panel
	$('#' + ops_function + 'ControlPanel_form').find('.filterField').each(function() {
		var fieldName = $(this).attr('id').slice(ops_function.length + 8);
		var fieldValue = $(this).val();
		filterVars[fieldName] = fieldValue;
	});

	filterData.filter_vars = filterVars;

	// Add sort params
	if (APP_STATE[ops_function]) {
		sortList = APP_STATE[ops_function];
	} else {
		sortList = [];
	}

	filterData.sort_list = sortList;
	filterData.ACCESS_TOKEN = ACCESS_TOKEN;

	// Send parameters to server and get matching list table data
	$.ajax({
		url: "/ops/ajax/filterList",
		type: 'POST',
		timeout: 10000,
		dataType: 'json',
		data: JSON.stringify(filterData),
		processData: false, // Send JSON to server, not post key/vals

		success: function(data) {
			if (data.status == 'OK') {
				fillListTable(data.payload.rows, mode);
			} else {
				alert('Debug warning: ' + data.status_text);
			}
		},
		error: function(a, b, c) {
			alert('Debug warning: Could not reach server to get menus ' + b);
		}
	});

	// Populate table DOM from server results
	function fillListTable(rows, mode) {

		var html = '';
		var applied_col_classes;

		// Populate table header *****************
		var cols = TABLE_SPECS[ops_function];

		if (mode == 'init') {
			html = '<thead><tr class="shell_listTable">';
			$('#' + ops_function + 'ListTable thead').remove();

			for (var i = 0; i < cols.length; i++) {
				if (cols[i].col_width) { // Ignore null col_width - these are not for display
					applied_col_classes = '';

					if (cols[i].col_type == 'number') {
						applied_col_classes = ' number';
					}

					html += '<th class="shell_listTable' + applied_col_classes + '" onclick="addSort(\'' + cols[i].db_field + '\');">';
					html += cols[i].col_header;
					html += '</th>';
				}
			}

			html += '</tr></thead>';

			$('#' + ops_function + 'ListTable').append(html);
		}

		// Populate table body *******************
		html = '';
		$('#' + ops_function + 'ListTable tbody').remove();

		for (var i = 0; i < rows.length; i++) {
			
			html += '<tr class="shell_listTable">';

			for (var c = 0; c < cols.length; c++) {

				if (cols[c].col_width) { // Ignore null col_width - these are not for displayu

					applied_col_classes = '';

					// For auto width columns, change td class to allow size to open up as needed
					if (cols[c].col_width == 'auto') {
						applied_col_classes = ' stretch';
					}

					if (cols[c].col_type == 'number') {
						applied_col_classes = ' number';
					}

					html += '<td class="shell_listTable' + applied_col_classes + '">';
					if (cols[c].link_record_id_db_field) {
						html += '<a class="shell_listTable" onclick="' + cols[c].link_javascript_func_name + '(';
						html += rows[i][cols[c].link_record_id_db_alias] + ');">';
						html += prettyCol(rows[i][cols[c].db_alias]);
						html += '</a>'
					} else {
						
						html += formatListCol(rows[i][cols[c].db_alias], cols[c].db_alias);
						
					}
					html += '</td>';
				}

			}

			html += '</tr>';
		}

		$('#' + ops_function + 'ListTable').append(html);

	}


	function formatListCol(data, db_col_alias, opt_data) {

		switch (ops_function) {
			case 'breed':
				switch (db_col_alias) {

					default:
						return prettyCol(data);
						break;
				}
				break;

			case 'prod':
				switch (db_col_alias) {

					case 'img_name':
						if (data) {
							return '<a href="/images/site/products/' + data + '" target="_new" class="shell_listTable">' + data + '</a>';
						} else {
							return '';
						}
						break;

					case 'price':
						return '$' + formatCurrency(data);
						break;

					default:
						return prettyCol(data);
						break;
				}
				
				break;


			case 'order':
				switch (db_col_alias) {

					case 'order_date':
						return formatDateTime(data);
						break;

					case 'order_status':
						return formatOrderStatus(data);
						break;

					case 'email':
						return formatEmailLink(data);
						break;

					case 'total':
						return '$' + formatCurrency(data);
						break;

					default:
						return prettyCol(data);
						break;
				}
				break;

		}
	}

	// Convert null values to blank
	function prettyCol(val) {
		if (val) {
			return val;
		} else {
			if (val == 0) {
				return '0';
			} else {
				return '';
			}
		}
	}

}

function addSort(field) {
	var sortList;
	var ops_function = APP_STATE.current_function;

	if (APP_STATE[ops_function]) {
		sortList = APP_STATE[ops_function];
	} else {
		sortList = [];
	}

	// Check if primry sort was clicked again so we know to flip acs/desc
	if (sortList.length > 0) {
		if (sortList[0].field == field) {
			if (sortList[0].sortOrder == 'DESC') {
				sortList[0].sortOrder = 'ASC';
			} else {
				sortList[0].sortOrder = 'DESC';
			}

			// alert('New sort obj = ' + JSON.stringify(sortList));
			APP_STATE[ops_function] = sortList;
			localStorage.setItem('APP_STATE', JSON.stringify(APP_STATE));
			filterList(ops_function);
			return;
		}
	}

	// Add new sort
	sortList.unshift({
		field: field,
		sortOrder: 'ASC'
	});

	// Only sort 3 columns at most
	if (sortList.length > 3) {
		sortList.pop();
	}

	// If new sort was already in sort list, purge it out
	// Start at 2nd item of list
	for (var i = 1; i < sortList.length; i++) {
		if (sortList[i].field == field) {
			sortList.splice(i);
		}
	}

	// alert('New sort obj = ' + JSON.stringify(sortList));
	APP_STATE[ops_function] = sortList;
	localStorage.setItem('APP_STATE', JSON.stringify(APP_STATE));
	filterList(ops_function);
	return;

}

// Create a "waiting spinner" centered in given DOM element
function ajaxWaitingStatus(locationTarget) {
	var opts = {
	  lines: 13, // The number of lines to draw
	  length: 7, // The length of each line
	  width: 4, // The line thickness
	  radius: 10, // The radius of the inner circle
	  corners: 1, // Corner roundness (0..1)
	  rotate: 0, // The rotation offset
	  color: '#666', // #rgb or #rrggbb
	  speed: 1, // Rounds per second
	  trail: 60, // Afterglow percentage
	  shadow: false, // Whether to render a shadow
	  hwaccel: false, // Whether to use hardware acceleration
	  className: 'spinner', // The CSS class to assign to the spinner
	  zIndex: 2e9, // The z-index (defaults to 2000000000)
	  top: 'auto', // Top position relative to parent in px
	  left: 'auto' // Left position relative to parent in px
	};
	
	var spinner = new Spinner(opts).spin(locationTarget);

	return spinner;
}





// Handle image uploader form submit
var imageUploadSubmitFunction = function() {
	var ops_function = APP_STATE.current_function
	var imgUploadOpts = getImgUploadOpts(ops_function);
	var filesToUpload = document.getElementById(ops_function + '_userImageInput').files.length;
	var max_files = $("#" + ops_function + "_image_uploadForm input[name='max_files']").val();
	var current_uploads = $('#' + ops_function + 'Form_uploads_list' + ' .form_image-box.active').length;

	if (filesToUpload + current_uploads > max_files) {
		if (current_uploads == 0) {
			alert('Oh dear, heavens to etsy! You can only upload ' + max_files + ' images.');
		} else {
			if (current_uploads == (max_files - 1)) {
				alert('Oh dear, heavens to etsy! You can only add one more photo.');
			} else {
				alert('Oh dear, heavens to etsy! You can only add ' + (max_files - current_uploads) + ' more images.');
			}
		}

		document.getElementById(ops_function + "_image_uploadForm").reset();

		UploaderTimerId = setInterval(function() {
			if($('#' + ops_function + '_userImageInput').val() !== '') {
				clearInterval(UploaderTimerId);
				$('#' + ops_function + '_image_uploadForm').submit();
			}
		}, 500);



		return false;
	}


	// Upload files
	var spinner = ajaxWaitingStatus(document.getElementById(ops_function + '_image_add'));
	$('#' + ops_function + '_loading_pane').show();

	// alert('Uploading...');

	// IMPORTANT: FireFox needs to expect JSON response as dataType text for some reason
	$(this).ajaxSubmit({                                                                                                                 

		dataType: 'text',

		error: function(xhr) {
			spinner.stop();
			$('#' + ops_function + '_loading_pane').hide();
			alert('Upload Error: ' + xhr.status);
		},

		success: function(response) {
			spinner.stop();
			$('#' + ops_function + '_loading_pane').hide();

			res = JSON.parse(response);

			if(res.status == 'ERROR') {
				alert(res.status_msg);
				return;
			}

			var uploadedFiles = res.uploads;
			var new_li_html = '';

			for (var i = 0; i < uploadedFiles.length; i++) {

				new_li_html += '<li class="form_image-box active" data-dbid="' + uploadedFiles[i].id +'" style="' + imgUploadOpts.styles.surroundSize + '">';
				new_li_html += '<div class="form_image-container" style="';
				new_li_html += 'background: url(' + uploadedFiles[i].img_thumb_path + ') no-repeat left top;';
				new_li_html += 'background-position: center;';
				new_li_html += 'background-size: cover;' + imgUploadOpts.styles.thumbSize;
				new_li_html += '"><a href="#" class="remove"></a>';
				new_li_html += '<a href="' + uploadedFiles[i].img_path + '" rel="lightbox" title="" class="preview"></a>';
				new_li_html += '</div></li>';

			}

			$('#' + ops_function + '_image_add').before(new_li_html)

			$('#' + ops_function + 'Form_uploads_list > li').slice(max_files).remove();


			// Upload complete, so reset form and restart timer
			if ($('#' + ops_function + 'Form_uploads_list .form_image-box.active').length < (max_files)) {
				document.getElementById(ops_function + '_image_uploadForm').reset();

				UploaderTimerId = setInterval(function() {
					if($('#' + ops_function + '_userImageInput').val() !== '') {
						clearInterval(UploaderTimerId);
						$('#' + ops_function + '_image_uploadForm').submit();
					}
				}, 500);

			}

		}
	});

	// Have to stop the form from submitting and causing a page refresh        
	return false;
}




/* Generate DOM HTML for image uploading.
	Options:
		ops_function: valid ops_function name
		site_path: path to uploaded images to relative to public root, ex: '/images/myfolder/'
		max_files: Total images that cen be uploaded - DEFAULTS to 1
		control_code: Code to assocate images with this function/use. Passed to DB
		control_rec_id: DB record ID image is associated with. Passed to DB if supplied
		thumb_size: {width: ###, height: ###}
		addFormOnly: true/false - default is false
*/
function genImgUploadHtml(opts) {
	var max_files, addFormOnly;
	var html = '';

	max_files = opts.max_files || 1;
	addFormOnly = opts.addFormOnly || false;

	html += '<li class="form_image-box" id="' + opts.ops_function + '_image_add" style="' + opts.styles.surroundSize + '">';
	html += '<form id="' + opts.ops_function + '_image_uploadForm" class="form_uploader_form" method="post" enctype="multipart/form-data" action="/ops/file-uploader">';
	html += '<input type="hidden" name="max_files" value="' + max_files + '">';
	html += '<input type="hidden" name="site_path" value="' + opts.site_path + '">';
	html += '<input type="hidden" name="control_code" value="' + opts.control_code + '">';
	html += '<input type="hidden" name="control_rec_id" id="prod_control_rec_id" value="' + opts.control_rec_id + '">';
	html += "<input type='hidden' name='thumbsize' value='" + JSON.stringify(opts.thumb_size) + "'>";
	html += '<div class="form_upload-container" style="' + opts.styles.surroundSize + '">';
	html += '<input class="form_image-upload" style="' + opts.styles.inputSize + '" type="file" id="prod_userImageInput" name="userImages" multiple="multiple" accept="image/*"/>';
	html += '</div>';
	html += '<div class="form_add-images-button" style="' + opts.styles.addButtonSize + '">';
	html += '<span class="form_button-add"></span>';
	html += '<span>Add Image</span>';
	html += '</div>';
	html += '<div class="form_loading-container" style="' + opts.styles.surroundSize + '" id="prod_loading_pane"></div>';
	html += '</form>';
	html += '</li>';

	if (!addFormOnly) {
		for (var i = 1; i <= (max_files - 1); i++) {
			html += '<li class="form_image-box empty" style="' + opts.styles.surroundSize + '"><div style="' + opts.styles.surroundSize + '"></div></li>';
		}
	}

	return html;
}


// Get image uploader options form relevant local function
function getImgUploadOpts(ops_function) {
	switch (ops_function) {
		case 'prod':
			return PROD_FUNC.getImgUploadOptions();
			break;
	}
}


// General functions ***********************
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function formatDateTime(x) {

	var d = new Date(x);

	var curr_date;
	var curr_month;
	var curr_year;
	var formattedDate;
	var a_p;
	var curr_min;
	var formattedTime;
	var curr_hour;
	var curr_min;

	if (d) {

		curr_date = d.getDate();
		curr_month = d.getMonth() + 1;
		curr_year = d.getFullYear();
		formattedDate = curr_month + '/' + curr_date + '/' + curr_year;

		a_p = '';
		curr_min, formattedTime;
		curr_hour = d.getHours();
		curr_min = d.getMinutes();

		if (curr_hour < 12) {
		   a_p = 'AM';
		} else {
		   a_p = 'PM';
		}

		if (curr_hour == 0) {
		   curr_hour = 12;
		}

		if (curr_hour > 12) {
		   curr_hour = curr_hour - 12;
		}

		formattedTime = (curr_hour + ':' + makeTwo(curr_min) + ' ' + a_p);

		return formattedDate + ' ' + formattedTime;

	} else {
		return '';
	}

	function makeTwo(x) {
		return ('0' + String(x)).slice(0, 2);
	}

}


function formatOrderStatus(status_code) {
	switch (status_code) {
		case 'P':
			return 'Pending';
			break;
		case 'C':
			return 'Complete';
			break;
		case 'X':
			return "Canceled";
			break;
		default:
			return status_code;
			break;
	}
}

function formatEmailLink(email) {
	if (email) {
		return '<a class="shell_listTable" href="mailto:' + email + '">' + email + '</a>';
	} else {
		return '';
	}
}

function formatCurrency(num) {
	num = isNaN(num) || num === '' || num === null ? 0.00 : num;
	return parseFloat(num).toFixed(2);
}

function formatText(x) {
	if (x) {
		return x.replace(/(\r\n|\n|\r)/g,"<br />");
	} else {
		return '';
	}
}
