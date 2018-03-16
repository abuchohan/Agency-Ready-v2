var vertexShaderText = 
[
    'precision mediump float;',
    '',
    'attribute vec3 vertPosition;',
    'attribute vec2 vertTexCoord;',
    'varying vec2 fragTexCoord;',
    'uniform mat4 mWorld;',
    'uniform mat4 mView;',
    'uniform mat4 mProj;',
    '',
    'void main()',
    '{',
    '  fragTexCoord = vertTexCoord;',
    '  gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);',
    '}'
].join('\n');

var fragmentShaderText =
[
    'precision mediump float;',
    '',
    'varying vec2 fragTexCoord;',
    'uniform sampler2D sampler;',
    '',
    'void main()',
    '{',
    '  gl_FragColor = texture2D(sampler, fragTexCoord);',
    '}'
].join('\n');


var InitDemo = function() {
console.log ("WebGL Is working");
    
    var canvas = document.getElementById("game-surface");
    var gl = canvas.getContext("webgl");


// adding supports for older browers
if (!gl) {
    console.log("Reverting to fallback" );
gl = canvas.getContext("experimental-webgl"); 

}

// if webgl can not be got send alert    
if (!gl) {
    window.alert("You need to change browser to view this project")
}   
    
    gl.enable(gl.DEPTH_TEST);
    
// this is making the scipt not draw the back of the box relative to the camera, this way extra system resources will not be used.
gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    
    
    
    // creating the shaders

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vertexShaderText);
gl.shaderSource(fragmentShader, fragmentShaderText)

gl.compileShader(vertexShader);

// checking if there is a compling error, if so push to console with additional informaiton
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
console.error("Error compligin vertex shader, Something went wrong", gl.getShaderInfoLog(vertexShader));
return;
}

gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
console.error("Error compligin vertex shader, Something went wrong", gl.getShaderInfoLog(fragmentShader));
return;
}
    // makiung the program, bringing all the shaders in one peice
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
console.error("error linking program, something went wrong", gl.getProgramInfoLog(program));
return;
    }

    // checking for any other problems
gl.validateProgram(program);
if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("Error validating the program", gl.getProgramInfoLog(program));
    return;
}
  

// this will be stored on the RAM  
	var boxVertices = 
[ // X, Y, Z           U, V
		// Top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Left
		-1.0, 1.0, 1.0,    0, 0,
		-1.0, -1.0, 1.0,   1, 0,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   0, 1,

		// Right
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,   0, 1,
		1.0, -1.0, -1.0,  0, 0,
		1.0, 1.0, -1.0,   1, 0,

		// Front
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,    1, 0,
		-1.0, -1.0, 1.0,    0, 0,
		-1.0, 1.0, 1.0,    0, 1,

		// Back
		1.0, 1.0, -1.0,    0, 0,
		1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, 1.0, -1.0,    1, 0,

		// Bottom
		-1.0, -1.0, -1.0,   1, 1,
		-1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, 1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
	];

// telling the script what triangles are making the square as its rendered using triangle.
    var boxIndices = 	[
		// Top
		0, 1, 2,
		0, 2, 3,

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];
    
    // this will be used on the gpu // creating buffer
var boxVertexBufferObject = gl.createBuffer();
    // binding buffer 
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
    // passing data
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);
    
	var boxIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);


    // static draw means we are sending over the things stored on the RAM to the GPU Memory
    
    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    var texCoordAttribLocation = gl.getAttribLocation(program, "vertTexCoord");
    gl.vertexAttribPointer(
    positionAttribLocation, // location of attribute
    3,                      // number of elements per attribute
    gl.FLOAT,               // type of element
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,   // size of indervidual vertsex
    0,              // offset from the beginning of the single vertex to this attribute 
    );

    gl.vertexAttribPointer(
    texCoordAttribLocation, // location of attribute
    2,                      // number of elements per attribute
    gl.FLOAT,               // type of element
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,   // size of indervidual vertsex
    3 * Float32Array.BYTES_PER_ELEMENT              // offset from the beginning of the single vertex to this attribute 
    );
    
	gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(texCoordAttribLocation);
    
    
// making the texture -- its also a buffer object
	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D( 
        gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
        gl.UNSIGNED_BYTE, 
        document.getElementById("texture-image")
	);
	gl.bindTexture(gl.TEXTURE_2D, null);
    
    
//// tell openGL state machine which program should be active
gl.useProgram(program);

var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
var matViewUniformLocation = gl.getUniformLocation(program, "mView");
var matProjUniformLocation = gl.getUniformLocation(program, "mProj");
    

var worldMatrix = new Float32Array(16);
var viewMatrix = new Float32Array(16);
var projMatrix = new Float32Array(16);
    
    // saving them to our RAM
    mat4.identity(worldMatrix);
    // this is giving us a the camera position
    mat4.lookAt (viewMatrix,[0,0,-8], [0,0,0], [0,1,0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0 );
    
    // on all mat4 elements documentation can be looked up on gl-matrix
    
    
    // sending to shader
    
    // Matrix4 meanings 4x4 matrix | F and V find meaning!!!
 gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
 gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
 gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
    
	var xRotationMatrix = new Float32Array(16);
	var yRotationMatrix = new Float32Array(16);
    
    // main render loop
    // making variables out of the loop as memory allaction could be a issue
    var identityMatrix = new Float32Array(16);
    mat4.identity(identityMatrix);

    var angle = 0;
    var loop = function () {
        var angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        
        // parameters output, orignal matrix, angle and what axis you are rotating on
	    mat4.rotate(yRotationMatrix, identityMatrix, angle, [0, 1, 0]);
		mat4.rotate(xRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
		mat4.mul(worldMatrix, yRotationMatrix, xRotationMatrix);
        
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
        gl.clearColor(0.22, 0.23, 0.22, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        
		gl.bindTexture(gl.TEXTURE_2D, boxTexture);
		gl.activeTexture(gl.TEXTURE0);
        
        gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
        // wont be drawing when no one is look at it
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    
    
    // rending the shader in a certain way | traingles can be changed to other renders


};



// notes

// glMatrix was developed primarily for WebGL, which requires that vectors and matrices be passed as Float32Array. So, for a WebGL application, the potentially costly conversion from Array to Float32Array would need to be included in any performance measurement.


