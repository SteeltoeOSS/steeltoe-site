//= require vendor/highlight.min
//= require vendor/particles.min
//= require vendor/svg-injector.min

document.addEventListener("DOMContentLoaded", function() {
  var codeSnippets = document.querySelectorAll('pre code');
  var SVGillustrations = document.querySelectorAll('img.svg-illustration');

  function injectSVgs() {
    SVGInjector(SVGillustrations);
  }

  function highlightCodeSnippets() {
    for(var i = 0; i < codeSnippets.length; i++) {
      hljs.highlightBlock(codeSnippets[i]);
    }
  }

  function drawParticles() {
    particlesJS.load('particles', 'particle-config.json');
  }

  drawParticles();
  injectSVgs();
  highlightCodeSnippets();
});