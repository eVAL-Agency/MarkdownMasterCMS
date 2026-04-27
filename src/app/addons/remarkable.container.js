/**
 * MarkdownMaster CMS
 *
 * The MIT License (MIT)
 * Copyright (c) 2026 Charlie Powell
 * https://github.com/cdp1337/markdownmaster
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
export default (remarkable) => {
	remarkable.block.ruler.before('code', 'container', (state, startLine, endLine, silent) => {
		let pos = state.bMarks[startLine] + state.tShift[startLine];
		let max = state.eMarks[startLine];

		if (state.src.slice(pos, pos + 3) !== ':::') return false;
		if (silent) return true;

		// Parse params: ::: tag .class #id
		const params = state.src.slice(pos + 3, max).trim().split(/\s+/);
		let tag = 'div', classes = [], id = '';

		params.forEach(p => {
			if (p.startsWith('.')) classes.push(p.slice(1));
			else if (p.startsWith('#')) id = p.slice(1);
			else if (p) tag = p;
		});

		// --- NESTING LOGIC ---
		let nextLine = startLine;
		let depth = 1; // We just opened one

		while (++nextLine < endLine) {
			let curPos = state.bMarks[nextLine] + state.tShift[nextLine];
			let curMax = state.eMarks[nextLine];
			let lineText = state.src.slice(curPos, curMax).trim();

			if (lineText.startsWith(':::')) {
				// If it's just ':::', it's a closer. If it has text, it's a new opener.
				if (lineText.length === 3) {
					depth--;
				} else {
					depth++;
				}
			}
			if (depth === 0) break;
		}
		// ---------------------

		state.tokens.push({
			type: 'container_open',
			tag: tag,
			classes: classes,
			id: id,
			level: state.level++
		});

		state.parser.tokenize(state, startLine + 1, nextLine);

		state.tokens.push({
			type: 'container_close',
			tag: tag,
			level: --state.level
		});

		state.line = nextLine + 1;
		return true;
	});

	remarkable.renderer.rules.container_open = (tokens, idx) => {
		const t = tokens[idx];
		const classAttr = t.classes.length ? ` class="${t.classes.join(' ')}"` : '';
		const idAttr = t.id ? ` id="${t.id}"` : '';
		return `<${t.tag}${idAttr}${classAttr}>\n`;
	};

	remarkable.renderer.rules.container_close = (tokens, idx) => `</${tokens[idx].tag}>\n`;
};
