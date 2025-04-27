/**
 * Test suite for Markdown HTML support
 *
 * @module CMS
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Charlie Powell
 * @see https://github.com/eVAL-Agency/MarkdownMasterCMS
 */

import {describe, expect, it, jest, test} from '@jest/globals';
import renderer from '../../src/app/addons/loader-remarkable';


describe('markdown-html', () => {
	it('basic', () => {
		let md = `<div>blah</div>`,
			html = renderer(md);

		expect(html.trim()).toEqual('<div>blah</div>');
	});

	it('nested', () => {
		let md = `<div class="row">
	<div class="col1">
		blah
	</div>
	<div class="col2">
		blah
	</div>
</div>
	`,
			html = renderer(md);

		expect(html.trim()).toEqual(`<div class="row">
    <div class="col1">
        blah
    </div>
    <div class="col2">
        blah
    </div>
</div>`);
	});

	it('newlines in markup', () => {
		let md = `<script>
// some comment

console.log('test');

</script>
	`,
			html = renderer(md);

		expect(html.trim()).toEqual(`<script>
// some comment

console.log('test');

</script>`);
	});
});
