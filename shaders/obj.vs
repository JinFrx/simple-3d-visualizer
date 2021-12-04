attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;

uniform mat4 uRMatrix;
uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec4 pos3D;
varying vec3 N;
varying mat4 rMatrix;

// ==================================================================

const float CONST_PI = 3.1415926535;

// ==================================================================

void main(void) {
	pos3D = uMVMatrix * vec4(aVertexPosition, 1.0);
	N = vec3(uRMatrix * vec4(aVertexNormal, 1.0));

	rMatrix = uRMatrix;

	gl_Position = uPMatrix * pos3D;
}
