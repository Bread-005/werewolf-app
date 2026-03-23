import {getGermanName, sleep, speak, storage, waitCycle} from "./main.js";

async function doppelgangerVerboseText(nightPhaseText) {
    await sleep(2);
    nightPhaseText.textContent = "Wenn du die ";
    await speak("./voices/doppelganger/verbose/first_part.mp3");
    const nightRoles = storage.activatedRoles.filter(role => storage.activatedRoles.find(role1 => role1.name === "Doppelganger").verboseRoles.includes(role.name));
    for (let i = 0; i < nightRoles.length; i++) {
        if (i === nightRoles.length - 1 && nightRoles.length > 1) {
            nightPhaseText.textContent += " oder ";
            await speak("./voices/doppelganger/verbose/or.mp3");
        }
        nightPhaseText.textContent += nightRoles[i].germanName;
        if (i < nightRoles.length - 2) nightPhaseText.textContent += ", ";
        await speak("./voices/" + nightRoles[i].name.toLowerCase().replaceAll(" ","_") + "/" + nightRoles[i].name.toLowerCase().replaceAll(" ","_") + ".mp3");
    }
    nightPhaseText.textContent += " Karte angesehen hast führe die Aktion jetzt durch";
    await speak("./voices/doppelganger/verbose/last_part.mp3");
}

async function doppelgangerExtraWake(phase, nightPhaseImage, nightPhaseText) {
    if (!phase.doppelganger) return;
    if (!storage.activatedRoles.find(role => role.name === "Doppelganger")) return;

    nightPhaseImage.src = "./images/doppelganger.png";
    nightPhaseText.textContent = "Doppelgängerin, wenn du die " + getGermanName(phase.name) + " Karte angesehen hast, wach auf.";
    await speak("./voices/doppelganger/later_action/first_part.mp3");
    await speak("./voices/" + phase.name + "/" + phase.name + ".mp3");
    await speak("./voices/doppelganger/later_action/last_part.mp3");
    if (phase.name !== "leader" && phase.name !== "minion" && phase.name !== "apprentice_tanner" && phase.name !== "auraseer" &&
        phase.name !== "curator") {
        nightPhaseText.textContent = phase.text;
        await speak("./voices/" + phase.name + "/text.mp3");
    }
    if (phase.name === "curator") {
        nightPhaseText.textContent = phase.doppelganger.text;
        await speak("./voices/" + phase.name + "/doppelganger_text.mp3");
    }
    if (phase.randomActions) {
        const randomActions = [];
        for (const action of phase.randomActions) {
            for (let i = 0; i < storage[phase.name + "RandomActionChances"][action.name]; i++) {
                randomActions.push(action);
            }
        }
        const randomAction = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
        nightPhaseText.textContent = nightPhaseText.textContent += randomAction.text;
        await speak("./voices/random_cards/" + randomAction.text + ".mp3");
    }
    await waitCycle(phase, nightPhaseText);
    nightPhaseText.textContent += "Doppelgängerin schließ deine Augen.";
    await speak("./voices/doppelganger/doppelganger.mp3");
    await speak("./voices/close_your_eyes.mp3");
}

export {doppelgangerVerboseText, doppelgangerExtraWake};