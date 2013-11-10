$(document).ready(function() {
	var order_conf_num = getCookie('order_conf_num');

	if (!order_conf_num) {
		window.location.href = '/';
	}

	$('#order_conf_num').html('#' + order_conf_num);
	setCookie('order_conf_num', '');
	
});
