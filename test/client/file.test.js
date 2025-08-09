/**
 * Test suite for File object
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2023 - 2024 Charlie Powell
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import assert from 'assert';
import {describe, expect, it, jest, test} from '@jest/globals';
import {JSDOM} from 'jsdom';
import File from '../../src/app/file';
import { Config } from '../../src/app/config';
import {FakeResponse} from './fakeresponse';
import CMSError from '../../src/app/cmserror';
import {setSystemContainer} from '../../src/app/templater';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import remarkable from '../../src/app/addons/loader-remarkable';



const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;



describe('File', () => {
	// Define common file contents that can be re-used

	const generic_contents = fs.readFileSync(
		dirname(fileURLToPath(import.meta.url)) + '/../assets/tests/good_file.md',
		'utf8'
	);
	const nodate_contents = fs.readFileSync(
		dirname(fileURLToPath(import.meta.url)) + '/../assets/tests/good_file_no_date.md',
		'utf8'
	);

	const default_config = () => {
		let c = new Config();
		c.markdownEngine = remarkable;
		return c;
	}


	describe('loadContent', () => {
		it('load content', () => {
			fetch = jest.fn(() => {
				return new Promise(resolve => {
					let response = new FakeResponse();

					response._setSuccessfulContent(
						nodate_contents,
						'application/markdown',
						{'Last-Modified': 'Sun, 07 May 2023 19:03:08 GMT'}
					);

					resolve(response);
				});
			});

			let f = new File('test.md', 'test', 'test', default_config());
			f.loadContent().then(() => {
				expect(f.title).toEqual('Testing Bug Features');
				expect(f.seotitle).toEqual('Google Friendly Title');
				expect(f.excerpt).toEqual('This is a generic test');
				expect(f.author).toEqual('Alice');
				expect(f.banner).toEqual({alt: '200.jpg', src: 'https://www.http.cat/200.jpg'});
				expect(f.image).toEqual({alt: 'Success Cat', src: 'https://www.http.cat/200.jpg'});
				expect(f.tags).toEqual(['Test', 'Document']);
				expect(f.url).toEqual('test.md');
				expect(f.date).toEqual('May 7, 2023');
				expect(f.datetime).toBeInstanceOf(Date);
				expect(f.datetime.getFullYear()).toEqual(2023);
				expect(f.datetime.getMonth()).toEqual(4);
				expect(f.datetime.getDate()).toEqual(7);
			});
		});
		it('load content 404 not found', async function(){
			fetch = jest.fn(() => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					response._setErrorNotFound();
					resolve(response);
				});
			});

			let f = new File('test.md', 'test', 'test', default_config());
			console.warn = jest.fn(() => true );
			await expect(f.loadContent()).rejects.toBeInstanceOf(CMSError);
		});
		it('load content network error', async function(){
			fetch = jest.fn(() => {
				return new Promise((resolve, reject) => {
					reject('Network error');
				});
			});

			let f = new File('test.md', 'test', 'test', default_config());
			console.warn = jest.fn(() => true );
			await expect(f.loadContent()).rejects.toBeInstanceOf(CMSError);
		});
	});

	describe('parseFrontMatter', () => {
		it('basic attributes', () => {
			let f = new File('test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseFrontMatter();

			expect(f.title).toEqual('Testing Bug Features');
			expect(f.seotitle).toEqual('Google Friendly Title & Stuff');
			expect(f.excerpt).toEqual('This is a generic test');
			expect(f.author).toEqual('Alice');
			expect(f.banner).toEqual({alt: '200.jpg', src: 'https://www.http.cat/200.jpg'});
			expect(f.image).toEqual({alt: 'Success Cat', src: 'https://www.http.cat/200.jpg'});
			expect(f.tags).toEqual(['Test', 'Document']);
			expect(f.url).toEqual('test.md');
			expect(f.date).toEqual('2023-03-14');
			expect(f.falsy).toEqual(false);
			expect(f.truth).toEqual(true);
			expect(f.iamempty).toBeNull();
		});
		it('protected attributes', () => {
			let f = new File('test.md', 'test', 'test', default_config());
			f.content = `---
title: Testing SEO Features
permalink: https://test.tld
---
`;
			console.warn = jest.fn(() => true);
			f.parseFrontMatter();
			expect(console.warn.mock.calls).toHaveLength(1);
		});
		it('relative file', () => {
			let f = new File('test.md', 'test', 'test', default_config());
			f.content = `---
title: Testing SEO Features
image: 
  alt: Local Cat
  src: images/200.jpg
---
`;
			f.parseFrontMatter();
			expect(f.image).toEqual({alt: 'Local Cat', src: 'images/200.jpg'});
		});
		it('relative file with directory', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = `---
title: Testing SEO Features
image: 
  alt: Local Cat
  src: images/200.jpg
---
`;
			f.parseFrontMatter();
			expect(f.image).toEqual({alt: 'Local Cat', src: '/posts/topic/images/200.jpg'});
		});
		it('bad key case', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = `---
Title: Testing Bug Features
Author: Bob
THING: Yup, this is a thing! 
---
`;
			f.parseFrontMatter();

			expect(f.Title).toBeUndefined();
			expect(f.Author).toBeUndefined();
			expect(f.THING).toBeUndefined();
			expect(f.title).toEqual('Testing Bug Features');
			expect(f.author).toEqual('Bob');
			expect(f.thing).toEqual('Yup, this is a thing!');
		});

		/**
		 * Check to ensure that function cannot be overridden from incoming keys
		 */
		it('function overrides', () => {
			console.warn = jest.fn(() => true );

			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = `---
render: false
title: Sneaky exploit attempt
---
`;
			f.parseFrontMatter();
			expect(f.render).toBeInstanceOf(Object);
			expect(typeof f.render).toBe('function');
		});
		it('multiple attributes', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = `---
title: Food Items
categories: [Soup, Food]
utensils:
  - spoon
  - fork
  - knife
images:
  - alt: Local Cat
    src: images/200.jpg
  - alt: Remote Cat
    src: https://http.cat/200.jpg
---
`;
			f.parseFrontMatter();
			expect(f.categories).toEqual(['Soup', 'Food']);
			expect(f.utensils).toEqual(['spoon', 'fork', 'knife']);
			expect(f.images).toHaveLength(2);
			expect(f.images[0]).toEqual({alt: 'Local Cat', src: '/posts/topic/images/200.jpg'});
			expect(f.images[1]).toEqual({alt: 'Remote Cat', src: 'https://http.cat/200.jpg'});
		});
		it('date is not yesterday', () => {
			let f = new File('test.md', 'test', 'test', default_config());
			f.content = fs.readFileSync(
				dirname(fileURLToPath(import.meta.url)) + '/../assets/tests/dates_are_difficult.md',
				'utf8'
			);

			f.parseFrontMatter();
			expect(f.date).toBeInstanceOf(Date);
			assert.equal(f.date.getFullYear(), 2023);
			assert.equal(f.date.getMonth(), 3);
			assert.equal(f.date.getDate(), 10);
		});
	});

	describe('parseFilename', () => {
		it('/pages/content/about.md', () => {
			let f = new File('/pages/content/about.md', 'test', 'test', default_config());
			f.parseFilename();
			expect(f.name).toEqual('about');
		});
	});

	describe('parsePermalink', () => {
		it('/pages/content/about.md', () => {
			let f = new File('/pages/content/about.md', 'test', 'test', default_config());
			f.parsePermalink();
			expect(f.permalink).toEqual('/pages/content/about.html');
		});
	});

	describe('parseDate', () => {
		it('2023-03-14 frontmatter', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = `---
title: Testing Bug Features
date: '2023-03-14'
---
`;
			f.parseFrontMatter();
			assert.equal(f.date, '2023-03-14');
			f.parseDate();
			assert.equal(f.date, 'Mar 14, 2023');
			expect(f.datetime).toBeInstanceOf(Date);
			assert.equal(f.datetime.getFullYear(), 2023);
			assert.equal(f.datetime.getMonth(), 2);
			assert.equal(f.datetime.getDate(), 14);
		});
		it('2023-03-14 url', () => {
			let f = new File('/posts/topic/2023-03-14-test.md', 'test', 'test', default_config());
			f.content = fs.readFileSync(
				dirname(fileURLToPath(import.meta.url)) + '/../assets/tests/topic/2023-03-14-test.md',
				'utf8'
			);
			f.parseFrontMatter();
			expect(f.url).toContain('2023-03-14');
			expect(f.date).toBeNull();
			f.parseDate();
			expect(f.date).toEqual('Mar 14, 2023');
			expect(f.datetime).toBeInstanceOf(Date);
			expect(f.datetime.getFullYear()).toEqual(2023);
			expect(f.datetime.getMonth()).toEqual(2);
			expect(f.datetime.getDate()).toEqual(14);
		});
		it('2023/03/14 url', () => {
			let f = new File('/posts/topic/2023/03/14/test.md', 'test', 'test', default_config());
			f.content = `---
title: Testing Bug Features
---
`;
			f.parseFrontMatter();
			expect(f.url).toContain('2023/03/14');
			expect(f.date).toBeNull();
			f.parseDate();
			expect(f.date).toEqual('Mar 14, 2023');
			expect(f.datetime).toBeInstanceOf(Date);
			expect(f.datetime.getFullYear()).toEqual(2023);
			expect(f.datetime.getMonth()).toEqual(2);
			expect(f.datetime.getDate()).toEqual(14);
		});
		it('last-modified header', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = `---
title: Testing Bug Features
---
`;
			// Spoof this as it would be set from the HTTP header
			f.datetime = 'Sun, 07 May 2023 19:03:08 GMT';
			f.parseFrontMatter();
			expect(f.date).toBeNull();
			f.parseDate();
			expect(f.date).toEqual('May 7, 2023');
			expect(f.datetime).toBeInstanceOf(Date);
			expect(f.datetime.getFullYear()).toEqual(2023);
			expect(f.datetime.getMonth()).toEqual(4);
			expect(f.datetime.getDate()).toEqual(7);
		});
		it('date frontmatter is a date', () => {
			let f = new File('test.md', 'test', 'test', default_config());
			f.content = `---
title: Testing SEO Features
date: 2023-04-10
---
`;
			f.parseFrontMatter();
			expect(f.date).toBeInstanceOf(Date);
			f.parseDate();
			expect(f.date).toEqual('Apr 10, 2023');
			expect(f.datetime).toBeInstanceOf(Date);
			assert.equal(f.datetime.getFullYear(), 2023);
			assert.equal(f.datetime.getMonth(), 3);
			assert.equal(f.datetime.getDate(), 10);
		});
	});

	describe('parseBody', () => {
		it('marked', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			expect(f.bodyLoaded).toEqual(false);
			expect(f.body).toBeNull();
			f.parseBody().then(() => {
				expect(f.bodyLoaded).toEqual(true);
				expect(f.body).toEqual('<h1 id="test-page">Test Page</h1>\n<p>This is test content about Zebras</p>\n');
			});
		});
		/**
		 * Test if the Markdown engine is not set, it should still render something
		 */
		it('no markdown engine', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.config.markdownEngine = null;
			f.content = generic_contents;
			expect(f.bodyLoaded).toEqual(false);
			expect(f.body).toBeNull();
			f.parseBody().then(() => {
				expect(f.bodyLoaded).toEqual(true);
				expect(f.body).toEqual('<pre>\n\n# Test Page\n\nThis is test content about Zebras</pre>');
			});
		});
		/**
		 * Test if the Markdown page has no FrontMatter content, it should still render
		 */
		it('no frontmatter', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = `# Test Page

This is test content about Zebras`;
			f.parseBody().then(() => {
				expect(f.bodyLoaded).toEqual(true);
				expect(f.body).toEqual('<h1 id="test-page">Test Page</h1>\n<p>This is test content about Zebras</p>\n');
			});
		});
		it('no content', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = '';
			f.parseBody().then(() => {
				expect(f.bodyLoaded).toEqual(true);
				expect(f.body).toEqual('');
			});
		});
	});

	describe('parseContent', () => {
		it('standard', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			expect(f.title).toBeNull();
			expect(f.date).toBeNull();
			expect(f.author).toBeNull();
			expect(f.name).toBeNull();
			expect(f.permalink).toBeNull();
			f.parseContent();
			expect(f.title).toEqual('Testing Bug Features');
			expect(f.seotitle).toEqual('Google Friendly Title & Stuff');
			expect(f.excerpt).toEqual('This is a generic test');
			expect(f.author).toEqual('Alice');
			expect(f.banner).toEqual({alt: '200.jpg', src: 'https://www.http.cat/200.jpg'});
			expect(f.image).toEqual({alt: 'Success Cat', src: 'https://www.http.cat/200.jpg'});
			expect(f.tags).toEqual(['Test', 'Document']);
			expect(f.falsy).toEqual(false);
			expect(f.truth).toEqual(true);
			expect(f.iamempty).toBeNull();
			expect(f.permalink).toEqual('/posts/topic/test.html');
			expect(f.url).toEqual('/posts/topic/test.md');
			expect(f.date).toEqual('Mar 14, 2023');
			expect(f.datetime).toBeInstanceOf(Date);
			expect(f.datetime.getFullYear()).toEqual(2023);
			expect(f.datetime.getMonth()).toEqual(2);
			expect(f.datetime.getDate()).toEqual(14);
		});
	});

	describe('matchesSearch', () => {
		it('standard', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			expect(f.matchesSearch('zebras test alice')).toEqual(true);
			expect(f.matchesSearch('zebras stampede alice')).toEqual(false);
		});
	});

	describe('matchesAttributeSearch', () => {
		it('comparisons', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			expect(f.matchesAttributeSearch({author: 'alice'})).toEqual(true);
			expect(f.matchesAttributeSearch({author: 'bob'})).toEqual(false);
			expect(f.matchesAttributeSearch({title: '~ .*Bug.*'})).toEqual(true);
			expect(f.matchesAttributeSearch({date: '> 2020-02-02'})).toEqual(true);
			expect(f.matchesAttributeSearch({rating: '>= 1'})).toEqual(true);
			expect(f.matchesAttributeSearch({rating: '< 5'})).toEqual(true);
			expect(f.matchesAttributeSearch({datetime: '< 2030-04-05'})).toEqual(true);
			expect(f.matchesAttributeSearch({rating: '<= 4.5'})).toEqual(true);
		});
		it('tags basic', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			expect(f.matchesAttributeSearch({tags: 'document'})).toEqual(true);
			expect(f.matchesAttributeSearch({tags: 'popcorn'})).toEqual(false);
			expect(f.matchesAttributeSearch({tags: ['document', 'draft']})).toEqual(true);
			expect(f.matchesAttributeSearch({tags: ['hot', 'buttered', 'popcorn']})).toEqual(false);
		});
		it('or mode', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			expect(f.matchesAttributeSearch({author: 'Richard', tags: ['Pineapple', 'Pizza'], rating: '> 2.0'}, 'OR')).toEqual(true);
			expect(f.matchesAttributeSearch({author: 'Richard', tags: ['Pineapple', 'Pizza'], rating: '> 5.0'}, 'OR')).toEqual(false);
		});
		it('and mode', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			expect(f.matchesAttributeSearch({author: 'Alice', tags: ['Document', 'Pizza'], rating: '> 2.0'})).toEqual(true);
			expect(f.matchesAttributeSearch({author: 'Alice', tags: ['Pineapple', 'Pizza'], rating: '> 2.0'})).toEqual(false);
		});
		it('null searches', () => {
			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			expect(f.matchesAttributeSearch({author: null})).toEqual(false);
			expect(f.matchesAttributeSearch({idonotexist: 'bob'})).toEqual(false);
		});
	});

	describe('_matchesAttribute', () => {
		let f = new File();

		it('bool true = string true', () => {
			f.test = true;
			expect(f._matchesAttribute('test', 'true')).toEqual(true);
		});

		it('bool true = string 1', () => {
			f.test = true;
			expect(f._matchesAttribute('test', '1')).toEqual(true);
		});

		it('int 1 = string 1', () => {
			f.test = 1;
			expect(f._matchesAttribute('test', '1')).toEqual(true);
		});

		it('Date 2025-01-01 = string 2025-01-01', () => {
			f.test = new Date('2025-01-01');
			expect(f._matchesAttribute('test', '2025-01-01')).toEqual(true);
		});

		it('NULL != string 1', () => {
			expect(f._matchesAttribute('attributeDoesNotExist', '!= 1')).toEqual(true);
		});

		it('string /pages/foo.html ~ string foo', () => {
			f.test = '/pages/foo.html';
			expect(f._matchesAttribute('test', '~ foo')).toEqual(true);
		});
	});

	describe('render', () => {
		let area = {};

		it('seotitle', () => {
			setSystemContainer(area);

			fetch = jest.fn(() => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					response._setSuccessfulContent(
						'<html><body><h1><%= data.title %></h1></body></html>',
						'text/html'
					);
					resolve(response);
				});
			});

			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			f.render().then(() => {
				expect(global.document.title).toEqual('Google Friendly Title & Stuff');
				expect(area.innerHTML).toEqual('<html><body><h1>Testing Bug Features</h1></body></html>');
			});
		});
		it('title', () => {
			setSystemContainer(area);

			fetch = jest.fn(() => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					response._setSuccessfulContent(
						'<html><body><h1><%= data.title %></h1></body></html>',
						'text/html'
					);
					resolve(response);
				});
			});

			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			f.seotitle = null;
			f.render().then(() => {
				expect(global.document.title).toEqual('Testing Bug Features');
				expect(area.innerHTML).toEqual('<html><body><h1>Testing Bug Features</h1></body></html>');
			});
		});
		it('no title', () => {
			setSystemContainer(area);

			fetch = jest.fn(() => {
				return new Promise(resolve => {
					let response = new FakeResponse();
					response._setSuccessfulContent(
						'<html><body><h1><%= data.title %></h1></body></html>',
						'text/html'
					);
					resolve(response);
				});
			});

			let f = new File('/posts/topic/test.md', 'test', 'test', default_config());
			f.content = generic_contents;
			f.parseContent();
			f.seotitle = null;
			f.title = '';
			f.render().then(() => {
				expect(global.document.title).toEqual('Page');
				expect(area.innerHTML).toEqual('<html><body><h1></h1></body></html>');
			});
		});
	});
});
