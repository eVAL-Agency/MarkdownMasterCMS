/**
 * Extra - Chart.js
 *
 * Renders data charts (bar / line / pie / donut) from a native Markdown table
 * inside a `:::` container, using Chart.js v4 on the client.
 *
 * @module Extras/Chart.js
 * @license The MIT License (MIT)
 * @copyright (c) 2025 eVAL Agency
 * @author Marek Novak
 * @see https://markdownmaster.com/docs/extras/chartjs.html
 * @since 5.2.0
 */

{
	// Ensure Chart.js is loaded before setting up the cms:route handler
	const script = document.createElement('script');
	script.src = CMS.config.webpath + 'extras/chartjs/js/chart.umd.min.js';

	let chartElements = new WeakSet(); // Track already-upgraded elements

	script.onload = () => {
		if (typeof Chart === 'undefined') {
			console.warn('Chart.js failed to load properly');
			return;
		}

		document.addEventListener('cms:route', () => {
			const container = CMS.config.container;
			const chartTypes = ['bar', 'line', 'pie', 'donut'];
			const elements = container.querySelectorAll(chartTypes.map(t => t + ':not([data-chartjs-upgraded])').join(', '));
			const chartTypeMap = { bar: 'bar', line: 'line', pie: 'pie', donut: 'doughnut' };

			// Read configuration
			const colors = CMS.config.extra('chartjs', 'colors', [ '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40' ]);
			const titleEnabled = CMS.config.extra('chartjs', 'title', true);
			const legendEnabled = CMS.config.extra('chartjs', 'legend', true);

			elements.forEach(el => {
				if (chartElements.has(el)) return; // Skip already processed
				chartElements.add(el);

				const table = el.querySelector('table');
				if (!table) {
					console.warn('No <table> found inside chart element', el);
					return;
				}

				// Read title from heading if present
				const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
				const titleText = heading ? heading.textContent.trim() : '';   // heading already .remove()'d
				const titleDisplay = titleEnabled && (titleText !== '');
				if (heading) {
					heading.remove(); // Remove heading from DOM
				}

				// Extract data from table
				const rows = Array.from(table.querySelectorAll('tr'));
				if (rows.length < 2) return; // Need header + at least one data row

				const headers = Array.from(rows[0].querySelectorAll('th, td')).map(cell => cell.textContent.trim());
				if (headers.length < 2) return; // Need at least one label column and one data column

				// First column is labels
				const labels = rows.slice(1).map(row => {
					const cells = Array.from(row.querySelectorAll('td'));
					return cells[0] ? cells[0].textContent.trim() : '';
				});

				// Process data columns (from 2nd header onwards)
				const datasets = [];
				for (let i = 1; i < headers.length; i++) {
					const label = headers[i];
					const data = rows.slice(1).map(row => {
						const cells = Array.from(row.querySelectorAll('td'));
						const cellValue = cells[i] ? cells[i].textContent.trim() : '';
						const num = Number(cellValue);
						return isNaN(num) ? null : num;
					});
					datasets.push({
						label,
						data
					});
				}

				// Apply colors to datasets
				datasets.forEach((dataset, index) => {
					const colorIndex = index % colors.length;
					if (el.tagName.toLowerCase() === 'pie' || el.tagName.toLowerCase() === 'donut') {
						// For pie/donut charts, cycle colors per entry (slice)
						dataset.backgroundColor = dataset.data.map((_, i) => colors[(index + i) % colors.length]);
					} else {
						// For bar/line charts, apply to background and border colors
						dataset.backgroundColor = colors[colorIndex];
						dataset.borderColor = colors[colorIndex];
					}
				});

				// Chart configuration
				const config = {
					type: chartTypeMap[el.tagName.toLowerCase()] || el.tagName.toLowerCase(),
					data: {
						labels,
						datasets
					},
					options: {
						responsive: true,
						maintainAspectRatio: false,
						plugins: {
							title: {
								display: titleDisplay,
								text: titleText
							},
							legend: {
								display: legendEnabled && !el.classList.contains('no-legend')
							}
						}
					}
				};

				// Apply chart-specific options
				if (el.tagName.toLowerCase() === 'bar' || el.tagName.toLowerCase() === 'line') {
					config.options.scales = {};
					const stacked = el.classList.contains('stacked');
					if (stacked) {
						config.options.scales.x = { stacked: true };
						config.options.scales.y = { stacked: true };
					}
				}

				if (el.tagName.toLowerCase() === 'line') {
					// Set fill per dataset for line charts
					if (el.classList.contains('fill')) {
						datasets.forEach(ds => ds.fill = true);
					}
				}

				// Create canvas container
				const canvasContainer = document.createElement('div');
				canvasContainer.style.position = 'relative';
				canvasContainer.style.height = '400px';

				const canvas = document.createElement('canvas');
				canvasContainer.appendChild(canvas);

				// Replace table with canvas container
				table.replaceWith(canvasContainer);

				// Set data attribute to mark as upgraded
				el.setAttribute('data-chartjs-upgraded', '');

				// Create chart
				new Chart(canvas, config);
			});
		});
	};

	document.head.appendChild(script);
}