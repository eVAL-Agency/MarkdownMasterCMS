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


describe('markdown-container', () => {
	it('basic', () => {
		let md = `::: div
blah

:::
`,
			html = renderer(md);

		expect(html.trim()).toEqual(`<div>
<p>blah</p>
</div>`);
	});

	it('nested', () => {
		let md = `::: .row
::: .col1
blah

:::
::: .col2
blah

:::
:::`,
			html = renderer(md);

		expect(html.trim()).toEqual(`<div class="row">
<div class="col1">
<p>blah</p>
</div>
<div class="col2">
<p>blah</p>
</div>
</div>`);
	});

	/**
	 * In most tags, markdown inside HTML tags should be allowed
	 */
	it('markdown inside html', () => {
		let md = `::: .blocks-2

This is a markdown paragraph
{.block}

<div class="block">This is an HTML div</div>

:::`,
			html = renderer(md);

		expect(html.trim()).toEqual(`<div class="blocks-2">
<p class="block">This is a markdown paragraph</p>
<div class="block">This is an HTML div</div>
</div>`);
	});
});
