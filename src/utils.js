/**
 * Randomly pick a key from a map, weighted by the relative integer value of the keys
 *
 * @param {Map<any, number>} weightedMap - Map where the keys are the choices and values are their integer weights
 * @returns {any} - Randomly selected key from weightedMap
 */
export function weightedRandom(weightedMap) {
  let chosenKey = undefined;
  const sumValues = weightedMap.values().reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  const finalDieRoll = Math.floor(Math.random() * sumValues);
  let skipped = 0;
  weightedMap.forEach((value, choice) => {
    if (finalDieRoll < value + skipped && !chosenKey)
      chosenKey = choice
    else
      skipped += value;
  });

  return chosenKey;
}

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
 * @param {*} arr - Array of length 1+ 
 * @returns {(arr: any) => any} - A random item from that array
 */
export function randomArrayItem(arr) {
  if (arr && arr.length) {
    return arr[Math.floor(Math.random() * arr.length)];
  } else {
    return undefined;
  }
}