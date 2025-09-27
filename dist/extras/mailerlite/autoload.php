<?php

set_include_path(get_include_path() . PATH_SEPARATOR . __DIR__ . '/src');

// Register the 'mailerlite' as a form action.
\MarkdownMaster\Controllers\FormController::AddAction('mailerlite', ['MailerLite\\MailerLiteApi', 'ActionSubscribe']);
