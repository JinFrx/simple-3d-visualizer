
function mat(a){
	if (a == '0'){
		return materialType.CT;
	}
	else if (a == '1'){
		return materialType.MIRROR;
	}
	else if (a == '2'){
		return materialType.TRANSPARENT;
	}

}

/* Changement d'objets */

function ob(){
    var name_object = document.getElementById("objets").value;
    loadObject(name_object);
}

/* Changement type de matériau */
function mt(){
    var mattype = document.getElementById("materials").value;
    MATERIAL['type'] = mat(mattype);
}

/* Changement de l'indice de refraction  */
function indre(){
    var ni = document.getElementById("ni").value;
    MATERIAL['ni'] = ni;
}

/* Changement de sigma */
function sig(){
    var sigma = document.getElementById("sig").value;
    MATERIAL['sigma'] = sigma;
}

/* Changement des cartes d'environnement */
function cubma(){
    var name_cubemaps = document.getElementById("cubemaps").value;
    loadCubeMapTextures(name_cubemaps);
}

/* Hexa vers float */
function hexaToRGB(hexa){
    r = hexa.substring(1, 3);
    g = hexa.substring(3, 5);
    b = hexa.substring(5, 7);
    return [parseInt(r, 16) / 255.0,
            parseInt(g, 16) / 255.0,
            parseInt(b, 16) / 255.0];
}

/* Changement de la couleur de diffusion */
function diffuseColor(){
    var diffuse_value = document.getElementById("diffuse").value;
    MATERIAL['diffuseColor'] = hexaToRGB(diffuse_value);
}

/* Changement de la couleur speculaire */

function specularColor(){
    var specular_value = document.getElementById("specular").value;
    MATERIAL["specularColor"] = hexaToRGB(specular_value);
}