import {speak, waitCycle} from "../main.js";
import {storage} from "../storage.js";
import {consumeAlienExchangeDecision} from "./oracle.js";

/**
 * Picks and announces the Alien's random night action, taking into account any
 * alien_exchange decision from the Oracle (forces or blocks a card swap).
 */
async function alienRandomAction(phase, nightPhaseText, randomActions) {
    const alienExchangeDecision = consumeAlienExchangeDecision();
    let alienActionPool = randomActions;
    if (alienExchangeDecision === false) {
        alienActionPool = alienActionPool.filter(action => action.name !== "left" && action.name !== "right");
    }
    const randomAlienAction = alienExchangeDecision === true
        ? phase.randomActions.find(action => action.name === (Math.random() < 0.5 ? "left" : "right"))
        : alienActionPool.sort(() => Math.random() - 0.5)[0] || {name: "stare", text: ""};

    if (randomAlienAction.name !== "stare" && randomAlienAction.name !== "view") {
        nightPhaseText.textContent = randomAlienAction.text;
        await speak("./voices/alien/random_actions/" + randomAlienAction.name + ".mp3");
    }
    if (randomAlienAction.name === "view") {
        nightPhaseText.textContent = "Seht euch zusammen eine Karte an von ";
        const randomView = randomActions.find(action => action.name === "view").viewOptions.sort(() => Math.random() - 0.5)[0];
        nightPhaseText.textContent += randomView;
        await speak("./voices/alien/random_actions/view_first_part.mp3");
        await speak("./voices/random_cards/" + randomView + ".mp3");
    }
    if (randomAlienAction.name === "timer") {
        storage.votingTime = Math.round(storage.votingTime / 2);
    }
}

/**
 * Runs the joint Groob/Zerb wake-up segment inside the Alien phase, when both roles are active.
 */
async function alienGroobAndZerbAction(phase, nightPhaseImage, nightPhaseText) {
    nightPhaseImage.src = "./images/groob.png";
    nightPhaseText.textContent = phase.groobAndZerb.text;
    await speak("./voices/groob/text.mp3");
    await waitCycle(phase, nightPhaseText);
    nightPhaseText.textContent = phase.groobAndZerb.ending;
    await speak("./voices/groob/ending.mp3");
}

export {alienRandomAction, alienGroobAndZerbAction};
