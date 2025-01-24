import { Creature, Equippable } from "./entities";
import { Events, Event } from "./events";
import { dieRollString, randomChoice } from "./utils";

export enum Gender {
  male = "MALE",
  female = "FEMALE",
  neuter = "NEUTER",
  you = "YOU",
}

type Pronouns = {
  himself: string;
  his: string;
  him: string;
  he: string;
};

type PronounMap = {
  [key in Gender]: Pronouns;
};

const PRONOUNS: PronounMap = {
  MALE: {
    himself: "himself",
    his: "his",
    him: "him",
    he: "he",
  },
  FEMALE: {
    himself: "herself",
    his: "her",
    him: "her",
    he: "she",
  },
  NEUTER: {
    himself: "itself",
    his: "its",
    him: "it",
    he: "it",
  },
  YOU: {
    himself: "yourself",
    his: "your",
    him: "you",
    he: "you",
  },
};

type Dict = { [key: string]: string };

export class GrammarDict {
  dict: Dict = {};

  constructor(
    public subject: Creature,
    public object: Equippable,
  ) {}

  makePronounDict(gender: Gender, maybePrefix?: string) {
    const prefix = maybePrefix || "";
    const pronouns = PRONOUNS[gender];
    for (const [key, value] of Object.entries(pronouns)) {
      this.dict[prefix + key] = value;
    }
  }

  fillDict(target: Creature, viewer?: Creature, maybePrefix?: string) {
    const prefix = maybePrefix || "";

    if (target === viewer) {
      this.makePronounDict(Gender.you, prefix);
      this.dict[prefix + "name"] = "you";
      this.dict[prefix + "name_pos"] = "your";
    } else {
      this.makePronounDict(target.gender, prefix);
      this.dict[prefix + "name"] = target.name;
      this.dict[prefix + "name_pos"] = `${target.name}'s`;
    }
  }
}

function applyDict(string: string, dict: Dict) {
  return string.replace(/%\(([a-zA-Z0-9_]+)\)s/g, function (_str, term) {
    return dict[term].toString();
  });
}

function parseString(
  string: string,
  isSquarePlural: boolean,
  isAnglePlural: boolean,
) {
  const SQUARES = /\[(.*?)(\|(.+?))?\]/g;
  const ANGLES = /\<(.*?)(\|(.+?))?\>/g;

  function replaceBrackets(string: string, regexp: RegExp, isPlural: boolean) {
    return string.replace(regexp, (_str, singular, plural) => {
      if (isPlural) {
        return plural ? plural.slice(1) : "";
      }
      return singular;
    });
  }

  string = replaceBrackets(string, SQUARES, isSquarePlural);
  return replaceBrackets(string, ANGLES, isAnglePlural);
}

export class View {
  constructor(public viewer?: Creature) {}

  makeGrammarDict(subject: Creature, object: Creature): GrammarDict {
    let dict = new GrammarDict(subject, object);
    dict.fillDict(subject, this.viewer);
    dict.fillDict(object, this.viewer, "o_");
    return dict;
  }

  parseString(string: string, dict: GrammarDict) {
    const isSubjPlural = dict.subject == this.viewer;
    const isObjPlural = dict.object == this.viewer;

    string = parseString(string, isSubjPlural, isObjPlural);
    return applyDict(string, dict.dict);
  }
}

export class Narrator {
  constructor(
    public view: View,
    public events: Events,
  ) {}

  hit(
    attacker: Creature,
    defender: Creature,
    damage: number,
    attackRoll: number,
    roundNumber: number,
  ) {
    const weapon = attacker.weapon!;
    const percent = damage / defender.hp;
    let part;
    let phrase;
    let stumbleDesc;
    const dict = this.view.makeGrammarDict(attacker, defender);

    dict.dict.weapon = attacker.weapon!.name;
    dict.dict.o_weapon = defender.weapon!.name;

    if (percent < 0.15) {
      phrase = randomChoice(weapon.words.light);
    } else if (percent < 0.5) {
      phrase = randomChoice(weapon.words.medium);
    } else {
      phrase = randomChoice(weapon.words.heavy);
      if (percent < 1.0) {
        part = randomChoice(defender.parts.heavy);
      } else {
        part = randomChoice(defender.parts.fatal!);
      }
    }

    if (attacker.weapon!.isAttackRollCrit(attackRoll) || percent >= 0.8) {
      if (roundNumber == 1) {
        stumbleDesc = randomChoice(attacker.stumbles[0]);
      } else {
        stumbleDesc = randomChoice(attacker.stumbles[1]);
      }
      stumbleDesc = this.view.parseString(stumbleDesc, dict);
      this.events.emit(Event.stumble(stumbleDesc, attacker, defender));
      this.events.emit(Event.pause(1));
    }

    if (part) {
      phrase = "%(name)s " + phrase + " %(o_name_pos)s " + part;
    } else {
      phrase = "%(name)s " + phrase + " %(o_name)s";
    }

    phrase += " for " + damage + " damage!";
    phrase = this.view.parseString(phrase, dict);
    this.events.emit(Event.hit(phrase, attacker, defender, damage));
  }

  miss(attacker: Creature, defender: Creature) {
    var dict = this.view.makeGrammarDict(attacker, defender);
    var phrase = "%(name)s misses %(o_name)s!";
    phrase = this.view.parseString(phrase, dict);
    this.events.emit(Event.miss(phrase, attacker, defender));
  }
}

type DoDieRoll = () => number;

export class MeleeAttack {
  dieRoll: DoDieRoll;

  constructor(
    public narrator: Narrator,
    public maybeDieRoll?: DoDieRoll,
  ) {
    this.dieRoll = maybeDieRoll || (() => dieRollString("1d20"));
  }

  oneAttack(
    attacker: Creature,
    defender: Creature,
    baseAttackBonus: number,
    roundNumber: number,
  ) {
    const attackRoll = this.dieRoll();
    const attack = attackRoll + baseAttackBonus + attacker.str;
    const defense = defender.armorClass();

    if (defender.hp == 0) {
      return;
    }

    if (attack >= defense) {
      const damage = attacker.weapon!.damageRoll(attackRoll);
      this.narrator.hit(attacker, defender, damage, attackRoll, roundNumber);
      defender.loseHp(damage);
    } else {
      this.narrator.miss(attacker, defender);
    }
  }

  executeTurn(attacker: Creature, defender: Creature) {
    const attacks = attacker.baseAttackBonus();
    this.oneAttack(attacker, defender, attacks[0], 1);
    for (let i = 1; i < attacks.length; i++) {
      this.narrator.events.emit(Event.pause(2));
      this.oneAttack(attacker, defender, attacks[i], 1 + i);
    }
  }
}
