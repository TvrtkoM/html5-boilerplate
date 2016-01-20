var $ = require('jquery');

$(document).ready(function() {
  var x_svg = $('<svg>' +
      '<line x1="0" y1="0" x2="100" y2="100"></line>' +
      '<line x1="0" y1="100" x2="100" y2="0"></line>' +
      '</svg>'),
    o_svg = $('<svg>' +
      '<circle cx="50" cy="50" r="48"></circle>' +
      '</svg>'),
    $board = $('#board'),
    $boardOverlay = $('#boardOverlay'),
    $message = $('#message'),
    getMessage = function(game) {
      if(!game || !game.state) {
        return 'Game not started yet.';
      }
      else {
        if (game.move < 9) {
          return (game.player == game.next) ? 'Your turn.' : 'AI playing a move. Wait...';
        }
        else {
          return 'Game finished!';
        }
      }
    };

  $message.text(getMessage());

  $('.cell').click(function(e) {
    var game = $board.data('game');
    if($(this).children().length == 0) {
      $(this).html(game.next == 'o' ? o_svg.clone() : x_svg.clone());
      game.next = game.next == 'o' ? 'x' : 'o';
      game.move += 1;
      $board.trigger('gEndTurn');
    }
  });

  $('.button.o, .button.x').click(function(e) {
    var $el = $(e.target), pick;
    e.preventDefault();
    pick = $el.hasClass('o') ? 'o' : 'x';
    $boardOverlay.hide();
    $board.data('game', {
      state: 1, // 0 - not started; 1 - game in progress; 2 - game end
      next: 'x', // next/current move - 'x' or 'o'
      player: pick, // what player picked
      move: 0
    }).trigger('gStart');
  });

  // run on game state change
  $board.on('gStart gEndTurn', function(e) {
    var game = $board.data('game');
    $message.text(getMessage(game));
  });

  // clears board - restarts game
  $('#restart').click(function() {
    $board.data('game', null);
    $('.cell').html('');
    $message.text(getMessage());
    $boardOverlay.show();
  });
});
