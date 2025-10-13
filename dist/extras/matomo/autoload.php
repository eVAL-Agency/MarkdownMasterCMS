<?php

use MarkdownMaster\Hooks;
use MarkdownMaster\File;
use MarkdownMaster\Views\HTMLTemplateView;
use MarkdownMaster\Config;

Hooks::Add('render_page_view', function(File $file, HTMLTemplateView $view) {
	// Add the necessary Matomo tracking code into the page header
	$host = Config::GetExtraParameter('matomo', 'host', null);
	$site = Config::GetExtraParameter('matomo', 'siteId', null);
	if (!$host || !$site) {
		// Matomo not configured
		return;
	}
	$view->headScripts[] = <<<EOD
var _paq = window._paq = window._paq || [];
/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
//_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
(function() {
	var u="//$host/";
	_paq.push(['setTrackerUrl', u+'matomo.php']);
	_paq.push(['setSiteId', '$site']);
	var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
	g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
})();
EOD;

	$view->footContent[] = <<<EOD
<noscript><p><img referrerpolicy="no-referrer-when-downgrade" src="//$host/matomo.php?idsite={$site}&amp;rec=1" style="border:0;" alt="" /></p></noscript>
EOD;
});
