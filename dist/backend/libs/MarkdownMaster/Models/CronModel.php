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

namespace MarkdownMaster\Models;

use PDO;
use PDOException;
use Exception;
use MarkdownMaster\Model;
use MarkdownMaster\Config;

class CronModel extends Model {
	protected static string $table = 'cron';

	protected static array $keys = ['job'];

	/**
	 * Unique identifier for the job
	 *
	 * @var string
	 */
	public string $job;

	/**
	 * Date string of the last execution of this job
	 *
	 * date('c') format - 2025-01-01T00:00:00+00:00
	 * @var string
	 */
	public string $last_run;

	/**
	 * Synchronize the database schema with this table's expected definition
	 *
	 * @throws PDOException
	 * @return void
	 */
	public static function SyncTable(): void {
		$db = self::Db();

		$db->exec("
			CREATE TABLE IF NOT EXISTS cron (
				job TEXT PRIMARY KEY,
				last_run TEXT
			);
		");
	}
}
