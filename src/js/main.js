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
        var next = Math.floor(Math.random() * 5);
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
        console.log(newVal);
      }
    });
  }
]);

