---
title: Extra - Remote Deploy
---

Server-side plugin to support automation of `git pull` via a webhook.


## Initialization

To load this plugin, add the following to the `extras` block in your
[config.php](https://markdownmaster.com/docs/site-configuration.html):

```php
'extras' => [
    // ...
    
    'remote-deploy' => [
        'secret-token' => 'some-preshared-random-string',
    ],
    
    // ...
],
```


## Configuration

* `secret-token` - The secret token used to authenticate requests
* `token-header` - Optionally set to change the header, defaults to "X-Deploy-Token"

The `secret-token` is required and is a shared secret to authorize the webhook.

By default `X-Deploy-Token` is used as the header to check against, but this can be changed to any header name.

## Required Schema

N/A


## Usage

To make use of this plugin, add a webhook in your github actions, gitlab-ci, or other CI/CD pipeline
to perform a web call to `/deploy` with the defined preshared secret token.

For example with Gitlab:

`.gitlab-ci.yml` in root of your project:

```yaml
stages:
  - deploy

deploy_to_server:
  stage: deploy
  tags:
    - docker
  image: curlimages/curl:latest
  script:
    - |
      curl -X POST \
        -H "X-Deploy-Token: some-preshared-random-string" \
        https://your-site.tld/deploy
  only:
    - main
```


## Example Styles

N/A
