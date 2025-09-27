<?php
/**
 * MarkdownMaster CMS
 *
 * @version dev
 * @copyright 2025 eVAL Agency
 * @license MIT
 * @link https://github.com/eVAL-Agency/MarkdownMasterCMS
 * @package MarkdownMasterCMS
 *
 * The MIT License (MIT)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */


namespace MarkdownMaster\Controllers;

use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\DNSCheckValidation;
use Egulias\EmailValidator\Validation\RFCValidation;
use MarkdownMaster\Config;
use MarkdownMaster\Controller;
use MarkdownMaster\Views\JSONView;
use Symfony\Component\Mailer\Mailer;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mime\Email;
use Exception;

/**
 * Handle submissions of form data to /form,
 * each form must be set in config.php, ie:
 *
 * ```php
 * 'forms' => [
 *     'contact' => [
 *         'fields' => [
 *             'name' => [
 *               'required' => true
 *             ],
 *             'email' => [
 *                 'type' => 'email',
 *                 'required' => true
 *             ],
 *             'message' => [
 *                 'required' => true
 *             ]
 *         ],
 *         'actions' => [
 *             [
 *                 'action' => 'email',
 *                 'to' => 'sales@yourdomain.tld',
 *                 'subject' => 'New Contact Submission',
 *                 'template' => 'contact',
 *             ],
 *         ],
 *     ],
 * ],
 * ```
 */
class FormController extends Controller {
	/**
	 * Handle POST requests to /form
	 *
	 * Form data must be JSON encoded along with application/json content type
	 * and must contain a `form` attribute matching the form name in config.php
	 * along with any field as defined in the form configuration.
	 *
	 * @return JSONView
	 * @throws Exception
	 */
	public function post() {
		if (!$this->request->isJSON()) {
			// Only JSON requests are accepted
			throw new Exception('Invalid request - only accepts JSON', 400);
		}

		$data = $this->request->getBody();
		if (!is_array($data)) {
			throw new Exception('Invalid request - empty body', 400);
		}

		if (!isset($data['form'])) {
			throw new Exception('Invalid request - missing required key: form', 400);
		}

		$formConfig = Config::GetForm($data['form']);

		if (!isset($formConfig['fields']) || !is_array($formConfig['fields'])) {
			throw new Exception('Invalid form configuration - missing fields', 500);
		}

		if (!isset($formConfig['actions']) || !is_array($formConfig['actions'])) {
			throw new Exception('Invalid form configuration - missing actions', 500);
		}

		// Setup some preliminary information about this submission
		$formData = [
			'form' => $data['form'],
			'ip' => $this->request->getIP(),
			'user_agent' => $this->request->getUserAgent(),
		];

		// Validate the form data and assign all keys to the form data
		$errors = [];
		foreach ($formConfig['fields'] as $field => $fieldSettings) {
			$required = $fieldSettings['required'] ?? false;
			$type = $fieldSettings['type'] ?? 'text';
			$value = trim($data[$field] ?? '');

			if ($required && $value === '') {
				$errors[$field] = 'Field is required';
			}

			if ($type === 'email') {
				$validator = new EmailValidator();
				if (!$validator->isValid($value, new RFCValidation())) {
					$errors[$field] = 'Invalid email address';
				}
				if (!$validator->isValid($value, new DNSCheckValidation())) {
					$errors[$field] = 'Invalid or nonexistent email address domain';
				}
			}

			$formData[$field] = $data[$field] ?? '';
		}

		$view = new JSONView();
		if (count($errors)) {
			$view->status = 400;
			$view->data['success'] = false;
			$view->data['message'] = 'Invalid form data';
			$view->data['errors'] = $errors;
			return $view;
		}

		foreach ($formConfig['actions'] as $actionSettings) {
			switch ($actionSettings['action']) {
				case 'email':
					$this->actionEmail($formData, $actionSettings);
					break;
				case 'test':
					// Print form data to the output View, (useful for testing, both in unittests and in development)
					$view->data['form'] = $formData;
					break;
				default:
					throw new Exception('Invalid form configuration - unknown action: ' . $actionSettings['action'], 500);
			}
		}

		$view->data['success'] = true;
		$view->data['message'] = 'Processed form successfully';
		return $view;
	}

	private function actionEmail(array $data, array $settings) {
		$emailConfig = Config::GetEmail();
		$email = new Email();
		$transport = Transport::fromDsn($emailConfig['dsn']);
		$mailer = new Mailer($transport);

		if (isset($emailConfig['from']) && isset($emailConfig['fromName'])) {
			$from = $emailConfig['fromName'] . '<' . $emailConfig['from'] . '>';
		}
		else {
			$from = $emailConfig['from'];
		}

		if (str_starts_with($settings['to'], 'field:')) {
			// Allow the "to" field for emails to start with "field:" to specify
			// this should be sent to the address in the form data.
			$field = substr($settings['to'], 6);
			$settings['to'] = $data[$field];
		}

		$email->subject($settings['subject'] ?? 'Form submission')
			->from($from)
			->to($settings['to']);

		$template = null;
		if (isset($settings['template'])) {
			$tplName = Config::GetRootPath() . 'themes/' . Config::GetTheme() .
				'/layouts/' . $settings['action'] . '-' . $settings['template'] . '.tpl';
			if (file_exists($tplName)) {
				$template = file_get_contents($tplName);
				foreach ($data as $key => $val) {
					$template = str_replace('{{' . $key . '}}', $val, $template);
				}

				$email->text($template);
			}
		}


		if (!$template) {
			$email->text('Form submission from ' . $data['form'] . ' at ' . date('Y-m-d H:i:s') . "\n\n" . print_r($data, true));
		}

		$mailer->send($email);
	}
}