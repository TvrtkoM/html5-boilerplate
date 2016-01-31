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
    win_combs = [
      [11, 12, 13],
      [21, 22, 23],
      [31, 32, 33],
      [11, 21, 31],
      [12, 22, 32],
      [13, 23, 33],
      [11, 22, 33],
      [13, 22, 31]
    ],
    modGameState = function(game, move, moves, cells) {
      moves.push(move);
      moves.sort();
      removeMove(move, cells);
      if(checkWin(moves)) {
        game.win = game.next;
        game.state = 2;
      }
      else {
        game.move += 1;
      }
      game.next = game.next == 'o' ? 'x' : 'o';
    },
    checkWin = function(comb) {
      // checks victory condition - comb is containing all elements from one of arrays in wins
      var result = false;
      comb = comb.sort();
      $.each(win_combs, function(idx, val) {
        var intersect = _.intersection(comb, val);
        if(_.isEqual(intersect, val)) {
          result = true;
        }
      });
      return result;
    },
    _scoreHelper = function(player, moves, cells, iter) {
      var player_moves = moves[player],
        iter = iter || 1,
        is_ai = !(iter % 2 == 0),
        opp = player == 'x' ? 'o' : 'x',
        score = iter,
        scores = []
        ;
      if(checkWin(player_moves)) {
        if(is_ai) {
          score = 10 - score;
        }
        else {
          score = score - 10;
        }
      }
      else {
        cells.forEach(function(val, idx) {
          var cells_ = removeMove(val, [].concat(cells)),
            moves_ = _.cloneDeep(moves),
            opp_moves = moves_[opp];
          opp_moves.push(val);
          opp_moves.sort();
          scores.push(_scoreHelper(opp, moves_, cells_, iter+1))
        });
        if(scores.length > 0) {
          if(is_ai) {
            score = Math.min.apply(null, scores);
          }
          else {
            score = Math.max.apply(null, scores);
          }
        }
      }
      return score;
    },
    calculateAiMove = function(player, moves, cells) {
      var res = cells[0], score = 0;
      cells.forEach(function(val, idx) {
        var cells_ = removeMove(val, [].concat(cells)),
          moves_ = _.cloneDeep(moves),
          score_;
        moves_[player].push(val);
        moves_[player].sort();
        score_ = _scoreHelper(player, moves_, cells_);
        if(score_ > score) {
          score = score_;
          res = val;
        }
      });
      return res;
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
      $(this).html(svg[game.next].clone());
      modGameState(game, move, moves, cells);
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
      move,
      ai_moves = moves[game.next]
      ;
    if(cells.length == 9) {
      move = 11;
    }
    else {
      move = calculateAiMove(game.next, moves, cells);
    }
    $('.cell[data-cell=' + move + ']').html(svg[game.next].clone());
    modGameState(game, move, ai_moves, cells);
    $board.trigger('gEndTurn', [game]);
  });

  // clears board - restarts game
  $('#restart').click(function() {
    $('.cell').html('');
    $message.text(getMessage());
    $boardOverlay.show();
  });
});
