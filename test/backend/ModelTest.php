<?php

namespace backend;

use MarkdownMaster\Config;
use MarkdownMaster\Model;
use MarkdownMaster\Models\CronModel;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;
use PHPUnit\Framework\TestCase;

#[UsesClass(Config::class)]
#[UsesClass(Model::class)]
#[CoversClass(Model::class)]
class ModelTest extends TestCase {
	private string $testDbPath;

	protected function setUp(): void {
		// Create a test database path
		$this->testDbPath = sys_get_temp_dir() . '/model_test_' . uniqid() . '.sqlite';
		
		// Set up minimal config for testing
		Config::OverrideConfig([
			'host' => 'http://localhost',
			'webpath' => '/',
			'rootpath' => dirname(__DIR__) . '/assets/',
			'database' => [
				'path' => $this->testDbPath,
			],
		]);
		
		// Register models that would normally be registered during install
		Model::RegisterModel(CronModel::class);
	}

	protected function tearDown(): void {
		// Clean up test database
		if (file_exists($this->testDbPath)) {
			unlink($this->testDbPath);
		}
		
		// Reset shared DB connection to avoid leaking between tests
		Model::Reset();
	}

	/**
	 * Test the installation of a Cron table
	 *
	 * @return void
	 */
	public function testInstallCron() {
		// Starting out, it should not be registered
		$this->assertCount(0, CronModel::DescribeTable());

		// Install the table
		CronModel::SyncTable();
		
		// One installed, it should have content.
		$columns = CronModel::GetColumnNames();
		$this->assertGreaterThan(0, count($columns));
		$this->assertCount(count($columns), CronModel::DescribeTable());
	}

	public function testDbReturnsSharedConnection() {
		// Test that Db() returns the same instance on subsequent calls
		$db1 = Model::Db();
		$db2 = Model::Db();
		
		$this->assertSame($db1, $db2);
	}

	public function testDbReturnsNullOnFailure() {
		// Test that Db() returns null when path is not creatable
		Config::OverrideConfig([
			'host' => 'http://localhost',
			'webpath' => '/',
			'rootpath' => dirname(__DIR__) . '/assets/',
			'database' => [
				'path' => '/proc/nonexistent',
			],
		]);
		$db = Model::Db();
		
		$this->assertNull($db);
	}
	
	public function testGetRegisteredModels() {
		// Test that registered models are returned correctly
		$models = Model::GetRegisteredModels();
		$this->assertContains(CronModel::class, $models);
	}

	public function testDescribeTable() {
		// Test that table description works for a registered model
		$db = Model::Db();
		$this->assertNotNull($db);
		
		// Sync the table first (this is what would happen during install)
		CronModel::SyncTable();
		
		$description = CronModel::DescribeTable();
		$this->assertIsArray($description);
	}
}