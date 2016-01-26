var $ = require('jquery');
var _ = require('lodash');

$(document).ready(function() {
  var svg = {
      'x': $('<svg>' +
        '<line x1="0" y1="0" x2="100" y2="100"></line>' +
        '<line x1="0" y1="100" x2="100" y2="0"></line>' +
        '</svg>'),
      'o': $('<svg>' +
        '<circle cx="50" cy="50" r="48"></circle>' +
        '</svg>')
    },
    $board = $('#board'),
    $boardOverlay = $('#boardOverlay'),
    $message = $('#message'),
    checkWin = function(comb) {
      // checks victory condition - comb is containing all elements from one of arrays in wins
      var wins = [
        [11, 12, 13],
        [21, 22, 23],
        [31, 32, 33],
        [11, 21, 31],
        [12, 22, 32],
        [13, 23, 33],
        [11, 22, 33],
        [13, 22, 31]
      ], result = false;
      comb = comb.sort();
      $.each(wins, function(idx, val) {
        var intersect = _.intersection(comb, val);
        if(_.isEqual(intersect, val)) {
          result = true;
        }
      });
      return result;
    },
    getMessage = function(game) {
      // returns message depending on game state
      if(!game || !game.state) {
        return 'Game not started yet.';
      }
      else if(game.win) {
        return game.win + ' ' + 'wins!'
      }
      else if (game.move < 9 && !game.win) {
        return (game.player == game.next) ? 'Your turn.' : 'AI playing a move. Wait...';
      }
      else {
        return 'Game finished! It\'s draw.';
      }
    },
    calculate_ai_move = function(player, x_moves, y_moves) {
    }
    ;

  $message.text(getMessage());

  $('.cell').click(function(e) {
    // cell clicking event handler
    var game = $board.data('game'),
      moves;
    if(game.player == game.next && $(this).children().length == 0 && !game.win) {
      moves = $board.data(game.next);
      moves.push($(this).data('cell'));
      $board.data(game.next, moves);
      $(this).html(svg[game.next].clone());
      if(checkWin(moves)) {
        game.win = game.next;
        game.state = 2;
      }
      else {
        game.next = game.next == 'o' ? 'x' : 'o';
        game.move += 1;
      }
      $board.trigger('gEndTurn', [game]);
    }
  });

  $('.button.o, .button.x').click(function(e) {
    var $el = $(e.target), pick, game;
    e.preventDefault();
    pick = $el.hasClass('o') ? 'o' : 'x';
    $boardOverlay.hide();
    game = {
      state: 1, // 0 - not started; 1 - game in progress; 2 - game end
      next: 'x', // next/current move - 'x' or 'o'
      player: pick, // what player picked
      move: 0, // move number
      win: null // set to 'x' or 'o' on victory
    };
    $board
      .data('game', game)
      .data('x' ,[])
      .data('o', [])
      .trigger('gEndTurn', [game]);
  });

  // run on game state change - turn ends
  $board.on('gEndTurn', function(e, game) {
    $message.text(getMessage(game));
    if(game.player != game.next) {
      $board.trigger('gAIMove', [game]);
    }
  });

  // AI move
  $board.on('gAIMove', function(e, game) {
    var move = calculate_ai_move(game.next, $board.data('x'), $board.data('y'));
    $("[data-cell==" + move + "]").html(svg[game.next].clone());
  });

  // clears board - restarts game
  $('#restart').click(function() {
    $board.data('game', null);
    $('.cell').html('');
    $message.text(getMessage());
    $boardOverlay.show();
  });
});
