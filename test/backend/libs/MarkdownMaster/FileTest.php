<?php

use PHPUnit\Framework\TestCase;
use MarkdownMaster\File;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\UsesClass;

#[CoversClass(File::class)]
#[UsesClass(Config::class)]
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
	 * Test for a file that does not exist
	 *
	 * @return void
	 */
	public function testNotFoundFile() {
		$this->expectException(\Exception::class);
		new File(Config::GetRootPath() . 'tests/i-do-not-exist.md');
	}

	/**
	 * Test for a file that is an invalid (or uninstalled) type of file
	 *
	 * @return void
	 */
	public function testBadTypeFile() {
		$this->expectException(\Exception::class);
		new File(Config::GetRootPath() . 'fails/exists_but_empty.md');
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
		$this->assertEquals('Google Friendly Title & Stuff', $file->getMeta('seotitle'));
		$this->assertEquals('Google Friendly Title & Stuff', $file->getMeta(['seotitle', 'title'], null));
		$this->assertNull($file->getMeta(['invalid1'], null));
		$this->assertEquals('This is a generic test', $file->getMeta('excerpt'));
		$this->assertEquals('2023-03-14', $file->getMeta('date'));
		$this->assertEquals('Alice', $file->getMeta('author'));
		$this->assertEquals(4.5, $file->getMeta('rating'));
		$this->assertArrayHasKey('src', $file->getMeta('banner'));
		$this->assertIsArray($file->getMeta('tags'));
		$this->assertEquals(false, $file->getMeta('falsy'));
		$this->assertEquals(true, $file->getMeta('truth'));
		$this->assertEquals('', $file->getMeta('iamempty'));

		$listingContent = '<article>' .
			'<h2><a href="http://localhost/tests/good_file.html">Testing Bug Features</a></h2>' .
			'<p>This is a generic test</p><img src="https://www.http.cat/200.jpg" alt="Success Cat"/>' .
			'</article>';
		$this->assertEquals($listingContent, $file->getListing());

		$this->assertGreaterThan(0, $file->getTimestamp());
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
		$this->assertArrayHasKey('title', $data);
		$this->assertEquals('No Frontmatter', $file->getMeta('title'));

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

	/**
	 * Test generating an automatic excerpt from a file
	 *
	 * @return void
	 */
	public function testAutoExcerptLongParagraph() {
		$file = new File(Config::GetRootPath() . 'tests/really_long_paragraph.md');
		$excerpt = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' .
			'Esse nonumy laborum dolore vel qui minim proident eros aute quis magna ipsum nisl iusto, ' .
			'veniam rebum obcaecat molestie elitr aliquid nulla option et doming eos. ' .
			'Eros qui laoreet molestie cum nobis minim imperdiet. Aliqua elit hendrerit id volutpat dolore clita.';
		$this->assertEquals($excerpt, $file->getMeta('excerpt'));
	}

	/**
	 * Test retriving a date string from the filename / directory path
	 *
	 * @return void
	 */
	public function testDateInFilename() {
		$file = new File(Config::GetRootPath() . 'tests/2025-02-05-date-in-filename.md');
		$this->assertEquals('2025-02-05', $file->getMeta('date'));
	}

	/**
	 * Test retriving a date string from the filename / directory path
	 *
	 * @return void
	 */
	public function testDateIsTimestamp() {
		$file = new File(Config::GetRootPath() . 'tests/date_is_timestamp.md');
		$this->assertEquals('2025-03-15', $file->getMeta('date'));
	}

	/**
	 * Test image filename resolving
	 *
	 * @return void
	 */
	public function testImageResolving() {
		$imagePath = Config::GetHost() . Config::GetWebPath() . 'tests/';
		$file = new File(Config::GetRootPath() . 'tests/image_resolving.md');
		$this->assertEquals('Image Test', $file->getMeta('title'));

		$this->assertEquals($imagePath . 'some-image.jpg', $file->getMeta('image')['src']);
		$this->assertEquals('some image', $file->getMeta('image')['alt']);

		$this->assertEquals($imagePath . 'some-banner.jpg', $file->getMeta('banner')['src']);
		$this->assertEquals('some banner', $file->getMeta('banner')['alt']);

		$this->assertEquals($imagePath . 'some-full.jpg', $file->getMeta('full')['src']);
		$this->assertEquals('Full Image', $file->getMeta('full')['alt']);

		$this->assertEquals($imagePath . 'product1.jpg', $file->getMeta('products')[0]['image']);
		$this->assertEquals('Product 1', $file->getMeta('products')[0]['title']);

		$this->assertEquals($imagePath . 'product2.jpg', $file->getMeta('products')[1]['image']);
		$this->assertEquals('Product 2', $file->getMeta('products')[1]['title']);

		$this->assertEquals($imagePath . 'product3.jpg', $file->getMeta('products')[2]['image']);
		$this->assertEquals('Product 3', $file->getMeta('products')[2]['title']);
	}
}
