/**
 * Configuration for CMS when operating in client-only mode
 *
 * THIS IS NOT REQUIRED WHEN USING THE SERVER!
 *
 */

let config = {

	// The URL that will be the default view that will initially load
	// Examples:
	// 'posts' -- Set default view to /posts.html
	// 'pages/home' -- Set default view to /pages/home.html
	defaultView: 'pages/home',

	// Set to true to enable debug logging, (will enable logging events to the console)
	debug: false,

	// Set this to the web path to use for the URL.
	// for example, if your site is located in https://domain.tld/cms/
	// your webpath should be '/cms/'
	// NOTE, a trailing slash is REQUIRED.
	webpath: '/',

	// The name of the layouts directory.
	layoutDirectory: 'layouts',

	// These are the types of content to load. Each type name is a directory or
	// folder where the files, pages or posts are located. Each type has a list
	// and single layout template that will determine how the file will be rendered.
	// Each type expects the following format:
	// {
	//    name: 'posts', // Key name for this content type
	//    layout: {
	//      list: 'post-list', // Template file to use for listing this content type
	//      single: 'post',    // Template file to use for rendering a single page
	//      title: 'Posts'     // Page title set automatically when browsing the listing page
	//    },
	//  },
	types: [
		{
			name: 'posts',
			layout: {
				list: 'posts',
				single: 'post',
				sort: 'datetime-r',
				title: 'Posts'
			},
		},
		{
			name: 'pages',
			layout: {
				list: 'pages',
				single: 'page',
				sort: 'title',
				title: 'Pages'
			},
		},
	],

	// ID of element to attach CMS.js to
	elementId: 'cms',
};


// Inform the CMS that the configuration is ready.
document.dispatchEvent(new CustomEvent('cms:config', { detail: config }));
