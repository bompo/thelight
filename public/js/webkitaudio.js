/*
 * Copyright (c) 2011 Stefan Wagner, Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

define([
    "js/util/gl-matrix.js"
], function () {

    "use strict";

    var WebKitAudio;

    /**
     * WebKitAudio Engine
     */
    WebKitAudio = function (canvas) {
        var self = this;

        this.loaded = false;
        
        this.context = new webkitAudioContext();  
          
        window.console.log("load sounds");

        //load samples
        var bufferLoader = new BufferLoader(
            this.context,
            [
              'root/sounds/track1.mp3',
              'root/sounds/track2.mp3',
              'root/sounds/track3.mp3',
              'root/sounds/far.mp3',
              'root/sounds/rumble1.mp3',
              'root/sounds/rumble2.mp3',
              'root/sounds/kill.mp3',
              'root/sounds/ending.mp3',
            ],
            this.finishedLoading
        );
        bufferLoader.load(this);

        return this;
    };

    WebKitAudio.prototype.finishedLoading = function (self, bufferList) {     
        self.bufferList = bufferList;
       
        self.track1 = this.context.createBufferSource();  
        self.track2 = this.context.createBufferSource(); 
        self.track3 = this.context.createBufferSource(); 
        self.far = this.context.createBufferSource(); 
        self.rumble1 = this.context.createBufferSource(); 
        self.rumble2 = this.context.createBufferSource(); 
        self.kill = this.context.createBufferSource(); 
        self.ending = this.context.createBufferSource(); 
        
        //bind buffer
        self.track1.buffer = bufferList[0];
        self.track2.buffer = bufferList[1];
        self.track3.buffer = bufferList[2];
        self.far.buffer = bufferList[3];
        self.rumble1.buffer = bufferList[4];
        self.rumble2.buffer = bufferList[5];
        self.kill.buffer = bufferList[6];
        self.ending.buffer = bufferList[7];
  
        // add a gain nodes to control the volumes  
        self.track1Gain = this.context.createGainNode();  
        self.track1Gain.gain.value = 0.0;  
        self.track1.connect(self.track1Gain);  
        self.track1Gain.connect(this.context.destination); 

        self.track2Gain = this.context.createGainNode();  
        self.track2Gain.gain.value = 0.0;  
        self.track2.connect(self.track2Gain);  
        self.track2Gain.connect(this.context.destination); 
 
        self.track3Gain = this.context.createGainNode();  
        self.track3Gain.gain.value = 0.0;  
        self.track3.connect(self.track3Gain);  
        self.track3Gain.connect(this.context.destination); 

        self.farGain = this.context.createGainNode();  
        self.farGain.gain.value = 0.0;  
        self.far.connect(self.farGain);  
        self.farGain.connect(this.context.destination); 

        self.rumble1Gain = this.context.createGainNode();  
        self.rumble1Gain.gain.value = 0.0;  
        self.rumble1.connect(self.rumble1Gain);  
        self.rumble1Gain.connect(this.context.destination); 

        self.rumble2Gain = this.context.createGainNode();  
        self.rumble2Gain.gain.value = 0.0;  
        self.rumble2.connect(self.rumble2Gain);  
        self.rumble2Gain.connect(this.context.destination); 
        
        self.kill.connect(this.context.destination);   
        self.ending.connect(this.context.destination); 

        //enable loop
        self.track1.loop = true;  
        self.track2.loop = true;  
        self.track3.loop = true;  
        self.far.loop = true;  
        self.rumble1.loop = true;  
        self.rumble2.loop = true;  

        //play sounds
        self.track1.noteOn(0);  
        self.track2.noteOn(0);  
        self.track3.noteOn(0);  
        self.far.noteOn(0);  
        self.rumble1.noteOn(0);  
        self.rumble2.noteOn(0);  

        self.loaded = true;
        window.console.log("all sounds loaded");
        document.getElementById("loading").textContent = "";
    }

    WebKitAudio.prototype.update = function (distance) {
        if(!this.loaded) return;

        //manage sound volumes
        var vol = Math.max(0, 1 - (distance/8000));
		this.rumble1Gain.gain.value = parseFloat(0.8* vol );
		vol = Math.max(0, 1 - (distance/1000));
		this.rumble2Gain.gain.value = parseFloat(0.8* vol );
		vol = Math.min(1, Math.max(0, (distance-8000)/3000));
		this.farGain.gain.value = parseFloat(vol);
		vol = Math.min(1, Math.max(0, 2-(distance)/5000));
		this.track1Gain.gain.value = 1.0;
		vol = Math.min(1, Math.max(0, 1.4-(distance)/5000));
		this.track2Gain.gain.value = parseFloat(vol);
		vol = Math.min(1, Math.max(0, 1.0-(distance)/5000));
		this.track3Gain.gain.value = parseFloat(vol);
    };
    
    WebKitAudio.prototype.playKillSound = function () {
        if(!this.loaded) return;
        this.kill = this.context.createBufferSource(); 
        this.kill.buffer = this.bufferList[6];
        this.kill.connect(this.context.destination);   
        this.kill.noteOn(0.0);  
    };
    
    WebKitAudio.prototype.playEndTheme = function () {
        if(!this.loaded) return;
        
		this.rumble1Gain.gain.value = 0.0;
		this.rumble2Gain.gain.value = 0.0;
		this.farGain.gain.value = 0.0;
		this.track1Gain.gain.value = 0.0;
		this.track2Gain.gain.value = 0.0;
		this.track3Gain.gain.value = 0.0;
		
		this.ending.noteOn(0.0);  
    };

    function BufferLoader(context, urlList, callback) {
      this.context = context;
      this.urlList = urlList;
      this.onload = callback;
      this.bufferList = new Array();
      this.loadCount = 0;
    }

    BufferLoader.prototype.loadBuffer = function(self, url, index) {
      // Load buffer asynchronously
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";

      var loader = this;

      request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
          request.response,
          function(buffer) {
            if (!buffer) {
              alert('error decoding file data: ' + url);
              return;
            }
            loader.bufferList[index] = buffer;
            if (++loader.loadCount == loader.urlList.length)
              loader.onload(self, loader.bufferList);
          }
        );
      }

      request.onerror = function() {
        alert('BufferLoader: XHR error');
      }

      request.send();
    }

    BufferLoader.prototype.load = function(self) {
      for (var i = 0; i < this.urlList.length; ++i)
      this.loadBuffer(self, this.urlList[i], i);
    }

    return {
        WebKitAudio: WebKitAudio
    };
});
