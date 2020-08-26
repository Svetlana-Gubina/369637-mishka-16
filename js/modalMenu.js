'use strict';
(function(){
var BREAKPOINTS = {
  tablet: '768px'
};
var toggle = document.querySelector(".main-nav__toggle");
var menuItemTop = document.querySelector(".main-nav__flex-tablet");
var menuItemBottom = document.querySelector(".main-nav__flex-search");

var handleBreackpointChange = function (event) {
  if (event.matches) {
    menuItemTop.classList.remove("menu-close");
    menuItemBottom.classList.remove("menu-close");
  } else {
    menuItemTop.classList.add("menu-close");
    menuItemBottom.classList.add("menu-close");
  }
}

var modalMenuActive = function() {
toggle.classList.remove("visually-hidden");
};

var mediaQueryList = window.matchMedia('(min-width:' + BREAKPOINTS.tablet.toString() + '');
mediaQueryList.addListener(handleBreackpointChange);
handleBreackpointChange(mediaQueryList);

window.addEventListener("load", modalMenuActive);

toggle.addEventListener("click", function(evt) {
  evt.preventDefault();
  this.classList.toggle("main-nav__toggle-close");
  menuItemTop.classList.toggle("menu-close");
  menuItemBottom.classList.toggle("menu-close");
});
})();
