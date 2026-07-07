// --------------------------------
// Recode of Segrid | John Roy | 1973
// diagram here : https://www.ragnardigital.art/collection/segrid
// --------------------------------

let filename          = 'MAGBa3_Recoding_Segrid_John_Roy';
let bDrawGrid         = false;
let bDrawPatterns     = true;
let bDoExportSvg      = false; 

// --------------------------------
let palette           = {'paperColor':'#000', 'strokeColor':'#FFF'};

// --------------------------------
// Paper format
let paperFormatCM      = [25,25]; // cm

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
// Function that will participants will work in
// (x,y) : position of the cell
// d     : width/height of the cell
// (i,j) : coordinates of the cell
// n     : density
function drawPattern(x,y,d,i,j,n)
{
  let d2  = d/2;
  let gap = d2 * 1/params.nbLinesHalfCell;
  
  push();
  translate(x+d2, y+d2);

  let offset = d/(2*n)/2;
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
function setup() 
{
  // Create canvas
  createCanvas(800, floor(800/paperRatio()));
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
  
  if (bDoExportSvg)
    beginRecordSvg(this, `${filename}.svg`);

  if (bDrawPatterns)
  {
    // Patterns
    let margin = params.margin;
    let r     = params.res;
    let mw    = margin*width; 
    let w     = width-2*mw;
    let mh    = 0.5*(height-w); 
    let d     = (width-2*mw)/r;
    let cx    = (r - 1) / 2;
    let cy    = (r - 1) / 2;
    let dMax  = floor(r / 2);
    
    strokeWeight( mmToPx(params.sw) );
    for (let [i,j] of getGridCellsOnionOrder(r))
    {
      // Coordinates of (i,j) cell
      let x = mw+i*d;
      let y = mh+j*d;

      // Density
      let dst = max(abs(i - cx), abs(j - cy));
      let n   = map(dst / dMax,0,params.nbLinesMin,params.nbLinesMax,1);

      // Draw pattern
      drawPattern(x,y,d,i,j,n);
    }


  }
  if (bDoExportSvg)
  {
    endRecordSvg();
    bDoExportSvg = false;
  }

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
// Returns the (i,j) coordinates of a r x r grid ordered ring by ring,
// from the outer perimeter inward, like the layers of an onion.
function getGridCellsOnionOrder(r)
{
  let cells   = [];
  let maxRing = Math.ceil(r / 2);

  for (let ring=0; ring<maxRing; ring++)
  {
    let iStart = ring, iEnd = r-1-ring;
    let jStart = ring, jEnd = r-1-ring;

    if (iStart == iEnd && jStart == jEnd)
    {
      // single cell left in the middle (odd r)
      cells.push([iStart, jStart]);
    }
    else if (iStart == iEnd)
    {
      // single column left
      for (let j=jStart; j<=jEnd; j++)
        cells.push([iStart, j]);
    }
    else if (jStart == jEnd)
    {
      // single row left
      for (let i=iStart; i<=iEnd; i++)
        cells.push([i, jStart]);
    }
    else
    {
      // top row, left -> right
      for (let i=iStart; i<=iEnd; i++)
        cells.push([i, jStart]);
      // right column, top+1 -> bottom
      for (let j=jStart+1; j<=jEnd; j++)
        cells.push([iEnd, j]);
      // bottom row, right-1 -> left
      for (let i=iEnd-1; i>=iStart; i--)
        cells.push([i, jEnd]);
      // left column, bottom-1 -> top+1
      for (let j=jEnd-1; j>=jStart+1; j--)
        cells.push([iStart, j]);
    }
  }

  return cells;
}

// --------------------------------
function drawGrid()
{
  push();
  stroke(255,100,0,120);
  strokeWeight(1);

  let m = params.margin*width; 
  let r = params.res;
  for (let i=0; i<=r; i++)
  {
     let x = map(i,0,r,m,width-m);
     line(x,m,x,height-m);
  }  
  for (let j=0; j<=r; j++)
  {
     let y = map(j,0,r,m,height-m);
     line(m,y,width-m,y);
  }  
  pop();
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

// --------------------------------
function keyPressed()
{
  if (key == 'e')
  {
    bDoExportSvg = true;
    redraw();
  }
}