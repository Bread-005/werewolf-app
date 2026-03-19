import {speak, storage, waitCycle} from "./main.js";

async function cowAction(phase, nightPhaseImage, nightPhaseText) {
    nightPhaseImage.src = "./images/cow.png";
    nightPhaseText.textContent = phase.cow.text;
    await speak("./voices/" + phase.name + "/cow/text.mp3");
    await waitCycle(phase, nightPhaseText);
    nightPhaseText.textContent = phase.cow.ending;
    await speak("./voices/cow/ending.mp3");

    if (storage.activatedRoles.find(role => role.name === "Doppelganger")) {
        nightPhaseImage.src = "./images/doppelganger.png";
        nightPhaseText.textContent = phase.cow.doppelganger.text;
        await speak("./voices/" + phase.name + "/cow/doppelganger_text.mp3");
        await waitCycle(phase, nightPhaseText);
        nightPhaseText.textContent = phase.cow.doppelganger.ending;
        await speak("./voices/cow/doppelganger_ending.mp3");
    }
}

export {cowAction};