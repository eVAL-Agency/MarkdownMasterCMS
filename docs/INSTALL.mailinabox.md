---
title: Install Guide - Mail-in-a-box + Nextcloud
seotitle: Install MarkdownMaster CMS on Main-in-a-box and Nextcloud
---

[Mail-in-a-Box](https://mailinabox.email/){target=_blank}
ships with Nextcloud and Nginx and can be modified to support hosting full sites
directly from the Nextcloud shares.
This allows direct access to the markdown files of the site on your local workstation
and immediate and seamless deployment of changes thanks to Nextcloud.

Notice, the default config for MIAB only allows for static sites, which is supported by
MarkdownMaster CMS, but not recommended as it will miss out on any of the SEO and bot features
built into the backend.
This guide will offer the advanced option of utilizing the PHP backend of MarkdownMaster CMS,
but comes with the trade-off of not being able to run on the default domain name.

## Presumptions

This guide presumes you have a working Mail-in-a-box instance with Nextcloud installed
**that is fully updated**.

The MIAB instance is installed at `example.tld` and you will be installed a **new**
domain `mycontentsite.tld` to host your site.


## Update

This script is tested with the latest released at the time of writing, version 71.
If you are not on the latest mail-in-a-box version, please update before proceeding.


## DNS

You will need to create a new DNS entry for the new domain, `mycontentsite.tld` and point it
to a `CNAME` record for your MIAB instance, `example.tld` or an `A` record pointing to the
IP address of your MIAB instance.

**Note** because this domain is managed separately from MAIB, (as it only supports static sites),
you will need to use an external DNS provider to manage the DNS records for your new site.

If you are forwarding a top-level domain, consider adding `www.` as a DNS entry as well,
as this is common for websites.


## Install Files

Select a location in your Nextcloud instance to host the files, for example `Sync/mycontentsite.tld/site` or some such.
Extract MarkdownMaster CMS to this directory and wait for the files to be uploaded.

For collaborative editing, group files **are** supported and allow multiple people to edit the site.

Once uploaded, take note of the location of the files on the server, 
this file path will be used later.

For examples:

* `/home/user-data/owncloud/you@example.tld/files/mycontentsite.tld/site`
* `/home/user-data/owncloud/__groupfolders/1/mycontentsite.tld/site`


## Upgrade PHP

Mail-in-a-box ships with PHP 8.0, but MarkdownMaster requires PHP 8.2 or higher.
At the time of writing PHP 8.4 is the latest stable release, so install that alongside
the existing PHP 8.0 version.

```bash
# Install dependencies for MarkdownMaster CMS
# This includes the nginx plugin for certbot
sudo apt install php8.4 php8.4-fpm php8.4-xml python3-certbot-nginx


# Enable and start PHP 8.4 backend handler
sudo systemctl enable php8.4-fpm
sudo systemctl start php8.4-fpm
```


## Install Virtual Host

Create a new file in `/etc/nginx/conf.d` named (for example) `mycontentsite.tld.conf`
with the following content, adjusted to your site name and file path:

```nginx
upstream mycontentsite-fpm { # Set name to unique identifier for your site
    server unix:/var/run/php/php8.4-fpm.sock;
}

server {
    listen 80;
    # Domain name to serve, you can use mydomain.tld www.mydomain.tld; to include multiple.
    server_name mycontentsite.tld;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    # Domain name to serve, you can use mydomain.tld www.mydomain.tld; to include multiple.
    server_name mycontentsite.tld;
    server_tokens off;
    
    # Path to your site files
    root /home/user-data/owncloud/THE_LOCATION_OF_YOUR_SITE_FILES;
    
    index index.php;
    
    include snippets/snakeoil.conf;
    
    location ~ /.*\.(html|json|xml) {
        try_files $uri $uri/ /index.php?$args;
    }
    
    location = /index.php {
        include fastcgi_params;
        fastcgi_index index.php;
        
        # Path to your site files + '/index.php'
        fastcgi_param SCRIPT_FILENAME /home/user-data/owncloud/THE_LOCATION_OF_YOUR_SITE_FILES/index.php;
        
        # Identifier from upstream block
        fastcgi_pass mycontentsite-fpm; 
    }
    
    include mime.types;
    types {
        text/markdown md;
    }
}
```


## Test, Restart, and SSL

After adding the Nginx configuration, test the configuration for errors with:

```bash
sudo nginx -t
```

and if successful, reload the configuration with:

```bash
sudo systemctl restart nginx
```

If everything was successful, continue to installing the SSL certificate from LetsEncrypt.

```bash
# Alternatively certbot --nginx -d mycontentsite.tld -d www.mycontentsite.tld
certbot --nginx -d mycontentsite.tld
```


## Wrapping up

Now that the virtual host is installed and SSL is configured, access the site in a web browser
and check if you have a valid certificate and are getting a response, probably similar to:

```
Error 500

Configuration file not found, please copy config.example.php to config.php
```

This is an error, but it indicates the application is running and ready for configuration!

From here, you can copy `config.example.php` to `config.php` and edit the configuration
as necessary per [site configuration doc](site-configuration.md).


*[MAIB]: Mail-in-a-Box
*[SEO]: Search Engine Optimization