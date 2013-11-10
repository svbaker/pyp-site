// ------- Global TABLE_SPECS object holds all list page column definitions ----------
// - property name is keyed on OPS "function name"
// - value of property is array of column definition objects
// - null db_field means it is a soecial query field provided by back end

var TABLE_SPECS = {};

// breed **********************
TABLE_SPECS['breed'] = [];

	TABLE_SPECS['breed'].push(
		{db_field: 'breeds.breed_name',
		db_alias: 'breed_name',
		col_header: 'Breed',
		col_width: '160px',
		link_javascript_func_name: 'edit',
		link_record_id_db_field: 'breeds.id',
		link_record_id_db_alias: 'breed_id'}
	);

	TABLE_SPECS['breed'].push(
		{db_field: 'breeds_class.parent_class',
		db_alias: 'parent_class',
		col_header: 'Parent Class',
		col_width: '100px'}
	);

	TABLE_SPECS['breed'].push(
		{db_field: 'breeds_class.class',
		db_alias: 'class',
		col_header: 'Class',
		col_width: '180px'}
	);

	TABLE_SPECS['breed'].push(
		{db_field: null, // Subquery on server
		db_alias: 'uploads',
		col_header: '',
		col_width: '59px',
		link_javascript_func_name: 'BREED_FUNC.viewUploads',
		link_record_id_db_field: 'breeds.id',
		link_record_id_db_alias: 'breed_id'}
	);

	TABLE_SPECS['breed'].push(
		{db_field: 'breeds.breed_description',
		db_alias: 'breed_description',
		col_header: 'Description',
		col_width: 'auto'}
	);



// prod **********************
TABLE_SPECS['prod'] = [];

	TABLE_SPECS['prod'].push(
		{db_field: 'products.id',
		db_alias: 'id',
		col_header: 'ID',
		col_width: '40px',
		link_javascript_func_name: 'edit',
		link_record_id_db_field: 'products.id',
		link_record_id_db_alias: 'prod_id'}
	);

	TABLE_SPECS['prod'].push(
		{db_field: 'products.name',
		db_alias: 'name',
		col_header: 'Product Name',
		col_width: '150px'}
	);

	TABLE_SPECS['prod'].push(
		{db_field: 'product_cats.cat_name',
		db_alias: 'cat_name',
		col_header: 'Category',
		col_width: '110px'}
	);

	TABLE_SPECS['prod'].push(
		{db_field: 'products.size',
		db_alias: 'size',
		col_header: 'Size',
		col_width: '70px'}
	);

	TABLE_SPECS['prod'].push(
		{db_field: 'products.color',
		db_alias: 'color',
		col_header: 'Color',
		col_width: '80px'}
	);

	TABLE_SPECS['prod'].push(
		{db_field: null, // Subquery on server
		db_alias: 'img_name',
		col_header: 'Image',
		col_width: '70px'}
	);

	TABLE_SPECS['prod'].push(
		{db_field: 'products.price',
		db_alias: 'price',
		col_header: 'Price',
		col_width: '90px',
		col_type: 'number'}
	);

	TABLE_SPECS['prod'].push(
		{db_field: 'products.on_hand',
		db_alias: 'on_hand',
		col_header: 'On hand',
		col_width: '90px',
		col_type: 'number'}
	);



// order **********************
TABLE_SPECS['order'] = [];

	TABLE_SPECS['order'].push(
		{db_field: 'order_header.order_num',
		db_alias: 'order_num',
		col_header: 'Order #',
		col_width: '60px',
		link_javascript_func_name: 'edit',
		link_record_id_db_field: 'order_header.order_num',
		link_record_id_db_alias: 'edit_order_num'}
	);

	TABLE_SPECS['order'].push(
		{db_field: 'order_header.order_num',
		db_alias: 'invoice',
		col_header: 'Invoice',
		col_width: '35px',
		link_javascript_func_name: 'ORDER_FUNC.invoice',
		link_record_id_db_field: 'order_header.order_num',
		link_record_id_db_alias: 'invoice_order_num'}
	);

	TABLE_SPECS['order'].push(
		{db_field: 'order_header.order_date',
		db_alias: 'order_date',
		col_header: 'Order Date',
		col_width: '130px'}
	);

	TABLE_SPECS['order'].push(
		{db_field: 'order_header.order_status',
		db_alias: 'order_status',
		col_header: 'Status',
		col_width: '70px'}
	);

	TABLE_SPECS['order'].push(
		{db_field: 'order_header.name',
		db_alias: 'name',
		col_header: 'Name',
		col_width: '100px'}
	);

	TABLE_SPECS['order'].push(
		{db_field: 'order_header.email',
		db_alias: 'email',
		col_header: 'Email'}
	);

	TABLE_SPECS['order'].push(
		{db_field: 'order_header.city',
		db_alias: 'city',
		col_header: 'City',
		col_width: '100px'}
	);

	TABLE_SPECS['order'].push(
		{db_field: 'order_header.state',
		db_alias: 'state',
		col_header: 'State',
		col_width: '40px'}
	);

	TABLE_SPECS['order'].push(
		{db_field: null, // Subquery on server
		db_alias: 'qty',
		col_header: 'Qty',
		col_width: '59px',
		col_type: 'number'}
	);

	TABLE_SPECS['order'].push(
		{db_field: null, // Subquery on server
		db_alias: 'total',
		col_header: 'Total',
		col_width: '59px',
		col_type: 'number'}
	);
