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

    var HTML5Audio;

    /**
     * HTML5Audio Engine
     */
    HTML5Audio = function (canvas) {
        var self = this;

        //init sound
        var audio = document.createElement("audio");
        if (audio != null && audio.canPlayType && audio.canPlayType("audio/mpeg")) {
            this.track1 = new Audio('root/sounds/track1.mp3');
            this.track2 = new Audio('root/sounds/track2.mp3');
            this.track3 = new Audio('root/sounds/track3.mp3');
            this.far = new Audio('root/sounds/far.mp3');
            this.rumble1 = new Audio('root/sounds/rumble1.mp3');
            this.rumble2 = new Audio('root/sounds/rumble2.mp3');
            this.kill = new Audio('root/sounds/kill.mp3');
            this.ending = new Audio('root/sounds/ending.mp3');
        } else {
            this.track1 = new Audio('root/sounds/track1.ogg');
            this.track2 = new Audio('root/sounds/track2.ogg');
            this.track3 = new Audio('root/sounds/track3.ogg');
            this.far = new Audio('root/sounds/far.ogg');
            this.rumble1 = new Audio('root/sounds/rumble1.ogg');
            this.rumble2 = new Audio('root/sounds/rumble2.ogg');
            this.kill = new Audio('root/sounds/kill.ogg');
            this.ending = new Audio('root/sounds/ending.ogg');
        }

        this.track1.load();
        this.track2.load();
        this.track3.load();
        this.far.load();
        this.rumble1.load();
        this.rumble2.load();
        this.kill.load();
        this.ending.load();

        this.track1.addEventListener("loadedmetadata", function() {
            this.play();
            this.loaded = true;
            self.syncSound();
        }, false);

        this.track2.load()
        this.track2.addEventListener("loadedmetadata", function() {
            this.play();
            this.loaded = true;
            self.syncSound();
        }, true);

        this.track3.load()
        this.track3.addEventListener("loadedmetadata", function() {
            this.play();
            this.loaded = true;
            self.syncSound();
        }, true);

        this.far.load()
        this.far.addEventListener("loadedmetadata", function() {
            this.play();
            this.loaded = true;
            self.syncSound();
        }, true);

        this.rumble1.load()
        this.rumble1.addEventListener("loadedmetadata", function() {
            this.play();
            this.loaded = true;
            self.syncSound();
        }, true);

        this.rumble2.load()
        this.rumble2.addEventListener("loadedmetadata", function() {
            this.play();
            this.loaded = true;
            self.syncSound();
        }, true);
        
        this.kill.load()
        this.kill.addEventListener("loadedmetadata", function() {
            this.loaded = true;
            self.syncSound();
        }, true);

        this.ending.load()
        this.ending.addEventListener("loadedmetadata", function() {
            this.loaded = true;
            self.syncSound();
        }, true);
        

       if (typeof this.track1.loop == 'boolean') {
            this.track1.loop = true;
        } else {
            this.track1.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }

        if (typeof this.track2.loop == 'boolean') {
            this.track2.loop = true;
        } else {
            this.track2.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }

        if (typeof this.track3.loop == 'boolean') {
            this.track3.loop = true;
        } else {
            this.track3.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }

        if (typeof this.far.loop == 'boolean') {
            this.far.loop = true;
        } else {
            this.far.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }

        if (typeof this.rumble1.loop == 'boolean') {
            this.rumble1.loop = true;
        } else {
            this.rumble1.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }

        if (typeof this.rumble2.loop == 'boolean') {
            this.rumble2.loop = true;
        } else {
            this.rumble2.addEventListener('ended', function() {
                this.currentTime = 0;
                this.play();
            }, false);
        }


        return this;
    };

    HTML5Audio.prototype.syncSound = function () {
        if(this.track1.loaded) this.track1.currentTime = 0;
        if(this.track2.loaded) this.track2.currentTime = 0;
        if(this.track3.loaded) this.track3.currentTime = 0;
        if(this.far.loaded) this.far.currentTime = 0;
        if(this.rumble1.loaded) this.rumble1.currentTime = 0;
        if(this.rumble2.loaded) this.rumble2.currentTime = 0;
        document.getElementById("loading").textContent = "";
    };

    HTML5Audio.prototype.update = function (distance) {
        //manage sound volumes
        var vol = Math.max(0, 1 - (distance/8000));
		this.rumble1.volume = parseFloat(0.8* vol );
		vol = Math.max(0, 1 - (distance/1000));
		this.rumble2.volume = parseFloat(0.8* vol );
		vol = Math.min(1, Math.max(0, (distance-8000)/3000));
		this.far.volume = parseFloat(vol);
		vol = Math.min(1, Math.max(0, 2-(distance)/5000));
		this.track1.volume = parseFloat(vol);
		vol = Math.min(1, Math.max(0, 1.4-(distance)/5000));
		this.track2.volume = parseFloat(vol);
		vol = Math.min(1, Math.max(0, 1.0-(distance)/5000));
		this.track3.volume = parseFloat(vol);
    };
    
    HTML5Audio.prototype.playKillSound = function () {
        this.kill.play();     
    };
    
    HTML5Audio.prototype.playEndTheme = function () {
        this.track1.pause();
        this.track2.pause();
        this.track3.pause();
        this.far.pause();
        this.rumble1.pause();
        this.rumble2.pause();  
        
        this.ending.play();
    };

    return {
        HTML5Audio: HTML5Audio
    };
});
