//= require highlight.min
//= require particles.min
//= require svg-injector.min

document.addEventListener("DOMContentLoaded", function() {
  var eeToggle = document.querySelectorAll('.eeToggle');
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

  function toggleEasterEgg(event) {
    var eeTarget = this.dataset.ee;
    var eeBody = document.querySelector('#' + eeTarget);
    var eeTerminal = document.querySelector('#' + eeTarget + '-terminal');
    eeBody.classList.toggle('hide');
    eeTerminal.classList.toggle('hide');
  }

  eeToggle.forEach(function(ee) { 
    ee.addEventListener('click', toggleEasterEgg);
  })

  drawParticles();
  injectSVgs();
  highlightCodeSnippets();

});