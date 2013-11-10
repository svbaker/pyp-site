/* MySQL tables to support Pampered Poultry e-commerce site */

/* catalog tables */
CREATE TABLE products (
     id                    INT AUTO_INCREMENT      NOT NULL,
     name                  VARCHAR(240)            NOT NULL,
     cat_code              VARCHAR(40)             NOT NULL,
     size                  VARCHAR(80)             NULL, /* From product_sizes table */
     color                 VARCHAR(120)            NULL,
     price                 DECIMAL(6,2)            NOT NULL,
     on_hand               INT                     NOT NULL,
     status                CHAR(1)                 NOT NULL, /* A=Active, I=Inactive, R=Retired */
PRIMARY KEY(id)  
);

CREATE TABLE product_cats (
     code                  VARCHAR(40)             NOT NULL,
     group_code            VARCHAR(40)             NOT NULL,
     cat_name               VARCHAR(180)            NOT NULL, 
PRIMARY KEY(code) 
);

CREATE TABLE product_cat_groups (
     code                  VARCHAR(40)             NOT NULL,
     cat_group_name        VARCHAR(180)            NOT NULL, 
PRIMARY KEY(code) 
);

CREATE TABLE product_sizes (
     size                  VARCHAR(80)             NOT NULL, /* No spaces - used as a code as well as display */
     order_num             INT                     NOT NULL, /* For sort order */
PRIMARY KEY(size) 
);

INSERT INTO product_sizes (size, order_num) VALUES ('Large', 10);
INSERT INTO product_sizes (size, order_num) VALUES ('Medium', 20);
INSERT INTO product_sizes (size, order_num) VALUES ('Small', 30);
INSERT INTO product_sizes (size, order_num) VALUES ('X-Small', 40);

INSERT INTO product_cat_groups (code, cat_group_name) VALUES ('DIAPERS', 'Diapers');
INSERT INTO product_cat_groups (code, cat_group_name) VALUES ('SADDLES', 'Saddles');
INSERT INTO product_cat_groups (code, cat_group_name) VALUES ('ATTIRE', 'Attire');
INSERT INTO product_cat_groups (code, cat_group_name) VALUES ('SPEC', 'Specials');

INSERT INTO product_cats (code, group_code, cat_name) VALUES ('CHICKEN-DIAPER', 'DIAPERS', 'Chicken Diapers');
INSERT INTO product_cats (code, group_code, cat_name) VALUES ('CHICKEN-SADDLE', 'SADDLES', 'Chicken Saddles');
INSERT INTO product_cats (code, group_code, cat_name) VALUES ('CHICKEN-ATTIRE', 'ATTIRE', 'Chicken Attire');
INSERT INTO product_cats (code, group_code, cat_name) VALUES ('SPECIAL', 'SPEC', 'Specials');


CREATE TABLE order_header (
     order_num           INT                 NOT NULL AUTO_INCREMENT,
     order_date          DATETIME            NOT NULL,
     order_status        CHAR(1)             NOT NULL  DEFAULT 'P',
     order_status_date   DATETIME            NULL,
     gift_status         CHAR(1)             NOT NULL,
     gift_message        TEXT                NULL,
     name                VARCHAR(120)        NOT NULL,
     email               VARCHAR(160)        NOT NULL,
     add1                VARCHAR(120)        NOT NULL,
     add2                VARCHAR(120)        NULL,
     zip                 VARCHAR(40)         NOT NULL,
     city                VARCHAR(120)        NOT NULL,
     country_code        VARCHAR(4)          NOT NULL,
     state               VARCHAR(120)        NOT NULL,
     items_total_cost    DECIMAL(6,2)        NOT NULL,
     shipping_cost       DECIMAL(6,2)        NOT NULL,
     card_type           VARCHAR(40)         NOT NULL,
     card_number         VARCHAR(16)         NOT NULL,
     ccv                 VARCHAR(4)          NOT NULL,
     expire_month        INT                 NOT NULL,
     expire_year         INT                 NOT NULL,
     bill_add1           VARCHAR(120)        NOT NULL,
     bill_add2           VARCHAR(120)        NULL,
     bill_zip            VARCHAR(40)         NOT NULL,
     bill_city           VARCHAR(120)        NOT NULL,
     bill_country_code   VARCHAR(4)          NOT NULL,
     bill_state          VARCHAR(120)        NOT NULL,
     ops_notes           TEXT                NULL,
     encrypted_card_number VARCHAR(255)      NULL,
PRIMARY KEY(order_num)
);

ALTER TABLE order_header AUTO_INCREMENT = 1001;


CREATE TABLE order_detail (
     order_num           INT                 NOT NULL,
     line_item           INT                 NOT NULL,
     line_status         CHAR(1)             NOT NULL  DEFAULT 'P',
     prod_id             INT                 NOT NULL,
     prod_name           VARCHAR(250)        NOT NULL,
     sell_price          DECIMAL(6,2)        NOT NULL,
     qty                 INT                 NOT NULL
);


/* General file uploader data management */
CREATE TABLE file_uploads (
     id               INT AUTO_INCREMENT NOT NULL,
     status           CHAR(1)            NOT NULL  DEFAULT 'A', /* A=Active, I=Inactive */
     control_code     VARCHAR(80)  NOT NULL, /* file upload area/purpose */
     title            VARCHAR(200) NULL,
     user_filename    VARCHAR(250) NULL,
     hash             VARCHAR(80)  NULL, /* null until id is assigned */
     file_ext         VARCHAR(24)  NOT NULL,
     file_url         VARCHAR(200) NULL, /* Full http url of uploaded file */
     thumb_url        VARCHAR(200) NULL, /* Full http url of uploaded file's thumb if created */
     control_rec_id   INT          NULL, /* For some uploades, database id record related to file upload */
     upload_date      DATETIME     NULL,
     image_width      INT          NULL, /* Images only - uploaded image width */
     image_height     INT          NULL, /* Images only - uploaded image height */
     thumb_width      INT          NULL, /* Images only that had a thumbnail created - thumb width */
     thumb_height     INT          NULL, /* Images only that had a thumbnail created - thumb height */
PRIMARY KEY(id)
);


/* Chickipedia tables  */
CREATE TABLE breeds_class (
     code            VARCHAR(20)   NOT NULL,
     class           VARCHAR(120)  NOT NULL,
     parent_class    VARCHAR(40)   NOT NULL,
     description     TEXT          NULL,
PRIMARY KEY(code)
);

INSERT INTO breeds_class (code, class, parent_class) VALUES ('AMC', 'American', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('AC', 'Asiatic', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('EC', 'English', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('MC', 'Mediterranean', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('CC', 'Continental', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('OSBC', 'All Other Standard Breeds', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('GBC', 'Game Bantam', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('SCCLBC', 'Single Comb Clean Legged Bantam', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('RCCLBC', 'Rose Comb Clean Leg Bantam', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('OCCLBC', 'All Other Combs, Clean Legged Bantam', 'Chicken');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('FLBC', 'Feathered Leg Bantam', 'Chicken');

INSERT INTO breeds_class (code, class, parent_class) VALUES ('HD', 'Heavy Weight', 'Duck');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('MD', 'Medium Weight', 'Duck');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('LD', 'Light Weight', 'Duck');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('BD', 'Bantam', 'Duck');

INSERT INTO breeds_class (code, class, parent_class) VALUES ('HG', 'Heavy', 'Geese');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('MG', 'Medium', 'Geese');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('LG', 'Light', 'Geese');

INSERT INTO breeds_class (code, class, parent_class) VALUES ('T', '', 'Turkey');
INSERT INTO breeds_class (code, class, parent_class) VALUES ('GF', '', 'Guinea Fowl');

CREATE TABLE breeds (
     id                  INT  AUTO_INCREMENT  NOT NULL,
     breed_name          VARCHAR(120)         NOT NULL,
     breed_class_code    VARCHAR(20)          NOT NULL,
     breed_is_standard   char(1)              NOT NULL  DEFAULT 'Y', /* Y/N */
     weight_unit         VARCHAR(12)          NOT NULL, /* 'lb' or 'oz' */
     weight_lbs_cock     DECIMAL(5, 2)        NOT NULL,
     weight_lbs_hen      DECIMAL(5, 2)        NOT NULL,
     weight_lbs_cockerel DECIMAL(5, 2)        NOT NULL,
     weight_lbs_pullet   DECIMAL(5, 2)        NOT NULL,
     category            VARCHAR(40)          NOT NULL, /* 'Meat', 'Egg', 'Dual Purpose', 'Ornamental' */
     egg_size            VARCHAR(40)          NOT NULL, /* 'Extra Small', 'Small', 'Medium', 'Large', 'Jumbo' */
     egg_production      VARCHAR(40)          NOT NULL, /* 'Poor', 'Average', 'Excellent' */
     egg_color           VARCHAR(60)          NOT NULL, /* 'White', 'Cream', 'Light brown', 'Brown', 'Chocolate', 'Blue/green' */
     egg_color_notes     VARCHAR(250)         NULL,
     toes                INT                  NOT NULL, /* 4 or 5 */
     leg                 varchar(60)          NOT NULL, /* 'Feathered' or 'Clean' */
     beard               CHAR(1)              NOT NULL, /* Y/N */
     muffs               CHAR(1)              NOT NULL, /* Y/N */
     comb_name           VARCHAR(40)          NOT NULL,
     breed_description   TEXT                 NULL,
     origin              TEXT                 NULL,
     disqualifications   TEXT                 NULL,
     skin_color          VARCHAR(20)          NOT NULL, /* 'Black', 'White', "Yellow" */
     crest               CHAR(1)              NOT NULL, /* Y/N */
PRIMARY KEY(id)
);

CREATE TABLE breed_comb (
     comb_name       VARCHAR(40)   NOT NULL,
     description     TEXT          NULL,
PRIMARY KEY(comb_name)
);

INSERT INTO breed_comb (comb_name, description) VALUES ('Single', 'A simple straight row of spikes beginning at the bird’s nostril and sweeping back its head.');
INSERT INTO breed_comb (comb_name, description) VALUES ('Walnut', 'Solid, almost round and rather lumpy. It is often wider then it is long and covered with small corrugations. There may be two or three small rear points hidden by a crest.');
INSERT INTO breed_comb (comb_name, description) VALUES ('V', 'Formed from two sections. These are well-defined, horn like and joined at the base.');
INSERT INTO breed_comb (comb_name, description) VALUES ('Strawberry', 'Raised slightly on the birds head, a looks like half a strawberry, hence the name.');
INSERT INTO breed_comb (comb_name, description) VALUES ('Rose', 'Flat and close to the bird’s head. Sometimes it will form a point and extend back further than the rest of the comb.');
INSERT INTO breed_comb (comb_name, description) VALUES ('Pea', 'Rows of “peas” side by side, although sometimes there is only one row. Usually uniform in size in shape, however, as the bird matures, this can change becoming irregular in shape and size.');
INSERT INTO breed_comb (comb_name, description) VALUES ('Buttercup', 'A very small single comb in the center with a large one on either side.');
INSERT INTO breed_comb (comb_name, description) VALUES ('Cushion', 'Solid and low. It is moderately small, compact and smooth on top with no spikes for depressions.');


CREATE TABLE breed_plumage (
     code         INT    AUTO_INCREMENT NOT NULL,
     color        TEXT                  NOT NULL,    
PRIMARY KEY(code)
);

CREATE TABLE breed_plumage_map (
     breed_id        INT           NOT NULL,
     plumage_code    INT           NOT NULL,
     standard        CHAR(1)       NOT NULL, /* Y/N */
PRIMARY KEY(breed_id, plumage_code)
);


/* OPS site tables */
CREATE TABLE ops_users (
     userid      varchar(60)     NOT NULL,
     password    varchar(60)     NOT NULL,
     name        varchar(120)    NOT NULL,
     email       varchar(180)    NOT NULL,
     last_login  datetime        NULL,
     logins      int             NOT NULL  DEFAULT 0,
PRIMARY KEY(userid)
);

CREATE TABLE ops_sessions (
     userid           varchar(60)   NOT NULL,
     token            varchar(250)  NULL,
     expire_date      datetime      NULL,
     last_login       datetime      NULL,
     logins           int           NOT NULL  DEFAULT 0
);

INSERT INTO ops_users (userid, password, name, email) VALUES ('YOUR_ADMIN_USR','YOUR_PASSWORD','Full Name','User email address');

/* ---- For photo uploader ------- */
CREATE TABLE posts (
     id                      INT AUTO_INCREMENT NOT NULL,
     breed_id                INT          NOT NULL,
     full_name               VARCHAR(255) NOT NULL,
     farm_name               VARCHAR(255) NULL,
     mailing_address         TEXT         NULL,
     email                   VARCHAR(255) NOT NULL,
     email_optin             CHAR(1)      NOT NULL,
     website                 VARCHAR(255) NULL,
     photo_credit            VARCHAR(255) NULL,
     breed_description       TEXT         NULL,
     breed_personality       TEXT         NULL,
     breedvalue_eggs         CHAR(1)      NOT NULL,
     breedvalue_meat         CHAR(1)      NOT NULL,
     breedvalue_dual         CHAR(1)      NOT NULL,
     breedvalue_pet          CHAR(1)      NOT NULL,
     breedvalue_looks        CHAR(1)      NOT NULL,
     post_date               DATETIME     NULL,
     ip                      VARCHAR(80)  NULL,
     agent                   VARCHAR(255) NULL,
     status                  CHAR(1)      NOT NULL, /* P=Pending review, C=Completed review, A=Award */
PRIMARY KEY(id)
);


CREATE TABLE photo_uploads (
     id               INT AUTO_INCREMENT NOT NULL,
     photo_title      VARCHAR(200) NULL,
     user_filename    VARCHAR(250) NULL,
     hash             VARCHAR(80)  NULL, /* null until id is assigned */
     file_ext         VARCHAR(24)  NOT NULL,
     web_path         VARCHAR(200) NULL,
     post_id          INT          NULL, /* null until post is complete */
     upload_date      DATETIME     NULL,
     upload_status    CHAR(1)      NOT NULL, /* P=Pending, C=Completed post, U=Use, M=Maybe, N=Not use */
     user_comment     TEXT         NULL,
     pyp_comment      TEXT         NULL,
PRIMARY KEY(id)
);
/* ------------- end photo uploader tables ------ */


CREATE TABLE countries (
     id             INT   AUTO_INCREMENT   NOT NULL,
     country        VARCHAR(200)           NOT NULL,
     quick_list     CHAR(1)                NOT NULL  DEFAULT 'N', /* Y/N */
     status         CHAR(1)                NOT NULL  DEFAULT 'A', /* A=Active, I=Inactive */
     PRIMARY KEY(id)
);

INSERT INTO countries (country) VALUES ('Afghanistan');
INSERT INTO countries (country) VALUES ('Albania');
INSERT INTO countries (country) VALUES ('Algeria');
INSERT INTO countries (country) VALUES ('American Samoa');
INSERT INTO countries (country) VALUES ('Andorra');
INSERT INTO countries (country) VALUES ('Angola');
INSERT INTO countries (country) VALUES ('Anguilla');
INSERT INTO countries (country) VALUES ('Antigua and Barbuda');
INSERT INTO countries (country) VALUES ('Argentina');
INSERT INTO countries (country) VALUES ('Armenia');
INSERT INTO countries (country) VALUES ('Aruba');
INSERT INTO countries (country) VALUES ('Australia');
INSERT INTO countries (country) VALUES ('Austria');
INSERT INTO countries (country) VALUES ('Azerbaijan');
INSERT INTO countries (country) VALUES ('Bahamas');
INSERT INTO countries (country) VALUES ('Bahrain');
INSERT INTO countries (country) VALUES ('Bangladesh');
INSERT INTO countries (country) VALUES ('Barbados');
INSERT INTO countries (country) VALUES ('Belarus');
INSERT INTO countries (country) VALUES ('Belgium');
INSERT INTO countries (country) VALUES ('Belize');
INSERT INTO countries (country) VALUES ('Benin');
INSERT INTO countries (country) VALUES ('Bermuda');
INSERT INTO countries (country) VALUES ('Bhutan');
INSERT INTO countries (country) VALUES ('Bolivia');
INSERT INTO countries (country) VALUES ('Bosnia and Herzegovina');
INSERT INTO countries (country) VALUES ('Botswana');
INSERT INTO countries (country) VALUES ('Bouvet Island');
INSERT INTO countries (country) VALUES ('Brazil');
INSERT INTO countries (country) VALUES ('British Indian Ocean Territory');
INSERT INTO countries (country) VALUES ('British Virgin Islands');
INSERT INTO countries (country) VALUES ('Brunei');
INSERT INTO countries (country) VALUES ('Bulgaria');
INSERT INTO countries (country) VALUES ('Burkina Faso');
INSERT INTO countries (country) VALUES ('Burundi');
INSERT INTO countries (country) VALUES ('Cambodia');
INSERT INTO countries (country) VALUES ('Cameroon');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'Canada');
INSERT INTO countries (country) VALUES ('Cape Verde');
INSERT INTO countries (country) VALUES ('Cayman Islands');
INSERT INTO countries (country) VALUES ('Central African Republic');
INSERT INTO countries (country) VALUES ('Chad');
INSERT INTO countries (country) VALUES ('Chile');
INSERT INTO countries (country) VALUES ('China');
INSERT INTO countries (country) VALUES ('Christmas Island');
INSERT INTO countries (country) VALUES ('Cocos (Keeling) Islands');
INSERT INTO countries (country) VALUES ('Colombia');
INSERT INTO countries (country) VALUES ('Comoros');
INSERT INTO countries (country) VALUES ('Congo, Republic of');
INSERT INTO countries (country) VALUES ('Cook Islands');
INSERT INTO countries (country) VALUES ('Costa Rica');
INSERT INTO countries (country) VALUES ('Croatia');
INSERT INTO countries (country) VALUES ('Cuba');
INSERT INTO countries (country) VALUES ('Cyprus');
INSERT INTO countries (country) VALUES ('Czech Republic');
INSERT INTO countries (country) VALUES ('Denmark');
INSERT INTO countries (country) VALUES ('Djibouti');
INSERT INTO countries (country) VALUES ('Dominica');
INSERT INTO countries (country) VALUES ('Dominican Republic');
INSERT INTO countries (country) VALUES ('Ecuador');
INSERT INTO countries (country) VALUES ('Egypt');
INSERT INTO countries (country) VALUES ('El Salvador');
INSERT INTO countries (country) VALUES ('Equatorial Guinea');
INSERT INTO countries (country) VALUES ('Eritrea');
INSERT INTO countries (country) VALUES ('Estonia');
INSERT INTO countries (country) VALUES ('Ethiopia');
INSERT INTO countries (country) VALUES ('Falkland Islands (Malvinas)');
INSERT INTO countries (country) VALUES ('Faroe Islands');
INSERT INTO countries (country) VALUES ('Fiji');
INSERT INTO countries (country) VALUES ('Finland');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'France');
INSERT INTO countries (country) VALUES ('French Guiana');
INSERT INTO countries (country) VALUES ('French Polynesia');
INSERT INTO countries (country) VALUES ('French Southern Territories');
INSERT INTO countries (country) VALUES ('Gabon');
INSERT INTO countries (country) VALUES ('Gambia');
INSERT INTO countries (country) VALUES ('Georgia');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'Germany');
INSERT INTO countries (country) VALUES ('Ghana');
INSERT INTO countries (country) VALUES ('Gibraltar');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'Greece');
INSERT INTO countries (country) VALUES ('Greenland');
INSERT INTO countries (country) VALUES ('Grenada');
INSERT INTO countries (country) VALUES ('Guadeloupe');
INSERT INTO countries (country) VALUES ('Guam');
INSERT INTO countries (country) VALUES ('Guatemala');
INSERT INTO countries (country) VALUES ('Guinea');
INSERT INTO countries (country) VALUES ('Guinea-Bissau');
INSERT INTO countries (country) VALUES ('Guyana');
INSERT INTO countries (country) VALUES ('Haiti');
INSERT INTO countries (country) VALUES ('Heard Island and McDonald Islands');
INSERT INTO countries (country) VALUES ('Holy See (Vatican City State)');
INSERT INTO countries (country) VALUES ('Honduras');
INSERT INTO countries (country) VALUES ('Hong Kong');
INSERT INTO countries (country) VALUES ('Hungary');
INSERT INTO countries (country) VALUES ('Iceland');
INSERT INTO countries (country) VALUES ('India');
INSERT INTO countries (country) VALUES ('Indonesia');
INSERT INTO countries (country) VALUES ('Iran');
INSERT INTO countries (country) VALUES ('Iraq');
INSERT INTO countries (country) VALUES ('Ireland');
INSERT INTO countries (country) VALUES ('Isle of Man');
INSERT INTO countries (country) VALUES ('Israel');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'Italy');
INSERT INTO countries (country) VALUES ('Ivory Coast');
INSERT INTO countries (country) VALUES ('Jamaica');
INSERT INTO countries (country) VALUES ('Japan');
INSERT INTO countries (country) VALUES ('Jordan');
INSERT INTO countries (country) VALUES ('Kazakhstan');
INSERT INTO countries (country) VALUES ('Kenya');
INSERT INTO countries (country) VALUES ('Kiribati');
INSERT INTO countries (country) VALUES ('Kosovo');
INSERT INTO countries (country) VALUES ('Kuwait');
INSERT INTO countries (country) VALUES ('Kyrgyzstan');
INSERT INTO countries (country) VALUES ('Laos');
INSERT INTO countries (country) VALUES ('Latvia');
INSERT INTO countries (country) VALUES ('Lebanon');
INSERT INTO countries (country) VALUES ('Lesotho');
INSERT INTO countries (country) VALUES ('Liberia');
INSERT INTO countries (country) VALUES ('Libya');
INSERT INTO countries (country) VALUES ('Liechtenstein');
INSERT INTO countries (country) VALUES ('Lithuania');
INSERT INTO countries (country) VALUES ('Luxembourg');
INSERT INTO countries (country) VALUES ('Macao');
INSERT INTO countries (country) VALUES ('Macedonia');
INSERT INTO countries (country) VALUES ('Madagascar');
INSERT INTO countries (country) VALUES ('Malawi');
INSERT INTO countries (country) VALUES ('Malaysia');
INSERT INTO countries (country) VALUES ('Maldives');
INSERT INTO countries (country) VALUES ('Mali');
INSERT INTO countries (country) VALUES ('Malta');
INSERT INTO countries (country) VALUES ('Marshall Islands');
INSERT INTO countries (country) VALUES ('Martinique');
INSERT INTO countries (country) VALUES ('Mauritania');
INSERT INTO countries (country) VALUES ('Mauritius');
INSERT INTO countries (country) VALUES ('Mayotte');
INSERT INTO countries (country) VALUES ('Mexico');
INSERT INTO countries (country) VALUES ('Micronesia, Federated States of');
INSERT INTO countries (country) VALUES ('Moldova');
INSERT INTO countries (country) VALUES ('Monaco');
INSERT INTO countries (country) VALUES ('Mongolia');
INSERT INTO countries (country) VALUES ('Montenegro');
INSERT INTO countries (country) VALUES ('Montserrat');
INSERT INTO countries (country) VALUES ('Morocco');
INSERT INTO countries (country) VALUES ('Mozambique');
INSERT INTO countries (country) VALUES ('Myanmar (Burma)');
INSERT INTO countries (country) VALUES ('Namibia');
INSERT INTO countries (country) VALUES ('Nauru');
INSERT INTO countries (country) VALUES ('Nepal');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'Netherlands');
INSERT INTO countries (country) VALUES ('Netherlands Antilles');
INSERT INTO countries (country) VALUES ('New Caledonia');
INSERT INTO countries (country) VALUES ('New Zealand');
INSERT INTO countries (country) VALUES ('Nicaragua');
INSERT INTO countries (country) VALUES ('Niger');
INSERT INTO countries (country) VALUES ('Nigeria');
INSERT INTO countries (country) VALUES ('Niue');
INSERT INTO countries (country) VALUES ('Norfolk Island');
INSERT INTO countries (country) VALUES ('Northern Mariana Islands');
INSERT INTO countries (country) VALUES ('North Korea');
INSERT INTO countries (country) VALUES ('Norway');
INSERT INTO countries (country) VALUES ('Oman');
INSERT INTO countries (country) VALUES ('Pakistan');
INSERT INTO countries (country) VALUES ('Palau');
INSERT INTO countries (country) VALUES ('Palestinian Territory, Occupied');
INSERT INTO countries (country) VALUES ('Panama');
INSERT INTO countries (country) VALUES ('Papua New Guinea');
INSERT INTO countries (country) VALUES ('Paraguay');
INSERT INTO countries (country) VALUES ('Peru');
INSERT INTO countries (country) VALUES ('Philippines');
INSERT INTO countries (country) VALUES ('Poland');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'Portugal');
INSERT INTO countries (country) VALUES ('Puerto Rico');
INSERT INTO countries (country) VALUES ('Qatar');
INSERT INTO countries (country) VALUES ('Reunion');
INSERT INTO countries (country) VALUES ('Romania');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'Russia');
INSERT INTO countries (country) VALUES ('Rwanda');
INSERT INTO countries (country) VALUES ('Saint Helena');
INSERT INTO countries (country) VALUES ('Saint Kitts and Nevis');
INSERT INTO countries (country) VALUES ('Saint Lucia');
INSERT INTO countries (country) VALUES ('Saint Martin (French part)');
INSERT INTO countries (country) VALUES ('Saint Pierre and Miquelon');
INSERT INTO countries (country) VALUES ('Saint Vincent and the Grenadines');
INSERT INTO countries (country) VALUES ('Samoa');
INSERT INTO countries (country) VALUES ('San Marino');
INSERT INTO countries (country) VALUES ('Sao Tome and Principe');
INSERT INTO countries (country) VALUES ('Saudi Arabia');
INSERT INTO countries (country) VALUES ('Senegal');
INSERT INTO countries (country) VALUES ('Serbia');
INSERT INTO countries (country) VALUES ('Seychelles');
INSERT INTO countries (country) VALUES ('Sierra Leone');
INSERT INTO countries (country) VALUES ('Singapore');
INSERT INTO countries (country) VALUES ('Slovakia');
INSERT INTO countries (country) VALUES ('Slovenia');
INSERT INTO countries (country) VALUES ('Solomon Islands');
INSERT INTO countries (country) VALUES ('Somalia');
INSERT INTO countries (country) VALUES ('South Africa');
INSERT INTO countries (country) VALUES ('South Georgia and the South Sandwich Islands');
INSERT INTO countries (country) VALUES ('South Korea');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'Spain');
INSERT INTO countries (country) VALUES ('Sri Lanka');
INSERT INTO countries (country) VALUES ('Sudan');
INSERT INTO countries (country) VALUES ('Suriname');
INSERT INTO countries (country) VALUES ('Svalbard and Jan Mayen');
INSERT INTO countries (country) VALUES ('Swaziland');
INSERT INTO countries (country) VALUES ('Sweden');
INSERT INTO countries (country) VALUES ('Switzerland');
INSERT INTO countries (country) VALUES ('Syria');
INSERT INTO countries (country) VALUES ('Taiwan');
INSERT INTO countries (country) VALUES ('Tajikistan');
INSERT INTO countries (country) VALUES ('Tanzania');
INSERT INTO countries (country) VALUES ('Thailand');
INSERT INTO countries (country) VALUES ('Timor-Leste');
INSERT INTO countries (country) VALUES ('Togo');
INSERT INTO countries (country) VALUES ('Tokelau');
INSERT INTO countries (country) VALUES ('Tonga');
INSERT INTO countries (country) VALUES ('Trinidad');
INSERT INTO countries (country) VALUES ('Tunisia');
INSERT INTO countries (country) VALUES ('Turkey');
INSERT INTO countries (country) VALUES ('Turkmenistan');
INSERT INTO countries (country) VALUES ('Turks and Caicos Islands');
INSERT INTO countries (country) VALUES ('Tuvalu');
INSERT INTO countries (country) VALUES ('Uganda');
INSERT INTO countries (country) VALUES ('Ukraine');
INSERT INTO countries (country) VALUES ('United Arab Emirates');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'United Kingdom');
INSERT INTO countries (quick_list, country) VALUES ('Y', 'United States');
INSERT INTO countries (country) VALUES ('United States Minor Outlying Islands');
INSERT INTO countries (country) VALUES ('Uruguay');
INSERT INTO countries (country) VALUES ('U.S. Virgin Islands');
INSERT INTO countries (country) VALUES ('Uzbekistan');
INSERT INTO countries (country) VALUES ('Vanuatu');
INSERT INTO countries (country) VALUES ('Venezuela');
INSERT INTO countries (country) VALUES ('Vietnam');
INSERT INTO countries (country) VALUES ('Wallis and Futuna');
INSERT INTO countries (country) VALUES ('Western Sahara');
INSERT INTO countries (country) VALUES ('Yemen');
INSERT INTO countries (country) VALUES ('Zaire (Democratic Republic of Congo)');
INSERT INTO countries (country) VALUES ('Zambia');
INSERT INTO countries (country) VALUES ('Zimbabwe');


/* http://liststates.com/ */

CREATE TABLE states (
     country_code        VARCHAR(120)           NOT NULL,
     state_code          VARCHAR(20)            NOT NULL,
     state               VARCHAR(200)           NOT NULL,
     PRIMARY KEY(country_code, state)
);


INSERT INTO states (country_code, state_code, state) VALUES ('US','AL','Alabama');
INSERT INTO states (country_code, state_code, state) VALUES ('US','AK','Alaska');
INSERT INTO states (country_code, state_code, state) VALUES ('US','AZ','Arizona');
INSERT INTO states (country_code, state_code, state) VALUES ('US','AR','Arkansas');
INSERT INTO states (country_code, state_code, state) VALUES ('US','CA','California');
INSERT INTO states (country_code, state_code, state) VALUES ('US','CO','Colorado');
INSERT INTO states (country_code, state_code, state) VALUES ('US','CT','Connecticut');
INSERT INTO states (country_code, state_code, state) VALUES ('US','DE','Delaware');
INSERT INTO states (country_code, state_code, state) VALUES ('US','DC','District Of Columbia');
INSERT INTO states (country_code, state_code, state) VALUES ('US','FL','Florida');
INSERT INTO states (country_code, state_code, state) VALUES ('US','GA','Georgia');
INSERT INTO states (country_code, state_code, state) VALUES ('US','HI','Hawaii');
INSERT INTO states (country_code, state_code, state) VALUES ('US','ID','Idaho');
INSERT INTO states (country_code, state_code, state) VALUES ('US','IL','Illinois');
INSERT INTO states (country_code, state_code, state) VALUES ('US','IN','Indiana');
INSERT INTO states (country_code, state_code, state) VALUES ('US','IA','Iowa');
INSERT INTO states (country_code, state_code, state) VALUES ('US','KS','Kansas');
INSERT INTO states (country_code, state_code, state) VALUES ('US','KY','Kentucky');
INSERT INTO states (country_code, state_code, state) VALUES ('US','LA','Louisiana');
INSERT INTO states (country_code, state_code, state) VALUES ('US','ME','Maine');
INSERT INTO states (country_code, state_code, state) VALUES ('US','MD','Maryland');
INSERT INTO states (country_code, state_code, state) VALUES ('US','MA','Massachusetts');
INSERT INTO states (country_code, state_code, state) VALUES ('US','MI','Michigan');
INSERT INTO states (country_code, state_code, state) VALUES ('US','MN','Minnesota');
INSERT INTO states (country_code, state_code, state) VALUES ('US','MS','Mississippi');
INSERT INTO states (country_code, state_code, state) VALUES ('US','MO','Missouri');
INSERT INTO states (country_code, state_code, state) VALUES ('US','MT','Montana');
INSERT INTO states (country_code, state_code, state) VALUES ('US','NE','Nebraska');
INSERT INTO states (country_code, state_code, state) VALUES ('US','NV','Nevada');
INSERT INTO states (country_code, state_code, state) VALUES ('US','NH','New Hampshire');
INSERT INTO states (country_code, state_code, state) VALUES ('US','NJ','New Jersey');
INSERT INTO states (country_code, state_code, state) VALUES ('US','NM','New Mexico');
INSERT INTO states (country_code, state_code, state) VALUES ('US','NY','New York');
INSERT INTO states (country_code, state_code, state) VALUES ('US','NC','North Carolina');
INSERT INTO states (country_code, state_code, state) VALUES ('US','ND','North Dakota');
INSERT INTO states (country_code, state_code, state) VALUES ('US','OH','Ohio');
INSERT INTO states (country_code, state_code, state) VALUES ('US','OK','Oklahoma');
INSERT INTO states (country_code, state_code, state) VALUES ('US','OR','Oregon');
INSERT INTO states (country_code, state_code, state) VALUES ('US','PW','PALAU');
INSERT INTO states (country_code, state_code, state) VALUES ('US','PA','Pennsylvania');
INSERT INTO states (country_code, state_code, state) VALUES ('US','PR','PUERTO RICO');
INSERT INTO states (country_code, state_code, state) VALUES ('US','RI','Rhode Island');
INSERT INTO states (country_code, state_code, state) VALUES ('US','SC','South Carolina');
INSERT INTO states (country_code, state_code, state) VALUES ('US','SD','South Dakota');
INSERT INTO states (country_code, state_code, state) VALUES ('US','TN','Tennessee');
INSERT INTO states (country_code, state_code, state) VALUES ('US','TX','Texas');
INSERT INTO states (country_code, state_code, state) VALUES ('US','UT','Utah');
INSERT INTO states (country_code, state_code, state) VALUES ('US','VT','Vermont');
INSERT INTO states (country_code, state_code, state) VALUES ('US','VA','Virginia');
INSERT INTO states (country_code, state_code, state) VALUES ('US','WA','Washington');
INSERT INTO states (country_code, state_code, state) VALUES ('US','WV','West Virginia');
INSERT INTO states (country_code, state_code, state) VALUES ('US','WI','Wisconsin');
INSERT INTO states (country_code, state_code, state) VALUES ('US','WY','Wyoming');

INSERT INTO states (country_code, state_code, state) VALUES ('CA','AB','Alberta');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','BC','British Columbia');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','MB','Manitoba');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','NB','New Brunswick');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','NL','Newfoundland');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','NT','Northwest Territories');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','NS','Nova Scotia');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','NU','Nunavut');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','ON','Ontario');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','PE','Prince Edward Island');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','QC','Quebec');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','SK','Saskatchewan');
INSERT INTO states (country_code, state_code, state) VALUES ('CA','YT','Yukon');

