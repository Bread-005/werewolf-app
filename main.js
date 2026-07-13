import {doppelgangerExtraWake, doppelgangerVerboseText} from "./doppelganger.js";
import {cowAction} from "./cow.js";
import {leaderAction} from "./leader.js";
import {storage, saveLocalStorage, buildWeightedActionPool} from "./storage.js";
let allRoles = [];
let paused = false;
let currentAudio = null;

document.addEventListener("DOMContentLoaded", async () => {

    if (!storage) {
        const storage1 = {
            activatedRoles: [],
            enabledEditions: ["Werewolves"],
            actionTime: 5,
            votingTime: 300,
            currentSettingRole: "",
            alienRandomActionChances: {view: 10, stare: 10, timer: 10, left: 10, right: 10, show: 10, new_alien: 0},
            psychicRandomActionChances: {neighbor: 10, even_player: 10, odd_player: 10, not_neighbor: 10, any_player: 10, middle: 10},
            morticianRandomActionChances: {self: 10, left_neighbor: 10, right_neighbor: 10, neighbor: 10},
            leaderKnowsEverything: false,
            moveCard: true
        }
        localStorage.setItem("werewolf-app", JSON.stringify(storage1));
        window.location.reload();
    }

    if (!storage.enabledEditions) {
        storage.enabledEditions = ["Werewolves"];
        saveLocalStorage();
    }

    if (!storage.alienRandomActionChances) {
        storage.alienRandomActionChances = {view: 10, stare: 10, timer: 10, left: 10, right: 10, show: 10, new_alien: 0};
        saveLocalStorage();
    }

    if (!storage.psychicRandomActionChances) {
        storage.psychicRandomActionChances = {neighbor: 10, even_player: 10, odd_player: 10, not_neighbor: 10, any_player: 10, middle: 10};
        saveLocalStorage();
    }

    if (!storage.morticianRandomActionChances) {
        storage.morticianRandomActionChances = {self: 10, left_neighbor: 10, right_neighbor: 10, neighbor: 10};
        saveLocalStorage();
    }

    if (!storage.activatedRoles) {
        storage.activatedRoles = [];
        saveLocalStorage();
    }

    const editions = document.querySelector(".editions");
    for (const edition of editions.children) {
        showEdition(edition);
        edition.addEventListener("click", () => {
            if (storage.enabledEditions.includes(edition.className)) {
                storage.enabledEditions = storage.enabledEditions.filter(edition1 => edition1 !== edition.className);
            } else {
                storage.enabledEditions.push(edition.className);
            }
            storage.activatedRoles = storage.activatedRoles.filter(role => role.edition !== edition.className);
            saveLocalStorage();
            showEdition(edition);
            showRolesSelection();
        });
    }

    const roleGrid = document.querySelector(".roles-grid");
    allRoles = await fetch("./roles.json").then(res => res.json());
    showRolesSelection();

    window.scrollTo(0, 0);

    const nightPhaseImage = document.querySelector(".image");
    const nightPhaseText = document.getElementById("night-phase-text");

    document.querySelector(".start-button").addEventListener("click", async () => {
        const allPhases = await fetch("./phases.json").then(res => res.json());
        let phases = [];
        for (const phase of allPhases) {
            if (storage.activatedRoles.find(role => role.name.toLowerCase().replaceAll(" ", "") === phase.name.replaceAll("_","")) ||
                phase.name === "all_sleep" || phase.name === "move_card" && storage.moveCard || phase.name === "all_wake_up" ||
                phase.name === "werewolf" && storage.activatedRoles.find(role => role.name.toLowerCase().includes("wolf") && role.name !== "Dreamwolf") ||
                phase.name === "alien" && storage.activatedRoles.find(role => role.name === "Synthetic Alien" || role.name === "Groob" || role.name === "Zerb") ||
                phase.name === "vampire" && storage.activatedRoles.find(role => role.name === "Vampire" || role.name === "Master" || role.name === "Count") ||
                phase.name === "all_view_mark" && storage.activatedRoles.find(role => role.mark)) {
                phases.push(phase);
            }
        }
        if (!storage.activatedRoles.find(role => role.name.toLowerCase().includes("wolf"))) phases = phases.filter(phase => phase.name !== "minion");
        if (!storage.activatedRoles.find(role => role.name === "Tanner")) phases = phases.filter(phase => phase.name !== "apprentice_tanner");
        if (!storage.activatedRoles.find(role => role.name === "Groob") && !storage.activatedRoles.find(role => role.name === "Zerb")) phases = phases.filter(phase => phase.name !== "Groob");
        if (!storage.activatedRoles.find(role => role.mark)) {
            phases = phases.filter(phase => phase.name !== "pickpocket" && phase.name !== "priest");
        }
        if (storage.activatedRoles.filter(role => role.mark && role.name !== "Assassin" && role.name !== "Apprentice Assassin").length === 0) {
            phases = phases.filter(phase => phase.name !== "priest");
        }

        storage.activatedRoles.sort((a, b) => allRoles.indexOf(a) - allRoles.indexOf(b));
        saveLocalStorage();

        document.querySelector(".editions").style.display = "none";
        roleGrid.style.display = "none";
        document.querySelector(".start-button").style.display = "none";
        document.querySelector(".settings-button").style.display = "none";
        document.querySelector(".night-phase").style.display = "flex";

        for (const phase of phases) {
            if (phase.name === "all_sleep" || phase.name === "move_card" || phase.name === "all_wake_up") {
                nightPhaseImage.src = "./images/villager.png";
                nightPhaseText.textContent = phase.text;
                await speak("./voices/" + phase.name + ".mp3");
                await sleep(2);
                continue;
            }
            if (phase.name === "all_view_mark") {
                nightPhaseImage.src = "./images/marks/mark_of_clarity.png";
                nightPhaseText.textContent = phase.text;
                await speak("./voices/all_view_mark/text.mp3");
                await waitCycle(phase, nightPhaseText);
                nightPhaseText.textContent = phase.ending;
                await speak("./voices/all_view_mark/ending.mp3");
                continue;
            }

            if (storage.activatedRoles.find(role => role.name === "Assassin") && phase.name === "apprentice_assassin" && storage.activatedRoles.find(role => role.name === "Doppelganger")) {
                nightPhaseImage.src = "./images/assassin.png";
                nightPhaseText.textContent = "Meuchler wach auf.";
                await speak("./voices/assassin/assassin.mp3");
                await speakSingularOrPlural(false, "./voices/wake_up.mp3", "./voices/wake_up_multiple.mp3");
            }

            nightPhaseImage.src = "./images/" + phase.name + ".png";
            if (phase.name === "blob") {
                const playerCount = storage.activatedRoles.length - 3;
                if (playerCount <= 3) continue;
                const neighborCount = Math.ceil(playerCount / 2) - 1;
                nightPhaseText.textContent = buildBlobInstruction(playerCount, neighborCount);
                await sleep(1);
                await speak("./voices/blob/first_part.mp3");

                if (nightPhaseText.textContent.includes("linken") && nightPhaseText.textContent.includes("rechten")) {
                    await speak("./voices/blob/" + neighborCount + ".mp3");
                    await speak("./voices/blob/second_part_both.mp3");
                    await speak("./voices/blob/" + neighborCount + ".mp3");
                    await speak("./voices/blob/third_part_both.mp3");
                } else {
                    await speak("./voices/blob/" + neighborCount + ".mp3");
                    if (nightPhaseText.textContent.includes("linken")) {
                        await speak("./voices/blob/second_part_left.mp3");
                    }
                    if (nightPhaseText.textContent.includes("rechten")) {
                        await speak("./voices/blob/second_part_right.mp3");
                    }
                }
                await sleep(1);
                continue;
            }

            nightPhaseText.textContent = getGermanName(phase.name) + " wach auf.";
            if (phase.isMultiple) nightPhaseText.textContent = nightPhaseText.textContent.replace("wach", "wacht");
            if (phase.name === "werewolf" && storage.activatedRoles.find(role => role.name === "Dreamwolf")) {
                nightPhaseText.textContent = "Alle Werwölfe außer dem Traumwolf, wacht auf. Traumwolf heb deinen Daumen.";
                await speak("./voices/werewolf/dreamwolf_text.mp3");
            } else {
                await speak("./voices/" + phase.name + "/" + phase.name + ".mp3");
                await speakSingularOrPlural(phase.isMultiple, "./voices/wake_up.mp3", "./voices/wake_up_multiple.mp3");
                if (phase.name !== "leader") {
                    if (!phase.textWithMarks || !storage.activatedRoles.find(role => role.mark)) {
                        nightPhaseText.textContent = phase.text;
                        await speak("./voices/" + phase.name + "/" + "text.mp3");
                    } else {
                        nightPhaseText.textContent = phase.textWithMarks;
                        await speak("./voices/" + phase.name + "/" + "textWithMarks.mp3");
                    }
                }
            }
            if (phase.name === "doppelganger") {
                await doppelgangerVerboseText(nightPhaseText);
            }
            if (phase.name === "leader") {
                await leaderAction(nightPhaseText);
            }
            if (phase.secondText) {
                await sleep(1.5);
                nightPhaseText.textContent = phase.secondText;
                await speak("./voices/" + phase.name + "/second_text.mp3");
            }
            if (phase.randomActions) {
                const randomActions = buildWeightedActionPool(phase);
                if (phase.name === "alien") {
                    const randomAlienAction = randomActions.sort(() => Math.random() - 0.5)[0] || {
                        name: "stare",
                        text: ""
                    };
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
                } else {
                    const randomAction = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
                    nightPhaseText.textContent = nightPhaseText.textContent += randomAction.text;
                    await speak("./voices/random_cards/" + randomAction.text + ".mp3");
                }
            }
            await waitCycle(phase, nightPhaseText);
            if ((phase.name === "alien" || phase.name === "werewolf" || phase.name === "vampire") && storage.activatedRoles.find(role => role.name === "Cow")) {
                await cowAction(phase, nightPhaseImage, nightPhaseText);
            }
            if (phase.name === "werewolf" && storage.activatedRoles.find(role => role.name === "Dreamwolf")) {
                nightPhaseText.textContent = "Traumwolf senk deinen Daumen.";
                await speak("./voices/werewolf/dreamwolf_ending.mp3");
            }
            if (phase.name !== "assassin" || storage.activatedRoles.find(role => role.name === "Doppelganger")) {
                nightPhaseImage.src = "./images/" + phase.name + ".png";
                nightPhaseText.textContent = getGermanName(phase.name) + (phase.isMultiple ? " schließt eure" : " schließ deine") + " Augen.";
                await speak("./voices/" + phase.name + "/" + phase.name + ".mp3");
                await speakSingularOrPlural(phase.isMultiple, "./voices/close_your_eyes.mp3", "./voices/close_your_eyes_multiple.mp3");
            }
            if (phase.name === "alien" && (storage.activatedRoles.find(role => role.name === "Groob") && storage.activatedRoles.find(role => role.name === "Zerb"))) {
                nightPhaseImage.src = "./images/groob.png";
                nightPhaseText.textContent = phase.groobAndZerb.text;
                await speak("./voices/groob/text.mp3");
                await waitCycle(phase, nightPhaseText);
                nightPhaseText.textContent = phase.groobAndZerb.ending;
                await speak("./voices/groob/ending.mp3");
            }
            await doppelgangerExtraWake(phase, nightPhaseImage, nightPhaseText);
            if (phase.name === "renfield") {
                nightPhaseText.textContent = "Vampire senkt eure Arme wieder.";
                await speak("./voices/" + phase.name + "/ending.mp3");
            }
            if (phase.name === "minion") {
                nightPhaseText.textContent = "Werwölfe senkt eure Daumen wieder.";
                await speak("./voices/" + phase.name + "/ending.mp3");
            }
            if (phase.name === "leader" && !storage.leaderKnowsEverything) {
                nightPhaseText.textContent = "Senkt alle eure Daumen und Hände wieder.";
                await speak("./voices/" + phase.name + "/ending.mp3");
            }
            if (phase.name === "apprentice_tanner") {
                nightPhaseText.textContent = "Gerber senk deinen Daumen wieder.";
                await speak("./voices/" + phase.name + "/ending.mp3");
            }
            if (phase.name === "aura_seer") {
                nightPhaseText.textContent = "Senkt alle eure Daumen wieder.";
                await speak("./voices/" + phase.name + "/ending.mp3");
            }
            if (storage.activatedRoles.find(role => role.name === "Assassin") && phase.name === "apprentice_assassin") {
                nightPhaseImage.src = "./images/assassin.png";
                nightPhaseText.textContent = "Meuchler schließ deine Augen.";
                await speak("./voices/assassin/assassin.mp3");
                await speakSingularOrPlural(false, "./voices/close_your_eyes.mp3", "./voices/close_your_eyes_multiple.mp3");
            }
        }

        document.querySelector(".night-content").removeChild(nightPhaseImage);
        document.querySelector(".night-content").removeChild(nightPhaseText);
        const voteTimer = document.createElement("h2");
        document.querySelector(".app").append(voteTimer);
        voteTimer.setAttribute("class", "vote-timer");
        voteTimer.textContent = "05:00";
        const maxSeconds = storage.votingTime;

        for (let i = maxSeconds; i >= 0; i--) {
            voteTimer.textContent = Math.floor(i / 60) + ":" + (i % 60 < 10 ? "0" : "") + (i % 60);
            await sleep(1);
            if (i === 0) {
                const voting = ["ready_for_vote:Macht euch bereit für die Abstimmung.", "three:3", "two:2", "one:1", "vote:abstimmen"];

                for (const vote of voting) {
                    voteTimer.textContent = vote.split(":")[1];
                    await speak("./voices/voting/" + vote.split(":")[0] + ".mp3");
                    await sleep(0.5);
                }
                window.location.reload();
            }
        }
    });

    document.querySelector(".settings-button").addEventListener("click", () => {
        window.location = "settings.html";
    });

    document.getElementById("pause-button").addEventListener("click", () => {
        paused = !paused;
        const pauseButton = document.getElementById("pause-button");
        if (paused) {
            currentAudio?.pause();
            pauseButton.textContent = "Weiter";
        } else {
            currentAudio?.play();
            pauseButton.textContent = "Pause";
        }
    });

    document.getElementById("stop-button").addEventListener("click", () => {
        window.location.reload();
    });

    function showEdition(edition) {
        if (storage.enabledEditions.includes(edition.className)) {
            edition.style.border = "blue solid 2px";
            edition.style.background = "cornflowerblue";
        } else {
            edition.style.border = "white solid 2px";
            edition.style.background = null;
        }
    }

    function showRolesSelection() {
        let enabledRoles = allRoles.filter(role => storage.enabledEditions.includes(role.edition));

        roleGrid.innerHTML = "";

        for (const role of enabledRoles) {
            const div = document.createElement("div");
            div.classList.add("role-card");
            if (storage.activatedRoles.find(role1 => role1.name === role.name)) {
                div.style.border = "4px solid white";
            }

            const img = document.createElement("img");
            img.src = "./images/" + role.name.toLowerCase().replaceAll(" ","_") + ".png";
            img.alt = role.name;

            div.append(img);
            roleGrid.append(div);

            div.addEventListener("click", () => {
                // const clickSound = new Audio("./voices/click_sound.wav");
                // clickSound.play();
                if (!div.style.border || div.style.border === "none") {
                    div.style.border = "4px solid white";
                    storage.activatedRoles.push(role);
                } else {
                    div.style.border = "none";
                    storage.activatedRoles = storage.activatedRoles.filter(role1 => role1.id + role1.name !== role.id + role.name);
                }
                saveLocalStorage();
            });
        }
    }
});

async function speak(filePath) {
    return new Promise(resolve => {
        const audio = new Audio(filePath);
        currentAudio = audio;
        audio.onended = () => {
            currentAudio = null;
            resolve();
        };
        audio.play();
    });
}

async function speakSingularOrPlural(isMultiple, singularPath, pluralPath) {
    await speak(isMultiple ? pluralPath : singularPath);
}

async function sleep(seconds) {
    let remaining = seconds * 1000;
    while (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (!paused) {
            remaining -= 100;
        }
    }
}


async function waitCycle(phase, nightPhaseText) {
    let pauseTime = storage.actionTime;
    if (phase.name === "doppelganger" || phase.name === "villageidiot" || phase.name === "cupid" ||
        phase.name === "priest") {
        pauseTime *= 2;
    }
    if (phase.name === "leader" && storage.leaderKnowsEverything) pauseTime *= 3;
    if (pauseTime === 0) {
        return;
    }
    for (let i = pauseTime; i >= 0; i--) {
        nightPhaseText.textContent = "(Pause: " + pauseTime + " Sekunden)";
        const div = document.createElement("div");
        div.textContent = "00:" + (i < 10 ? "0" : "") + i.toString();
        nightPhaseText.append(div);
        await sleep(1);
        nightPhaseText.removeChild(div);
    }
    nightPhaseText.textContent = "";
}

function getGermanName(englishName) {
    for (const role of allRoles) {
        if (englishName.replaceAll("_", "").toLowerCase() === role.name.toLowerCase().replaceAll(" ","")) {
            if (role.germanName === "Werwolf") return "Werwölfe";
            if (role.germanName === "Alien") return "Aliens";
            if (role.germanName === "Vampir") return "Vampire";
            return role.germanName;
        }
    }
    return "";
}

function buildBlobInstruction(playerCount, neighborCount) {
    const options = [];
    if (playerCount > 3) {
        options.push(`Klecks, halte dich selbst und ${neighborCount} Spieler zu deiner linken Seite am Leben.`);
        options.push(`Klecks, halte dich selbst und ${neighborCount} Spieler zu deiner rechten Seite am Leben.`);
        if (playerCount % 2 !== 0 && neighborCount % 2 === 0) {
            const halfCount = neighborCount / 2;
            options.push(`Klecks, halte dich selbst und ${halfCount} Spieler zu deiner linken und ${halfCount} Spieler zu deiner rechten Seite am Leben.`);
        }
    }
    return options[Math.floor(Math.random() * options.length)];
}

export {speak, sleep, waitCycle, getGermanName, paused};