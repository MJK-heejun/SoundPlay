'use strict';

/**
 * @ngdoc function
 * @name soundPlay.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the soundPlay
 */
angular.module('soundPlay')
  .controller('PlayCtrl', function ($scope, globals, $location, g_sound) {


    //preference restored from indexdb
    $scope.type = 2;
    $scope.playbackrate = 1;

    //listen for accelerometer
    window.addEventListener('deviceorientation', handleOrientation);
    //reset/initialize panner pos
    resetPanner();

    var request = new XMLHttpRequest();


    try{
      //stop music to play a new one
      g_sound.source.stop(0);
    }catch(e){
      console.log(e);
    }

    console.log(globals.current_music_id);

    //var url = 'http://api.soundcloud.com/tracks/'+globals.current_music_id+'/stream?client_id='+globals.client_id; 
          
          var url = "http://api.soundcloud.com/tracks/48230395/stream?client_id=22a6f6d4d6138acff711c666f09a62c7";
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    alert("a");
    request.onload = function(){
        alert("b");
        g_sound.context.decodeAudioData(request.response, function(buffer){
            alert("c");
            g_sound.mySoundBuffer = buffer;                      
            g_sound.isPaused = false;
            $scope.play();
        }, onError);
    };
    request.send();


    function onError(){
      console.log("error while loading request");
    }


    $scope.play = function(){
      g_sound.source = g_sound.context.createBufferSource();
      // tell the source which sound to play
      
      g_sound.source.buffer = g_sound.mySoundBuffer;  
      
      //g_sound.source.connect(g_sound.context.destination); 

      g_sound.source.connect(g_sound.panner);
      pannerSetPos(0, 0, 295); //private function
      g_sound.panner.connect(g_sound.context.destination);


      if(g_sound.isPaused){
        g_sound.isPaused = false;
        g_sound.source.start(0, g_sound.pausedAt); 
      }else{
        g_sound.source.start(0);                      
      }
                                                       
      console.log(g_sound.source);
    };


    //playback rate change
    $scope.$watch('playbackrate', function(){      
      try{
        g_sound.source.playbackRate.value = $scope.playbackrate;
      }catch(e){
        console.log(e);
      }      
    });    

  
    $scope.pause = function(){
      //save the paused time of the music 
      g_sound.pausedAt = g_sound.source.context.currentTime;
      g_sound.isPaused = true;
      g_sound.source.stop(0);
    };

    $scope.stop = function(){
      g_sound.isPaused = false;
      g_sound.pausedAt = 0;
      g_sound.source.stop(0);
    };




    $scope.lowFilter = function(){
      
    };

    //accelerometer event function
    function handleOrientation(event) {
      // Do stuff with the new orientation data
      var absolute = event.absolute;
      var alpha    = event.alpha;
      var beta     = event.beta;
      var gamma    = event.gamma;
      
      if(!g_sound.isPaused && gamma > 30){
        //if less than 10, increase panner pos by 0.1
        if(g_sound.xPos < 10)
          g_sound.xPos += 0.1;        
      }else if(!g_sound.isPaused && gamma < -30){
        //if bigger than -10, decrease panner pos by 0.1
        if(g_sound.xPos > -10)
          g_sound.xPos -= 0.1;
      }
      pannerSetPos(g_sound.xPos, g_sound.yPos, g_sound.zPos);

      //$('#gamma').text(gamma);
      //$('#xPos').text(g_sound.xPos);      
    }

    function resetPanner(){
      g_sound.xPos = 0;
      g_sound.yPos = 0;
      g_sound.zPos = 295;      
    }
    function pannerSetPos(xPos, yPos, zPos){
      g_sound.panner.setPosition(xPos, yPos, zPos);
    }
});
