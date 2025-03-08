---
title: Install Guide - Apache
seotitle: Install MarkdownMaster CMS on Apache
---

Apache2 can be used to host your own site, but needs a module to be enabled.

`rewrite` is required as it will allow URLs to be rewritten and resolved via the History API. 
This will also perform rewrites for search crawlers to ensure they retrieve content 
when crawling the various .html links.


## Install dependencies, (if required)

```bash
sudo apt install apache2 php libapache2-mod-php
```


## Setup apache (tested on Debian/Ubuntu)

Enable the modules necessary and restart the web server.

```bash
sudo a2enmod rewrite
sudo a2enmod "php$(php -v | egrep '^PHP' | sed 's:PHP \([0-9]*\.[0-9]*\).*:\1:')"
sudo systemctl restart apache2
```


## Install Files

Download the **full**
[latest release](https://github.com/eVAL-Agency/MarkdownMasterCMS/releases/latest) and
extract to your web root, (/var/www/html, public_html, or where ever your site is located).


## Configure Application

Copy `.htaccess.example` to `.htaccess` and edit as necessary.
Take note of the `RewriteBase` directive and SSL/www rules if necessary.

Copy `config.example.php` to `config.php` and edit as necessary.

Refer to the [site configuration doc](site-configuration.md) for more information.
