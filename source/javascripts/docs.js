//= require vendor/jquery-3.1.1.slim.min
//= require vendor/sticky-kit.min
//= require vendor/smooth-scroll
//= require vendor/gumshoe

document.addEventListener("DOMContentLoaded", function() {
	var stickyTOC = $('#toc'),
			SM_BREAKPOINT = 640,
			TOClinkSelector = '.toc-link ul li a'
	
	init();

	function init() {
		var windowWidth = window.innerWidth;
		if (windowWidth > SM_BREAKPOINT) stickyTOC.stick_in_parent();
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
		stickyTOC.trigger("sticky_kit:detach");
	}

	function handleStickyNav() {
		var windowWidth = window.innerWidth,
				stickyTOCExists = stickyTOC.hasClass('is_stuck');
				stickyTOCDoesntExist = !stickyTOCExists;

		if(windowWidth < SM_BREAKPOINT && stickyTOCExists) {
			destroyStickyNav();
		} else if(windowWidth > SM_BREAKPOINT && stickyTOCDoesntExist) {
			stickyTOC.stick_in_parent();
		}
	}
});