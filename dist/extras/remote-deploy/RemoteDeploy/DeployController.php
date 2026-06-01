<?php

namespace RemoteDeploy;

use MarkdownMaster\Config;
use MarkdownMaster\Controller;
use Exception;

class DeployController extends Controller {
	public function post() {
		// Get the secret token from the configuration
		$secretToken = Config::GetExtraParameter('remote-deploy', 'secret-token');
		$tokenHeader = Config::GetExtraParameter('remote-deploy', 'token-header', 'X-Deploy-Token');

		if (!$secretToken) {
			throw new Exception('Unauthorized: Invalid deployment token', 401);
		}

		// Retrieve the token from a header (e.g., X-Deploy-Token)
		$providedToken = $_SERVER['HTTP_' . str_replace('-', '_', strtoupper($tokenHeader))] ?? '';

		if ($providedToken !== $secretToken) {
			throw new Exception('Unauthorized: Invalid deployment token', 401);
		}

		// This should be the absolute path on your server
		$projectPath = BASE_DIR;
		if (!file_exists($projectPath . '/.git')) {
			throw new Exception('This project does not appear to be a git project, unable to deploy', 500);
		}

		if (posix_geteuid() !== stat($projectPath)['uid']) {
			throw new Exception('This project does not appear to be owned by the web user, unable to deploy', 500);
		}

		// Execute the git pull
		// We use '2>&1' to redirect error output to stdout so we can capture it in the result
		$command = "cd $projectPath && git pull 2>&1";
		$output = shell_exec($command);

		// Return a response
		// Since this is an API-style call, returning a simple string or status is sufficient
		if (strpos($output, 'error') !== false || strpos($output, 'fatal') !== false) {
			throw new Exception('Deployment Failed: ' . $output, 500);
		}

		return "Deployment Successful: " . $output;
	}
}