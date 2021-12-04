// =====================================================
const ASSETS_PATH = 'assets/'
const SHADERS_PATH = 'shaders/'
const OBJS_PATH = ASSETS_PATH + 'objs/'
const CUPE_MAP_TEXTURES_PATH = ASSETS_PATH + 'cubemaps/'

// =====================================================
// * Stocker les informations sur les fichiers textures
const cmTexSourceInfos = {
	'chapel': {
		dirPath: CUPE_MAP_TEXTURES_PATH + 'chapel/',
		ext: 'jpg',
		size: 2048
	},
	'colosseum': {
		dirPath: CUPE_MAP_TEXTURES_PATH + 'colosseum/',
		ext: 'jpg',
		size: 2048
	},
	'hall': {
		dirPath: CUPE_MAP_TEXTURES_PATH + 'hall/',
		ext: 'jpg',
		size: 512
	},
	'sky': {
		dirPath: CUPE_MAP_TEXTURES_PATH + 'sky/',
		ext: 'jpg',
		size: 2048
	},
	'temple': {
		dirPath: CUPE_MAP_TEXTURES_PATH + 'temple/',
		ext: 'jpg',
		size: 2048
	},
	'webgl-test': {
		dirPath: CUPE_MAP_TEXTURES_PATH + 'webgl-test/',
		ext: 'jpg',
		size: 512
	},
	'yokohama': {
		dirPath: CUPE_MAP_TEXTURES_PATH + 'yokohama/',
		ext: 'jpg',
		size: 2048
	},
	'yokohama-night': {
		dirPath: CUPE_MAP_TEXTURES_PATH + 'yokohama-night/',
		ext: 'jpg',
		size: 2048
	}
}

// =====================================================
// * Entier qui permet de definir le type de materiau pour l'objet
const materialType = {
	CT: 0,
	MIRROR: 1,
	TRANSPARENT: 2
}

// =====================================================
var gl;

// =====================================================
var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var rotMatrix = mat4.create();
var distCENTER;

// =====================================================
var OBJ1 = null;
var PLANE = null;
var CUBEMAP = null;

// =====================================================
var SRCPOS = [0, 0, 0];

var MATERIAL = {
	type: materialType.CT,
	diffuseColor: [1, 1, 1],
	specularColor: [1, 1, 1],
	sigma: 0.01, // valeurs dans ]0.0, 1.0]
	ni: 1.0 // valeurs dans [1.0, 4.0]
}

// =====================================================
// OBJET 3D, lecture fichier obj
// =====================================================
class objmesh
{
	// --------------------------------------------
	constructor(objFName) {
		this.objName = objFName;
		this.shaderName = SHADERS_PATH + 'obj';
		this.loaded = -1;
		this.shader = null;
		this.mesh = null;
		
		loadObjFile(this);
		loadShaders(this);
	}

	// --------------------------------------------
	setShadersParams()
	{
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.vertexBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.nAttrib = gl.getAttribLocation(this.shader, "aVertexNormal");
		gl.enableVertexAttribArray(this.shader.nAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.mesh.normalBuffer);
		gl.vertexAttribPointer(this.shader.nAttrib, this.mesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.rMatrixUniform = gl.getUniformLocation(this.shader, "uRMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");

		// Passer la texture de la cubemap en uniform
		this.shader.textureUniform = gl.getUniformLocation(this.shader, "uTexture");

		// Passer les parametres utilisateur en uniform
		this.shader.srcPos = gl.getUniformLocation(this.shader, "uSRCPOS");
		this.shader.materialTypeUniform = gl.getUniformLocation(this.shader, "uMaterialType");
		this.shader.sigmaUniform = gl.getUniformLocation(this.shader, "uSigma");
		this.shader.niUniform = gl.getUniformLocation(this.shader, "uNi");
		this.shader.diffuseColorUniform = gl.getUniformLocation(this.shader, "uDiffuseColor");
		this.shader.specularColorUniform = gl.getUniformLocation(this.shader, "uSpecularColor");
	}
	
	// --------------------------------------------
	setMatrixUniforms()
	{
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);
		gl.uniformMatrix4fv(this.shader.rMatrixUniform, false, rotMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
	}

	// --------------------------------------------
	setUserParametersUniforms()
	{
		gl.uniform3fv(this.shader.srcPos, SRCPOS);
		gl.uniform1i(this.shader.materialTypeUniform, MATERIAL['type']);
		gl.uniform1f(this.shader.sigmaUniform, MATERIAL['sigma']);
		gl.uniform1f(this.shader.niUniform, MATERIAL['ni']);
		gl.uniform3fv(this.shader.diffuseColorUniform, MATERIAL['diffuseColor']);
		gl.uniform3fv(this.shader.specularColorUniform, MATERIAL['specularColor']);
	}

	// --------------------------------------------
	draw()
	{
		if(this.shader && this.loaded==4 && this.mesh != null) {
			this.setShadersParams();
			this.setMatrixUniforms();
			
			this.setUserParametersUniforms();

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.indexBuffer);
			gl.drawElements(gl.TRIANGLES, this.mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
		}
	}

}

// =====================================================
// PLAN 3D, Support géométrique
// =====================================================
class plane
{
	// --------------------------------------------
	constructor()
	{
		this.shaderName = SHADERS_PATH + 'plane';
		this.loaded = -1;
		this.shader = null;
		this.drawable = true;

		this.initAll();
	}
		
	// --------------------------------------------
	initAll()
	{
		var size = 1.0;
		var vertices=[
			-size, -size, 0.0,
			 size, -size, 0.0,
			 size, size, 0.0,
			-size, size, 0.0
		];

		var texcoords = [
			0.0,0.0,
			0.0,1.0,
			1.0,1.0,
			1.0,0.0
		];

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		this.vBuffer.numItems = 4;

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
		this.tBuffer.itemSize = 2;
		this.tBuffer.numItems = 4;

		loadShaders(this);
	}
	
	
	// --------------------------------------------
	setShadersParams()
	{
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.tAttrib = gl.getAttribLocation(this.shader, "aTexCoords");
		gl.enableVertexAttribArray(this.shader.tAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.vertexAttribPointer(this.shader.tAttrib,this.tBuffer.itemSize, gl.FLOAT, false, 0, 0);

		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
	}


	// --------------------------------------------
	setMatrixUniforms()
	{
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, distCENTER);
		mat4.multiply(mvMatrix, rotMatrix);
		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
	}

	// --------------------------------------------
	draw()
	{
		if(this.shader && this.loaded==4) {		
			this.setShadersParams();
			this.setMatrixUniforms(this);
			
			gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems);
			gl.drawArrays(gl.LINE_LOOP, 0, this.vBuffer.numItems);
		}
	}

}

// =====================================================
// CUBEMAP, carte d'environnement
// =====================================================
class cubemap
{
	// --------------------------------------------
	constructor()
	{
		this.shaderName = SHADERS_PATH + 'cubemap';
		this.loaded = -1;
		this.shader = null;

		this.initAll();
	}

	// --------------------------------------------
	initAll()
	{
		var size = 50.0;
		var vertices = [
			-size,  size, -size,
			-size, -size, -size,
			 size, -size, -size,
			 size, -size, -size,
			 size,  size, -size,
			-size,  size, -size,

			-size, -size,  size,
			-size, -size, -size,
			-size,  size, -size,
			-size,  size, -size,
			-size,  size,  size,
			-size, -size,  size,

			 size, -size, -size,
			 size, -size,  size,
			 size,  size,  size,
			 size,  size,  size,
			 size,  size, -size,
			 size, -size, -size,

			-size, -size,  size,
			-size,  size,  size,
			 size,  size,  size,
			 size,  size,  size,
			 size, -size,  size,
			-size, -size,  size,

			-size,  size, -size,
			 size,  size, -size,
			 size,  size,  size,
			 size,  size,  size,
			-size,  size,  size,
			-size,  size, -size,

			-size, -size, -size,
			-size, -size,  size,
			 size, -size, -size,
			 size, -size, -size,
			-size, -size,  size,
			 size, -size,  size
		];

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		this.vBuffer.itemSize = 3;
		// 6 * 6 (un cube, donc 6 faces avec 2 triangles par face)
		this.vBuffer.numItems = 36;

		loadShaders(this);
	}

	// --------------------------------------------
	setShadersParams() 
	{
		gl.useProgram(this.shader);

		this.shader.vAttrib = gl.getAttribLocation(this.shader, "aVertexPosition");
		gl.enableVertexAttribArray(this.shader.vAttrib);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.vertexAttribPointer(this.shader.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		this.shader.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
		this.shader.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");

		this.shader.skyboxLocation = gl.getUniformLocation(this.shader, "uSkybox");
		gl.uniform1i(this.shader.skyboxLocation, 0);
	}

	// --------------------------------------------
	setMatrixUniforms()
	{
		mat4.identity(mvMatrix);
		mat4.multiply(mvMatrix, rotMatrix);
		gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, mvMatrix);
		gl.uniformMatrix4fv(this.shader.pMatrixUniform, false, pMatrix);
	}

	// --------------------------------------------
	draw()
	{
		if(this.shader && this.loaded==4) {		
			this.setShadersParams();
			this.setMatrixUniforms(this);

			gl.drawArrays(gl.TRIANGLES, 0, this.vBuffer.numItems);
		}
	}
}

// =====================================================
// FONCTIONS GENERALES, INITIALISATIONS
// =====================================================
function initGL(canvas)
{
	try {
		gl = canvas.getContext("experimental-webgl");
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.clearColor(0.7, 0.7, 0.7, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK); 
	} catch (e) {}
	if (!gl) {
		console.log("Could not initialise WebGL");
	}
}

// =====================================================
loadObjFile = function(OBJ3D)
{
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			var tmpMesh = new OBJ.Mesh(xhttp.responseText);
			OBJ.initMeshBuffers(gl,tmpMesh);
			OBJ3D.mesh=tmpMesh;
		}
	}
	
	xhttp.open("GET", OBJ3D.objName, true);
	xhttp.send();
}

// =====================================================
function loadShaders(Obj3D)
{
	loadShaderText(Obj3D,'.vs');
	loadShaderText(Obj3D,'.fs');
}

// =====================================================
function loadShaderText(Obj3D, ext) // lecture asynchrone...
{
  var xhttp = new XMLHttpRequest();
  
  xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4 && xhttp.status == 200) {
		if(ext=='.vs') { Obj3D.vsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(ext=='.fs') { Obj3D.fsTxt = xhttp.responseText; Obj3D.loaded ++; }
		if(Obj3D.loaded==2) {
			Obj3D.loaded ++;
			compileShaders(Obj3D);
			Obj3D.loaded ++;
		}
	}
  }
  
  Obj3D.loaded = 0;
  xhttp.open("GET", Obj3D.shaderName+ext, true);
  xhttp.send();
}

// =====================================================
function compileShaders(Obj3D)
{
	Obj3D.vshader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(Obj3D.vshader, Obj3D.vsTxt);
	gl.compileShader(Obj3D.vshader);
	if (!gl.getShaderParameter(Obj3D.vshader, gl.COMPILE_STATUS)) {
		console.log("Vertex Shader FAILED... "+Obj3D.shaderName+".vs");
		console.log(gl.getShaderInfoLog(Obj3D.vshader));
	}

	Obj3D.fshader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(Obj3D.fshader, Obj3D.fsTxt);
	gl.compileShader(Obj3D.fshader);
	if (!gl.getShaderParameter(Obj3D.fshader, gl.COMPILE_STATUS)) {
		console.log("Fragment Shader FAILED... "+Obj3D.shaderName+".fs");
		console.log(gl.getShaderInfoLog(Obj3D.fshader));
	}

	Obj3D.shader = gl.createProgram();
	gl.attachShader(Obj3D.shader, Obj3D.vshader);
	gl.attachShader(Obj3D.shader, Obj3D.fshader);
	gl.linkProgram(Obj3D.shader);
	if (!gl.getProgramParameter(Obj3D.shader, gl.LINK_STATUS)) {
		console.log("Could not initialise shaders");
		console.log(gl.getShaderInfoLog(Obj3D.shader));
	}
}

// =====================================================
// * Fonction de chargement d'objet dans la scene
function loadObject(objectName)
{
	OBJ1 = new objmesh(OBJS_PATH + objectName);
}

// =====================================================
// * Fonction pour charger les textures des faces de la cubemap dans la scene
function loadCubeMapTextures(textureName)
{
	const {dirPath, ext, size} = cmTexSourceInfos[textureName];
	const splitDirPath = dirPath.split('/');
	const texPrefix = dirPath + splitDirPath[splitDirPath.length - 2];

	const facesInfos = [
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			src: texPrefix + '-pos-x.' + ext
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			src: texPrefix + '-neg-x.' + ext
		},
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			src: texPrefix + '-pos-y.' + ext
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			src: texPrefix + '-neg-y.' + ext
		},
		{
			target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			src: texPrefix + '-pos-z.' + ext
		},
		{
			target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
			src: texPrefix + '-neg-z.' + ext
		}
	];

	// -------------------------------------------------

	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	
	facesInfos.forEach((faceInfo) => {
		const {target, src} = faceInfo;
		
		// Allouer la face en premier
		gl.texImage2D(target, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		// Chargement asynchrone de la texture de la face
		var img = new Image();
		img.src = src;

		// Assigner ensuite la texture a la face
		img.onload = function () {
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
			gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		};

		// Generer une exception dans la console quand une texture n'a pas ete chargee correctement
		img.onerror = function(){
			throw ("La texture \"" + src + "\" n'a pas ete chargee.");
		};
	});

	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
}

// =====================================================
function webGLStart()
{
	var canvas = document.getElementById("WebGL-test");

	canvas.onmousedown = handleMouseDown;
	document.onmouseup = handleMouseUp;
	document.onmousemove = handleMouseMove;
	canvas.onwheel = handleMouseWheel;

	initGL(canvas);
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

	mat4.identity(rotMatrix);
	mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
	mat4.rotate(rotMatrix, rotY, [0, 0, 1]);

	distCENTER = vec3.create([0, -0.2, -3]);

	// -------------------------------------------------
	
	loadObject('bunny.obj');

	MATERIAL['diffuseColor'] = [0.824, 0.412, 0.118]
	MATERIAL['type'] = materialType.CT;
	MATERIAL['sigma'] = 0.1;
	MATERIAL['ni'] = 1.5;

	// -------------------------------------------------

	PLANE = new plane();
	PLANE.drawable = false;

	// -------------------------------------------------

	CUBEMAP = new cubemap();
	loadCubeMapTextures('sky');

	// -------------------------------------------------

	tick();
}

// =====================================================
function drawScene()
{
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	gl.depthFunc(gl.LEQUAL);
	CUBEMAP.draw();
	gl.depthFunc(gl.LESS);

	OBJ1.draw();

	if (PLANE.drawable)
		PLANE.draw();
}