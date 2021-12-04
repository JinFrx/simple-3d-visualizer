precision mediump float;

uniform samplerCube uSkybox;

varying vec3 texCoords;

// ============================================================================

void main(){
    gl_FragColor = textureCube(uSkybox, texCoords);
}