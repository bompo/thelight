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

    var Background;

    /**
     * Background who moves
     */
    Background = function (gl,position,size) {
        var self = this;

        this._position = position;
        this._dirty = true;    
        this._size = 1100;
        this.alpha = 0.2;

        this._modelMat = mat4.create();

        return this;
    };

    Background.prototype.getModelMat = function () {
        if (this._dirty) {
            var mv = this._modelMat;
            mat4.identity(mv);
                 
            mat4.translate(mv, [-this._position[0],-this._position[1], 0]);            
            mat4.scale(mv, [this._size,this._size,0]);
            
//            mat4.translate(mv, [this._position[0], this._position[1], 0]);
//            mat4.scale(mv, [this._size,this._size, 0]);
            this._dirty = false;
        }

        return this._modelMat;
    };

    Background.prototype.getPosition = function () {
        return this._position;
    };

    Background.prototype.setPosition = function (value) {
        this._position = value;
        this._dirty = true;
    };

    Background.prototype.draw  = function (gl, quadModel) {
        quadModel.draw(gl, this.getModelMat(), this.alpha, 2);
    };

    return {
        Background: Background
    };
});
