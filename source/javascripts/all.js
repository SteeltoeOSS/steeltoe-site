$(document).ready(function() {
  var eeToggle = $('.eeToggle');

  var codeSnippets = $('.code-snippet code');

  codeSnippets.each(function(index, cs) {
    hljs.highlightBlock(cs);
  });

  particlesJS.load('particles', 'particle-config.json');

  function toggleEasterEgg() {
    var parentTerminal = $(this).closest('.terminal');
    var snippet = parentTerminal.find('.code-snippet');
    var ee = parentTerminal.find('.ee');
    
    ee.toggleClass('hide');
    snippet.toggleClass('hide');
  }

  eeToggle.on('click', toggleEasterEgg);

});