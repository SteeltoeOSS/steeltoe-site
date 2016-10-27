$(document).ready(function() {
  var codeSnippets = $('.codeSnippet');
  codeSnippets.each(function(index, cs) {
    hljs.highlightBlock(cs);
  });
});