import babel from '@rollup/plugin-babel';
import eslint from '@rollup/plugin-eslint';
import resolve from '@rollup/plugin-node-resolve';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} (c) ${new Date().getFullYear()} ${pkg.author.name} ${pkg.homepage} | Originally based off https://chrisdiana.github.io/cms.js from (c) 2021 Chris Diana */`;
export default [{
	input: 'src/app/main.js',
	external: ['CMS'],
	output: [
		{
			file: 'dist/app/cms.js',
			name: 'CMS',
			format: 'iife',
			banner: banner,
		}
	],
	plugins: [
		eslint(),
		resolve(),
		//commonjs(),
		babel({
			exclude: 'node_modules/**',
			babelHelpers: 'bundled'
		}),
	],
}];
