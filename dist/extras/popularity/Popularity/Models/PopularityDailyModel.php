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

namespace Popularity\Models;

use PDO;
use PDOException;
use MarkdownMaster\Model;

class PopularityDailyModel extends Model {
	public static string $table = 'popularity_daily';

	/**
	 * The page relative path, generally ends with .md
	 * @var string
	 */
	public string $page;

	/**
	 * The date of the view, in YYYY-MM-DD format
	 * @var string
	 */
	public string $day;

	/**
	 * Total number of page views for the day
	 * @var int
	 */
	public int $views = 0;

	/**
	 * The calculated score for the page
	 * @var int
	 */
	public int $score = 0;

	/**
	 * Synchronize the database schema with this table's expected definition
	 *
	 * @throws PDOException
	 * @return void
	 */
	public static function SyncTable(): void {
		$db = self::Db();

		$db->exec("
			CREATE TABLE IF NOT EXISTS popularity_daily (
				page TEXT NOT NULL,
				day TEXT NOT NULL,
				views INTEGER NOT NULL DEFAULT 0,
				score INTEGER NOT NULL DEFAULT 0,
				UNIQUE(page, day)
			);
		");

		if (!self::HasColumn('score')) {
			$db->exec("ALTER TABLE popularity_daily ADD COLUMN score INTEGER NOT NULL DEFAULT 0;");
		}
	}

	/**
	 * Remove views from the database older than today
	 *
	 * @return void
	 */
	public static function RemoveOldViews(): void {
		$db = self::Db();
		if (!$db) {
			return;
		}

		$dateLimit = date('Y-m-d', time() - 86400 * 90);
		$stmt = $db->prepare("DELETE FROM popularity_daily WHERE day < :date_limit");
		$stmt->execute(['date_limit' => $dateLimit]);
	}

	/**
	 * Get an array of all daily scores for all pages.
	 *
	 * Returned array is keyed by page path, and each value is the score for that page.
	 *
	 * @return array<string,int>
	 */
	public static function GetDailyScores(): array {
		$db = self::Db();
		if (!$db) {
			return [];
		}

		$ret = [];
		try {
			$stmt = $db->query("
			SELECT page, SUM(score) total_score 
			FROM popularity_daily
			GROUP BY page
		");
			while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
				$ret[$row['page']] = $row['total_score'];
			}
		}
		catch (PDOException $e) {
			error_log("Failed to get daily scores: " . $e->getMessage());
		}

		return $ret;
	}
}
