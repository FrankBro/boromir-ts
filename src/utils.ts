function parseDieString(string: string): [number, number, number] {
  const parts = string.split("d");
  const secondParts = parts[1].split("+");
  const num = parseInt(parts[0]);
  const sides = parseInt(secondParts[0]);
  let plus = 0;
  if (secondParts.length === 2) {
    plus = parseInt(secondParts[1]);
  }
  return [num, sides, plus];
}

export function dieRollString(dice: string) {
  const [num, sides, plus] = parseDieString(dice);
  return dieRoll(num, sides, plus);
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice<T>(array: T[]): T {
  return array[getRandomInt(0, array.length - 1)];
}

export function dieRoll(num: number, sides: number, plus: number = 0) {
  let sum = 0;
  for (let i = 0; i < num; i++) {
    sum += getRandomInt(1, sides);
  }
  return sum + plus;
}
