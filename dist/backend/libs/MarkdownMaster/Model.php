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

use Error;
use PDO;
use Exception;
use PDOException;
use ReflectionClass;

/**
 * Core database layer for MarkdownMaster CMS
 *
 * This class provides access to the SQLite database for supplemental functions
 *
 * The database is only created on demand, via `/install` URL call.
 *
 * Example usage in an extra:
 *
 * ```php
 * // autoload.php
 * Model::RegisterModel('Popularity\Models\PopularityViewsModel');
 * ```
 *
 * ```php
 * // Popularity/Models/PopularityViewsModel.php
 * namespace Popularity\Models;
 *
 * use MarkdownMaster\Model;
 *
 * class PopularityViewsModel extends Model {
 *   public static string $table = 'popularity_views';
 *
 *   // List of primary keys for this Model
 *   public static array $keys = ['id'];
 *   // List of columns and their types in this Model
 *   public int $id;
 *   public string $page;
 *   public string $visitor;
 *   public string $day;
 *
 *   public static function SyncTable(): void {
 *     $db = self::Db();
 *
 *     $db->exec("
 *       CREATE TABLE IF NOT EXISTS popularity_views (
 *         id INTEGER PRIMARY KEY,
 *         page TEXT NOT NULL,
 *         visitor TEXT NOT NULL,
 *         day TEXT NOT NULL
 *       );
 *     ");
 *   }
 * }
 * ```
 *
 * @throws PDOException
 */
class Model {
	/**
	 * The name of the database table this model represents
	 *
	 * @var string
	 */
	protected static string $table;

	/**
	 * The list of primary keys in the database table
	 *
	 * @var array
	 */
	protected static array $keys = [];

	/** @var ?PDO */
	private static ?PDO $_db = null;

	private static array $_models = [];

	public function __construct() {

	}

	/**
	 * Register a model class to be initialized when the database is initialized
	 *
	 * This MUST be called during autoload.php to ensure the database is installed
	 *
	 * @param string $modelClass
	 * @return void
	 */
	public static function RegisterModel(string $modelClass): void {
		self::$_models[] = $modelClass;
	}

	/**
	 * Synchronize the database schema with this table's expected definition
	 *
	 * Called during /install
	 *
	 * @throws PDOException
	 * @return void
	 */
	public static function SyncTable(): void {
		// This function must be implemented by subclasses
	}

	/**
	 * Get a shared PDO connection to the database for the current request
	 *
	 * @return PDO|null
	 */
	public static function Db(): ?PDO {
		if (Model::$_db !== null) {
			return Model::$_db;
		}

		$path = Config::GetDatabasePath();
		if (!$path) {
			// Path is not configured, just skip out as the database system is not available.
			return null;
		}

		if (!file_exists($path)) {
			// Try to auto-create the directory and file to store the database
			// If auto creation fails, return NULL to indicate no database is available.
			$dir = dirname($path);

			try {
				if (!is_dir($dir)) {
					mkdir($dir, 0755, true);
				}
				if (!is_writable($dir)) {
					return null;
				}
				if (!file_exists($path)) {
					touch($path);
				}
			}
			catch (Exception|Error) {
				return null;
			}
		}

		try {
			Model::$_db = new PDO("sqlite:$path");
			Model::$_db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

			// Enable WAL mode for better concurrency
			Model::$_db->exec('PRAGMA journal_mode=WAL;');

			return Model::$_db;
		} catch (Exception $e) {
			error_log("Failed to initialize database: " . $e->getMessage());
			return null;
		}
	}

	/**
	 * Reset the application state; useful in tests
	 *
	 * @return void
	 */
	public static function Reset(): void {
		Model::$_db = null;
	}

	/**
	 * Get debug information about the database
	 *
	 * @return array
	 */
	public static function GetDebugInfo(): array {
		$ret = [
			'enabled' => self::Db() !== null,
			'path' => Config::GetDatabasePath(),
			'tables' => [],
		];

		if (!$ret['enabled']) {
			$ret['comment'] = 'To install a database, call /install in a browser.';
			return $ret;
		}

		foreach (self::$_models as $model) {
			try {
				$ret['tables'][$model] = $model::DescribeTable();
			}
			catch (Exception|Error) {
				$ret['tables'][$model] = 'ERROR LOADING TABLE';
			}
		}

		return $ret;
	}

	/**
	 * Get all registered model classes
	 *
	 * @return array[Model::class]
	 */
	public static function GetRegisteredModels(): array {
		return self::$_models;
	}

	/**
	 * Describe the table schema as recorded in the database
	 *
	 * Provides an array with:
	 *
	 * * cid (int) - The table's autoincrement ID
	 * * name (string) - The column name
	 * * type (string) - The column type
	 * * notnull (int) - 1 if the column is not null
	 * * dflt_value (string) - The default value for the column
	 * * pk (int) - 1 if the column is a primary key
	 '
	 *
	 * @return array
	 */
	public static function DescribeTable(): array {
		$db = self::Db();
		if (!$db) {
			return [];
		}

		$stmt = $db->prepare("PRAGMA table_info(" . static::$table . ")");
		$stmt->execute();
		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	/**
	 * Get the table state, useful for debugging
	 *
	 * @return string
	 */
	public static function GetTableState(): string {
		try {
			$schema = static::DescribeTable();
			$columns = static::GetColumnNames();

			// Flatten the schema names to compare against expected columns
			$schemaNames = array_map(function($col) { return $col['name']; }, $schema);
			$diff = array_diff($columns, $schemaNames);
			if (count($schema) == 0) {
				return 'NOT INSTALLED - call /install in a browser.';
			}
			elseif (count($diff) > 0) {
				return 'MISMATCHING COLUMNS: ' . implode(', ', $diff);
			}
			else {
				return 'OK';
			}
		}
		catch (Exception|Error $e) {
			return $e->getMessage();
		}
	}

	/**
	 * Get all records from the table
	 *
	 * @return array<static>
	 */
	public static function GetAll(): array {
		$db = self::Db();
		if (!$db) {
			return [];
		}

		try {
			return $db
				->query("SELECT * FROM " . static::$table)
				->fetchAll(PDO::FETCH_CLASS,static::class);
		}
		catch (PDOException $e) {
			// This system should gracefully fail, as the database is optional in this CMS.
			error_log("Failed to get all records: " . $e->getMessage());
			return [];
		}
	}

	/**
	 * Get all raw values from the table
	 *
	 * @return array
	 */
	public static function GetAllRaw(): array {
		$db = self::Db();
		if (!$db) {
			return [];
		}

		try {
			return $db
				->query("SELECT * FROM " . static::$table)
				->fetchAll(PDO::FETCH_ASSOC);
		}
		catch (PDOException $e) {
			// This system should gracefully fail, as the database is optional in this CMS.
			error_log("Failed to get all records: " . $e->getMessage());
			return [];
		}
	}

	/**
	 * Get the list of column names for this model
	 *
	 * @return array<string>
	 */
	public static function GetColumnNames(): array {
		$reflection = new ReflectionClass(static::class);
		$properties = $reflection->getProperties();
		$columns = [];
		foreach($properties as $property) {
			// Skip static properties
			if ($property->isStatic()) {
				continue;
			}
			
			// Skip properties that start with underscore
			if (str_starts_with($property->getName(), '_')) {
				continue;
			}
			
			$columns[] = $property->getName();
		}
		return $columns;
	}

	/**
	 * Perform an INSERT OR REPLACE (aka upsert) for this record
	 *
	 * @return void
	 */
	public function upsert(): void {
		$db = self::Db();
		if (!$db) {
			return;
		}

		$columns = static::GetColumnNames();
		$sql = "INSERT OR REPLACE INTO " . static::$table;
		$sql .= ' (' . implode(',', $columns) . ')';
		$sql .= ' VALUES (' . str_repeat('?,', count($columns) - 1) . '?)';

		$values = [];
		foreach ($columns as $column) {
			$values[] = $this->$column;
		}

		try {
			$stmt = $db->prepare($sql);
			$db->beginTransaction();
			$stmt->execute($values);
			$db->commit();
		}
		catch (PDOException $e) {
			$db->rollBack();
			error_log("Failed to upsert record: " . $e->getMessage());
		}
	}

	/**
	 * Perform an INSERT for this record
	 *
	 * @return void
	 */
	public function insert(): void {
		$db = self::Db();
		if (!$db) {
			return;
		}

		$columns = static::GetColumnNames();


		$data = [];
		foreach ($columns as $column) {
			if (in_array($column, static::$keys)) {
				// Only insert the primary key if it has a value set,
				// this is to support autoinc keys.
				if (isset($this->$column)) {
					$data[$column] = $this->$column;
				}
			}
			else {
				$data[$column] = $this->$column;
			}
		}
		$sql = "INSERT INTO " . static::$table;
		$sql .= ' (' . implode(',', array_keys($data)) . ')';
		$sql .= ' VALUES (' . str_repeat('?,', count($data) - 1) . '?)';

		try {
			$stmt = $db->prepare($sql);
			$db->beginTransaction();
			$stmt->execute(array_values($data));

			if (count(static::$keys) === 1 && !isset($data[static::$keys[0]])) {
				// Check if there's a primary key that needs updated with the autoinsert ID.
				$lastId = $db->lastInsertId();
				if ($lastId !== false) {
					$this->{static::$keys[0]} = $lastId;
				}
			}
			$db->commit();
		}
		catch (PDOException $e) {
			$db->rollBack();
			error_log("Failed to insert record: " . $e->getMessage());
		}
	}
}
