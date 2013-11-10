## Settings Files

These are the files used to set your development/production settings such as user id's, passwords, and paths, etc. They are ignored via the .gitignore file so they are not shared/tracked in version control or get pushed to production by accident.

### **env.json**
env.json goes at the root of the project at the same level as the server.js file. Details:

    {
        "port": Port main site runs on
        "sslport": Port SSL site runs on
        "host": Host of site such as www.yoursite.com,
        "db": {
            "host": MySQL server path. Use "localhost" if on the local server
            "database": MySQL Database name
            "user": Datbase user id
            "password": Database password
    },
        "email": {
            "user": SMTP email user name
            "password": email password 
            "host": Path to SMTP server
            "ssl": true/false depending on your SMTP server configuration
    },
        "encryption_key": aes256 key for DB field encryption,
        "webroot_path": full local server path to the node site /public folder,
        "env_mode": "PROD" or "DEV" (changes logging detail and email sending)
        "logSQL": "N"/"Y" Yes/no if you want to log all SQL statements
        "notification_email": Email address of site admin/operator
    }

### **ssl/cert.pem and ssl/key.pem**

Place your SSL certificate and private key in the ssl folder under root

### **/public/js/env.js**

This file holds environment-related setting variables:

    var thisSiteFullurl = 'http://localhost:80/'; // Used by links/redirects within the site
    var thisSiteFullHTTPSurl = 'https://localhost:443/'; // Used by links/redirects within the site
    var thisSiteDomain = ''; // for local host, otherwise: 'www.yoursite.com' - for cookie management

