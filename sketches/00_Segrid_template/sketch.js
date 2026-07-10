// --------------------------------
// Recode of Segrid | John Roy | 1973
// diagram here : https://www.ragnardigital.art/collection/segrid
// --------------------------------

let filename          = 'MAGBa3_Recoding_Segrid_John_Roy';
let bDrawGrid         = true;
let bDrawPatterns     = false;
let bDoExportSvg      = false; 

// --------------------------------
let palette           = {'paperColor':'#000', 'strokeColor':'#FFF'};

// --------------------------------
// Paper format
// Available : [15,15] [25,25] [21,29.7]
let paperFormatCM      = [25,25]; // cm

// --------------------------------
let canvasW            = 600; // pixels

// --------------------------------
// Default values
let params = 
{
  'margin' : 0.05, // %
  'sw' : 0.4, // mm
  'res' : 17,
  'nbLinesMin' : 1,
  'nbLinesMax' : 9,
  'nbLinesHalfCell' : 5
}

// --------------------------------
function setup() 
{
  // Create canvas
  createCanvas(canvasW, floor(canvasW/paperRatio()));
  setSvgResolutionDPCM(Math.floor(width/paperFormatCM[0]));  

  // no loop, just draw once
  noLoop();
}

// --------------------------------
function draw() 
{
  background(palette.paperColor);
  noFill();
  strokeCap(ROUND);
  stroke(palette.strokeColor);
  
  // Choose random params
  // Set seed for random function calls
  // So that the sequence of random numbers is always the same
  setupRandomGenerator();
  // params.res = random_int(10,20);

  // Grid
  if (bDrawGrid)
    drawGrid();
  
  // Export SVG
  if (bDoExportSvg)
    beginRecordSvg(this, `${filename}.svg`);

  // Patterns
  if (bDrawPatterns)
  {
    let [xGrid,yGrid,dimGrid] =  getGridInformation();

    let r           = params.res;
    let step        = dimGrid/r;
    let cx          = (r - 1) / 2;
    let cy          = (r - 1) / 2;
    let dMax        = floor(r / 2);
    
    strokeWeight( mmToPx(params.sw) );
    for (let j=0; j<r; j++)
    {
      for (let i=0; i<r; i++)
      {
        // Coordinates of (i,j) cell
        let x = xGrid + i*step;
        let y = yGrid + j*step;
        
        // Density
        let dst = max(abs(i - cx), abs(j - cy));
        let n   = map(dst / dMax,0,params.nbLinesMin,params.nbLinesMax,1);

        // Draw pattern
        drawPatternSegrid(x,y,step,i,j,n);              
      }
    }
  }

  // Export SVG end
  if (bDoExportSvg)
  {
    endRecordSvg();
    bDoExportSvg = false;
  }

}

// --------------------------------
// Function that will participants will work in
// (x,y) : position of the cell
// d     : width/height of the cell
// (i,j) : coordinates of the cell
// n     : density
function drawPattern(x,y,d,i,j,n)
{
  
}

// --------------------------------
// Function that will participants will work in
// (x,y) : position of the cell
// d     : width/height of the cell
// (i,j) : coordinates of the cell
// n     : density
function drawPatternSegrid(x,y,d,i,j,n)
{
  let d2  = d/2;
  let gap = d2 * 1/params.nbLinesHalfCell;
  
  push();
  translate(x+d2, y+d2);

  for (let a=0;a<4;a++)
  {
    push();
    rotate(a*PI/2)
    let y = -d2+gap; 
    for (let k=0;k<n;k++)
    {
      line(-d2,y,0,y)
      y += gap;
    }
    pop();
    
  }
  
  pop();
}


// --------------------------------
function setupRandomGenerator()
{
  if (!params.seed)
  {
    params.seed = Date.now();
    console.log(`Choosing seed : ${params.seed}`);
  }
  random_dec = PRNG.Alea(params.seed);
}


// --------------------------------
function drawGrid()
{
  push();
  stroke(255,120);
  strokeWeight(1);

  let r = params.res;
  let [xGrid,yGrid,dimGrid] =  getGridInformation();
  for (let i=0; i<=r; i++)
  {
     let x = map(i,0,r,xGrid,xGrid+dimGrid);
     line(x,yGrid,x,yGrid+dimGrid);
  }  
  for (let j=0; j<=r; j++)
  {
     let y = map(j,0,r,yGrid,yGrid+dimGrid);
     line(xGrid,y,xGrid+dimGrid,y);
  }  
  pop();
}

// --------------------------------
function getGridInformation()
{
  let margin      = params.margin;
  let m           = min(width,height)*margin;
  let dimGrid     = min(width,height)-2*m;
  let xGrid       = (width-dimGrid)/2;
  let yGrid       = (height-dimGrid)/2;
  return [xGrid,yGrid,dimGrid];
}

// --------------------------------
function mmToPx(mm)
{
  return mm/(10*paperFormatCM[0]) * width;
}

// --------------------------------
function paperRatio()
{
  return paperFormatCM[0] / paperFormatCM[1]; 
}
