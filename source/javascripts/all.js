$(document).ready(function() {
  var codeSnippets = $('.codeSnippet');

  codeSnippets.each(function(index, cs) {
    hljs.highlightBlock(cs);
  });

  /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
  particlesJS.load('particles', 'particle-config.json', function() {
    console.log('callback - particles.js config loaded');
  });

});