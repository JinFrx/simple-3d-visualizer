
precision mediump float;

uniform samplerCube uTexture;
uniform vec3 uSRCPOS; // Position de la source lumineuse
uniform int uMaterialType;
uniform float uSigma;
uniform float uNi;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
//uniform vec3 uRColor;
//uniform vec3 uTColor;

varying vec4 pos3D;
varying vec3 N;
varying mat4 rMatrix;

// ==================================================================

const float CONST_PI = 3.1415926535;

// Puissance de la source lumineuse
const vec3 SRCPOW = vec3(3.5);

vec3 KD = uDiffuseColor;
vec3 KS = uSpecularColor;

// ==================================================================

// * Un dot strictement positif.
// * A utiliser principalement lorsqu'on doit faire un dot entre la
// * lumiere incidente (i) et une normale (n ou m)
float ddot(const vec3 a, const vec3 b)
{
	return max(dot(a, b), 0.0);
}

// ==================================================================

// * Retourne la transposee d'une matrice m de dimension 4x4 donnee
// * en argument
mat4 transpose(const mat4 m) {
  return mat4(m[0][0], m[1][0], m[2][0], m[3][0],
              m[0][1], m[1][1], m[2][1], m[3][1],
              m[0][2], m[1][2], m[2][2], m[3][2],
              m[0][3], m[1][3], m[2][3], m[3][3]);
}

// ==================================================================

float Fresnel(const float c, const float ni)
{
	float g = sqrt(ni * ni + c * c - 1.0);

	float gmc = g - c;
	float gpc = g + c;
	float term1 = (gmc * gmc) / (gpc * gpc);
	float term2_num = c * gpc - 1.0;
	float term2_den = c * gmc + 1.0;
	float term2 = (term2_num * term2_num) / (term2_den * term2_den);

	return 1.0 / 2.0 * term1 * term2;
}

// ==================================================================

float Distrib_Beckmann(const float cosTheta_m, const float sigma)
{
	float sigma_pow2 = sigma * sigma;
	float cosTheta_m_pow2 = cosTheta_m * cosTheta_m;
	float cosTheta_m_pow4 = cosTheta_m_pow2 * cosTheta_m_pow2;
	float tanTheta_m = (1.0 - cosTheta_m) / cosTheta_m;
	float tanTheta_m_pow2 = tanTheta_m * tanTheta_m;
	
	float den = CONST_PI * sigma_pow2 * cosTheta_m_pow4;
	float expo = exp( -tanTheta_m_pow2 / (2.0 * sigma_pow2) );

	return ( 1.0 / den ) * expo;
}

// ==================================================================

float GAF_CavitesEnV(const float dim, const float din, const float dom, const float don, const float dnm)
{
	float temp_min = min( (2.0 * dnm * don) / dom, (2.0 * dnm * din) / dim );

	return min(temp_min, 1.0);
}

// ==================================================================

float CookTorrance(const float dim,
                   const float din,
				   const float dom,
				   const float don,
				   const float dnm,
				   const float F, const float sigma)
{
	float D = Distrib_Beckmann(dnm, sigma);
	float G = GAF_CavitesEnV(dim, din, dom, don, dnm);

	return (F * D * G) / (4.0 * din * don);
}

// ==================================================================

vec3 computeMir(const vec3 o, const vec3 n, const mat4 rot)
{
	//float don = ddot(o, n); // cosTheta_o
	//vec3 Mir = -o + 2.0 * n * don;
	vec3 Mir = reflect(-o, n);

	// Appliquer rotation inverse a Mir
	return vec3(rot * vec4(Mir, 1.0));
}

// ==================================================================

vec3 computeT(const vec3 o, const vec3 n, const float ni, const mat4 rot)
{
	//float cosTheta_o = ddot(o, n);
	//float cosTheta_o_pow2 = cosTheta_o * cosTheta_o;
	//float eta = 1.0 / ni;
	//float eta_pow2 = eta * eta;
	//float cosTheta_t = sqrt(1.0 - eta_pow2 * (1.0 - cosTheta_o_pow2));
	//vec3 T = n * (eta * cosTheta_o - cosTheta_t) + eta * -o;
	vec3 T = refract(-o, n, 1.0 / ni);

	// Appliquer rotation inverse a T
	return vec3(rot * vec4(T, 1.0));
}

// ==================================================================

vec4 computeTransparency(const vec3 r, const vec3 t, const vec3 n, const float ni)
{
	vec4 LiR = textureCube(uTexture, r);
	vec4 LiT = textureCube(uTexture, t);
	float drn = ddot(r, n);
	float F = Fresnel(drn, ni);

	return F * LiR + (1.0 - F) * LiT;
}

// ==================================================================

void main(void)
{
	vec3 i = normalize(uSRCPOS - vec3(pos3D));
	vec3 o = normalize(vec3(-pos3D));
	vec3 n = normalize(N);

	if(uMaterialType != 0)
	{
		// Rotation en X de la cubemap
		float angle = -90.0 * CONST_PI / 180.0;
		mat3 rotX = mat3(1.0, 0.0,         0.0,
						 0.0, cos(angle), -sin(angle),
						 0.0, sin(angle),  cos(angle));
		mat4 rMatrixInv = transpose(rMatrix * mat4(rotX));
		
		// Calculer la direction Mir de reflexion
		vec3 Mir = computeMir(o, n, rMatrixInv);

		if (uMaterialType == 1)
			// ----------------------------------------------------------
			// Mirroir parfait
			// ----------------------------------------------------------

			gl_FragColor = textureCube(uTexture, Mir);
		else if (uMaterialType == 2)
		{
			// ----------------------------------------------------------
			// Mirroir + Transparent
			// ----------------------------------------------------------

			// Calculer la direction T de transmission
			vec3 T = computeT(o, n, uNi, rMatrixInv);
			
			// Calculer la couleur de transparence
			//gl_FragColor = textureCube(uTexture, T);
			gl_FragColor = computeTransparency(Mir, T, n, uNi);
		}
	}
	else
	{
		// ----------------------------------------------------------
		// Cook-Torrance
		// ----------------------------------------------------------

		vec3 m = normalize(i + o);

		float dim = ddot(i, m);
		float din = ddot(i, n); // cosTheta_i
		float dom = ddot(o, m);
		float don = ddot(o, n); // cosTheta_o
		float dnm = ddot(n, m); // cosTheta_m
		
		// Diffuse Lambert model
		vec3 diffuse = KD / CONST_PI;

		// Specular Cook-Torrance model
		float F = Fresnel(dim, uNi);
		vec3 specular = KS * CookTorrance(dim, din, dom, don, dnm, F, uSigma);

		// BRDF Lambert-CookTorrance
		vec3 Fr = (1.0 - F) * diffuse + specular;
		
		// Cook Torrance rendering (Li * Fr * cosTheta_n)
		vec3 col = SRCPOW * Fr * din;
		
		gl_FragColor = vec4(col, 1.0);
	}
}



