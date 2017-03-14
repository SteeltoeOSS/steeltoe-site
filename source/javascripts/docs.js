//= require vendor/sticky
//= require vendor/smooth-scroll
//= require vendor/gumshoe

document.addEventListener("DOMContentLoaded", function() {
	var stickyTOC = null,
			SM_BREAKPOINT = 640,
			TOClinkSelector = '.toc-link ul li a'
	
	init();

	function init() {
		var windowWidth = window.innerWidth;
		if (windowWidth > SM_BREAKPOINT) stickyTOC = new Sticky('#toc');
		window.onresize = handleStickyNav;

		smoothScroll.init({
	    selector: TOClinkSelector,
	    speed: 500,
	    easing: 'easeInOutCubic',
	    offset: 0,
		});

		gumshoe.init({
  		selector: TOClinkSelector, // Default link selector (must use a valid CSS selector)
  		container: window, // The element to spy on scrolling in (must be a valid DOM Node)
  		offset: 35, // Distance in pixels to offset calculations
  		activeClass: 'active-toc-link', // Class to apply to active navigation link and its parent list item
  		scrollDelay: false, // Wait until scrolling has stopped before updating the navigation
		});
	}

	function destroyStickyNav() {
		stickyTOC.destroy();
		stickyTOC = null;
	}

	function handleStickyNav() {
		var windowWidth = window.innerWidth,
				stickyTOCExists = !!stickyTOC,
				stickyTOCDoesntExist = !stickyTOCExists;

		if(windowWidth < SM_BREAKPOINT && stickyTOCExists) {
			destroyStickyNav();
		} else if(windowWidth > SM_BREAKPOINT && stickyTOCDoesntExist) {
			stickyTOC = new Sticky('#toc');
		}
	}

});