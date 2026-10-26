/**
 * Test suite for FileCollection
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2023 - 2024 Charlie Powell
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import {describe, expect, it, jest, test} from '@jest/globals';
import {FakeResponse} from './fakeresponse';
import FileCollection from '../../src/app/filecollection';
import {Config} from '../../src/app/config';
import {JSDOM} from 'jsdom';
import File from '../../src/app/file';
import CMSError from '../../src/app/cmserror';


const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;

describe('FileCollection', () => {
	const good_directory_listing_contents = `<html><body>
<a href="../">../</a>
<a href="subtopics/">subtopics/</a>
<a href="img.png">img.png</a>
<a href="topic.md">topic.md</a>
<a href="user.md">user.md</a>
</body></html>
		`;

	const good_files = [
		new File('/tests/test1.md', 'tests', 'test', new Config()),
		new File('/tests/test2.md', 'tests', 'test', new Config()),
		new File('/tests/test3.md', 'tests', 'test', new Config()),
		new File('/tests/test4.md', 'tests', 'test', new Config()),
	];
	good_files[0].title = 'Zulu';
	good_files[0].permalink = '/tests/test1.html';
	good_files[1].title = 'Beta';
	good_files[1].tags = ['Test', 'greek'];
	good_files[1].permalink = '/tests/test2.html';
	good_files[2].title = 'Charlie';
	good_files[2].sticky = true;
	good_files[2].permalink = '/tests/test3.html';
	good_files[3].title = 'Alpha';
	good_files[3].tags = ['Test'];
	good_files[3].permalink = '/tests/test4.html';

	describe('getFileListUrl', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			expect(collection.getFileListUrl()).toEqual('/tests');
		});
	});
	describe('getFileElements', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			let files = collection.getFileElements(good_directory_listing_contents);
			expect(files).toHaveLength(3);
			expect(files[0]).toEqual('subtopics/');
			expect(files[1]).toEqual('topic.md');
			expect(files[2]).toEqual('user.md');
		});
	});
	describe('getFiles', () => {
		it('basic', () => {
			let subtopics = `<html><body>
<a href="../">../</a>
<a href="images/">images/</a>
<a href="topic1.md">topic1.md</a>
<a href="topic2.md">topic2.md</a>
</body></html>
		`
			fetch = jest.fn(url => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					if (url === '/tests/subtopics/') {
						response._setSuccessfulContent(subtopics, 'html/html');
					} else {
						response._setSuccessfulContent(good_directory_listing_contents, 'html/html');
					}

					resolve(response);
				});
			});

			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.getFiles().then(() => {
				expect(collection.allFiles).toHaveLength(4);
				expect(collection.allFiles[0].url).toEqual('/tests/topic.md');
				expect(collection.allFiles[1].url).toEqual('/tests/user.md');
				expect(collection.allFiles[2].url).toEqual('/tests/subtopics/topic1.md');
				expect(collection.allFiles[3].url).toEqual('/tests/subtopics/topic2.md');
			});
		});
	});
	describe('scanDirectory', () => {
		it('good test', () => {
			fetch = jest.fn(() => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					response._setSuccessfulContent(good_directory_listing_contents, 'html/html');
					resolve(response);
				});
			});

			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.scanDirectory('/tests/').then(more_directories => {
				expect(collection.allFiles).toHaveLength(2);
				expect(collection.allFiles[0].url).toEqual('/tests/topic.md');
				expect(collection.allFiles[1].url).toEqual('/tests/user.md');
				expect(more_directories).toHaveLength(1);
				expect(more_directories[0]).toEqual('/tests/subtopics/');
			});
		});
	});

	/**
	 * Tests for the getPageUrl function of FileCollection
	 */
	describe('getPageUrl', () => {
		it ('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			expect(collection.getPageUrl(1)).toEqual('/tests.html');
		});
		it ('basic with page number', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			collection.paginate(1)
			expect(collection.getPageUrl(2)).toEqual('/tests.html?page=2');
		});
		it ('more pages than present', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();

			// There are 4 tests, so setting paginate to 10 results per page
			// will result in only one page of results.
			collection.paginate(10)
			expect(collection.getPageUrl(2)).toEqual('/tests.html');
		});
	});

	/**
	 * Tests for the getPreviousPageUrl function of FileCollection
	 */
	describe('getPreviousPageUrl', () => {
		it ('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			// When on page 3, previous will be 2.
			collection.paginate(1, 3)
			expect(collection.getPreviousPageUrl()).toEqual('/tests.html?page=2');
		});

		it ('basic on page 2', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			// When on page 2, previous will simply be omitted.
			collection.paginate(1, 2)
			expect(collection.getPreviousPageUrl()).toEqual('/tests.html');
		});

		it ('basic on page 1', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			// When on page 1, previous will simply be omitted.
			collection.paginate(1, 1)
			expect(collection.getPreviousPageUrl()).toEqual('/tests.html');
		});

		it ('no pagination set', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			// When paginate was never called, this function simply returns the URL.
			expect(collection.getPreviousPageUrl()).toEqual('/tests.html');
		});
	});

	/**
	 * Tests for the getNextPageUrl function of FileCollection
	 */
	describe('getNextPageUrl', () => {
		it ('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			// When on page 3, next will be 4.
			collection.paginate(1, 3)
			expect(collection.getNextPageUrl()).toEqual('/tests.html?page=4');
		});

		it ('basic on last page', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			// When on page 2, previous will simply be omitted.
			collection.paginate(1, 4)
			expect(collection.getNextPageUrl()).toEqual('/tests.html?page=4');
		});

		it ('basic on page 1', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			// When on page 1, previous will simply be omitted.
			collection.paginate(1, 1)
			expect(collection.getNextPageUrl()).toEqual('/tests.html?page=2');
		});

		it ('no pagination set', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			// When paginate was never called, this function simply returns the URL.
			expect(collection.getNextPageUrl()).toEqual('/tests.html');
		});
	});

	/**
	 * Tests for the getPageTagUrl function of FileCollection
	 */
	describe('getPageTagUrl', () => {
		it ('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();
			expect(collection.getPageTagUrl('test')).toEqual('/tests.html?tag=test');
		});
		it ('already filtered', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();

			// With the tag already present, it should remove it.
			collection.filterTag('Test')
			expect(collection.getPageTagUrl('test')).toEqual('/tests.html');
		});
		it ('combined tags', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;
			collection.resetFilters();

			// With the tag already present, it should add a second when requested
			collection.filterTag('Test')
			expect(collection.getPageTagUrl('GREEK')).toEqual('/tests.html?tag=test%2Cgreek');
		});

		it ('spaces and underscores', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());

			// URLs should generate underscores.
			expect(collection.getPageTagUrl('Greek TEST')).toEqual('/tests.html?tag=greek_test');
		});
	});

	describe('filterSort', () => {
		it ('basic sort', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			collection.filterSort('title');

			expect(collection['tests'][0].title).toEqual('Alpha');
			expect(collection['tests'][1].title).toEqual('Beta');
			expect(collection['tests'][2].title).toEqual('Charlie');
			expect(collection['tests'][3].title).toEqual('Zulu');
		});
		it ('reverse basic sort', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			collection.filterSort('title-r');

			expect(collection['tests'][0].title).toEqual('Zulu');
			expect(collection['tests'][1].title).toEqual('Charlie');
			expect(collection['tests'][2].title).toEqual('Beta');
			expect(collection['tests'][3].title).toEqual('Alpha');
		});
		it ('feature #2 sticky sort', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			collection.filterSort('sticky-r, title');

			expect(collection['tests'][0].title).toEqual('Charlie');
			expect(collection['tests'][1].title).toEqual('Alpha');
			expect(collection['tests'][2].title).toEqual('Beta');
			expect(collection['tests'][3].title).toEqual('Zulu');
		});

		it ('sort with custom function', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			collection.filterSort((a, b) => {
				return a.title.localeCompare(b.title);
			})

			expect(collection['tests'][0].title).toEqual('Alpha');
			expect(collection['tests'][1].title).toEqual('Beta');
			expect(collection['tests'][2].title).toEqual('Charlie');
			expect(collection['tests'][3].title).toEqual('Zulu');
		});

		it ('sort by recent', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			collection.filterSort('recent');

			expect(collection['tests'][0].title).toEqual('Zulu');
			expect(collection['tests'][1].title).toEqual('Beta');
			expect(collection['tests'][2].title).toEqual('Charlie');
			expect(collection['tests'][3].title).toEqual('Alpha');
		});

		it('random sort with mocked random', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			// Set up predictable random sequence
			const randomSequence = [0.6, -0.3, 0.8, -0.1];
			let callCount = 0;

			jest.spyOn(Math, 'random').mockImplementation(() => {
				return randomSequence[callCount++ % randomSequence.length];
			});

			collection.resetFilters();
			collection.filterSort('random');

			expect(collection['tests'][0].title).toEqual('Beta');
			expect(collection['tests'][1].title).toEqual('Alpha');
			expect(collection['tests'][2].title).toEqual('Charlie');
			expect(collection['tests'][3].title).toEqual('Zulu');
		});
	});
	describe('filterSearch', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			collection.filterSearch('zulu').then(files => {
				expect(files).toHaveLength(1);
				expect(files[0].title).toEqual('Zulu');
			});
		});
	});
	describe('filterAttributeSearch', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			let files = collection.filterAttributeSearch({title: 'zulu'});
			expect(files).toHaveLength(1);
			expect(files[0].title).toEqual('Zulu');
		});
	});
	describe('filterTag', () => {
		/**
		 * Test basic single tag filtering
		 */
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			let files = collection.filterTag('greek');
			expect(files).toHaveLength(1);
			expect(files[0].title).toEqual('Beta');
			expect(collection.hasFilterTag('greek')).toEqual(true);
			expect(collection.hasFilterTag('Test')).toEqual(false);
		});

		/**
		 * Test that tags are case insensitive
		 */
		it('capitalization does not matter', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			let files = collection.filterTag('GREEK');
			expect(files).toHaveLength(1);
			expect(files[0].title).toEqual('Beta');
			expect(collection.hasFilterTag('GREEK')).toEqual(true);
			expect(collection.hasFilterTag('TEST')).toEqual(false);
		});

		/**
		 * Test filtering with multiple tags provided
		 */
		it('multiple tags', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			let files;

			collection.allFiles = good_files;

			// No tags set yet, any check for 'hasFilterTag' should return false.
			expect(collection.hasFilterTag('greek')).toEqual(false);
			expect(collection.hasFilterTag('Test')).toEqual(false);

			collection.resetFilters();
			files = collection.filterTag('Test');
			expect(files).toHaveLength(2); // There are 2 tests with "Test" as the tag
			expect(files[0].title).toEqual('Beta');
			expect(collection.hasFilterTag('greek')).toEqual(false);
			expect(collection.hasFilterTag('Test')).toEqual(true);

			collection.resetFilters();
			files = collection.filterTag('greek,Test');
			expect(files).toHaveLength(1); // Only 1 with both Test and Greek.
			expect(files[0].title).toEqual('Beta');
			expect(collection.hasFilterTag('greek')).toEqual(true);
			expect(collection.hasFilterTag('Test')).toEqual(true);

			collection.resetFilters();
			files = collection.filterTag('greek|Test');
			expect(files).toHaveLength(2); // 2 tests have either "Greek" or "Test"
			expect(collection.hasFilterTag('greek')).toEqual(true);
			expect(collection.hasFilterTag('Test')).toEqual(true);
		});

		it ('spaces and underscores', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			let files;
			let testFile = new File('/tests/test1.md', 'tests', 'test', new Config());
			collection.allFiles = [testFile];
			testFile.tags = ['Greek Test'];

			// Filtering should support underscores and spaces as the same.
			collection.resetFilters();
			files = collection.filterTag('greek test');
			expect(files).toHaveLength(1);

			collection.resetFilters();
			files = collection.filterTag('greek_test');
			expect(files).toHaveLength(1);

			collection.resetFilters();
			files = collection.filterTag('greek');
			expect(files).toHaveLength(0);
		});
	});
	describe('filterPermalink', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			let files = collection.filterPermalink('/tests/');
			expect(files).toHaveLength(4);

			files = collection.filterPermalink('/tests/test4');
			expect(files).toHaveLength(1);
		});
	});
	describe('getTags', () => {
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();

			let tags = collection.getTags();
			expect(tags).toHaveLength(2);
			expect(tags[0]).toEqual({name: 'Test', tag: 'test', count: 2, url: '/tests.html?tag=test', weight: 10});
			expect(tags[1]).toEqual({name: 'greek', tag: 'greek', count: 1, url: '/tests.html?tag=greek', weight: 5});
		});

		it('simple sort with strings', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();

			let tags = collection.getTags('name-r');
			expect(tags).toHaveLength(2);
			expect(tags[0]).toEqual({name: 'Test', tag: 'test', count: 2, url: '/tests.html?tag=test', weight: 10});
			expect(tags[1]).toEqual({name: 'greek', tag: 'greek', count: 1, url: '/tests.html?tag=greek', weight: 5});

			tags = collection.getTags('name');
			expect(tags[0]).toEqual({name: 'greek', tag: 'greek', count: 1, url: '/tests.html?tag=greek', weight: 5});
			expect(tags[1]).toEqual({name: 'Test', tag: 'test', count: 2, url: '/tests.html?tag=test', weight: 10});
		});

		it('simple sort with ints', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();

			let tags = collection.getTags('weight-r');
			expect(tags).toHaveLength(2);
			expect(tags[0]).toEqual({name: 'Test', tag: 'test', count: 2, url: '/tests.html?tag=test', weight: 10});
			expect(tags[1]).toEqual({name: 'greek', tag: 'greek', count: 1, url: '/tests.html?tag=greek', weight: 5});

			tags = collection.getTags('weight');
			expect(tags[0]).toEqual({name: 'greek', tag: 'greek', count: 1, url: '/tests.html?tag=greek', weight: 5});
			expect(tags[1]).toEqual({name: 'Test', tag: 'test', count: 2, url: '/tests.html?tag=test', weight: 10});
		});
	});

	describe('getFilteredTags', () => {
		const files = [
			new File('/tests/test1.md', 'tests', 'test', new Config()),
			new File('/tests/test2.md', 'tests', 'test', new Config()),
			new File('/tests/test3.md', 'tests', 'test', new Config()),
			new File('/tests/test4.md', 'tests', 'test', new Config()),
		];
		files[0].tags = ['test', 'page1'];
		files[1].tags = ['Test', 'page2'];
		files[2].tags = ['Test', 'page3'];
		files[3].tags = ['Test', 'page4'];

		it('pagination does not affect filtered tags', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = files;

			collection.resetFilters();

			// No sorting should return all tags
			expect(collection.getFilteredTags()).toHaveLength(5);

			// Pagination should return all tags
			collection.paginate(1, 1);
			expect(collection.getFilteredTags()).toHaveLength(5);
		});

		it('filters do affect filtered tags', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = files;

			collection.resetFilters();
			// Before filtering, all 5 tags are present
			expect(collection.getFilteredTags()).toHaveLength(5);
			collection.filterTag('page2')

			// After filtering, just 'test' and 'page2' should be available.
			expect(collection.getFilteredTags()).toHaveLength(2);
		});
	});

	describe('getFileByPermalink', () => {
		/**
		 * Test a basic lookup by permalink
		 */
		it('basic', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			let file = collection.getFileByPermalink('/tests/test2.html');
			expect(file.url).toEqual('/tests/test2.md');
		});

		/**
		 * Test a lookup by permalink that doesn't exist
		 *
		 * To support draft pages, this should still return a file handle.
		 */
		it('not found', () => {
			let collection = new FileCollection('tests', {list: 'test'}, new Config());
			collection.allFiles = good_files;

			collection.resetFilters();
			let file = collection.getFileByPermalink('/tests/test-invalid.html');
			expect(file.url).toEqual('/tests/test-invalid.md');
		});

	});
	describe('render', () => {
		// @todo
	});
});
