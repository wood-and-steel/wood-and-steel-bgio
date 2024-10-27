import { cities } from "./GameMap";

// Given two cities, returns the compass heading from one to the other

export function heading(fromKey, toKey) {

  const fromCity = cities.get(fromKey);
  const toCity = cities.get(toKey);

  // deg to rad
  const fromLat = fromCity.latitude * Math.PI / 180.0;
  const fromLong = fromCity.longitude * Math.PI / 180.0;
  const toLat = toCity.latitude * Math.PI / 180.0;
  const toLong = toCity.longitude * Math.PI / 180.0;
  
  const x = Math.cos(toLat) * Math.sin(toLong - fromLong);
  const y = Math.cos(fromLat) * Math.sin(toLat) - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(toLong - fromLong);

  let β = Math.atan2(x, y) * 180.0 / Math.PI; // rad to deg
  if (β < 0) β += 360.0;
  
  return β;
}

// Given two cities, return one of ["north", "south", "east", "west"]

export function cardinalDirection(fromKey, toKey) {
  const h = heading(fromKey, toKey);
  if (h > 315.0 || h <= 45.0)
    return "north"
  else if (h > 45.0 && h <= 135.0)
    return "east"
  else if (h > 135.0 && h <= 225.0)
    return "south"
  else
    return "west";
}