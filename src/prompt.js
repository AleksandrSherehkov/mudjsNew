import $ from 'jquery';
import 'devbridge-autocomplete';

$(document).ready(function () {
  // Обработка клика по элементам с data-hint
  $('body').on('click', '[data-hint]', function (e) {
    const modalElement = document.getElementById($(this).data('hint'));
    if (modalElement && window.bootstrap && window.bootstrap.Modal) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.toggle();
    }
    e.stopPropagation();
    e.preventDefault();
  });

  // Слушаем события от сервера и обновляем глобальный mudprompt
  $('#rpc-events').on('rpc-prompt', function (e, b) {
    if (window.mudprompt === undefined) {
      window.mudprompt = b;
    } else {
      $.extend(window.mudprompt, b);
    }
  });
});
