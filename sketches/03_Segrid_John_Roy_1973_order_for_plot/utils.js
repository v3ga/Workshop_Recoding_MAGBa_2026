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