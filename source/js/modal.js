'use strict';
(function () {
	var overlay = document.querySelector(".modal-overlay");
  var modal = document.querySelector(".modal");
  var modalForm = document.querySelector(".modal__form");
  var cartIcons = document.querySelectorAll('.catalog__item-cart-icon');
  var promoButton = document.querySelector(".promo__button");

 // Открытие и закрытие модального окна
 var addClickListener = function(button) {
  button.addEventListener("click", function (evt) {
		evt.preventDefault();
		modalOpen(modal);
		document.addEventListener('keydown', onPopupEscPress);
	})
 };

	var modalClose = function (modal) {
		modal.classList.remove("modal-show");
		overlay.classList.remove("modal-show");
	};

	var modalOpen = function (modal) {
		modal.classList.add("modal-show");
		overlay.classList.add("modal-show");
  };


	var onPopupEscPress = function (evt) {
		if (evt.keyCode === 27) {
			modalClose(modal);
		}
	};

  for (var i = 0; i < cartIcons.length; i++) {
    var cartIcon = cartIcons[i];
    addClickListener(cartIcon);
  };

  addClickListener(promoButton);

  modalForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    modalClose(modal);
	});
})();
