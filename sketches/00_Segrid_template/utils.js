// --------------------------------
// random number between a (inclusive) and b (exclusive)
var random_between = (a, b) => { return a + (b - a) * random_dec() }

// --------------------------------
// random integer between a (inclusive) and b (inclusive)
// requires a < b for proper probability distribution
var random_int = (a,b) => {return Math.floor(random_between(a, b + 1))}

// --------------------------------
var random_bool = (p=0.5) => { return random_dec() < p }

// --------------------------------
// random value in an array of items
var random_choice = (a) => { return a[random_int(0, a.length - 1)] }

// --------------------------------
// from https://observablehq.com/@makio135/utilities
var random_weighted = (items, weights) =>
{
  const cumulativeWeights = [];
  for (let i = 0; i < weights.length; i += 1)
  cumulativeWeights[i] = weights[i] + (cumulativeWeights[i - 1] || 0);

  const maxCumulativeWeight = cumulativeWeights[cumulativeWeights.length - 1];
  const randomNumber = maxCumulativeWeight * this.random_dec();

  for (let itemIndex = 0; itemIndex < items.length; itemIndex += 1) 
  {
    if (cumulativeWeights[itemIndex] >= randomNumber) 
    {
      return {
        item: items[itemIndex],
        index: itemIndex,
        };
    }
  }
}

// --------------------------------
function getHatches(vertices, angle, step, opts={'clip':true, 'backForth':true})
{
    let hatches     = [];

    let obb         = getOBB( vertices, createVector(cos(angle),sin(angle)) );
    let i           = obb.basis.i, j = obb.basis.j, v = obb.vertices;
    let nbIntervals = int (obb.dim.h / step); 
    let s           = 0,indexA,indexB;
    let A           = createVector(), B=createVector();
    for (let ii=0; ii<=nbIntervals; ii++)
    {
        // s = y-coordinate along obb j axis
        s = ii*step;
        indexA = 0, indexB = 1;

        // A & B slides along the y-axis of the obb
        // Give a little offset so we are sure to intersect polygons lines (edge case with square and obb = square)
        let offset  = 0.05*obb.dim.w;
        let obbA    = v[indexA], obbB = v[indexB]; 
        A.set( obbA.x + (-offset*i.x) + s*j.x, obbA.y + (-offset*i.y) + s*j.y);
        B.set( obbB.x + ( offset*i.x) + s*j.x, obbB.y + ( offset*i.y) + s*j.y);

        if (opts.backForth && ii%2==1)
        {
            let tmp = A;
            A=B;
            B=tmp;
        }
        
        hatches = hatches.concat(opts.clip ? getLinesPolygonIntersection(A,B,vertices) : [A.copy(), B.copy()]);
    }    

    return hatches;
}

// ----------------------------------------------------
function getLinesPolygonIntersection(A,B,vertices)
{
    let lines = [];
    let points = getPointsPolygonIntersection(A,B,vertices);
    points.sort( (P1,P2) =>
    {
        if (P1.dist(A) > P2.dist(A) ) return -1;
        return 0;
    });

    if (points.length%2==0)
    {
        for (let i=0; i<points.length; i=i+2)
          lines.push( [points[i],points[i+1]] );
    }

    return lines;
}

// ----------------------------------------------------
function getPointsPolygonIntersection(A,B,vertices)
{
    let nb = vertices.length;
    let points = [];
    let I;
    for (let i=0; i<nb; i++)
    {
        I   = getLineIntersection(A,B,vertices[i],vertices[(i+1)%nb]);
        if (I.is)
            points.push(I.p);
    }
    
    return points;
}

// --------------------------------------------------
function getLineIntersection(A,B,C,D)
{
    let  isec = {is:false},
    denom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y),
    na = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x),
    nb = (B.x - A.x) * (A.y - C.y) - (B.y - A.y) * (A.x - C.x);
    if (denom !== 0) 
    {
        let ua = na / denom,
            ub = nb / denom,
            vecI = p5.Vector.lerp(A,B,ua);

        if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
            isec = {is:true,p:vecI};
        } 
        else {
            isec = {is:false/*,p:vecI*/};
        }
    } 
    else 
    {
        if (na === 0 && nb === 0) 
        {
            isec = {is:false};
        }
    }
    return isec;
}


// --------------------------------------------------
// dir is a unit p5.Vector
// (i,j) orthonormal basis
function getOBB(vertices, dir)
{
    let O       = getCentroid(vertices);
    let i       = dir.normalize();
    let j       = createVector(-i.y,i.x); // perpendicular
    let AABB    = getAABB( getVerticesInBasis(vertices, O, i, j) );

    let OBB     = AABB.map( v => fromBasis(O,i,j,v) );
    let center  = fromBasis( O,i,j, createVector(AABB.x + 0.5*AABB.w, AABB.y + 0.5*AABB.h) );

    return { center:center, basis : {O:O, i:i, j:j}, dim : {w:AABB.w, h:AABB.h}, vertices : OBB };
}

  // --------------------------------------------------
function getAABB(vertices)
{
    let AABB = [];
    let xMin = Infinity, yMin = Infinity;
    let xMax = -Infinity, yMax = -Infinity;

    vertices.forEach( v => {
        if (v.x < xMin) xMin = v.x;
        if (v.x > xMax) xMax = v.x;
        if (v.y < yMin) yMin = v.y;
        if (v.y > yMax) yMax = v.y;
    });
  
    AABB.push( createVector(xMin,yMin) );
    AABB.push( createVector(xMax,yMin) );
    AABB.push( createVector(xMax,yMax) );
    AABB.push( createVector(xMin,yMax) );

    AABB.x      = xMin;
    AABB.y      = yMin;
    AABB.w      = xMax-xMin;
    AABB.h      = yMax-yMin;

    return AABB;
}

// --------------------------------------------------
function getCentroid(vertices)
{
  let res = createVector();
  for (let i = 0, nb = vertices.length; i < nb; i++)
  {
      let a = vertices[i];
      let b = vertices[(i + 1) % nb];
      let crossP = a.x * b.y - b.x * a.y;
      res.x += (a.x + b.x) * crossP;
      res.y += (a.y + b.y) * crossP;
  }
  let area = getArea(vertices);
  return res.mult(1.0 / (6.0 * area));
}

// --------------------------------------------------
function getArea(vertices)
{
    let area = 0;
    for (let i = 0, nb = vertices.length; i < nb; i++) {
        let a = vertices[i];
        let b = vertices[(i + 1) % nb];
        area += a.x * b.y;
        area -= a.y * b.x;
    }
    area *= 0.5;
    return area;
}

// --------------------------------------------------
// (i,j) orthonormal basis of p5.Vector
function getVerticesInBasis(vertices, O,i,j)
{
  return vertices.map( v=>{
      let OV = createVector(v.x-O.x, v.y-O.y);
      return createVector(OV.dot(i), OV.dot(j));
  });
}

// --------------------------------------------------
// inverse of getVerticesInBasis: turns a point v expressed in the local
// (i,j) orthonormal basis back into world coordinates : O + v.x*i + v.y*j
function fromBasis(O,i,j,v)
{
  return createVector( O.x + v.x*i.x + v.y*j.x, O.y + v.x*i.y + v.y*j.y );
}

// --------------------------------------------------
// scale vertices around their centroid by a factor
function scaleVertices(vertices,scale=1.0)
{
    let O = getCentroid(vertices);
    return vertices.map( v => createVector( O.x + (v.x-O.x)*scale, O.y + (v.y-O.y)*scale ) );
}