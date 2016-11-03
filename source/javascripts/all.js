//= require highlight.min
//= require particles.min
//= require svg-injector.min

document.addEventListener("DOMContentLoaded", function() {
  var codeSnippets = document.querySelectorAll('.code-snippet code');
  var SVGillustrations = document.querySelectorAll('img.svg-illustration');

  function injectSVgs() {
    SVGInjector(SVGillustrations);
  }

  function highlightCodeSnippets() {
    codeSnippets.forEach(function(cs, index) {
      hljs.highlightBlock(cs);
    })
  }

  function drawParticles() {
    particlesJS.load('particles', 'particle-config.json');
  }

  drawParticles();
  injectSVgs();
  highlightCodeSnippets();

});