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
    "util/gl-util",
    "js/util/gl-matrix.js",
], function (glUtil) {

    "use strict";

    // quad Shader
    var modelVS = [ 
        "attribute vec3 position;",

        "uniform mat4 viewMat;",
        "uniform mat4 modelMat;",
        "uniform mat4 projectionMat;",

        "void main(void) {",
        " mat4 modelViewMat = viewMat * modelMat;",
        " vec4 vPosition = modelViewMat * vec4(position, 1.0);",
        " gl_Position = projectionMat * vPosition;",
        "}"
    ].join("\n");

    var modelFS = [
        "uniform vec4 color;",

        "void main(void) {",       
        " gl_FragColor = color;",
        "}"
    ].join("\n");

    var modelShader = null;

    var identityMat = mat4.create();
    mat4.identity(identityMat);

    var CubeModel = function () {
    };

    CubeModel.prototype.load = function (gl, callback) {
        // Set up the verticies and indices
        var cubeVerts = [
        //x    y    z  u  v
        // Front
        -10,  10,  10, 0, 1,
        10,  10,  10, 1, 1,
        -10, -10,  10, 0, 0,
        10, -10,  10, 1, 0,

        // Back          
        10,  10, -10, 1, 1,
        -10,  10, -10, 0, 1,
        10, -10, -10, 1, 0,
        -10, -10, -10, 0, 0,

        // Left          
        -10,  10, -10, 1, 0,
        -10,  10,  10, 1, 1,
        -10, -10, -10, 0, 0,
        -10, -10,  10, 0, 1,

        // Right         
        10,  10,  10, 1, 1,
        10,  10, -10, 1, 0,
        10, -10,  10, 0, 1,
        10, -10, -10, 0, 0,

        // Top           
        -10,  10,  10, 0, 1,
        10,  10,  10, 1, 1,
        -10,  10, -10, 0, 0,
        10,  10, -10, 1, 0,

        // Bottom        
        10,  -10,  10, 1, 1,
        -10,  -10,  10, 0, 1,
        10,  -10, -10, 1, 0,
        -10,  -10, -10, 0, 0,
        ];

        var cubeIndices = [
        0, 1, 2,
        2, 1, 3,

        4, 5, 6,
        6, 5, 7,

        8, 9, 10,
        10, 9, 11,

        12, 13, 14,
        14, 13, 15,

        16, 17, 18,
        18, 17, 19,

        20, 21, 22,
        22, 21, 23,
        ];

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVerts), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

        if (!modelShader) {
            modelShader = glUtil.createShaderProgram(gl, modelVS, modelFS, 
                ["position"],
                ["viewMat", "modelMat", "projectionMat", "color"]
            );
        }
    };

    CubeModel.prototype.draw = function (gl, modelMat, viewMat, projectionMat, color) {
        var shader = modelShader;

        // Bind the appropriate buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.useProgram(shader);

        gl.uniform4fv(shader.uniform.color, color);

        gl.uniformMatrix4fv(shader.uniform.viewMat, false, viewMat);
        gl.uniformMatrix4fv(shader.uniform.modelMat, false, modelMat);
        gl.uniformMatrix4fv(shader.uniform.projectionMat, false, projectionMat);

        gl.enableVertexAttribArray(shader.attribute.position);

        // Setup the vertex layout
        gl.vertexAttribPointer(shader.attribute.position, 3, gl.FLOAT, false, 20, 0);
        gl.vertexAttribPointer(shader.attribute.texture, 2, gl.FLOAT, false, 20, 12);

        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    };

    return {
        CubeModel: CubeModel
    };
});
