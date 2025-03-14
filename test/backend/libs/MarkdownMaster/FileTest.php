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
			'rootpath' => dirname(__DIR__, 3) . '/assets/',
		]);
	}

	public function testSecurityInvalidFilePath1() {
		$this->expectException(\Exception::class);
		new File('/etc/passwd');
	}

	public function testSecurityInvalidFilePath2() {
		$this->expectException(\Exception::class);
		new File(Config::GetRootPath() . 'tests/../../../../../../../etc/passwd');
	}

	/**
	 * Test loading a basic file
	 * @return void
	 */
	public function testBasicFile() {
		$file = new File(Config::GetRootPath() . 'tests/good_file.md');
		$this->assertEquals('http://localhost/tests/', $file->path);
		$this->assertEquals(dirname(__DIR__, 3) . '/assets/tests/good_file.md', $file->file);
		$this->assertEquals('http://localhost/tests/good_file.html', $file->url);
		$this->assertEquals('/tests/good_file.md', $file->rel);
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
	 * Test rendering a file which does not contain frontmatter,
	 * all files should have them, but is not strictly required.
	 *
	 * This will test that even if a file does not contain any frontmatter, it still renders as expected.
	 *
	 * @return void
	 */
	public function testNoFrontmatter() {
		$file = new File(Config::GetRootPath() . 'tests/no_frontmatter.md');
		$data = $file->getMetas();
		$this->assertIsArray($data);
		// Even with no frontmatter, some fields should still be present.
		$this->assertArrayHasKey('date', $data);
		$this->assertArrayHasKey('draft', $data);
		$this->assertArrayHasKey('excerpt', $data);

		$this->assertEquals('This file is missing frontmatter, but it should still render.', $data['excerpt']);

		$content = "<h1>Missing Frontmatter!</h1>

<hr />

<ul>
<li><code>tags: blah, foo</code> => <code>tags: [blah, foo]</code></li>
</ul>

<p>This file is missing frontmatter,
but it should still render.</p>

<hr />

<p>It DOES contain horizontal rules however.</p>
";
		$this->assertEquals($content, $file->__toString());
	}

	/**
	 * Test generating an automatic excerpt from a file
	 *
	 * @return void
	 */
	public function testAutoExcerpt() {
		$file = new File(Config::GetRootPath() . 'tests/auto_excerpt.md');
		$excerpt = 'This sentence should come through as the excerpt since it does not have one assigned.' .
			' However, links, italics, and other formatting should not be included.';
		$this->assertEquals($excerpt, $file->getMeta('excerpt'));
	}
}
