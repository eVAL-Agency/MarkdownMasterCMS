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

namespace MarkdownMaster\Services;

use Exception;
use MarkdownMaster\Models\CronModel;

class CronService {
	private static array $jobs = [];

	/**
	 * Register a new cron job
	 *
	 * @param string   $job      Job name
	 * @param int      $intervalSeconds  Interval in seconds
	 * @param callable $handler  Handler function to call when job runs
	 * @return void
	 */
	public static function Register(string $job, int $intervalSeconds, callable $handler): void {
		self::$jobs[$job] = [
			'interval' => $intervalSeconds,
			'handler' => $handler
		];
	}

	/**
	 * Run any due jobs
	 */
	public static function RunDue(): void {

		$db = CronModel::Db();
		if (!$db) {
			// Database is not available, skip out
			return;
		}

		// Only run crons if the cron schema is up to date
		if (CronModel::GetTableState() !== 'OK') {
			return;
		}

		// Get a list of all jobs currently in the database
		// This is done with a bulk lookup to save queries
		$existingJobs = [];
		foreach (CronModel::GetAll() as $job) {
			$existingJobs[$job->job] = $job;
		}

		// Get all registered jobs that are due
		foreach (self::$jobs as $jobName => $jobInfo) {
			$interval = $jobInfo['interval'];
			$handler = $jobInfo['handler'];
			$now = date('c');
			$run = false;

			if (isset($existingJobs[$jobName])) {
				// Job already in the database, check if it needs to be run
				$lastRun = $existingJobs[$jobName]->last_run;
				if (strtotime($lastRun) < (time() - $interval)) {
					// Mark job as started BEFORE calling handler to prevent race condition
					$existingJobs[$jobName]->last_run = $now;
					$existingJobs[$jobName]->upsert();
					$run = true;
				}
			}
			else {
				// Job not registered in the database yet, create a new one and run the job.
				$jobEntry = new CronModel();
				// Mark job as started BEFORE calling handler to prevent race condition
				$jobEntry->job = $jobName;
				$jobEntry->last_run = $now;
				$jobEntry->upsert();
				$run = true;
			}

			if ($run) {
				try {
					// Run the job
					$handler();
				}
				catch (Exception $e) {
					error_log("Failed to run cron job [$jobName]:" . $e->getMessage());
				}
			}
		}

		// Cleanup phase: Remove any crons from the database that are not in the registry
		// Get all job names currently in the database
		foreach (CronModel::GetAll() as $job) {
			if (!isset(self::$jobs[$job->job])) {
				$job->delete();
			}
		}
	}
}