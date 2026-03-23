import {speak, storage} from "./main.js";

async function leaderAction(nightPhaseText) {

    if (storage.activatedRoles.find(role => role.name.toLowerCase().includes("wolf"))) {
        nightPhaseText.textContent = "Werwölfe hebt eure Daumen.";
        await speak("./voices/minion/text.mp3");

        if (storage.activatedRoles.find(role => role.name === "Alphawolf")) {
            nightPhaseText.textContent = "Alphawolf, zeige zusätzlich noch auf den Spieler, mit dem du die Werwolfkarte aus der Mitte vertauscht hast.";
            await speak("./voices/leader/alphawolf_text.mp3");
        }
    }

    if (storage.activatedRoles.find(role => role.name === "Alien" || role.name === "Synthetic Alien" || role.name === "Groob" || role.name === "Zerb")) {
        nightPhaseText.textContent = "Aliens hebt eure Daumen. Neigt dabei eure Daumen zur Seite.";
        await speak("./voices/leader/alien_text.mp3");

        if (storage.activatedRoles.find(role => role.name === "Synthetic Alien")) {
            nightPhaseText.textContent = "Synthetisches Alien neige deinen Daumen nach unten.";
            await speak("./voices/leader/synthetic_alien_text.mp3");
        }
        if (storage.activatedRoles.find(role => role.name === "Groob") && storage.activatedRoles.find(role => role.name === "Zerb")) {
            nightPhaseText.textContent = "Groob und Zerb, wenn ihr euch angesehen habt, zeigt auf einander.";
            await speak("./voices/leader/groob_and_zerb_text.mp3");
        }
    }
}

export {leaderAction};