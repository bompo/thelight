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
        " vec4 v = vec4(position, 1.0);",
        " vec4 v1 = modelMat * v;",
        " vec4 v2 = viewMat * v1;",
        " vec4 v3 = projectionMat * v2;",
        " gl_Position = v3;",
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

    var QuadModel = function () {
    };

    QuadModel.prototype.load = function (gl, callback) {
        // Set up the verticies and indices
        var cubeVerts = [
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0,
        -0.5, 0.5, 0,
        ];

        var cubeIndices = [
        0, 1, 2,
        0, 2, 3,
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
        this.shader = modelShader;
    };
    
    QuadModel.prototype.draw = function (gl, modelMat, color) {    
        gl.uniform4fv(this.shader.uniform.color, color);
        gl.uniformMatrix4fv(this.shader.uniform.modelMat, false, modelMat || identityMat);
        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
    
    QuadModel.prototype.bind = function (gl, viewMat, projectionMat) {
        this.shader = modelShader;

        // Bind the appropriate buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.useProgram(this.shader);

        gl.uniformMatrix4fv(this.shader.uniform.viewMat, false, viewMat);
        gl.uniformMatrix4fv(this.shader.uniform.projectionMat, false, projectionMat);

        // Setup the vertex layout
        gl.enableVertexAttribArray(this.shader.attribute.position);        
        gl.vertexAttribPointer(this.shader.attribute.position, 3, gl.FLOAT, false, 0, 0);
    };
    
    return {
        QuadModel: QuadModel
    };
});
