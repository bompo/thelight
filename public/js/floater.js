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

    var Floater;

    /**
     * Floater who moves
     */
    Floater = function (gl,position,size,speed,age) {
        var self = this;

        this._position = position;
        this._offsetPosition = vec3.create();
        this._v = vec3.create();
        this._a = vec3.create();
        this.alive = true;   
        this._age = 0;   
        this._maxAge = age;  
        this._maxAlpha = Math.random();  
        this._size = size;
        this._dirty = true;       
        this._speed = speed;

        this._modelMat = mat4.create();

        return this;
    };

    Floater.prototype.getModelMat = function () {
        if (this._dirty) {
            var mv = this._modelMat;
            mat4.identity(mv);
            
            //mat4.translate(mv, [((this._position[0]*this._size)+(this._offsetPosition[0]*this._maxAlpha)), ((this._position[1]*this._size)+(this._offsetPosition[1]*this._maxAlpha)), 0]);
            mat4.translate(mv, [(((this._position[0]*this._size))), (((this._position[1]*this._size))), 0]);
            mat4.scale(mv, [this._size*this._maxAlpha,this._size*this._maxAlpha,0]);
            this._dirty = false;
        }

        return this._modelMat;
    };

    Floater.prototype.setOffsetPosition = function (value) {
        this._offsetPosition = value;
        this._dirty = true;
    };

    Floater.prototype.update  = function () {
        if(!this.alive) return;
        var mix = 0.9;
     
        this._a[0] = this._a[0]*mix + (Math.random()-0.5)*(1-mix)*(this._maxAlpha*10);
		this._a[1] = this._a[1]*mix + (Math.random())*(1-mix)*(this._maxAlpha*4);
		this._v[0] += this._a[0];
		this._v[1] += this._a[1];
		this._position[0] += this._v[0]/this._speed;
		this._position[1] += this._v[1]/this._speed;
		this._a[0] = 0;
		this._a[1] = 0;
		this._v[0] *= 0.95;
		this._v[1] *= 0.95;

        this._age+= 1;
        if(this._age> this._maxAge) {
            this.alive = false;
        }

        this._dirty = true;
    };

    Floater.prototype.draw  = function (gl, quadModel) {
        if(!this.alive) return;

        this.alpha = 0;
		if(this._age < this._maxAge/2) {
			this.alpha = this._age/(this._maxAge/2);
		} else {
			this.alpha = 1 - (this._age-this._maxAge/2)/(this._maxAge/2);
		}
		if(this._maxAlpha<this.alpha) {
    		this.alpha = Math.min(this._maxAlpha,this.alpha);
    	}

        quadModel.draw(gl, this.getModelMat(), this.alpha,3);
    };

    return {
        Floater: Floater
    };
});
