import { Parts } from "./boromir";
import { Gender } from "./grammar";
import { dieRoll, dieRollString } from "./utils";

const ATTACKS_PER_ROUND = [
  [1],
  [2],
  [3],
  [4],
  [5],
  [6, 1],
  [7, 2],
  [8, 3],
  [9, 4],
  [10, 5],
  [11, 6, 1],
  [12, 7, 2],
  [13, 8, 3],
  [14, 9, 4],
  [15, 10, 5],
  [16, 11, 6, 1],
  [17, 12, 7, 2],
  [18, 13, 8, 3],
  [19, 14, 9, 4],
  [20, 15, 10, 5],
];

export class Thing {
  definiteName: string;
  indefiniteName: string;

  constructor(
    public name: string,
    public isUnique: boolean,
    public gender = Gender.neuter,
  ) {
    if (!isUnique) {
      this.definiteName = "the " + name;
      if (name.match(/^[aeiou]/)) {
        this.indefiniteName = "an " + name;
      } else {
        this.indefiniteName = "a " + name;
      }
    } else {
      this.definiteName = name;
      this.indefiniteName = name;
    }
  }
}

export class Equippable extends Thing {
  wearer?: Creature;
  constructor(name: string, isUnique: boolean) {
    super(name, isUnique);
  }
}

export class Weapon extends Equippable {
  constructor(
    name: string,
    isUnique: boolean,
    public damage: string,
    public words: Parts,
    public critRange: number,
    public critMultiplier: number,
  ) {
    super(name, isUnique);
  }

  isAttackRollCrit(attackRoll: number) {
    return attackRoll >= 20 - this.critRange;
  }

  damageRoll(attackRoll: number) {
    let numTimes = 1;
    let damage = 0;
    if (this.isAttackRollCrit(attackRoll)) {
      numTimes = this.critMultiplier;
    }
    for (let i = 0; i < numTimes; i++) {
      damage += dieRollString(this.damage) + this.wearer!.str;
    }
    return damage;
  }
}

export class Armor extends Equippable {
  constructor(
    name: string,
    isUnique: boolean,
    public armorBonus: number,
  ) {
    super(name, isUnique);
  }
}

export class Creature extends Thing {
  maxBaseHp;
  weapon?: Weapon;
  armor?: Armor;

  constructor(
    name: string,
    gender: Gender,
    isUnique: boolean,
    public level: number,
    public str: number,
    public con: number,
    public dex: number,
    public hp: number,
    public parts: Parts,
    public stumbles: string[][],
  ) {
    super(name, isUnique, gender);
    this.maxBaseHp = hp;
    this.fullyHeal();
  }

  equipWeapon(weapon: Weapon) {
    weapon.wearer = this;
    this.weapon = weapon;
  }

  equipArmor(armor: Armor) {
    armor.wearer = this;
    this.armor = armor;
  }

  armorClass() {
    return 10 + (this.armor?.armorBonus || 0) + this.dex;
  }

  baseAttackBonus(): number[] {
    return ATTACKS_PER_ROUND[this.level - 1];
  }

  check(name: "str" | "dex" | "con") {
    return dieRoll(1, 20) + this[name];
  }

  maxHp() {
    return this.maxBaseHp + this.con * this.level;
  }

  fullyHeal() {
    this.hp = this.maxHp();
  }

  loseHp(amount: number) {
    this.hp -= amount;
    if (this.hp < 0) {
      this.hp = 0;
    }
  }
}
