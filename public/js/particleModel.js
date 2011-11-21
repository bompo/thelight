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
        "attribute vec2 texture;",

        "uniform mat4 viewMat;",
        "uniform mat4 modelMat;",
        "uniform mat4 projectionMat;",
        
        "varying vec2 vTexture;",

        "void main(void) {",
        " vTexture = texture;",
        " vec4 v = vec4(position, 1.0);",
        " vec4 v1 = modelMat * v;",
        " vec4 v2 = viewMat * v1;",
        " vec4 v3 = projectionMat * v2;",
        " gl_Position = v3;",
        "}"
    ].join("\n");

    var modelFS = [
        "uniform sampler2D diffuse;",
        "uniform float alpha;",
        "uniform float step;",
        "uniform float contrast;",
        "uniform int blur;",

        "varying vec2 vTexture;",

        "void main(void) {", 
        " vec4 color;",
        " if(blur == 1) {",   
        " vec4 sample0, sample1, sample2, sample3;",
        " sample0 = texture2D(diffuse, vec2(vTexture.x - step, vTexture.y - step));",
        " sample1 = texture2D(diffuse, vec2(vTexture.x + step, vTexture.y + step));",
        " sample2 = texture2D(diffuse, vec2(vTexture.x + step, vTexture.y - step));",
        " sample3 = texture2D(diffuse, vec2(vTexture.x - step, vTexture.y + step));",
        " color = vec4((sample0.rgb + sample1.rgb + sample2.rgb + sample3.rgb) / 4.0,alpha);",
        " } else {",
        " color = vec4(texture2D(diffuse, vec2(vTexture.x, vTexture.y)).rgb, alpha);",
        " }",
        " color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;",
        " gl_FragColor = color;",
        "}"
    ].join("\n");
    
    var particleVS = [ 
        "uniform vec3 position;",
        "uniform float size;",

        "uniform mat4 viewMat;",
        "uniform mat4 modelMat;",
        "uniform mat4 projectionMat;",
        
        "void main(void) {",
        " vTexture = texture;",
        " vec4 v = vec4(position, 1.0);",
        " vec4 v1 = modelMat * v;",
        " vec4 v2 = viewMat * v1;",
        " vec4 v3 = projectionMat * v2;",
        " gl_Position = v3;",
        " gl_PointSize = size * ( 300.0 / length( v2.xyz ) );",
        "}"
    ].join("\n");

    var particleFS = [
        "uniform sampler2D diffuse;",

        "void main(void) {", 
        " gl_FragColor = vec4( vec3(1.0,0.0,0.0), 1.0 );",
        " gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );", 
        "}"
    ].join("\n");

    var modelShader = null;
    var particleShader = null;

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
        
        var cubeTexVerts = [
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        ];

        var cubeIndices = [
        0, 1, 2,
        0, 2, 3,
        ];

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVerts), gl.STATIC_DRAW);

        this.texBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTexVerts), gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
        
        this.textures = [];
        this.textures[0] = glUtil.loadTexture(gl, "root/sprites/player.png");
        this.textures[1] = glUtil.loadTexture(gl, "root/sprites/enemy.png");
        this.textures[2] = glUtil.loadTexture(gl, "root/sprites/background.png");
        this.textures[3] = glUtil.loadTexture(gl, "root/sprites/floater.png");
        this.textures[4] = glUtil.loadTexture(gl, "root/sprites/spark.png");

        if (!modelShader) {
            modelShader = glUtil.createShaderProgram(gl, modelVS, modelFS, 
                ["position","texture"],
                ["viewMat", "modelMat", "projectionMat", "diffuse", "alpha", "step", "contrast","blur"]
            );
        }
        this.shader = modelShader;
        
        if (!particleShader) {
            particleShader = glUtil.createShaderProgram(gl, particleVS, particleFS, 
                [],
                ["viewMat", "modelMat", "projectionMat", "diffuse", "position", "size"]
            );
        }
        this.shader = modelShader;
    };
    
    QuadModel.prototype.draw = function (gl, modelMat, alpha, textureSlot, contrast, blur) {
        if(blur!=null) {
            gl.uniform1i(this.shader.uniform.blur, 1);
        } else {
            gl.uniform1i(this.shader.uniform.blur, 0);
        }
        gl.uniform1f(this.shader.uniform.step, ((1.0 - Math.min(0.6,Math.pow(alpha,1.5)))/10.0));
        
        if(contrast!=null) {
            gl.uniform1f(this.shader.uniform.contrast, contrast);    
        } else {
            gl.uniform1f(this.shader.uniform.contrast, 0);  
        }
        gl.uniform1f(this.shader.uniform.alpha, alpha);
        
        gl.uniform1i(this.shader.uniform.diffuse, textureSlot);
        gl.uniformMatrix4fv(this.shader.uniform.modelMat, false, modelMat || identityMat);
        
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
    
    QuadModel.prototype.bind = function (gl, viewMat, projectionMat) {
        this.shader = modelShader;  
        
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[4]);
        gl.uniform1i(this.shader.uniform.diffuse, 4); 
        
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[3]);
        gl.uniform1i(this.shader.uniform.diffuse, 3);   
        
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[2]);
        gl.uniform1i(this.shader.uniform.diffuse, 2);    
 
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1]);
        gl.uniform1i(this.shader.uniform.diffuse, 1);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0]);
        gl.uniform1i(this.shader.uniform.diffuse, 0);

        // Bind the appropriate buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer); 
        gl.enableVertexAttribArray(this.shader.attribute.position);        
        gl.vertexAttribPointer(this.shader.attribute.position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);        
        gl.enableVertexAttribArray(this.shader.attribute.texture);        
        gl.vertexAttribPointer(this.shader.attribute.texture, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.useProgram(this.shader);

        gl.uniformMatrix4fv(this.shader.uniform.viewMat, false, viewMat);
        gl.uniformMatrix4fv(this.shader.uniform.projectionMat, false, projectionMat);  
       
    };
    
    return {
        QuadModel: QuadModel
    };
});
