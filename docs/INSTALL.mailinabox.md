---
title: Install Guide - Mail-in-a-box + Nextcloud
seotitle: Install MarkdownMaster CMS on Main-in-a-box and Nextcloud
---

[Mail-in-a-Box](https://mailinabox.email/){target=_blank}
ships with Nextcloud and Nginx and can be modified to support hosting full sites
directly from the Nextcloud shares.
This allows direct access to the markdown files of the site on your local workstation
and immediate and seamless deployment of changes thanks to Nextcloud.

This guide starts with the expectation that your mail-in-a-box instance is already up and running,
however please note this is **NOT SUPPORTED** by MIAB, so have backups and be mindful
this may break future upgrades.

This provides two options based on how you intend to use the site.
First option is setting up a new domain separate from your mail-in-a-box instance's primary domain,
(or separate subdomain), and the second is to piggyback the site off the primary domain.

For example, if your mail-in-a-box is `example.tld`, the first option will setup
`mycontentsite.tld` and the second will setup `example.tld`.


## Update

This script is tested with the latest released at the time of writing, version 71.
If you are not on the latest mail-in-a-box version, please update before proceeding.

## Install Files

Select a location in your Nextcloud instance to host the files, for example `Sync/example.tld/site` or some such.
Extract MarkdownMaster CMS to this directory and wait for the files to be uploaded.

For collaborative editing, group files **are** supported and allow multiple people to edit the site.

Once uploaded, take note of the location of the files on the server, 
this file path will be used later.

For examples:

* `/home/user-data/owncloud/you@example.tld/files/example.tld/site`
* `/home/user-data/owncloud/__groupfolders/1/example.tld/site`


## Upgrade PHP

Mail-in-a-box ships with PHP 8.0, but MarkdownMaster requires PHP 8.2 or higher.
The version of Nextcloud shipped with MIAB only supports up to PHP 8.2, so we'll use that version.

```bash
# Install dependencies for PHP 8.2
sudo VERS=8.2 apt install php"${PHP_VER}" php"${PHP_VER}"-fpm \
 php"${PHP_VER}"-cli php"${PHP_VER}"-sqlite3 php"${PHP_VER}"-gd php"${PHP_VER}"-imap php"${PHP_VER}"-curl \
 php"${PHP_VER}"-dev php"${PHP_VER}"-gd php"${PHP_VER}"-xml php"${PHP_VER}"-mbstring php"${PHP_VER}"-zip php"${PHP_VER}"-apcu
 php"${PHP_VER}"-intl php"${PHP_VER}"-imagick php"${PHP_VER}"-gmp php"${PHP_VER}"-bcmath

# Enable and start PHP 8.2 backend handler
sudo systemctl enable php8.2-fpm
sudo systemctl start php8.2-fpm

# Swap default FPM handler
sed -i 's/php8.0-fpm\.sock/php8.2-fpm.sock/g' /etc/nginx/conf.d/local.conf
```


## Install Virtual Host (option 1 - new domain)

// @todo: instructions for configuring /etc/nginx/conf.d/newsite.conf


## Install Virtual Host (option 2 - existing domain)

To install the site on top of your existing MAIB domain, 
edit `/etc/nginx/conf.d/local.conf` and location the `listen 443 ssl` server block
specific for your server URL.

```
# The secure HTTPS server.
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name example.tld;
    
    # Improve privacy: Hide version an OS information on
    # error pages and in the "Server" HTTP-Header.
    server_tokens off;
    
    ssl_certificate /home/user-data/ssl/ssl_certificate.pem;
    ssl_certificate_key /home/user-data/ssl/ssl_private_key.pem;
    
    # Expose this directory as static files.
    #root /home/user-data/www/default;
    #index index.html index.htm;
    
    ## ^^  ^^ Comment out the existing `root` and `index` directives

    
    
    ### BEGIN directive for MarkdownMaster CMS site
    
    # Must be set to the absolute path of the site files.
    root /home/user-data/owncloud/THE_LOCATION_OF_YOUR_SITE_FILES;
    
    # Default file handler, index.php handles everything
    index index.php;
    
    # Ensure index.php can be executed with PHP-FPM handler
    location = /index.php {
        include fastcgi_params;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME /home/user-data/owncloud/THE_LOCATION_OF_YOUR_SITE_FILES/index.php;
        fastcgi_pass php-fpm;
    }
    
    # Backend processing files for MarkdownMaster CMS
    rewrite /meta.json /index.php;
    rewrite /search.json /index.php;
    rewrite /sitemap.xml /index.php;
    rewrite /form /index.php;
    
    # Update this with any file type present in your site if necessary.
    rewrite ^/wiki.*\.html /index.php;
    rewrite ^/posts.*\.html /index.php;
    rewrite ^/pages.*\.html /index.php;
    
    ### END directive for MarkdownMaster CMS site
    
    # ... rest of server block
}
```

## Restart Nginx and test

After editing the Nginx configuration, test the configuration for errors with:

```bash
sudo nginx -t
```

and if successful, reload the configuration with:

```bash
sudo systemctl restart nginx
```

If everything was successful, browsing to the site should produce the following output:

```
Error 500

Configuration file not found, please copy config.example.php to config.php
```

This is an error, but it indicates the application is running and ready for configuration!

From here, you can copy `config.example.php` to `config.php` and edit the configuration
as necessary per [site configuration doc](site-configuration.md).


*[MAIB]: Mail-in-a-Box