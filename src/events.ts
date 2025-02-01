import { Color, Colors, Terminal } from "wglt";
import { Creature } from "./entities";

export abstract class Event {
  pause(): number | undefined {
    return undefined;
  }
  draw(term: Terminal, y: number): number {
    return 0;
  }

  static text(text: string, fg: Color = Colors.WHITE): Event {
    text = text[0].toUpperCase() + text.slice(1);
    return new TextEvent(text, fg);
  }

  static begin(p1: Creature, p2: Creature): Event {
    const text = `${p1.definiteName} and ${p2.definiteName} close in and begin to fight!`;
    return this.text(text);
  }

  static status(p1: Creature, p2: Creature): Event {
    function statusStr(creature: Creature) {
      return `${creature.name}: ${creature.hp}/${creature.maxHp()} HP`;
    }
    const text = `(${statusStr(p2)} ${statusStr(p1)})`;
    return this.text(text, Colors.LIGHT_GRAY);
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
    return new PauseEvent(seconds);
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

class PauseEvent extends Event {
  constructor(public seconds: number) {
    super();
  }

  pause(): number | undefined {
    return this.seconds;
  }
}

class TextEvent extends Event {
  constructor(
    public text: string,
    public fg: Color = Colors.WHITE,
  ) {
    super();
  }

  draw(term: Terminal, y: number): number {
    term.drawString(0, y, this.text, this.fg);
    return 1;
  }
}

export class Events {
  events: Event[] = [];

  constructor(public hero: Creature) {}

  emit(message: Event) {
    this.events.push(message);
  }
}
