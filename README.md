# Simple reflectance models for photorealistic rendering

<p align=center>
  <img src="https://github.com/JinFrx/3d-engine-shaders/blob/master/repo_showcase.PNG" alt="showcase image" style="width: 650px; max-width: 100%; height: auto" title="Click to enlarge picture" />
</p>

## Description

The main goal of this university project (2021) was to implement simple reflectance models via shaders for photorealistic rendering purpose.
Three aspects where approached:
- The interaction of light on a 3D model
- The Cook-Torrance model, with Beckmann Normal Distribution and Torrance-Sparrow GAF
- The reflections and refractions on a 3D model, computed with an environment map (cubemap)

Lighting and BRDFs are coded in the fragment shaders, in GLSL language. The render is displayed through a HTML / JS / WebGL interface.

The program is compatible with Mozilla Firefox. You may need to enable hard disk research for JS files through Firefox options:

```
- access to browser options with "about:config" in address bar
- search for "security.fileuri.strict_origin_policy" and reverse the state of the boolean (set it to False)
```

