/*
 * Copyright (c) 2011 Brandon Jones
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
    "camera",
    "background",
    "player",
    "floater",
    "enemy",
    "goal",
    "quadModel",
    "html5audio",
    "webkitaudio",
    "util/gl-util",
    "js/util/gl-matrix.js",
], function(camera, background, player, floater, enemy, goal, quadModel, html5audio, webkitaudio, glUtil) {

    "use strict";
      
    var GameRenderer = function (gl, canvas) {
        var self = this;
        
        //init audio engine
        try {
            this.audio = new webkitaudio.WebKitAudio();
            window.console.log("use WebKitAudio");
        } catch(e) {
            this.audio = new html5audio.HTML5Audio();
            window.console.log("use HTML5Audio");
        };
        
        this.quadModel = new quadModel.QuadModel();
        this.quadModel.load(gl);

        this.background = new background.Background(gl, canvas);

        this.player = new player.Player(gl, canvas);
        this.goal = new goal.Goal(gl);
        this.floaters = [];
        this.swipe = [];
        this.enemies = [];
        this.camera = new camera.GameCamera(canvas);
        this.win = false;
        this.canvas = canvas;

        this.deltaCount = 0;

        this.projectionMat = mat4.create();
        mat4.ortho(0, canvas.width,0,canvas.height, -1, 1, this.projectionMat);

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        gl.enable(gl.BLEND);
	    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    };    

    GameRenderer.prototype.resize = function (gl, canvas) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        this.canvas = canvas;
        mat4.ortho(0, canvas.width,0,canvas.height, -1, 1, this.projectionMat);
    };

    GameRenderer.prototype.drawFrame = function (gl, timing) { 
        if(this.win) {
            gl.clearColor(0.6,0.8,1.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            return;
        }
        
        this.deltaCount += timing.frameTime/1000;
        if(this.deltaCount > 0.01) {
            this.deltaCount = 0;
            this.logic(gl);
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var viewMat = this.camera.getViewMat();
        var projectionMat = this.projectionMat;

        //bind Model
        this.quadModel.bind(gl, viewMat, projectionMat);
        
        //draw background
        this.background.draw(gl, this.quadModel);
        
        //draw goal
        this.goal.draw(gl, this.quadModel);

        //draw floaters
        var len=this.floaters.length;
        for(var i=0; i<len; i++) {
	        this.floaters[i].draw(gl, this.quadModel);
        }

        //draw enemies
        var len=this.enemies.length;
        for(var i=0; i<len; i++) {
	        this.enemies[i].draw(gl, this.quadModel);
        }
 
        //draw swipe
        var len=this.swipe.length;
        for(var i=0; i<len; i++) {
	        this.swipe[i].draw(gl, this.quadModel);
        }
 
        //draw player
        this.player.draw(gl, this.quadModel);

    };
    
    GameRenderer.prototype.logic = function (gl) {    
        this.audio.update(this.goal.distance);        

        this.player.update();
        this.goal.update();  

        //calc distance to goal
        var x_d = this.goal.position[0]/10 - this.player.getPosition()[0];
		var y_d = this.goal.position[1]/10 - this.player.getPosition()[1];
		this.goal.distance = Math.sqrt(x_d * x_d + y_d * y_d)*10;
		if(this.goal.distance < 50) {
		    this.youWin();
		    return;
		}
		
		//update camera
        var mix = 0.96;
        var camPosition = vec3.create();        
		camPosition[0] = this.camera.getPosition()[0]*mix - this.player.getPosition()[0]*10*(1-mix);
		camPosition[1] = this.camera.getPosition()[1]*mix - this.player.getPosition()[1]*10*(1-mix);      
        this.camera.setPosition(camPosition);
        
        //update background
        this.background.setPosition(camPosition);   
        this.background.alpha =0.4 - ((this.goal.distance/10000)/4);  
		
		//check collision with enemy
		var len=this.enemies.length;
        for(var i=0; i<len; i++) {
	        this.enemies[i].update();
	        var x_d = this.enemies[i].position[0] - this.player.getPosition()[0];
		    var y_d = this.enemies[i].position[1] - this.player.getPosition()[1];
		    if((Math.sqrt(x_d * x_d + y_d * y_d))<1 && this.enemies[i].alpha > 0.5 && this.enemies[i].alive) {
		        this.reset();
		        return;
		    }
        }        
        
        //player swipe
        if(Math.random() > 0.3 && (Math.abs(this.player.v[0])>5 || Math.abs(this.player.v[1])>5)) {
			var position = vec3.create();
			position[0] = ((this.player.getPosition()[0]));
			position[1] = ((this.player.getPosition()[1]));
            this.swipe.push(new floater.Floater(gl,position,10,100,100));
		}        

        //add enemies
        var prob =  Math.max(0.2, this.goal.distance/8000);
        if(Math.random() > prob ) {
			var position = vec3.create();
			position[0] = (this.player.getPosition()[0]+(Math.random()*this.canvas.width/8)-this.canvas.width/16);
			position[1] = (this.player.getPosition()[1]+(Math.random()*this.canvas.height/8)-this.canvas.width/32);
			
			//check player overlap
			if(!(position[0]-4 < this.player.getPosition()[0] && position[0]+4 > this.player.getPosition()[0]) || !(position[1]-4 < this.player.getPosition()[1] && position[1]+4 > this.player.getPosition()[1])) {
			    this.enemies.push(new enemy.Enemy(gl,position));
			}  
		}

        //update and cleanup enemies
        var len=this.enemies.length;
        for(var i=0; i<len; i++) {
	        this.enemies[i].update();
        }
        if(len>0 && this.enemies[len-1].alive === false) {
           this.enemies.pop();
        }

        //add background floaters
        if(Math.random() > 0.9) {
			var position = vec3.create();
			position[0] = (this.player.getPosition()[0]/3+this.player.v[0]+(Math.random()*this.canvas.width/32)-this.canvas.width/64);
			position[1] = (this.player.getPosition()[1]/3+this.player.v[1]+(Math.random()*this.canvas.height/32)-this.canvas.height/64);
            this.floaters.push(new floater.Floater(gl,position,30,200,400));
		}

        //update and cleanup floaters
        var len=this.floaters.length;
        for(var i=0; i<len; i++) {
	        this.floaters[i].update();
	        this.floaters[i].setOffsetPosition(camPosition);
        }
        if(len>0 && this.floaters[len-1].alive === false) {
           this.floaters.pop();
        }
        
        //update and cleanup swipe
        var len=this.swipe.length;
        for(var i=0; i<len; i++) {
	        this.swipe[i].update();
        }
        if(len>0 && this.swipe[len-1].alive === false) {
           this.swipe.pop();
        }

    };
    
    GameRenderer.prototype.reset = function () {
        this.audio.playKillSound();
          
        var position = vec3.create();
        position[0] = -45;
        this.player.setPosition(position);
        
        var len=this.floaters.length;
        for(var i=0; i<len; i++) {
	       this.floaters.pop();
        }
        
        var len=this.enemies.length;
        for(var i=0; i<len; i++) {
	       this.enemies.pop();
        }
    }
    
    GameRenderer.prototype.youWin = function () {
        this.audio.playEndTheme();
        this.win = true;          
    }

    return {
        GameRenderer: GameRenderer
    };
});
