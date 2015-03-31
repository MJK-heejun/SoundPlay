'use strict';

/**
 * @ngdoc overview
 * @name soundPlay
 * @description
 * # soundPlay
 *
 * Main module of the application.
 */
angular
  .module('soundPlay', [
    'ngAnimate',
    'ngMessages',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/play', {
        templateUrl: 'views/play.html',
        controller: 'PlayCtrl'
      })      
      .otherwise({
        redirectTo: '/'
      });
  });



var app = angular.module('soundPlay');


app.value('globals',{
  is_logged_in: false,
  client_id: "22a6f6d4d6138acff711c666f09a62c7",
  current_user: "",
  current_music_id: "",
  current_music_sound: "",
  is_being_played: false,
  WIDTH : window.innerWidth,
  HEIGHT : window.innerHeight
});


//used as global object
app.factory('g_sound', function(globals){
  var g_sound = {};

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  g_sound.context = new AudioContext();

  //panner, listener context
  g_sound.panner = g_sound.context.createPanner();
  g_sound.listener = g_sound.context.listener;
  g_sound.listener.setPosition(0, 0, 300);
  //position tracked for panner
  g_sound.xPos;
  g_sound.yPos;
  g_sound.zPos;


  //g_sound.audio = new Audio();
  g_sound.source;
  //g_sound.filter;
  g_sound.url;
  g_sound.mySoundBuffer = null;
  g_sound.pausedAt;
  g_sound.isPaused = false;
  /*
  var score = {}; //object declaration

  score.attractions = 0;
  score.entertainment = 0;
  score.location = 0;
  score.history = 0;
  score.sports = 0;

  score.getTotalScore = function(){
    return score.attractions + score.entertainment + score.location + score.history + score.sports;
  }

  score.setToZero = function(category){
    switch(category){
      case "attractions":   
        score.attractions = 0;     
      break;
      case "entertainment":
        score.entertainment = 0;
      break;
      case "location":
        score.location = 0;
      break;
      case "history":
        score.history = 0;
      break;
      case "sports":
        score.sports = 0;
      break;
      default: 
    }
  }
*/

  return g_sound;
});