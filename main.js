import {doppelgangerVerboseText} from "./doppelganger.js";

const storage = JSON.parse(localStorage.getItem("werewolf-app"));

document.addEventListener("DOMContentLoaded", async () => {

    if (!storage) {
        const storage1 = {
            enabledEditions: ["Werewolves"],
            actionTime: 5,
            votingTime: 300,
            alienRandomActionChances: {view: 10, stare: 10, timer: 10, left: 10, right: 10, show: 10, new_alien: 0}
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

    const editions = document.querySelector(".editions");
    for (const edition of editions.children) {
        showEdition(edition);
        edition.addEventListener("click", () => {
            if (storage.enabledEditions.includes(edition.className)) {
                storage.enabledEditions = storage.enabledEditions.filter(edition1 => edition1 !== edition.className);
            } else {
                storage.enabledEditions.push(edition.className);
            }
            activatedRoles = activatedRoles.filter(role => role.edition !== edition.className);
            saveLocalStorage();
            showEdition(edition);
            showRolesSelection();
        });
    }

    const roleGrid = document.querySelector(".roles-grid");
    const allRoles = await fetch("./roles.json").then(res => res.json());
    let activatedRoles = [];
    showRolesSelection();

    window.scrollTo(0, 0);

    const nightPhaseImage = document.querySelector(".image");
    const nightPhaseText = document.getElementById("night-phase-text");

    document.querySelector(".start-button").addEventListener("click", async () => {
        if (activatedRoles.length === 0) return;
        const allPhases = await fetch("./phases.json").then(res => res.json());
        let phases = [];
        for (const phase of allPhases) {
            if (activatedRoles.find(role => role.name.toLowerCase().replaceAll(" ","_") === phase.name) ||
                phase.name === "all_sleep" || phase.name === "move_card" || phase.name === "all_wake_up" ||
                phase.name === "werewolf" && activatedRoles.find(role => role.name.toLowerCase().includes("wolf") && role.name !== "Dreamwolf")) {
                phases.push(phase);
            }
        }
        if (!activatedRoles.find(role => role.name.toLowerCase().includes("wolf"))) phases = phases.filter(phase => phase.name !== "minion");

        activatedRoles.sort((a, b) => allRoles.indexOf(a) - allRoles.indexOf(b));

        document.querySelector(".editions").style.display = "none";
        roleGrid.style.display = "none";
        document.querySelector(".bottom-bar").style.display = "none";
        document.querySelector(".night-phase").style.visibility = "visible";

        for (const phase of phases) {
            if (phase.name === "all_sleep" || phase.name === "move_card" || phase.name === "all_wake_up") {
                nightPhaseImage.src = "./images/villager.png";
                nightPhaseText.textContent = phase.text;
                await speak("./voices/" + phase.name + ".mp3");
                await sleep(2);
                continue;
            }

            nightPhaseImage.src = "./images/" + phase.name + ".png";
            nightPhaseText.textContent = getGermanName(phase.name) + " wach auf.";
            if (phase.isMultiple) nightPhaseText.textContent = nightPhaseText.textContent.replace("wach", "wacht");
            if (phase.name === "werewolf" && activatedRoles.find(role => role.name === "Dreamwolf")) {
                nightPhaseText.textContent = "Alle Werwölfe außer dem Traumwolf, wacht auf. Traumwolf heb deinen Daumen.";
                await speak("./voices/werewolf/dreamwolf_text.mp3");
            } else {
                await speak("./voices/" + phase.name + "/" + phase.name + ".mp3");
                if (!phase.isMultiple) {
                    await speak("./voices/wake_up.mp3");
                }
                if (phase.isMultiple) {
                    await speak("./voices/wake_up_multiple.mp3");
                }
                if (!phase.textWithMarks || !activatedRoles.find(role => role.mark)) {
                    nightPhaseText.textContent = phase.text;
                    await speak("./voices/" + phase.name + "/" + "text.mp3");
                } else {
                    nightPhaseText.textContent = phase.textWithMarks;
                    await speak("./voices/" + phase.name + "/" + "textWithMarks.mp3");
                }
            }
            if (phase.name === "doppelganger" && activatedRoles.filter(role => allRoles.find(role1 => role1.name === "Doppelganger").verboseRoles.includes(role.name)).length > 0) {
                await doppelgangerVerboseText(activatedRoles, nightPhaseText);
            }
            if (phase.secondText) {
                await sleep(1.5);
                nightPhaseText.textContent = phase.secondText;
                await speak("./voices/" + phase.name + "/second_text.mp3");
            }
            if (phase.alienRandomActions) {
                const randomActions = [];
                for (const action of phase.alienRandomActions) {
                    for (let i = 0; i < storage.alienRandomActionChances[action.name] / 5; i++) {
                        randomActions.push(action);
                    }
                }
                const randomAlienAction = randomActions.sort(() => Math.random() - 0.5)[0];
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
            if (phase.randomActions) {
                const randomAction = phase.randomActions.sort(() => Math.random() - 0.5)[0];
                nightPhaseText.textContent = nightPhaseText.textContent += randomAction;
                await speak("./voices/random_cards/" + randomAction + ".mp3");
            }
            await waitCycle(phase);
            if (phase.name === "werewolf" && activatedRoles.find(role => role.name === "Dreamwolf")) {
                nightPhaseText.textContent = "Traumwolf senk deinen Daumen.";
                await speak("./voices/werewolf/dreamwolf_ending.mp3");
            }
            nightPhaseText.textContent = getGermanName(phase.name) + (phase.isMultiple ? " schließt eure" : " schließ deine") + " Augen.";
            await speak("./voices/" + phase.name + "/" + phase.name + ".mp3");
            if (!phase.isMultiple) {
                await speak("./voices/close_your_eyes.mp3");
            }
            if (phase.isMultiple) {
                await speak("./voices/close_your_eyes_multiple.mp3");
            }
            if (phase.doppelganger && activatedRoles.find(role => role.name === "Doppelganger")) {
                nightPhaseImage.src = "./images/doppelganger.png";
                nightPhaseText.textContent = "Doppelgängerin, wenn du die " + getGermanName(phase.name) + " Karte angesehen hast, wach auf.";
                await speak("./voices/doppelganger/later_action/first_part.mp3");
                await speak("./voices/" + phase.name + "/" + phase.name + ".mp3");
                await speak("./voices/doppelganger/later_action/last_part.mp3");
                if (phase.name !== "minion" && phase.name !== "auraseer") {
                    nightPhaseText.textContent = phase.text;
                    await speak("./voices/" + phase.name + "/text.mp3");
                }
                if (phase.randomActions) {
                    const randomAction = phase.randomActions.sort(() => Math.random() - 0.5)[0];
                    nightPhaseText.textContent = nightPhaseText.textContent += randomAction;
                    await speak("./voices/random_cards/" + randomAction + ".mp3");
                }
                await waitCycle(phase);
                nightPhaseText.textContent += "Doppelgängerin schließ deine Augen.";
                await speak("./voices/doppelganger/doppelganger.mp3");
                await speak("./voices/close_your_eyes.mp3");
            }
            if (phase.name === "minion") {
                nightPhaseText.textContent = "Werwölfe senkt eure Daumen wieder.";
                await speak("./voices/" + phase.name + "/ending.mp3");
            }
            if (phase.name === "auraseer") {
                nightPhaseText.textContent = "Senkt alle eure Daumen wieder.";
                await speak("./voices/" + phase.name + "/ending.mp3");
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
                const voting = ["ready_for_vote:Macht euch bereit für die Abstimmung", "three:3", "two:2", "one:1", "vote:abstimmen"];

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
        console.log("Hier passiert noch nichts");
    });

    document.getElementById("stop-button").addEventListener("click", () => {
        window.location.reload();
    });

    async function waitCycle(phase) {
        const pauseTime = (phase.name === "doppelganger" || phase.name === "villageidiot" ? storage.actionTime * 2 : storage.actionTime);
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
            if (activatedRoles.find(role1 => role1.name === role.name)) {
                div.style.border = "white 5px solid";
            }
            const span = document.createElement("span");
            span.textContent = role.germanName;
            const img = document.createElement("img");
            img.src = "./images/" + role.name.toLowerCase().replaceAll(" ","_") + ".png";
            img.alt = role.name;

            div.append(span);
            div.append(img);
            roleGrid.append(div);

            div.addEventListener("click", () => {
                // const clickSound = new Audio("./voices/click_sound.wav");
                // clickSound.play();
                if (!div.style.border || div.style.border === "none") {
                    div.style.border = "white 5px solid";
                    activatedRoles.push(role);
                } else {
                    div.style.border = "none";
                    activatedRoles = activatedRoles.filter(role1 => role1 !== role);
                }
            });
        }
    }

    function getGermanName(englishName) {
        for (const role of allRoles) {
            if (englishName.toLowerCase() === role.name.toLowerCase().replaceAll(" ","_")) {
                if (role.germanName === "Werwolf") return "Werwölfe";
                if (role.germanName === "Alien") return "Aliens";
                return role.germanName;
            }
        }
        return "";
    }
});

async function speak(filePath) {
    return new Promise(resolve => {
        const audio = new Audio(filePath);
        audio.onended = resolve;
        audio.play();
    });
}

async function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function saveLocalStorage() {
    localStorage.setItem("werewolf-app", JSON.stringify(storage));
}

export {speak, sleep, storage, saveLocalStorage};