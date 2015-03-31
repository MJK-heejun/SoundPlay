'use strict';

/**
 * @ngdoc function
 * @name soundPlay.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the soundPlay
 */
angular.module('soundPlay')
  .controller('MainCtrl', function ($scope, globals, $location) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];


    $scope.music_list = []; //answers received from user

/*
  SC.stream("/tracks/293", {
    autoPlay: false,
    ontimedcomments: function(comments){
      console.log(comments[0].body);
    }
  }, function(sound){

  	sound.play();
  	setTimeout(function(){sound.stop();},2000);
  });
*/
/*
  $scope.login = function(){
    SC.connect(function(){
      globals.is_logged_in = true;
      SC.get('/me', function(me) {
        alert('Hello, ' + me.id + ":" + me.username); 
      });
    });
  };
*/

  //search
  $scope.$watch('search_form', function(){      



    SC.get('/tracks', { 
        title: $scope.search_form,
        limit: 10,
        sharing: 'public'
      }, function(tracks) {

      var tmp_list = [];

      //only 10 tracks
      for(var i=0; i< tracks.length; i++){
        //retrieve id and title of the music
        var tmp_id = tracks[i].id;
        var tmp_title = tracks[i].title;

        tmp_list.push({'id': tmp_id, 'title': tmp_title});
      }    
      $scope.music_list = tmp_list;

    });
  });

  $scope.select_music = function(id){
    //set the global var current_music_id
    globals.current_music_id = id;
    $location.path('/play');
  };


  SC.get('/tracks/12695424', function(tr){
    console.log(tr);
  });


  $('#print').click(function(){
    console.log($scope.music_list);
  });

});
