var angular = require('angular');
var simonGame = angular.module('simonGame', []);

simonGame.filter('twoDigit', [
  function() {
    return function(input) {
      if(input == 0) {
        return '--';
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
  'gameStateFactory',
  function($scope, gameStateFactory) {
    $scope.game = gameStateFactory.new();

    $scope.$watch('isOn', function(val) {
      if(!val) {
        $scope.game.off();
      }
    });
    $scope.$watch('game.steps', function(newVal, oldVal) {
      if(newVal.length > 0) {
        $scope.game.count += 1;
        $scope.$broadcast('game:showSteps', newVal);
      }
    }, true);

    $scope.$on('game:nextStep', function(event) {
      console.log('next');
      $scope.game.step();
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
            }, 1000);
          return seq.promise;
        };
        $scope.play_steps = [];
        $scope.current = -2;

        $scope.$on('game:showSteps', function(event, steps) {
          console.log('show steps');
          $scope.current = -1;
          $scope.steps = steps;
          runSteps([].concat(steps)).then(function() {
            $scope.current = -2;
          }, null, function(curr) {
            $scope.current = curr;
          });
        });
        $scope.$on('button:push', function(event, step) {
          $scope.current = step;
          $scope.play_steps.push(step);
          $timeout(function() {
            if($scope.play_steps.toString() == $scope.steps.toString()) {
              $scope.$emit('game:nextStep');
            } else {
              $scope.current = -2;
            }
          }, 1000);
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

