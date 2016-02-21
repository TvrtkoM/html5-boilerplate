var angular = require('angular');

var simonGame = angular.module('simonGame', []);

simonGame.factory('gameStateFactory', [
  function() {
    var state = {
      steps: [],
      hasStarted: false,
      restart: function() {
        this.hasStarted = true;
        this.steps = [];
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
  '$rootScope',
  'gameStateFactory',
  function($scope, $rootScope, gameStateFactory) {
    $scope.game = gameStateFactory.new();

    $scope.$watch('isOn', function(val) {
      if(!val) {
        $scope.game.off();
      }
    });
    $scope.$watch('game.steps', function(newVal, oldVal) {
      if(newVal.length > 0) {
        $rootScope.$broadcast('game:showSteps', newVal);
      }
    });
  }
]);

simonGame.directive('sgButtons', [
  '$q',
  '$interval',
  '$rootScope',
  function($q, $interval, $rootScope) {
    return {
      template: '\
      <div class="iface" ng-class="{enabled: current == -1}">\
      <div class="iface-row">\
        <div class="iface-btn green" ng-class="{active: current == 1}"></div>\
        <div class="iface-btn red" ng-class="{active: current == 2}"></div>\
      </div>\
      <div class="iface-row">\
        <div class="iface-btn yellow" ng-class="{active: current == 3}"></div>\
        <div class="iface-btn blue" ng-class="{active: current == 4}"></div>\
      </div>\
      </div>\
      ',
      scope: {
        steps: '=steps'
      },
      link: function($scope, $el, attrs) {
        var buttons = $el.find('.iface-btn'),
          user_steps = [];
        var runSteps = function(steps) {
          var seq = $q.defer(),
            interval = $interval(function() {
            if(steps.length == 0) {
              seq.resolve();
              $interval.cancel(interval);
            } else {
              seq.notify(steps.shift() + 1);
            }
          }, 1000);
          return seq.promise;
        };
        $scope.current = -2;
        $rootScope.$on('game:showSteps', function(event, steps) {
          $scope.current = 0;
          $scope.steps = steps;
          runSteps([].concat(steps)).then(function(res) {
            $scope.current = -1;
            $scope.$emit('game:showStepsDone');
          }, null, function(curr) {
            $scope.current = curr;
          });
        });
      }
    }
  }
]);
