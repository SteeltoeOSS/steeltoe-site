//= require vendor/tocbot.min

document.addEventListener("DOMContentLoaded", function() {
	init();

	function init() {
		tocbot.init({
			// Where to render the table of contents.
			tocSelector: '.js-toc',
			// Where to grab the headings to build the table of contents.
			contentSelector: '.js-toc-content',
			ignoreSelector: '.js-toc-ignore',
			// Which headings to grab inside of the contentSelector element.
			headingSelector: 'h1, h2, h3, h4',
			positionFixedSelector: '#toc',
			// Fixed position class to add to make sidebar fixed after scrolling down past the fixedSidebarOffset.
			positionFixedClass: 'is-position-fixed',
			// fixedSidebarOffset can be any number but by default is set to auto which sets the fixedSidebarOffset to the sidebar element's offsetTop from the top of the document on init.
			fixedSidebarOffset: '200',
		});
	}
});