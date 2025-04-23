/**
 * Test suite for Configuration
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2023 - 2024 Charlie Powell
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import {describe, expect, it, jest, test} from '@jest/globals';
import {Config, ConfigType} from '../../src/app/config';

describe('Config', () => {
	describe('load', () => {
		it('basic', () => {
			let c,
				params = {
					banana: 'BANANA',
					webpath: '/test/',
					types: [
						{
							name: 'test',
							layout: {
								list: 'test-list',
								single: 'test-single',
								sort: 'key',
								title: 'Tests'
							}
						}
					]
				};

			c = new Config(params);
			expect(c.banana).toEqual('BANANA');
			expect(c.webpath).toEqual('/test/');
			expect(c.types).toHaveLength(1);
			expect(c.types[0]).toBeInstanceOf(ConfigType);
			expect(c.types[0].name).toEqual('test');
			expect(c.types[0].layout).toBeInstanceOf(Object);
			expect(c.types[0].layout.list).toEqual('test-list');
			expect(c.types[0].layout.single).toEqual('test-single');
			expect(c.types[0].layout.sort).toEqual('key');
			expect(c.types[0].layout.title).toEqual('Tests');
		});
	});
});