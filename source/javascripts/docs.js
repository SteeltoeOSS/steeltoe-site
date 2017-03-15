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
  		selector: TOClinkSelector,
  		container: window,
  		offset: 35,
  		activeClass: 'active-toc-link',
  		scrollDelay: false,
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