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
    initial_cells = [11, 12, 13, 21, 22, 23, 31, 32, 33],
    removeMove = function(move, cells) {
      cells.splice(cells.indexOf(move), 1);
      return cells;
    },
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
    _calcMoveScore_helper = function(player, moves, cells, iter) {
      var moves_c = $.extend(true, {}, moves),
        cells_c = [].concat(cells),
        player_moves = moves_c[player],
        scores = [], res
      ;
      if(cells.length == 1) {
        player_moves.push(cells[0]);
        player_moves.sort();
        return checkWin(player_moves) ? 11: 0;
      }
      else {
        $.each(cells, function(idx, val) {
          player_moves.push(val);
          player_moves.sort();
          if(checkWin(player_moves)) {
            scores.push(iter + (iter % 2 == 0 ? 10: -10));
          } else {
            scores.push(_calcMoveScore_helper(
              player == 'x' ? 'o' : 'x',
              moves_c,
              removeMove(cells[0], cells_c),
              iter+1))
          }
        });
      }
      res = Math.max.apply(null, scores);
      console.log(scores);
      return res;
    },
    calculateAiMove = function(player, moves, cells) {
      var prev_score = 0, result = cells[0];
      $.each(cells, function(idx, val) {
        var move_score = _calcMoveScore_helper(player, moves, cells, 0);
        if(prev_score < move_score) {
          result = val;
          prev_score = move_score;
        }
      });
      return result;
    }
    ;

  $message.text(getMessage());

  // cell clicking event handler
  $('.cell').click(function(e) {
    var game = $board.data('game'),
      move, moves, cells;
    // only if it's human turn
    if(game.player == game.next && $(this).children().length == 0 && !game.win) {
      move = parseInt($(this).data('cell'));
      moves = $board.data('moves')[game.next];
      cells = $board.data('cells');
      removeMove(move, cells);
      moves.push($(this).data('cell'));
      moves.sort();
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

  // handle clicking on select symbol / first player
  // initializes game by adding data to $board
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
      .data('moves', { 'x': [], 'o': [] })
      .data('cells', [].concat(initial_cells))
      .trigger('gEndTurn', [game]);
    console.log($board.data());
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
    var cells = $board.data('cells'),
      moves = $board.data('moves'),
      move = calculateAiMove(game.next, moves, cells)
      ;
    $('.cell[data-cell=' + move + ']').html(svg[game.next].clone());
    moves[game.next].push(move);
    moves[game.next].sort();
    game.next = game.next == 'x' ? 'o' : 'x';
    removeMove(move, cells);
    $board.trigger('gEndTurn', [game]);
  });

  // clears board - restarts game
  $('#restart').click(function() {
    $('.cell').html('');
    $message.text(getMessage());
    $boardOverlay.show();
  });
});
