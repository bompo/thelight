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

    var Goal;

    /**
     * Goal who moves
     */
    Goal = function (gl) {
        var self = this;

        this.position = vec3.create();
        this.position[0] = 0;
        this.position[1] = 10000;
        this.size = 100;
        this.alive = true;   
        this.anicount = 0;   
        this.distance = 1;  

        this._modelMat = mat4.create();

        return this;
    };

    Goal.prototype.update  = function () {
        this.anicount += ((1-(this.distance/10000))*5)/50;

        this._dirty = true;
    };

    Goal.prototype.draw  = function (gl, quadModel) {
        var mv = this._modelMat;

        //render lines around it
		var lines = 20;
		for(var i = 0; i < lines; i++) {
			var angle = 360/lines * i + this.anicount*0.01;
            var col = 1*(1-(this.distance/15000))*(Math.sin(angle)*0.5+0.5)*0.25;
			
            mat4.identity(mv);
            mat4.translate(mv, [this.position[0], this.position[1], 0]);
            mat4.rotate(mv, angle, [0,0,1]);
            mat4.scale(mv, [100000,0.05*this.distance,0]);      
            quadModel.draw(gl, mv, [0.0, col, col, 1.0]);
		}

		for(var i = 0; i < lines; i++) {
			var angle = 360/lines * i + this.anicount*-0.01+(360/lines/2);
            var col = 1*(1-(this.distance/15000))*(Math.sin(angle)*0.5+0.5)*0.25;

            mat4.identity(mv);
            mat4.translate(mv, [this.position[0], this.position[1], 0]);
            mat4.rotate(mv, angle, [0,0,1]);
            mat4.scale(mv, [100000,0.05*this.distance,0]);      
            quadModel.draw(gl, mv, [0.0, col, col, 1.0]);
		}

        mat4.identity(mv);
        mat4.translate(mv, [this.position[0], this.position[1], 0]);
        mat4.scale(mv, [this.size,this.size,0]);      
        quadModel.draw(gl, mv,  [0.0, 0.8, 0.8, 1.0]);
    };

    return {
        Goal: Goal
    };
});
