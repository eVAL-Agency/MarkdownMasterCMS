<?php

define('BASE_DIR', realpath(__DIR__ . '/../../dist'));

spl_autoload_register(function($class) {
	//var_dump($class); die();
	require_once(str_replace('\\', '/', $class) . '.php');
});

set_include_path(get_include_path() . PATH_SEPARATOR . BASE_DIR . '/backend/libs');
