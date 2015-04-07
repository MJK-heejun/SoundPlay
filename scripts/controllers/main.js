'use strict';

/**
 * @ngdoc function
 * @name soundPlay.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the soundPlay
 */
angular.module('soundPlay')
  .controller('MainCtrl', function ($scope, globals, $location, mydb, $http) {
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

    if($scope.search_form === undefined || $scope.search_form == ""){
      //do nothing
    }else{
      var q = $scope.search_form;
      var limit = 10;
      var order = 'hotness';

      $http.get('http://api.soundcloud.com/tracks.json?client_id='+globals.client_id+'&q='+q+'&order='+order+'&limit='+limit).then(function(res){  

        var tracks = res.data;

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
    }


  });

  $scope.select_music = function(id){
    //set the global var current_music_id
    globals.current_music_id = id;
    $location.path('/play');
  };


});
