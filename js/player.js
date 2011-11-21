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

    var Player;

    /**
     * Player who moves
     */
    Player = function (gl, canvas) {
        var self = this, moving = false,
            x, y;

        this._position = vec3.create();
        this._position[0] = -45;
        this.v = vec3.create();
        this._a = vec3.create();
        this.speed = 20;
        this._pressedKeys = new Array(128);
        this._modelMat = mat4.create();
        this._alive = true;   
        this._age = 0;   
        this._size = 10;   
        this._dirty = true;
        this.delta = 0;
        
        
        // Set up the appropriate event hooks
        window.addEventListener("keydown", function (event) {
            self._pressedKeys[event.keyCode] = true;
        }, false);

        window.addEventListener("keyup", function (event) {
            self._pressedKeys[event.keyCode] = false;
        }, false);

        return this;
    };

    Player.prototype.getPosition = function () {
        return this._position;
    };

    Player.prototype.setPosition = function (value) {
        this._position = value;
        this._dirty = true;
    };

    Player.prototype.getModelMat = function () {
        if (this._dirty) {
            var mv = this._modelMat;
            mat4.identity(mv);
            
            mat4.translate(mv, [this._position[0]*this._size, this._position[1]*this._size, 0]);
            mat4.scale(mv, [this._size+(Math.sin(this.delta)*2),this._size+(Math.sin(this.delta)*2),1]);
            this._dirty = false;
        }

        return this._modelMat;
    };

    Player.prototype.update  = function () {
        this.delta += 0.01;
        if(this.delta>3.15) {
            this.delta = 0;
        }
    
        var dir = vec3.create(),
            speed = (this.speed/50),
            cam;        
        
        if (this._pressedKeys['W'.charCodeAt(0)] || this._pressedKeys[38]) {
            this._a[1] += speed;
        }
        if (this._pressedKeys['S'.charCodeAt(0)] || this._pressedKeys[40]) {
            this._a[1] -= speed;
        }
        if (this._pressedKeys['A'.charCodeAt(0)] || this._pressedKeys[37]) {
            this._a[0] -= speed;
        }
        if (this._pressedKeys['D'.charCodeAt(0)] || this._pressedKeys[39]) {
            this._a[0] += speed;
        }

        // Move the player in the direction we are facing
        //vec3.add(this._position, dir);
        
        this.v[0] += this._a[0];
        this.v[1] += this._a[1];
        this._position[0] += this.v[0]/20;
        this._position[1] += this.v[1]/20;

        this._a[0] = 0;
        this._a[1] = 0;
        this.v[0] *= 0.95;
        this.v[1] *= 0.95;

        this._dirty = true;
        
    };

    Player.prototype.draw  = function (gl, quadModel) {
        quadModel.draw(gl, this.getModelMat(),  1,0,0);
    };

    return {
        Player: Player
    };
});
