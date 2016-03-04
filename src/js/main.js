var angular = require('angular');
var simonGame = angular.module('simonGame', []);

simonGame.filter('twoDigit', [
  function() {
    return function(input) {
      if(input == 0) {
        return '--';
      }
      else if (input == -1) {
        return '!!';
      }
      else if (input < 10) {
        return '0' + input.toString();
      }
      return input.toString();
    }
  }
]);

simonGame.factory('gameStateFactory', [
  function() {
    var state = {
      steps: [],
      hasStarted: false,
      count: 0,
      strict: false,
      restart: function() {
        this.hasStarted = true;
        this.steps = [];
        this.count = 0;
        this.step();
      },
      step: function() {
        var next = Math.floor(Math.random() * 4);
        this.steps.push(next);
        return next;
      },
      off: function() {
        this.steps = [];
        this.hasStarted = false;
      }
    };
    return {
      new: function() {
        return Object.create(state);
      }
    }
  }
]);

simonGame.controller('game', [
  '$scope',
  '$timeout',
  'gameStateFactory',
  function($scope, $timeout, gameStateFactory) {
    $scope.game = gameStateFactory.new();

    $scope.$watch('isOn', function(val) {
      if(!val) {
        $scope.game.off();
      }
    });
    $scope.$watchCollection('game.steps', function(steps) {
      if(steps.length > 0) {
        $scope.game.count += 1;
        $scope.$broadcast('game:showSteps', steps);
      }
    });

    $scope.$on('game:nextStep', function(event) {
      $scope.game.step();
    });

    $scope.$on('game:invalidStep', function(event) {
      $scope.game.count = -1;
      $timeout(function() {
        if($scope.game.strict) {
          $scope.game.restart();
        } else {
          $scope.$broadcast('game:showSteps', $scope.game.steps);
          $scope.game.count = $scope.game.steps.length;
        }
      }, 700);
    });
  }
]);

simonGame.directive('sgButtons', [
  '$q',
  '$interval',
  '$timeout',
  function($q, $interval, $timeout) {
    return {
      template: '\
      <div class="iface" ng-class="{enabled: current == -2}">\
      <div class="iface-row">\
        <sg-button class="iface-btn green" number="0" ng-class="{active: current == 0}"></sg-button>\
        <sg-button class="iface-btn red" number="1" ng-class="{active: current == 1}"></sg-button>\
      </div>\
      <div class="iface-row">\
        <sg-button class="iface-btn yellow" number="2" ng-class="{active: current == 2}"></sg-button>\
        <sg-button class="iface-btn blue" number="3" ng-class="{active: current == 3}"></sg-button>\
      </div>\
      </div>\
      ',
      scope: {
        steps: '=steps'
      },
      controller: function($scope) {
        var runSteps = function(steps) {
          var seq = $q.defer(),
            interval = $interval(function() {
              if(steps.length == 0) {
                seq.resolve();
                $interval.cancel(interval);
              } else {
                seq.notify(steps.shift());
              }
            }, 1100);
          return seq.promise;
        };
        var showSteps = function(steps) {
          runSteps([].concat(steps)).then(function() {
            $scope.current = -2;
          }, null, function(curr) {
            $scope.current = curr;
            $timeout(function() {
              $scope.current = -1;
            }, 950);
          });
        };
        var idle_timer;

        $scope.current = -1;

        $scope.$watch('current', function() {
          if(!!idle_timer) {
            $timeout.cancel(idle_timer);
          }
          idle_timer = $timeout(function() {
            showSteps($scope.steps);
            idle_timer = null;
          }, 5000);
        });

        $scope.$on('game:showSteps', function(event, steps) {
          $scope.play_steps = [];
          $scope.current = -1;
          $scope.steps = steps;
          showSteps(steps);
        });
        $scope.$on('button:push', function(event, step) {
          var step_no;
          if($scope.current == -2) {
            $scope.current = step;
            $scope.play_steps.push(step);
            step_no = $scope.play_steps.length - 1;
            if(step != $scope.steps[step_no]) {
              $scope.$emit('game:invalidStep');
            }
            $timeout(function() {
              if($scope.play_steps.toString() == $scope.steps.toString()) {
                $scope.$emit('game:nextStep');
              } else {
                $scope.current = -2;
              }
            }, 1000);
          }
        });
      }
    }
  }
]);

simonGame.directive('sgButton', [
  function() {
    return {
      link: function($scope, $el, $attrs) {
        $el.bind('click', function() {
          $scope.$emit('button:push', parseInt($attrs.number));
          $scope.$apply();
        });
      }
    };
  }
]);

