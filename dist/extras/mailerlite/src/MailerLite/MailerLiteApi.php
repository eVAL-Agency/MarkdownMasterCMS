<?php

namespace MailerLite;

use Exception;

class MailerLiteApi {
	private string $apiKey;
	private string $baseUrl = 'https://connect.mailerlite.com/api';

	public static function ActionSubscribe(array $data, array $settings) {
		$apiKey = $settings['apiKey'] ?? null;
		if (!$apiKey) {
			throw new Exception('MailerLite API key not set in form action settings');
		}

		if (isset($settings['optinField'])) {
			// Check if there is an opt-in field set; if so, only proceed if it's present and truthy in the submitted data
			$optinField = $settings['optinField'];
			if (empty($data[$optinField])) {
				// Opt-in field is not set or is falsy, so we skip the subscription
				return null;
			}
		}

		$emailField = $settings['emailField'] ?? 'email';
		if (!isset($data[$emailField])) {
			throw new Exception("Email field '$emailField' not found in form submission");
		}
		$email = $data[$emailField];
		$fields = $settings['fields'] ?? [];
		$groups = $settings['groups'] ?? [];

		$api = new MailerLiteApi($apiKey);
		return $api->subscribe($email, $fields, $groups);
	}

	public function __construct(string $apiKey) {
		$this->apiKey = $apiKey;
	}

	public function subscribe(string $email, array $fields = [], array $groups = []) {
		$url = $this->baseUrl . '/subscribers';
		$data = [
			'email' => $email,
			'fields' => $fields,
			'groups' => $groups
		];

		if (isset($_SERVER['REMOTE_ADDR'])) {
			$data['ip_address'] = $_SERVER['REMOTE_ADDR'];
		}

		$options = [
			'headers' => [
				'Content-Type' => 'application/json',
				'Accept' => 'application/json',
				'Authorization' => 'Bearer ' . $this->apiKey,
			],
			'body' => json_encode($data)
		];

		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $options['body']);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array_map(
			fn($k, $v) => "$k: $v",
			array_keys($options['headers']),
			$options['headers']
		));

		$response = curl_exec($ch);
		if (curl_errno($ch)) {
			throw new Exception('Request Error: ' . curl_error($ch));
		}
		$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		$response = json_decode($response, true);
		if ($httpcode >= 400) {
			$errorMsg = $response['message'] ?? 'Unknown error';
			throw new Exception("API Error: $errorMsg", $httpcode);
		}
		else {
			return $response;
		}
	}
}