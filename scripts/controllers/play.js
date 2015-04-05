'use strict';

/**
 * @ngdoc function
 * @name soundPlay.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the soundPlay
 */
angular.module('soundPlay')
  .controller('PlayCtrl', function ($scope, globals, $location, g_sound, mydb) {


    //preference restored from indexdb    
    var loading_view = 0, play_view = 1, filter_view = 2, spatial_view = 3, playback_view = 4;    
    $scope.view = loading_view;

    //set default values
    $scope.playback_rate = 1;
    $scope.spatial_x = 0;
    $scope.filter_type = "none";
    
    //view enabler flag
    $scope.is_accelerometer_enabled = false;

    //listen for accelerometer
    window.addEventListener('deviceorientation', handleOrientation);

    //reset/initialize panner pos
    //resetPanner();
globals.current_music_id = 48230395;
    try{
      //stop music to play a new one
      g_sound.source.stop(0);
    }catch(e){
      console.log(e);
    }

    //fetch from db
    if (!mydb.ready) {
      console.log('DB is not ready: play.js');
      //$location.path('/main');
      return;
    }    
    
    var transaction = mydb.db.transaction('data', 'readwrite');    
    var objectStore = transaction.objectStore('data');
    var db_request = objectStore.get(globals.current_music_id);

    
    db_request.onsuccess = function(e) {
      var saved_data = e.target.result;

      $('.loading-msg').text("loading by XMLHttpRequest");

      //loading previously saved setting
      if(saved_data === undefined){
      }else{
        console.log('previous setting retrieved for the music');  

        //set default values
        $scope.playback_rate = saved_data['playback_rate'];
        $scope.spatial_x = saved_data['spatial_x'];
        $scope.filter_type = saved_data['filter_type'];
      }


      var request = new XMLHttpRequest();
      //var url = 'http://api.soundcloud.com/tracks/'+globals.current_music_id+'/stream?client_id='+globals.client_id; 
        var url = "http://api.soundcloud.com/tracks/48230395/stream?client_id=22a6f6d4d6138acff711c666f09a62c7";
      request.open("GET", url, true);
      request.responseType = "arraybuffer";
      $('.loading-msg').text("making Http Request");
      request.onload = function(){
          $('.loading-msg').text("decoding audio");
          //'request.response' is arraybuffer
          //'buffer' is decoded data - type = AudioBuffer: (IEEE754) 32 bits floating point buffer (float32)
          g_sound.context.decodeAudioData(request.response, function(buffer){
              $('.loading-msg').text("Audio decoded - loading buffer");

              //insert the buffer data into the db
              mydb.insert(globals.current_music_id, $scope.filter_type, $scope.playback_rate, $scope.spatial_x);

              g_sound.mySoundBuffer = buffer;                      
              //g_sound.mySoundBuffer = yoink;                      

              g_sound.isPaused = false;
              $scope.play();            

              $scope.$apply(function() {
                  $scope.view = play_view;
              });                
          }, onError);
      };
      request.send();
    }



    function onError(){
      console.log("error while loading request");
    }


    $scope.play = function(){        
      g_sound.source = g_sound.context.createBufferSource();
      // tell the source which sound to play
      g_sound.source.buffer = g_sound.mySoundBuffer;  

      g_sound.source.connect(g_sound.panner);
      g_sound.panner.connect(g_sound.context.destination);

      //g_sound.source.connect(g_sound.context.destination); 


      if(g_sound.isPaused){
        g_sound.isPaused = false;
        g_sound.source.start(0, g_sound.pausedAt); 
      }else{
        g_sound.source.start(0, 0);                      
      }
                                                       
    };



    //spatial_x change
    $scope.$watch('spatial_x', function(){     
      console.log("spatial_x: "+$scope.spatial_x);
      g_sound.panner.setPosition(parseFloat($scope.spatial_x), 0, 298);      
    }, true);

    //playback rate change
    $scope.$watch('playback_rate', function(){      
      try{
        console.log($scope.playback_rate);
        g_sound.source.playbackRate.value = $scope.playback_rate;
      }catch(e){
        console.log(e);
      }      
    });    

  
    //spatial_x change
    $scope.$watch('parent.view', function(newval, oldval){     
      console.log(newval+" "+oldval);      
    }, true); 


    $scope.pause = function(){
      //save the paused time of the music 
      g_sound.pausedAt = g_sound.source.context.currentTime;
      g_sound.isPaused = true;
      g_sound.source.stop(0);

      //console.log(g_sound.source.context.currentTime);
    };

    $scope.stop = function(){
      g_sound.isPaused = false;
      g_sound.pausedAt = 0;
      g_sound.source.stop(0);
    };


    $scope.changeView = function(arrow_clicked){
      if(arrow_clicked == 'r'){
        $scope.view = $scope.view % 4 + 1;        
      }else if(arrow_clicked == 'l'){
        if($scope.view == 1)
          $scope.view = 4;
        else
          $scope.view -= 1;
      }
    }; 
/*
    $scope.lowFilter = function(){
      
    };
*/
    //accelerometer event function
    function handleOrientation(event) {
      // Do stuff with the new orientation data

      var absolute = event.absolute;
      var alpha    = event.alpha;
      var beta     = event.beta;
      var gamma    = event.gamma;
      $scope.$apply(function() {
      }); 
      if($scope.is_accelerometer_enabled && gamma > 30){
        //if less than 10, increase panner pos by 0.1
        if($scope.spatial_x < 10)
          $scope.spatial_x += 0.1;        
      }else if($scope.is_accelerometer_enabled && gamma < -30){
        //if bigger than -10, decrease panner pos by 0.1
        if($scope.spatial_x > -10)
          $scope.spatial_x -= 0.1;
      }

      g_sound.panner.setPosition(parseFloat($scope.spatial_x), 0, 298);

      //pannerSetPos($scope.spatial_x, g_sound.yPos, g_sound.zPos);
      /*
      $('#gamma').text(gamma);
      $('#xPos').text($scope.spatial_x);        
      $('#acc').text($scope.is_accelerometer_enabled);        
      */
    }

    $('#reset').click(function(){
      mydb.remove(globals.current_music_id);
    });

});
