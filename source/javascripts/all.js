$(document).ready(function() {
  var eeToggle = $('.eeToggle');
  var codeSnippets = $('.code-snippet code');
  var svgs = $('.svg-illustration');

  codeSnippets.each(function(index, cs) {
    hljs.highlightBlock(cs);
  });

  SVGInjector(svgs, {}, function() {
    animateSVGs();
  });

  particlesJS.load('particles', 'particle-config.json');

  function toggleEasterEgg() {
    var parentTerminal = $(this).closest('.terminal');
    var snippet = parentTerminal.find('.code-snippet');
    var ee = parentTerminal.find('.ee');
    
    ee.toggleClass('hide');
    snippet.toggleClass('hide');
  }

  function animateSVGs() {
  }

  eeToggle.on('click', toggleEasterEgg);

});