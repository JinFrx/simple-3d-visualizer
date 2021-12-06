# Simple reflectance models for photorealistic rendering

<p align=center>
  <img src="https://github.com/JinFrx/3d-engine-shaders/blob/master/repo_showcase.PNG" alt="showcase image" style="width: 650px; max-width: 100%; height: auto" title="Click to enlarge picture" />
</p>

## Description

The goal of this university project (2021) was to implement BRDFs and light interaction with a 3D model and an environment map, through a WebGL interface.  

Lighting models are coded in shaders, in GLSL language.

Reflections and refractions are computed with rays cast per pixel and a cubemap.

The program is compatible with Mozilla Firefox. You may need to enable hard disk research for JS files through Firefox options:

```
- access to browser options with "about:config" in address bar
- search for "security.fileuri.strict_origin_policy" and set the boolean to True
```

