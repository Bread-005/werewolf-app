import {getGermanName, sleep, speak, voicePath, roleVoiceName} from "../main.js";
import {storage} from "../storage.js";

let selectedRole = null;

function renderNostradamusPicker(nostradamusPicker) {
    if (!storage.activatedRoles.find(role => role.name === "Nostradamus")) {
        return;
    }

    selectedRole = null;

    const viewableRoles = [];
    for (const role of storage.activatedRoles) {
        if (role.name === "Nostradamus") continue;
        if (viewableRoles.find(viewableRole => viewableRole.name === role.name)) continue;
        viewableRoles.push(role);
    }

    nostradamusPicker.innerHTML = "";
    for (const role of viewableRoles) {
        const card = document.createElement("div");
        card.classList.add("nostradamus-picker-card");

        const image = document.createElement("img");
        image.src = "./images/" + role.name.toLowerCase().replaceAll(" ", "_") + ".png";
        image.alt = role.name;
        card.append(image);
        nostradamusPicker.append(card);

        card.addEventListener("click", () => {
            for (const pickerCard of nostradamusPicker.children) {
                pickerCard.classList.remove("selected");
            }
            card.classList.add("selected");
            selectedRole = role;
        });
    }
}

async function nostradamusAction(nightPhaseText, nostradamusPicker) {
    const nostradamus = storage.activatedRoles.find(role => role.name === "Nostradamus");

    if (!nostradamus) {
        const teamNames = storage.activatedRoles.map(role => role.team).filter(team => team);
        const randomTeam = teamNames.length > 0 ? teamNames[Math.floor(Math.random() * teamNames.length)] : "Villager";
        await announceTeam(randomTeam, nightPhaseText);
        return;
    }

    await announceTeam(selectedRole?.team ?? "Villager", nightPhaseText);
    nostradamusPicker.innerHTML = "";
    selectedRole = null;
}

async function announceTeam(team, nightPhaseText) {
    const teamGermanName = team === "Villager" ? "Dorfbewohner" : getGermanName(team.replaceAll(" ", "_"));
    nightPhaseText.textContent = "Nostradamus ist nun im " + teamGermanName + " Team.";
    await speak("./voices/nostradamus/nostradamus.mp3");
    await speak("./voices/nostradamus/first_part.mp3");
    await speak(voicePath(roleVoiceName(team), roleVoiceName(team) + ".mp3"));
    await speak("./voices/nostradamus/team.mp3");
    await sleep(0.5);
}

export {nostradamusAction, renderNostradamusPicker};
