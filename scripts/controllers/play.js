'use strict';

/**
 * @ngdoc function
 * @name soundPlay.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the soundPlay
 */
angular.module('soundPlay')
  .controller('PlayCtrl', function ($rootScope, $scope, globals, $location, g_sound, mydb, $timeout) {


    //preference restored from indexdb    
    var loading_view = 0, filter_view = 1, spatial_view = 2, playback_view = 3;    
    $scope.view = loading_view;

    //set default values
    $scope.playback_rate = 1;
    $scope.spatial_x = 0;
    $scope.filter_type = "select filters";
    
    //view enabler flag
    $scope.is_accelerometer_enabled = false;
    $scope.is_geolocation_enabled = false;

    //Available selection for up/down action in filter,play views
    $scope.filter_view_selection_arr = ["select filters", "lowpass", "highpass", "bandpass"];

    //index for the selection arrays
    $scope.f_v_s_p_index = $scope.filter_view_selection_arr.length - 1;
    $scope.f_v_s_c_index = 0;
    $scope.f_v_s_n_index = 1;


    //listen for accelerometer
    window.addEventListener('deviceorientation', handleOrientation);


//globals.current_music_id = 8390970;
    try{
      //stop music to play a new one
      g_sound.source.stop(0);
    }catch(e){
      console.log(e);
    }

    //fetch from db
    if (!mydb.ready) {
      console.log('DB is not ready: play.js');
      $location.path('/main');
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
      //var url = "http://api.soundcloud.com/tracks/8390970/stream?client_id=22a6f6d4d6138acff711c666f09a62c7";

      var url = "http://jhjkim.com/soundPlayTerminal.php?track_num="+globals.current_music_id+"&client_id="+globals.client_id;
      //var url = "http://jhjkim.com/soundPlayTerminal.php?track_num=8390970&client_id=22a6f6d4d6138acff711c666f09a62c7";

      request.open("GET", url, true);
      request.responseType = "arraybuffer";
      //request.withCredentials = true;
      //console.log(request.withCredentials);
      $('.loading-msg').text("making Http Request");
      request.onload = function(){
          $('.loading-msg').text("decoding audio");
          //'request.response' is arraybuffer
          //'buffer' is decoded data - type = AudioBuffer: (IEEE754) 32 bits floating point buffer (float32)
          g_sound.context.decodeAudioData(request.response, function(buffer){
              $('.loading-msg').text("Audio decoded - loading buffer");

              g_sound.mySoundBuffer = buffer;                      

              $scope.play();            

              $scope.$apply(function() {
                  $scope.view = filter_view;
              });                
          }, onError);
      };
      request.send();
    }



    function onError(){
      console.log("error while loading request");
    }


    $scope.play = function(){       
      if(g_sound.isStopped){
        g_sound.isStopped = false;

        g_sound.source = g_sound.context.createBufferSource();

        // tell the source which sound to play
        g_sound.source.buffer = g_sound.mySoundBuffer;  

        //setting playback rate
        g_sound.source.playbackRate.value = $scope.playback_rate;


        //connect/disconnect filter node depending on the setting
        if($scope.filter_type == "select filters"){
          g_sound.source.connect(g_sound.panner);
          g_sound.panner.connect(g_sound.context.destination);
        }else{        
          g_sound.source.connect(g_sound.filter);
          g_sound.filter.connect(g_sound.panner);        
          g_sound.panner.connect(g_sound.context.destination);
          g_sound.filter.type = $scope.filter_type;
        }

        g_sound.source.start(0, 0);                    

      }                                             
    };

    $scope.stop = function(){
      //g_sound.isPaused = false;
      //g_sound.pausedAt = 0;
      g_sound.isStopped = true;
      g_sound.source.stop(0);  
    };


    //save/reset setting into indexedb
    $scope.saveDb = function(){
      mydb.insert(globals.current_music_id, $scope.filter_type, $scope.playback_rate, $scope.spatial_x);
    };
    $scope.resetDb = function(){
      mydb.remove(globals.current_music_id);
    };




    $scope.changeView = function(arrow_clicked){
      if(arrow_clicked == 'r'){
        $scope.view = $scope.view % 3 + 1;        
      }else if(arrow_clicked == 'l'){
        if($scope.view == 1)
          $scope.view = 3;
        else
          $scope.view -= 1;
      }
    }; 

    $scope.upDownArrowAction = function(arrow_clicked){
      switch($scope.view){
        /*        
        case play_view:          
        break;
        */
        case filter_view:
          //index update
          if(arrow_clicked == 'u'){
            $scope.f_v_s_p_index = $scope.f_v_s_p_index-1 < 0 ? $scope.filter_view_selection_arr.length - 1 : $scope.f_v_s_p_index-1;
            $scope.f_v_s_c_index = $scope.f_v_s_c_index-1 < 0 ? $scope.filter_view_selection_arr.length - 1 : $scope.f_v_s_c_index-1;
            $scope.f_v_s_n_index = $scope.f_v_s_n_index-1 < 0 ? $scope.filter_view_selection_arr.length - 1 : $scope.f_v_s_n_index-1;            
          }else{
            $scope.f_v_s_p_index = $scope.f_v_s_p_index+1 >= $scope.filter_view_selection_arr.length ? 0 : $scope.f_v_s_p_index+1;
            $scope.f_v_s_c_index = $scope.f_v_s_c_index+1 >= $scope.filter_view_selection_arr.length ? 0 : $scope.f_v_s_c_index+1;
            $scope.f_v_s_n_index = $scope.f_v_s_n_index+1 >= $scope.filter_view_selection_arr.length ? 0 : $scope.f_v_s_n_index+1;            
          }
          //keep track of the current filter type
          $scope.filter_type = $scope.filter_view_selection_arr[$scope.f_v_s_c_index];
          //update the filter type accordingly
          filterChange();
        break;
      }
    };


    //event action when user navigating away manually
    $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
        try{
          //remove geolocation setinterval
          //clearInterval(geolocation_interval);
          $scope.is_geolocation_enabled = false;
        }catch(e){
          console.log(e);
        }        
      }
    );

    //spatial_x change
    $scope.$watch('spatial_x', function(){     
      console.log("spatial_x: "+$scope.spatial_x);
      g_sound.panner.setPosition(parseFloat($scope.spatial_x), 0, 298);      
    }, true);


    //geolocation enabler change
    //var geolocation_interval;
    //var prev_lat, prev_long;
    $scope.$watch('is_geolocation_enabled', function(){      
      if($scope.is_geolocation_enabled){
        if(navigator.geolocation){
          var prev_lat, prev_long;
          navigator.geolocation.getCurrentPosition(function(position){
            prev_lat = position.coords.latitude;
            prev_long = position.coords.longitude;

            console.log(prev_lat);
            console.log(prev_long);

            handleGeolocation(prev_lat, prev_long);            
          }, function(e){
            console.log("error:"+e);
          }, {timeout: 3000, enableHighAccuracy:true});          
          /*
          geolocation_interval = setInterval(function(){
            var cur_lat;
            var cur_long;
            navigator.geolocation.getCurrentPosition(function(position){
              cur_lat = position.coords.latitude;
              cur_long = position.coords.longitude;
              var meter_per_sec = geolib.getDistance(
                {latitude: prev_lat, longitude: prev_long},
                {latitude: cur_lat, longitude: cur_long}
              );

              //debugging to convert string to float
              $scope.playback_rate = parseFloat($scope.playback_rate);

              //normal car speed = 50 kmh = 13.8889 meter per sec
              // => playback-rate speed up to 3x
              if(meter_per_sec > 13.8889 && $scope.playback_rate <= 3){
                $scope.playback_rate += 0.1;
              //normal cycling speed = 5.81152 meter per sec
              // => playback-rate speed up to 2x
              }else if(meter_per_sec > 5.81152){
                if($scope.playback_rate < 2)
                  $scope.playback_rate += 0.1;
                else
                  $scope.playback_rate -= 0.1;
              //man jogging speed = 3.71043 meter per sec
              // => playback-rate speed up to 1.5x              
              }else if(meter_per_sec > 3.71043){
                if($scope.playback_rate < 1.5)
                  $scope.playback_rate += 0.1;
                else
                  $scope.playback_rate -= 0.1;
              //man walking speed = 1.38582 meter per sec: but have it as 0.7mps
              // => playback-rate speed up to 1.3x              
              }else if(meter_per_sec > 0.7){
                if($scope.playback_rate < 1.3)
                  $scope.playback_rate += 0.1;
                else
                  $scope.playback_rate -= 0.1;
              //reduce playback rate gradually when slower than walking speed
              }else if(meter_per_sec < 0.7 && $scope.playback_rate > 1){
                $scope.playback_rate -= 0.1;
              }

              //set prev as curret
              prev_lat = cur_lat;
              prev_long = cur_long;             

              $scope.$apply(function() {
              });               
            });        
          }, 1000);
          */            
        }else{
          alert("Geolocation service is not supported by this browser");
        }
      }else{
        /*
        try{
          clearInterval(geolocation_interval);
        }catch(e){
          console.log(e);
        } 
        */     
      }
    });    

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


    function filterChange(){
      disconnectAllNode();
      if($scope.filter_type == 'select filters'){
        g_sound.source.connect(g_sound.panner);
        g_sound.panner.connect(g_sound.context.destination);
      }else{
        g_sound.source.connect(g_sound.filter);
        g_sound.filter.connect(g_sound.panner);        
        g_sound.panner.connect(g_sound.context.destination);              
      }

      g_sound.filter.type = $scope.filter_type;
    }

    //disconnect audio node
    function disconnectAllNode(){
      g_sound.source.disconnect();
      g_sound.filter.disconnect();
      g_sound.panner.disconnect();
    }

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

    }

    function handleGeolocation(prev_lat, prev_long){

      var cur_lat;
      var cur_long;      

      if($scope.is_geolocation_enabled){
        navigator.geolocation.getCurrentPosition(function(position){
          cur_lat = position.coords.latitude;
          cur_long = position.coords.longitude;
          var meter_per_sec = geolib.getDistance(
            {latitude: prev_lat, longitude: prev_long},
            {latitude: cur_lat, longitude: cur_long}
          );
          //debugging to convert string to float
          $scope.playback_rate = parseFloat($scope.playback_rate);

          //normal car speed = 50 kmh = 13.8889 meter per sec
          // => playback-rate speed up to 3x
          if(meter_per_sec > 13.8889 && $scope.playback_rate <= 3){
            $scope.playback_rate += 0.1;
          //normal cycling speed = 5.81152 meter per sec
          // => playback-rate speed up to 2x
          }else if(meter_per_sec > 5.81152){
            if($scope.playback_rate < 2)
              $scope.playback_rate += 0.1;
            else
              $scope.playback_rate -= 0.1;
          //man jogging speed = 3.71043 meter per sec
          // => playback-rate speed up to 1.5x              
          }else if(meter_per_sec > 3.71043){
            if($scope.playback_rate < 1.5)
              $scope.playback_rate += 0.1;
            else
              $scope.playback_rate -= 0.1;
          //man walking speed = 1.38582 meter per sec: but have it as 0.7mps
          // => playback-rate speed up to 1.3x              
          }else if(meter_per_sec > 0.7){
            if($scope.playback_rate < 1.3)
              $scope.playback_rate += 0.1;
            else
              $scope.playback_rate -= 0.1;
          //reduce playback rate gradually when slower than walking speed
          }else if(meter_per_sec < 0.7 && $scope.playback_rate > 1){
            $scope.playback_rate -= 0.1;
          }
          $scope.$apply(function() {
          });     
          if($scope.is_geolocation_enabled){
            var timeout = $timeout(function(){
              handleGeolocation(cur_lat, cur_long);
            },1000);            
          }else{
            console.log('geolocation disabled! - loop terminated');    
          }
        }, function(error){
          console.log("error occured:"+error);
          var timeout = $timeout(function(){
            handleGeolocation(prev_lat, prev_long);
          },1000);
        }, {timeout: 3000, enableHighAccuracy:true}); 
      }else{
        console.log('geolocation disabled! - loop terminated');
      }

    }


});
