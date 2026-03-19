import {sleep, speak, storage} from "./main.js";

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

export {doppelgangerVerboseText};