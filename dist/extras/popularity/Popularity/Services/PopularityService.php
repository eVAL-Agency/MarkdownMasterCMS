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

namespace Popularity\Services;

use MarkdownMaster\File;
use MarkdownMaster\Request;

use Popularity\Models\PopularityDailyModel;
use Popularity\Models\PopularityViewsModel;


class PopularityService {
	private static ?array $_Scores = null;

	private static function _CalculateScore(string $day, int $views): int {
		// The half-life of views in days (how quickly score decays)
		$halfLifeDays = 7;

		// Calculate age in days
		$age_days = max(0, (time() - strtotime($day)) / 86400);
		$weighted = $views * (0.5 ** ($age_days / $halfLifeDays));
		$weighted = (int)(round(log10(1 + $weighted), 1) * 10);
		return $weighted;
	}

	/**
	 * Records a page view in the database
	 *
	 * @param File $page
	 * @param Request $request
	 * @return void
	 */
	public static function Record(File $page, Request $request): void {
		$ip = $request->getIP();
		$userAgent = $request->getUserAgent();
		$visitor = hash('sha256', $ip . '|' . trim(preg_replace('/\s+/', ' ', $userAgent)));

		$view = new PopularityViewsModel();
		$view->page = $page->rel;
		$view->visitor = $visitor;
		$view->day = date('Y-m-d');
		$view->insert();
	}

	/**
	 * Roll up view counts from views table into daily table
	 *
	 * @return void
	 */
	public static function Rollup(): void {
		// How long records should persist in the daily table
		$dateLimit = date('Y-m-d', time() - 86400 * 90);

		// Get the raw view counts from the previous day
		$views = PopularityViewsModel::GetUniquePageViews();

		// Update all daily records with the updated score
		// or remove old records
		$dailies = PopularityDailyModel::GetAll();
		foreach($dailies as $daily) {
			if ($daily->day < $dateLimit) {
				$daily->delete();
			}
			else {
				$daily->score = self::_CalculateScore($daily->day, $daily->views);
				$daily->upsert();
			}
		}

		foreach ($views as $view) {
			$daily = new PopularityDailyModel();
			$daily->page = $view['page'];
			$daily->day = $view['day'];
			$daily->views = $view['unique_views'];
			$daily->score = self::_CalculateScore($view['day'], $view['unique_views']);
			$daily->upsert();
		}

		// Remove old views now that they've been migrated to daily
		PopularityViewsModel::RemoveOldViews();
	}

	/**
	 * Get weighted scores for all pages
	 *
	 * @return array<string,int> Map of page paths to their popularity scores
	 */
	public static function GetScores(): array {
		if (self::$_Scores !== null) {
			// Support cache so we only have to look up scores once per request
			return self::$_Scores;
		}

		self::$_Scores = PopularityDailyModel::GetDailyScores();

		return self::$_Scores;
	}

	/**
	 * Get score for a specific page
	 *
	 * @param string $page The page path
	 * @return int The score or 0 if no data
	 */
	public static function GetScoreFor(string $page): int {
		$scores = self::GetScores();
		return $scores[$page] ?? 0;
	}
}