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

class PopularityViewsModel extends Model {
	public static string $table = 'popularity_views';

	public static array $keys = ['id'];
	public int $id;
	public string $page;
	public string $visitor;
	public string $day;

	/**
	 * Synchronize the database schema with this table's expected definition
	 *
	 * @throws PDOException
	 * @return void
	 */
	public static function SyncTable(): void {
		$db = self::Db();

		$db->exec("
			CREATE TABLE IF NOT EXISTS popularity_views (
				id INTEGER PRIMARY KEY,
				page TEXT NOT NULL,
				visitor TEXT NOT NULL,
				day TEXT NOT NULL
			);
		");

		// Indexes for performance
		$db->exec("CREATE INDEX IF NOT EXISTS idx_popularity_views_page_day ON popularity_views(page, day);");
		$db->exec("CREATE INDEX IF NOT EXISTS idx_popularity_views_visitor_page_day ON popularity_views(visitor, page, day);");

	}

	/**
	 * Get unique page views (one hit per page per day per visitor)
	 *
	 * Only returns views before 'today'
	 *
	 * @return array[<page: string, day: string, unique_views: int>]
	 */
	public static function GetUniquePageViews(): array {
		$db = self::Db();
		if (!$db) {
			return [];
		}

		// This query counts unique views by grouping by page, day and visitor
		// which ensures that one visitor viewing the same page multiple times in a day only counts as one hit
		$stmt = $db->prepare("
		SELECT
			page,
			day,
			COUNT(DISTINCT visitor) as unique_views
		FROM popularity_views
		WHERE day < :date_limit
		GROUP BY page, day
		ORDER BY day, page;
		");
		$stmt->execute(['date_limit' => date('Y-m-d')]);
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
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

		$stmt = $db->prepare("DELETE FROM popularity_views WHERE day < :date_limit");
		$stmt->execute(['date_limit' => date('Y-m-d')]);
	}
}
