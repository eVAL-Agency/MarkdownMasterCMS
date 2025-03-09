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

require_once('backend/libs/MarkdownMaster/File.php');
use Config;

class FileCollection {
	/** @var File[] */
	public $files = [];
	public $url;
	public $type;

	public function __construct(string $type) {
		$this->type = $type;
		$this->url = Config::GetHost() . Config::GetWebPath() . $type . '.html';
		$pDir = Config::GetRootPath();
		$files = $this->glob_recursive($pDir . '/' . $type, '*.md');
		foreach ($files as $file) {
			$this->files[] = new File($file);
		}
	}

	/**
	 * Search recusively for files in a base directory matching a glob pattern.
	 * The `GLOB_NOCHECK` flag has no effect.
	 *
	 * @param string $base Directory to search
	 * @param string $pattern Glob pattern to match files
	 * @param int $flags Glob flags from https://www.php.net/manual/function.glob.php
	 * @return string[] Array of files matching the pattern
	 */
	private function glob_recursive(string $base, string $pattern, int $flags = 0) {
		$flags = $flags & ~GLOB_NOCHECK;

		if (substr($base, -1) !== DIRECTORY_SEPARATOR) {
			$base .= DIRECTORY_SEPARATOR;
		}

		$files = glob($base.$pattern, $flags);
		if (!is_array($files)) {
			$files = [];
		}

		$dirs = glob($base.'*', GLOB_ONLYDIR|GLOB_NOSORT|GLOB_MARK);
		if (!is_array($dirs)) {
			return $files;
		}

		foreach ($dirs as $dir) {
			$dirFiles = $this->glob_recursive($dir, $pattern, $flags);
			$files = array_merge($files, $dirFiles);
		}

		return $files;
	}

	/**
	 * Get a specific file by its relative path
	 *
	 * @param string $path
	 * @return File|null
	 */
	public function getByPath(string $path): ?File {
		foreach ($this->files as $file) {
			if ($file->rel === $path) {
				return $file;
			}
		}
		return null;
	}

	public function getFiles($filter = [], string $sort = null, int $limit = 50) {
		$files = $this->files;
		if (count($filter) > 0) {
			$files = array_filter($files, function($file) use ($filter) {
				foreach ($filter as $key => $value) {
					if ($file->getMeta($key) !== $value) {
						return false;
					}
				}
				return true;
			});
		}

		if ($sort) {
			usort($files, function($a, $b) use ($sort) {
				if ($a->getMeta($sort) === $b->getMeta($sort)) {
					return 0;
				}
				return ($a->getMeta($sort) < $b->getMeta($sort)) ? -1 : 1;
			});
		}

		return array_slice($files, 0, $limit);
	}
}
