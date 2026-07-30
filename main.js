import {doppelgangerExtraWake, doppelgangerVerboseText} from "./role_specific_files/doppelganger.js";
import {cowAction} from "./role_specific_files/cow.js";
import {leaderAction} from "./role_specific_files/leader.js";
import {storage, saveLocalStorage, buildWeightedActionPool, defaultStorage, applyStorageDefaults} from "./storage.js";
import {nostradamusAction, renderNostradamusPicker} from "./role_specific_files/nostradamus.js";
import {oracleQuestionEvaluation, renderOraclePicker} from "./role_specific_files/oracle.js";
import {alienRandomAction, alienGroobAndZerbAction} from "./role_specific_files/alien.js";
let allRoles = [];
let paused = false;
let currentAudio = null;
let allPhases = [];

document.addEventListener("DOMContentLoaded", async () => {

    if (!storage) {
        localStorage.setItem("werewolf-app", JSON.stringify(defaultStorage));
        window.location.reload();
    } else {
        applyStorageDefaults();
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
    allPhases = await fetch("./phases.json").then(res => res.json());
    showRolesSelection();

    window.scrollTo(0, 0);

    const nightPhaseImage = document.querySelector(".image");
    const nightPhaseText = document.getElementById("night-phase-text");
    const nostradamusPicker = document.querySelector(".nostradamus-picker");

    document.querySelector(".start-button").addEventListener("click", async () => {
        let phases = [];
        for (const phase of allPhases) {
            if (storage.activatedRoles.find(role => role.name.toLowerCase().replaceAll(" ", "") === phase.name.replaceAll("_","")) ||
                phase.name === "all_sleep" || phase.name === "move_card" && storage.moveCard || phase.name === "all_wake_up" ||
                phase.name === "werewolf" && storage.activatedRoles.find(role => role.name.toLowerCase().includes("wolf") && role.name !== "Dreamwolf") ||
                phase.name === "alien" && storage.activatedRoles.find(role => role.name === "Synthetic Alien" || role.name === "Groob" || role.name === "Zerb" || role.name === "Body Snatcher") ||
                phase.name === "vampire" && storage.activatedRoles.find(role => role.name === "Vampire" || role.name === "Master" || role.name === "Count") ||
                phase.name === "all_view_mark" && storage.activatedRoles.find(role => role.mark)) {
                phases.push(phase);
            }
        }
        if (!storage.activatedRoles.find(role => role.name.toLowerCase().includes("wolf"))) {
            phases = phases.filter(phase => phase.name !== "minion" && phase.name !== "squire");
        }
        if (!storage.activatedRoles.find(role => role.name === "Tanner")) phases = phases.filter(phase => phase.name !== "apprentice_tanner");
        if (!storage.activatedRoles.find(role => role.name === "Groob") && !storage.activatedRoles.find(role => role.name === "Zerb")) phases = phases.filter(phase => phase.name !== "Groob");
        if (!storage.activatedRoles.find(role => role.mark)) {
            phases = phases.filter(phase => phase.name !== "pickpocket" && phase.name !== "priest");
        }
        if (storage.activatedRoles.filter(role => role.mark && role.name !== "Assassin" && role.name !== "Apprentice Assassin").length === 0) {
            phases = phases.filter(phase => phase.name !== "priest");
        }
        if (!storage.activatedRoles.find(role => role.name === "Seer" || role.name === "Apprentice Seer")) {
            phases = phases.filter(phase => phase.name !== "beholder");
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
                await speak(voicePath(phase.name, phase.name + ".mp3"));
                await speakSingularOrPlural(phase.isMultiple, "./voices/wake_up.mp3", "./voices/wake_up_multiple.mp3");
                if (phase.name !== "leader" && phase.name !== "beholder" && phase.name !== "rascal") {
                    if (!phase.textWithMarks || !storage.activatedRoles.find(role => role.mark)) {
                        nightPhaseText.textContent = phase.text;
                        if (phase.name === "squire") {
                            await speak("./voices/minion/text.mp3");
                            await speak("./voices/squire/squire.mp3");
                        }
                        await speakText(phase.name);
                    } else {
                        nightPhaseText.textContent = phase.textWithMarks;
                        await speak(voicePath(phase.name, "textWithMarks.mp3"));
                    }
                }
            }
            if (phase.name === "nostradamus") {
                renderNostradamusPicker(nostradamusPicker);
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
                await speak(voicePath(phase.name, "second_text.mp3"));
            }
            if (phase.randomActions) {
                const randomActions = buildWeightedActionPool(phase);
                if (phase.name === "alien") {
                    await alienRandomAction(phase, nightPhaseText, randomActions);
                } else if (phase.name === "oracle") {
                    await renderOraclePicker(phase);
                } else if (phase.name === "empath") {
                    await sleep(0.5);
                    const randomAction = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
                    nightPhaseText.textContent = nightPhaseText.textContent = randomAction.text;
                    await speak("./voices/empath/" + randomAction.name + ".mp3");
                } else {
                    if (phase.name !== "rascal") {
                        const randomAction = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
                        nightPhaseText.textContent = nightPhaseText.textContent += randomAction.text;
                        await speak("./voices/random_cards/" + randomAction.text + ".mp3");
                    }
                    if (phase.name === "rascal") {
                        const randomRole = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
                        nightPhaseText.textContent = allPhases.find(role => role.name === randomRole.name).text;
                        await speakText(randomRole.name);
                    }
                }
            }
            if (phase.name === "beholder") {
                const seerArray = ["Seer", "Apprentice Seer"].filter(seer => storage.activatedRoles.find(role => role.name === seer));
                if (seerArray.length === 1) {
                    nightPhaseText.textContent = " " + storage.activatedRoles.find(role => role.name === seerArray[0])?.germanName + " heb deinen Daumen.";
                    nightPhaseText.textContent += " Betrachterin du darfst die Karte von dem Spieler angucken, der den Daumen hebt.";
                    await speak(voicePath(roleVoiceName(seerArray[0]), roleVoiceName(seerArray[0]) + ".mp3"));
                    await speak("./voices/beholder/thumb_up.mp3");
                    await speak("./voices/beholder/beholder.mp3");
                    await speak("./voices/beholder/look_at_one.mp3");
                }
                if (seerArray.length > 1) {
                    for (const seer of seerArray) {
                        const index = seerArray.indexOf(seer);
                        nightPhaseText.textContent += " " + storage.activatedRoles.find(role => role.name === seer)?.germanName;
                        await speak(voicePath(roleVoiceName(seer), roleVoiceName(seer) + ".mp3"));
                        if (index + 1 < seerArray.length) {
                            nightPhaseText.textContent += " und";
                            await speak("./voices/beholder/and.mp3");
                        }
                    }
                    nightPhaseText.textContent += " hebt eure Daumen.";
                    await speak("./voices/beholder/thumbs_up.mp3");
                    nightPhaseText.textContent += " Betrachterin du darfst die Karten, von den Spielern angucken, der ihre Daumen heben.";
                    await speak("./voices/beholder/beholder.mp3");
                    await speak("./voices/beholder/look_at_multiple.mp3");
                }
            }
            if (phase.name === "body_snatcher") {
                if (storage.bodySnatcherViewsCard) {
                    nightPhaseText.textContent = "Sehe dir dann deine Karte an.";
                    await speak("./voices/body_snatcher/view_card_text.mp3");
                }
                nightPhaseText.textContent = "Deine neue Karte ist nun ein Alien.";
                await speak("./voices/body_snatcher/ending_text.mp3");
            }
            await waitCycle(phase, nightPhaseText);
            if ((phase.name === "alien" || phase.name === "werewolf" || phase.name === "vampire") && storage.activatedRoles.find(role => role.name === "Cow")) {
                await cowAction(phase, nightPhaseImage, nightPhaseText);
            }
            if (phase.name === "werewolf" && storage.activatedRoles.find(role => role.name === "Dreamwolf")) {
                nightPhaseText.textContent = "Traumwolf senk deinen Daumen.";
                await speak("./voices/werewolf/dreamwolf_ending.mp3");
            }
            if (phase.name === "nostradamus") {
                await nostradamusAction(nightPhaseText, nostradamusPicker);
            }
            if (phase.name === "oracle") {
                await oracleQuestionEvaluation(nightPhaseText);
            }
            if (phase.name !== "assassin" || storage.activatedRoles.find(role => role.name === "Doppelganger")) {
                nightPhaseImage.src = "./images/" + phase.name + ".png";
                nightPhaseText.textContent = getGermanName(phase.name) + (phase.isMultiple ? " schließt eure" : " schließ deine") + " Augen.";
                await speak(voicePath(phase.name, phase.name + ".mp3"));
                await speakSingularOrPlural(phase.isMultiple, "./voices/close_your_eyes.mp3", "./voices/close_your_eyes_multiple.mp3");
            }
            if (phase.name === "alien" && (storage.activatedRoles.find(role => role.name === "Groob") && storage.activatedRoles.find(role => role.name === "Zerb"))) {
                await alienGroobAndZerbAction(phase, nightPhaseImage, nightPhaseText);
            }
            await doppelgangerExtraWake(phase, nightPhaseImage, nightPhaseText);
            if (phase.name === "renfield") {
                nightPhaseText.textContent = "Vampire senkt eure Arme wieder.";
                await speak(voicePath(phase.name, "ending.mp3"));
            }
            if (phase.name === "minion" || phase.name === "squire") {
                nightPhaseText.textContent = "Werwölfe senkt eure Daumen wieder.";
                await speak("./voices/minion/ending.mp3");
            }
            if (phase.name === "leader" && !storage.leaderKnowsEverything) {
                nightPhaseText.textContent = "Senkt alle eure Daumen und Hände wieder.";
                await speak(voicePath(phase.name, "ending.mp3"));
            }
            if (phase.name === "apprentice_tanner") {
                nightPhaseText.textContent = "Gerber senk deinen Daumen wieder.";
                await speak(voicePath(phase.name, "ending.mp3"));
            }
            if (phase.name === "aura_seer" || phase.name === "beholder") {
                nightPhaseText.textContent = "Senkt alle eure Daumen wieder.";
                await speak("./voices/aura_seer/ending.mp3");
            }
            if (phase.name === "empath") {
                nightPhaseText.textContent = "Senkt alle eure Hände wieder.";
                await speak("./voices/empath/ending.mp3");
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
                div.style.borderColor = "white";
            }

            const img = document.createElement("img");
            img.src = "./images/" + role.name.toLowerCase().replaceAll(" ","_") + ".png";
            img.alt = role.name;

            div.append(img);
            roleGrid.append(div);

            div.addEventListener("click", () => {
                // const clickSound = new Audio("./voices/click_sound.wav");
                // clickSound.play();
                if (div.style.borderColor !== "white") {
                    div.style.borderColor = "white";
                    storage.activatedRoles.push(role);
                } else {
                    div.style.borderColor = "transparent";
                    storage.activatedRoles = storage.activatedRoles.filter(role1 => role1.id + role1.name !== role.id + role.name);
                }
                saveLocalStorage();
            });
        }
    }
});

function voicePath(folder, file) {
    return "./voices/" + folder + "/" + file;
}

async function speakText(roleName) {
    await speak(voicePath(roleName, "text.mp3"));
}

function roleVoiceName(displayName) {
    return displayName.toLowerCase().replaceAll(" ", "_");
}

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
    if (phase.name === "leader" && storage.leaderKnowsEverything || phase.name === "nostradamus") {
        pauseTime *= 3;
    }
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

export {speak, sleep, waitCycle, getGermanName, paused, allPhases, voicePath, roleVoiceName, speakText};