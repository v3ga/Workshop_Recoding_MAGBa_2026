# Recoding : Tracing the Origins of Generative Art

Recoding is a short workshop exploring the logic of early generative art through the reinterpretation of a single historical artwork: [Segrid](https://recodeproject.com/artworks/v2n3-segrid) (1973) by John Roy.


<a href="https://ragnar-digital.transforms.svdcdn.com/production/images/artwork/Segrid_John_Roy_11102025.jpg?w=3000&q=80&auto=format&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1762802771&s=b11859ba603d3e7d3b4557bd47581e77"><img src="https://ragnar-digital.transforms.svdcdn.com/production/images/artwork/Segrid_John_Roy_11102025.jpg?w=3000&q=80&auto=format&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1762802771&s=b11859ba603d3e7d3b4557bd47581e77" height="400px" /></a><a href="https://ragnar-digital.transforms.svdcdn.com/production/images/artwork/20250520_153540.jpg?w=3000&q=80&auto=format&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1762802772&s=0bff021494e504b75e6a006a5467d0a5"><img src="https://ragnar-digital.transforms.svdcdn.com/production/images/artwork/20250520_153540.jpg?w=3000&q=80&auto=format&fit=crop&crop=focalpoint&fp-x=0.5&fp-y=0.5&dm=1762802772&s=0bff021494e504b75e6a006a5467d0a5" height="400px" /></a>
<span style="font-size:12px"><em>Images used with the permission of Ragnar Digital</em></span>

It will be held at Palo Alto in Barcelona (Spain) the 10th of July 2026 during ["MAGBa3 — Origens"](https://magba.art/magba3/) exhibition. 


## About
Participants will work from a contemporary “recode” of the original piece in [p5js](https://p5js.org/) — a program recreating the visual system and structure behind the work. A minimal interface will be provided, allowing direct interaction with the system’s parameters and rapid exploration of visual variations without starting from scratch.

The workshop will focus on how the image is constructed through rules, repetition, variation, and algorithmic constraints, following approaches developed by pioneers of computer art in the 1960s and 70s. Starting from this shared codebase, participants will create their own iterations and mutations of the work. 

Selected iterations will also be plotted as physical drawings using modern & vintage pen plotters.

https://magba.art/magba3/en/esdeveniments/recoding-tracing-the-origins-of-generative-art/index.html


## Workflow


## Sketches
* [Template]()
* [Sketch basic](https://editor.p5js.org/v3ga/sketches/lD0uUIE_g)
* [Sketch with random parameters and UI](https://editor.p5js.org/v3ga/sketches/GEq3U8fdO)

## Quick reference 
The files ```utils.js``` and ```sketch.js``` include some useful functions that can be used during the workshop.

#### Random functions
```js
// random number between 0 and 1
// random_dec is initalized in the setup() with a custom PRNG function 
let rnd = random_dec()
// random number between a and b (exclusive)
let rnd = random_between(a,b)
// random integer between a (inclusive) and b (inclusive)
let rnd = random_int(a,b)
// random boolean
let is = random_bool()
// random value in an array of items
let rnd_item = random_choice(a)
```
#### Geometry
```js
// Scales an array of p5.Vector from its centroid
let verticesScaled = scaleVertices(vertices, s=1.0)
// Computes oriented hatches for an array of vertices (p5.Vector)
// Returns [ [A,B], [A,B], ... ]
let lines = getHatches(vertices, angle, step);
```
#### Computation
```js
// Computes the position and dimension of the grid according to the user margin
let [xGrid,yGrid,dimGrid] = getGridInformation()
// Converts millimeters to pixels (using paper format)
let px = mmToPx(mm)
// Paper ratio
let ratio = paperRatio()
```

## Workflow
### The easy way
* Go to https://editor.p5js.org/v3ga/sketches/lD0uUIE_g
* Duplicate the sketch, it's plotter ready ! 

### The other way
This is not mandatory to install and run it for this workshop, though it is useful for easily manipulating svg and generating hpgl commands for Roland plotter.

##### Requirements
```python``` environment is needed to run the server.
Note for Mac users : if ```python```does not work, replace with ```python3``` in the following commands.

##### Download
Clone or download this repository.

##### Install and run
First we are going to create a virtual environment for the server.
In a terminal type the following commands : 
```bash
# Replace [path] with the appropriate location of the repo on your system
cd [path] 
```
```bash
python -m venv .venv
```

Then activate the virtual environment : 

**MacOS / Linux**
```bash
source .venv/bin/activate
```
**Windows**
```bash
.\.venv\Scripts\Activate.ps1
```

Once the virtual environment is activated, install the project’s dependencies listed in the ```requirements.txt``` file: 
```bash
pip install -r requirements.txt
```
That's it ! You should be able to run the server now.

##### Server lauching
```bash
python ./server.py
```
If everything went fine, you should be able to open ```http://127.0.0.1:8080``` on your browser and navigate into the examples.


## Libs & tools
* [Golan Levin / p5.plotSvg](https://github.com/golanlevin/p5.plotSvg/)<br />*p5.js library for exporting SVG files tailored for pen plotting.*
* [Antoine Beyeler / vpype](https://github.com/abey79/vpype)<br />*vpype is the Swiss-Army-knife command-line tool for plotter vector graphics.*

## Links
* [The ReCode project](https://recodeproject.com/)<br />*The ReCode Project is a community-driven effort to preserve computer art by translating it into a modern programming language (Processing / p5js)*
* [Zach Lieberman / Recreating The Past](https://rtp.media.mit.edu/)<br />*In Recreating the Past, we will study computational art from the past decades and recreate these works with contemporary techniques to gain aesthetic, analytical and technical knowledge.*
* [Yseul Song / Re-coded](https://yeseul.com/Re-coded)<br />*School for Poetic Computation studied five pioneers of computational media and recreated their projects using contemporary tools such as OpenFrameworks and Processing. We made about 50 pieces of sketches and displayed on two 9ft x 9ft LED walls.*
* [Lycée Le Corbusier à Strasbourg](https://www.lyceelecorbusier.eu/p5js/?page_id=2861)<br />*Collection of sketches*
* [Julien Gachadoat / Dessins géométriques et artistiques avec votre micro-ordinateur](https://github.com/v3ga/dessins_geometriques_et_artistiques)
* [Julien Gachadoat / Nouveaux dessins géométriques et artistiques avec votre micro-ordinateur](https://github.com/v3ga/nouveaux_dessins_geometriques_et_artistiques)<br />*These repositories present programs written by french mathematician and computer scientist Jean-Paul Delahaye in the books "Dessins géométriques et artistiques avec votre micro-ordinateur" & "Nouveau dessins géométriques et artistiques avec votre micro-ordinateur" published in 1985 for the Eyrolles french publishing house.*
 
### Plotters
* [Brian Boucheron / awesome-plotters](https://github.com/beardicus/awesome-plotters)<br />*A curated list of code and resources for computer-controlled drawing machines and other visual art robots.*
* [Julien Dorra / 3D printable plotter adapters for pens and refills](https://github.com/juliendorra/3D-printable-plotter-adapters-for-pens-and-refills)<br />*Use your favorite contemporary pens on vintage HP plotters with this parametric OpenSCAD code to create custom adapters.*
* [Roland DXY-1300 -1200 -1100 Command Reference Manual](https://archive.org/details/rolanddxy130012001100commandreferencemanualaf)

### Random numbers generators
* [A Million Random Digits with 100,000 Normal Deviates](https://www.rand.org/pubs/monograph_reports/MR1418.html)<br />*Still the largest known source of random digits and normal deviates, the work is routinely used by statisticians, physicists, polltakers, market analysts, lottery administrators, and quality control engineers.*
* [List of random number generators](https://en.wikipedia.org/wiki/List_of_random_number_generators)<br />*Random number generators are important in many kinds of technical applications, including physics, engineering or mathematical computer studies.*
* [prng](https://github.com/dworthen/prng)<br />*A collection of better PRNGs*

### History
* [v3ga / Computer & Computer art history](https://github.com/v3ga/computer_history)<br />*A set of links related to computer & code history (english and french links)*
