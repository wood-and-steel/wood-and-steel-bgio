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


