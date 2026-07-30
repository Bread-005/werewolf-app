import {allPhases, getGermanName, sleep, speak, waitCycle, voicePath, roleVoiceName, speakText} from "../main.js";
import {storage, buildWeightedActionPool} from "../storage.js";
import {oracleQuestionEvaluation, renderOraclePicker} from "./oracle.js";

async function doppelgangerVerboseText(nightPhaseText) {
    const nightRoles = storage.activatedRoles.filter(role => storage.activatedRoles.find(role1 => role1.name === "Doppelganger").verboseRoles.includes(role.name));

    if (!storage.activatedRoles.find(role => role.mark)) {
        if (storage.activatedRoles.find(role => role.name === "Marksman")) {
            nightRoles.push(storage.activatedRoles.find(role => role.name === "Marksman"));
        }
        if (storage.activatedRoles.find(role => role.name === "Gremlin")) {
            nightRoles.push(storage.activatedRoles.find(role => role.name === "Gremlin"));
        }
    }
    if (nightRoles.length === 0) return;

    await sleep(2);
    nightPhaseText.textContent = "Wenn du die ";
    await speak("./voices/doppelganger/verbose/first_part.mp3");

    for (let i = 0; i < nightRoles.length; i++) {
        if (i === nightRoles.length - 1 && nightRoles.length > 1) {
            nightPhaseText.textContent += " oder ";
            await speak("./voices/doppelganger/verbose/or.mp3");
        }
        nightPhaseText.textContent += nightRoles[i].germanName;
        if (i < nightRoles.length - 2) nightPhaseText.textContent += ", ";
        await speak(voicePath(roleVoiceName(nightRoles[i].name), roleVoiceName(nightRoles[i].name) + ".mp3"));
    }
    nightPhaseText.textContent += " Karte angesehen hast führe die Aktion jetzt durch.";
    await speak("./voices/doppelganger/verbose/last_part.mp3");
}

async function doppelgangerExtraWake(phase, nightPhaseImage, nightPhaseText) {
    if (!phase.doppelganger) return;
    if (!storage.activatedRoles.find(role => role.name === "Doppelganger")) return;
    if (!storage.activatedRoles.find(role => role.mark)) {
        if (phase.name === "marksman" || phase.name === "gremlin") {
            return;
        }
    }

    nightPhaseImage.src = "./images/doppelganger.png";
    nightPhaseText.textContent = "Doppelgängerin, wenn du die " + getGermanName(phase.name) + " Karte angesehen hast, wach auf.";
    await speak("./voices/doppelganger/later_action/first_part.mp3");
    await speak(voicePath(phase.name, phase.name + ".mp3"));
    await speak("./voices/doppelganger/later_action/last_part.mp3");
    if (phase.name !== "renfield" && phase.name !== "leader" && phase.name !== "minion" && phase.name !== "apprentice_tanner" && phase.name !== "aura_seer" &&
        phase.name !== "curator" && phase.name !== "beholder" && phase.name !== "rascal") {
        nightPhaseText.textContent = phase.text;
        await speakText(phase.name);
    }
    if (phase.name === "renfield") {
        nightPhaseText.textContent = phase.doppelganger.text;
        await speak(voicePath(phase.name, "doppelganger_text.mp3"));
    }
    if (phase.name === "curator") {
        nightPhaseText.textContent = phase.doppelganger.text;
        await speak(voicePath(phase.name, "doppelganger_text.mp3"));
    }
    if (phase.name === "beholder") {
        nightPhaseText.textContent = "Du darfst die Karten von den Spielern angucken, die ihre Daumen heben.";
        await speak("./voices/beholder/look_at_multiple.mp3");
    }
    if (phase.randomActions) {
        const randomActions = buildWeightedActionPool(phase);
        if (phase.name === "rascal") {
            const randomRole = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
            nightPhaseText.textContent = allPhases.find(role => role.name === randomRole.name).text;
            await speakText(randomRole.name);
        } else if (phase.name === "oracle") {
            await renderOraclePicker(phase);
        } else if (phase.name === "empath") {
            const randomAction = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
            nightPhaseText.textContent = randomAction.text;
            await speak("./voices/empath/" + randomAction.name + ".mp3");
        } else {
            const randomAction = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
            nightPhaseText.textContent = nightPhaseText.textContent += randomAction.text;
            await speak("./voices/random_cards/" + randomAction.text + ".mp3");
        }
    }
    await waitCycle(phase, nightPhaseText);
    if (phase.name === "oracle") {
        await oracleQuestionEvaluation(nightPhaseText);
    }
    nightPhaseText.textContent = "Doppelgängerin schließ deine Augen.";
    await speak("./voices/doppelganger/doppelganger.mp3");
    await speak("./voices/close_your_eyes.mp3");
}

export {doppelgangerVerboseText, doppelgangerExtraWake};