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

namespace MarkdownMaster;

use MarkdownMaster\Models\CronModel;
use PDO;
use PDOException;
use Exception;

class Cron {
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

		try {
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

				if (isset($existingJobs[$jobName])) {
					// Job already in the database, check if it needs to be run
					$lastRun = $existingJobs[$jobName]->last_run;
					if (strtotime($lastRun) < (time() - $interval)) {
						// Run the job
						$handler();
						$existingJobs[$jobName]->last_run = $now;
						$existingJobs[$jobName]->upsert();
					}
				}
				else {
					// Job not registered in the database yet, create a new one and run the job.
					$jobEntry = new CronModel();
					$handler();
					$jobEntry->job = $jobName;
					$jobEntry->last_run = $now;
					$jobEntry->upsert();
				}
			}
		} catch (PDOException $e) {
			error_log("Failed to run cron jobs: " . $e->getMessage());
		}
	}
}