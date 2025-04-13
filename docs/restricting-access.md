---
title: Restricting Access to site
seotitle: How to restrict access to MarkdownMaster CMS
---

MarkdownMaster CMS does not provide any built-in authentication, but Apache and Nginx
both support basic authentication.

## Restricting access with Apache

Create the authentication database file using `htpasswd` in a secure location outside the web root.

```bash
# Create the file, ONLY IF IT DOES NOT EXIST
htpasswd -cB .htpasswd YOURUSERNAME

# Or to add/modify a user from an existing file
htpasswd -B .htpasswd YOURUSERNAME
```

Edit the `.htaccess` file in the root of your site directory to include the following lines:


```apache
AuthType Basic
AuthName "Restricted Content"
AuthUserFile /PATH_TO_YOUR/.htpasswd
Require valid-user
```

## Restricting access with Nginx

// @TODO

## Restricting access with Mail-in-a-Box

Create the authentication database file using `htpasswd` in a secure location,
ie: alongside the site directory, but outside the web root.

```bash
# Create the file, ONLY IF IT DOES NOT EXIST
htpasswd -cB .htpasswd YOURUSERNAME

# Or to add/modify a user from an existing file
htpasswd -B .htpasswd YOURUSERNAME
```

Create a new file alongside the site directory, (preferably OUTSIDE the web root though),
called (for example) `nginx_auth.conf` with the following lines:

```nginx
satisfy all;
auth_basic "Restricted Access";
auth_basic_user_file /home/user-data/owncloud/PATH_TO_YOUR_SITE/.htpasswd;
```

Optionally to restrict from IP:

```nginx
satisfy all;
allow 1.2.3.4;
allow 1.2.3.5;
deny all;
```

Or a combination of both

```nginx
# Use "satisfy any" to whitelist IPs and require authentication OUTSIDE of those IPs
satisfy all;

allow 1.2.3.4;
allow 1.2.3.5;
deny all;

auth_basic "Restricted Access";
auth_basic_user_file /home/user-data/owncloud/PATH_TO_YOUR_SITE/.htpasswd;
```

Then include this file in `/etc/nginx/conf.d/YOURSITE.conf` inside the 443/SSL server block:

```nginx
    include /home/user-data/owncloud/PATH_TO_YOUR_SITE/nginx_auth.conf;
```

example:

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name YOURSITE.tld www.YOURSITE.tld;
    server_tokens off;
    root /home/user-data/owncloud/PATH_TO_YOUR_SITE/site;
    index index.php;
    include snippets/snakeoil.conf;
    include /home/user-data/owncloud/PATH_TO_YOUR_SITE/nginx_auth.conf;

    location ~ /.*\.(html|json|xml) {
        try_files $uri $uri/ /index.php?$args;
    }
    ...
}
```