# Simple reflectance models visualizer

<p align=center>
  <img src="https://github.com/JinFrx/pf-simple-reflectance/blob/master/repo_showcase.PNG" alt="showcase image" style="width: 650px; max-width: 100%; height: auto" title="Click to enlarge picture" />
</p>

## Description

*FR*

Projet réalisé dans le cadre universitaire.

Un simple programme web qui permet de visualiser dans un canvas HTML différents modèles d'illumination locale et l'interaction de la lumière sur des modèles géométriques 3D en temps-réel.

L'éclairage de la scène et le calcul des BRDF sont codés dans les fragments shaders.

Le programme contient trois matériaux :

- Micro-facettes : algorithme de *Cook-Torrance* (distribution de normales *Beckmann* et *GAF Torrance-Sparrow*/"cavités en V")
- Spéculaire pur (effet de miroir)
- Transmission partielle via *Fresnel* et une cubemap (effet de transparence)

Le programme est compatible avec Mozilla Firefox.
Si vous ne parvenez pas à visualiser la scène, il peut-être nécessaire d'octroyer la permission sur la lecture de fichiers JavaScript en local.
Pour cela :

```
- Entrer "about:config" dans la barre URL pour accéder aux options Firefox
- Si un avertissement est envoyé par Firefox sur la modification des préférences de configuration : accepter et poursuivre
- Recherchez dans la barre de recherche de la présente page l'option "security.fileuri.strict_origin_policy"
- Inversez l'état de l'option en modifiant le booléen en *False*
- N'hésitez pas à remettre l'option en *True* plus tard pour la sécurité
```

Vous pouvez orienter la caméra et zoomer dans le canvas à l'aide de la souris.

*EN*

Project made for study purposes.

A simple web program to visualize differents local illumination models and light interaction on 3D geometrics models in real-time.

Lighting and BRDFs are coded in the fragment shaders.
The render is done through a HTML canvas, using WebGL.

Three materials are available:

- Micro-facets : *Cook-Torrance* algorithm (*Beckmann* normal distribution and *Torrance-Sparrow GAF*)
- Pure specular (mirror effect)
- Partial refraction via *Fresnel* and environment map (transparency effect)

This program is compatible with Mozilla Firefox browser.
You may need to enable hard disk research for JavaScript files through Firefox options if you are not able to visualize anything.
To achieve this:

```
- Access browser options by entering "about:config" in address bar
- You may get a warning message from Firefox to prevent modifications (safety protocol): accept and continue
- Search for option "security.fileuri.strict_origin_policy" and set the boolean to False
- Don't hesitate to reverse the state of the option later for safety purpose (set it back to True)
```

Camera orientation and zoom is performed with the mouse in the canvas.

<!-- OLD DESCRIPTION
The main goal of this university project (2021) was to implement simple reflectance models via shaders for photorealistic rendering purpose.
Three aspects where approached:
- The interaction of light on a 3D model
- The Cook-Torrance model, with Beckmann Normal Distribution and Torrance-Sparrow GAF
- The reflections and refractions on a 3D model, computed with an environment map (cubemap)

The program is compatible with Mozilla Firefox. You may need to enable hard disk research for JS files through Firefox options:

```
- access to browser options with "about:config" in address bar
- search for "security.fileuri.strict_origin_policy" and reverse the state of the boolean (set it to False)
```
-->
