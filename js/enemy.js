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

    var Enemy;

    /**
     * Enemy who moves random
     */
    Enemy = function (gl,position) {
        var self = this;

        this.position = position;
        this._v = vec3.create();
        this._a = vec3.create();
        this.alive = true;   
        this._age = 0;   
        this._maxAge = 300;  
        this.size = 10;   
        this.alpha = 0;   
        this._dirty = true;

        this._modelMat = mat4.create();

        return this;
    };

    Enemy.prototype.getModelMat = function () {
        if (this._dirty) {
            var mv = this._modelMat;
            mat4.identity(mv);

            mat4.translate(mv, [this.position[0]*this.size, this.position[1]*this.size, 0]);
            mat4.scale(mv, [this.size*this.alpha,this.size*this.alpha,0]);
            this._dirty = false;
        }

        return this._modelMat;
    };

    Enemy.prototype.update  = function () {
        if(!this.alive) return;
     
        this._a[0] += (Math.random()-0.5);
		this._a[1] += (Math.random()-0.5);
		this._v[0] += this._a[0];
		this._v[1] += this._a[1];
		this.position[0] += this._v[0]/40;
		this.position[1] += this._v[1]/40;
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

    Enemy.prototype.draw  = function (gl, quadModel) {
        if(!this.alive) return;

		if(this._age < this._maxAge/2) {
			this.alpha = this._age/(this._maxAge/2);
		} else {
			this.alpha = 1 - (this._age-this._maxAge/2)/(this._maxAge/2);
		}

        quadModel.draw(gl, this.getModelMat(), this.alpha, 1, (Math.random()));
    };

    return {
        Enemy: Enemy
    };
});
