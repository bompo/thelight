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

    var GameCamera;

    /**
     * A 2D GameCamera
     */
    GameCamera = function (canvas) {
        var self = this;

        this._canvas = canvas;
        this._position = vec3.create();
        this._viewMat = mat4.create();
        this._dirty = true;
        
        return this;
    };

    GameCamera.prototype.getPosition = function () {
        return this._position;
    };

    GameCamera.prototype.setPosition = function (value) {
        this._position = value;
        this._dirty = true;
    };

    GameCamera.prototype.getViewMat = function () {
        if (this._dirty) {
            var mv = this._viewMat;
            mat4.identity(mv);
            mat4.translate(mv, [this._canvas.width/2, this._canvas.height/2, 0]);
            mat4.translate(mv, [this._position[0], this._position[1], -this._position[2]]);
            this._dirty = false;
        }

        return this._viewMat;
    };

    return {
        GameCamera: GameCamera
    };
});
