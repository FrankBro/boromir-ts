import { Terminal } from "wglt";
import { Creature } from "./entities";

type EventKind =
  | { kind: "pause"; seconds: number }
  | { kind: "text"; text: string };

export class Event {
  constructor(public kind: EventKind) {}

  draw(term: Terminal, y: number) {
    if (this.kind.kind == "text") {
      term.drawString(0, y, this.kind.text);
    }
  }

  static text(text: string) {
    text = text[0].toUpperCase() + text.slice(1);
    const kind: EventKind = { kind: "text", text };
    return new Event(kind);
  }

  static begin(p1: Creature, p2: Creature): Event {
    const text = `${p1.definiteName} and ${p2.definiteName} close in and begin to fight!`;
    return this.text(text);
  }

  static status(p1: Creature, p2: Creature): Event {
    function statusStr(creature: Creature) {
      return `${creature.name}: ${creature.hp}/${creature.maxHp()} HP`;
    }
    const text = `${statusStr(p2)} ${statusStr(p1)}`;
    return this.text(text);
  }

  static death(defender: Creature) {
    const text = `${defender.definiteName} has been killed!`;
    return this.text(text);
  }

  static intro(orc: Creature) {
    const text = `${orc.indefiniteName} wielding ${orc.weapon!.indefiniteName} approaches!`;
    return this.text(text);
  }

  static conclusion(count: number, orc: Creature, boromir: Creature) {
    const text = `After killing ${count - 1} ${orc.name}s, ${boromir.name} died.`;
    return this.text(text);
  }

  static pause(seconds: number) {
    const kind: EventKind = { kind: "pause", seconds };
    return new Event(kind);
  }

  static stumble(
    stumbleDesc: string,
    _attacker: Creature,
    _defender: Creature,
  ) {
    const text = stumbleDesc;
    return this.text(text);
  }

  static hit(
    phrase: string,
    _attacker: Creature,
    _defender: Creature,
    _damage: number,
  ) {
    const text = phrase;
    return this.text(text);
  }

  static miss(phrase: string, _attacker: Creature, _defender: Creature) {
    const text = phrase;
    return this.text(text);
  }
}

export class Events {
  events: Event[] = [];

  constructor(public hero: Creature) {}

  emit(message: Event) {
    this.events.push(message);
  }
}
