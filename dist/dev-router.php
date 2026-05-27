<?php
/**
 * Router for accessing the application in a development environment without a full web server.
 *
 * NOT FOR PRODUCTION, but useful for local development.
 *
 * To run this script, run:
 *
 * ```bash
 * php -S localhost:8000 dev-router.php
 * ```
 *
 * (replacing :8000 with your port of choice if necessary.)
 */

// Only allow this script if running via the PHP built-in development server
if (php_sapi_name() !== 'cli-server') {
    header('HTTP/1.1 403 Forbidden');
    exit('Access Denied: This script is for development use only.');
}

// 1. Get the requested resource path
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$file = __DIR__ . $path;

// 2. If the file exists and is not a directory, tell the server to serve it as-is
if ($path !== '/' && file_exists($file) && !is_dir($file)) {
    return false;
}

// 3. Otherwise, fall back to your main entry point
require_once __DIR__ . '/index.php';