---
title: "Contour Renderer"
post_slug: contour-rendering
post_image: "contour-rendering.png"
tags: ["C++", "OpenGL", "Computer Graphics", "Dynamic Programming"]
description: "A C++ application for visualing 2D contour maps as 3D models."
sourcecode: "https://github.com/pegasus-lynx/ContourRendering"
startdate: "01-03-2019"
enddate: "01-04-2019"
---

**Contour Renderer** is a 3D terrain visualization tool that showcases 
the intersection of advanced programming and computer graphics. 
Developed in **C++**, leveraging the capabilities of **OpenGL**, this tool 
is designed to transform 2D contour maps into dynamic 3D models
using a **_dynamic programming_** approach to triangulate i.e. 
dividing the surfaces in small triangles, which are then rendered
using **OpenGL**.

![Contour Map To Terrain Transformation](/assets/images/contour-map-terrain-map.webp)

Contour maps, which graphically represent varying elevations through 
concentric loops ( there can be exceptions to concentric constraint ), 
are the input for this application. The program intelligently interprets 
these loops, corresponding to different heights, and constructs a detailed 
3D landscape from them. This allows for a comprehensive visualization 
of terrain, offering users the ability to view the landscape from multiple 
angles and at various zoom levels.

This tool not only serves as a practical application for geographical 
and topographical analysis but also as a testament to the power of 
integrating graphical algorithms with user-friendly interfaces in C++.

The program takes a list of lists as input, where each list represents
a loop as a series of points.