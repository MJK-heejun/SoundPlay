'use strict';

/**
 * @ngdoc function
 * @name soundPlay.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the soundPlay
 */
angular.module('soundPlay')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
