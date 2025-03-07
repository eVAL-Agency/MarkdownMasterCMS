<?php

use PHPUnit\Framework\TestCase;
use MarkdownMaster\File;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;

#[CoversClass(File::class)]
class FileTest extends TestCase {

	public static function setUpBeforeClass(): void {
		// Spoof config
		Config::OverrideConfig([
			'types' => ['tests'],
			'host' => 'http://localhost',
			'webpath' => '/',
		]);
	}

	/**
	 * Test loading a basic file
	 * @return void
	 */
	public function testBasicFile() {
		$file = new File(dirname(__DIR__, 3) . '/tests/test.md');
		$this->assertEquals('http://localhost/tests/', $file->path);
		$this->assertEquals(dirname(__DIR__, 3) . '/tests/test.md', $file->file);
		$this->assertEquals('http://localhost/tests/test.html', $file->url);
		$this->assertEquals('/tests/test.md', $file->rel);

		// Remap the file to an actual test file
		$file->file = dirname(__DIR__, 3) . '/assets/tests/good_file.md';
		$this->assertEquals('Testing Bug Features', $file->getMeta('title'));
		$this->assertEquals('Google Friendly Title', $file->getMeta('seotitle'));
		$this->assertEquals('This is a generic test', $file->getMeta('excerpt'));
		$this->assertEquals('2023-03-14', $file->getMeta('date'));
		$this->assertEquals('Alice', $file->getMeta('author'));
		$this->assertEquals(4.5, $file->getMeta('rating'));
		$this->assertArrayHasKey('src', $file->getMeta('banner'));
		$this->assertIsArray($file->getMeta('tags'));
		$this->assertEquals(false, $file->getMeta('falsy'));
		$this->assertEquals(true, $file->getMeta('truth'));
		$this->assertEquals('', $file->getMeta('iamempty'));
	}

	/**
	 * Test rendering a file which does not contain frontmatter
	 *
	 * All files should have them, but is not strictly required.
	 *
	 * @return void
	 */
	public function testNoFrontmatter() {
		$file = new File(dirname(__DIR__, 3) . '/tests/test.md');
		// Remap the file to an actual test file
		$file->file = dirname(__DIR__, 3) . '/assets/tests/no_frontmatter.md';
		//var_dump($file);
		$this->assertIsArray($file->getMetas());
	}

	/**
	 * Test generating an automatic excerpt from a file
	 *
	 * @return void
	 */
	public function testAutoExcerpt() {
		$file = new File(dirname(__DIR__, 3) . '/tests/test.md');
		// Remap the file to an actual test file
		$file->file = dirname(__DIR__, 3) . '/assets/tests/auto_excerpt.md';
		$excerpt = 'This sentence should come through as the excerpt since it does not have one assigned.' .
			' However, links, italics, and other formatting should not be included.';
		$this->assertEquals($excerpt, $file->getMeta('excerpt'));
	}
}
