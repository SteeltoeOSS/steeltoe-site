$(document).ready(function() {
  var bsod = $('#bsod');
  var bsodTerminal = $("#bsodTerminal");
  var bsodCodeSnippet = $('#bsodTerminal .code-snippet')
  var bsodToggle = $('#bsodToggle');
  var codeSnippets = $('.code-snippet code');

  codeSnippets.each(function(index, cs) {
    hljs.highlightBlock(cs);
  });

  particlesJS.load('particles', 'particle-config.json');

  function toggleBsod() {
    bsod.toggleClass('hide');
    bsodCodeSnippet.toggleClass('hide');
  }

  bsod.on('click', toggleBsod);
  bsodToggle.on('click', toggleBsod);

});