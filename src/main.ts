import { Terminal } from "wglt";
import {
  armors,
  humanoidParts,
  makeArmor,
  makeWeapon,
  stumbles,
  weapons,
} from "./boromir";
import { Creature } from "./entities";
import { Events, Event } from "./events";
import { Gender, MeleeAttack, Narrator, View } from "./grammar";

window.addEventListener("DOMContentLoaded", () => {
  const height = 45;

  const crt = {
    scale: 6,
    blur: 0.5,
    curvature: 0.1,
    chroma: 0.5,
    vignette: 0.15,
    scanlineWidth: 0.75,
    scanlineIntensity: 0.25,
  };

  const term = new Terminal(
    document.querySelector("canvas") as HTMLCanvasElement,
    80,
    height,
    { crt },
  );

  const boromir = new Creature(
    "Boromir",
    Gender.male,
    true,
    15,
    17,
    17,
    13,
    104,
    humanoidParts,
    stumbles,
  );

  boromir.equipWeapon(makeWeapon(weapons.longsword));
  boromir.equipArmor(makeArmor(armors.chainShirt));

  function makeOrc() {
    const orc = new Creature(
      "orc",
      Gender.male,
      false,
      4,
      15,
      13,
      12,
      30,
      humanoidParts,
      stumbles,
    );
    orc.equipWeapon(makeWeapon());
    orc.equipArmor(makeArmor(armors.cloth));
    return orc;
  }

  const events = new Events(boromir);
  const view = new View();
  const narrator = new Narrator(view, events);
  const attack = new MeleeAttack(narrator);

  function combat(p1: Creature, p2: Creature) {
    const m = [
      [p1, p2],
      [p2, p1],
    ];
    if (p2.dex >= p1.dex) {
      m.reverse();
    }
    events.emit(Event.begin(p1, p2));
    events.emit(Event.pause(2));
    while (1) {
      events.emit(Event.status(p1, p2));
      for (let i = 0; i < m.length; i++) {
        const attacker = m[i][0];
        const defender = m[i][1];
        if (attacker.hp) {
          attack.executeTurn(attacker, defender);
        }
        if (defender.hp === 0) {
          events.emit(Event.death(defender));
          return;
        }
        events.emit(Event.pause(3));
      }
    }
  }

  let count = 0;
  let orc = makeOrc();
  for (; boromir.hp > 0; count++) {
    events.emit(Event.intro(orc));
    combat(orc, boromir);
    events.emit(Event.pause(3));
    if (boromir.hp > 0) {
      orc = makeOrc();
    }
  }

  events.emit(Event.conclusion(count, orc, boromir));

  let secondsPassed = 0;
  setInterval(() => {
    secondsPassed++;
  }, 100);

  let event = 0;
  let drawableEvents: number[] = [];
  let waitUntil = 0;

  term.update = () => {
    if (secondsPassed >= waitUntil) {
      const pause = events.events[event].pause();
      if (pause) {
        waitUntil = secondsPassed + pause;
      } else {
        drawableEvents.push(event);
      }
      event++;
    }

    term.clear();
    let y = 0;
    for (let i of drawableEvents.slice(-height)) {
      y += events.events[i].draw(term, y);
    }
  };
});
