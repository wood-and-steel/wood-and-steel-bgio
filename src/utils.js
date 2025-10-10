/**
 * Randomly pick a key from a map, weighted by the relative integer value of the keys
 *
 * @export
 * @param {Map<any, number>} weightedMap - Map where the keys are the choices and values are their integer weights
 * @returns {any} - Randomly selected key from weightedMap, or undefined if map is empty or all weights are zero
 */
export function weightedRandom(weightedMap) {
  if (!weightedMap || weightedMap.size === 0) {
    return undefined;
  }

  const sumValues = [...weightedMap.values()].reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  if (sumValues <= 0) {
    console.warn('weightedRandom: sum of weights is zero or negative');
    return undefined;
  }

  const finalDieRoll = Math.floor(Math.random() * sumValues);
  let skipped = 0;
  
  for (const [choice, value] of weightedMap) {
    if (finalDieRoll < value + skipped) {
      return choice;
    }
    skipped += value;
  }

  // Fallback (should never reach here with valid input)
  return undefined;
}

/**
 * Generate a random number with a Gaussian (normal) distribution between 0 and 1
 *
 * @export
 * @param {number} [iterations=0] - Internal counter to prevent infinite recursion
 * @returns {number} - Random number between 0 and 1 with Gaussian distribution
 */
export function gaussianRandom(iterations = 0) {
  const u = 1 - Math.random(); // Subtract to flip [0, 1) to (0, 1]
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * Math.random());
  num = num / 10.0 + 0.5; // Translate to [0, 1]

  if (num > 1 || num < 0) { // Resample if outside the range (about 0.02% of the time)
    if (iterations < 10) { // Make sure we don't recurse too many times
      return gaussianRandom(iterations + 1);
    } else {
      return Math.random();
    }
  }

  return num;
}


/**
 * Chooses a random item from an array
 *
 * @export
 * @param {Array} arr - Array of length 1+ 
 * @returns {*} - A random item from that array, or undefined if array is empty
 */
export function randomArrayItem(arr) {
  if (arr && arr.length > 0) {
    return arr[Math.floor(Math.random() * arr.length)];
  } else {
    return undefined;
  }
}


/**
 * Chooses a random item from a Set
 *
 * @export
 * @param {Set} set - Set to select from
 * @returns {*} - Randomly selected element, or undefined if set is empty
 */
export function randomSetItem(set) {
  if (set && set.size > 0) {
    const array = [...set];
    return array[Math.floor(Math.random() * array.length)];
  } else {
    return undefined;
  }
}