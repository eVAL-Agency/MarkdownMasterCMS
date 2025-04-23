/**
 * Test suite for CMSError objects
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2023 - 2024 Charlie Powell
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import {describe, expect, it, jest, test} from '@jest/globals';
import CMSError from '../../src/app/cmserror';

describe('CMSError', () => {
	describe('toString', () => {
		it('404', () => {
			let e = new CMSError(404, 'Not Found');
			expect(e.toString()).toEqual('[404] Not Found');
		});
	});
});