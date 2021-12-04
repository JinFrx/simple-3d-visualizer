attribute vec3 aVertexPosition;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec3 texCoords;

// ============================================================================

const float CONST_PI = 3.1415926535;

// ============================================================================

// * Retourne la transposee d'une matrice m de dimension 4x4 donnee
// * en argument
mat4 transpose(const mat4 m) {
  return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
              m[0][1], m[1][1], m[2][1], m[3][1],
              m[0][2], m[1][2], m[2][2], m[3][2],
              m[0][3], m[1][3], m[2][3], m[3][3]);
}

// ==================================================================

void main(){
    texCoords = aVertexPosition;

    // Rotation en X pour aligner le repere de la cubemap au repere des objets
    float angle = -90.0 * CONST_PI / 180.0;
    mat3 rotX = mat3(1.0, 0.0,         0.0,
		             0.0, cos(angle), -sin(angle),
		             0.0, sin(angle),  cos(angle));

    gl_Position = uPMatrix * uMVMatrix * vec4(rotX * aVertexPosition, 1.0);
}