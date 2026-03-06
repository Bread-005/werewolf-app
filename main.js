document.addEventListener("DOMContentLoaded", async () => {

    // alle Werewolf Cards: https://boardgamegeek.com/thread/2111933/all-roles-tile-images

    let gameIsRunning = false;
    const roleGrid = document.querySelector(".roles-grid");
    const roles = await fetch("./roles.json").then(res => res.json());
    let activatedRoles = [];

    for (const role of roles) {
        const div = document.createElement("div");
        div.classList.add("role-card");
        const img = document.createElement("img");
        img.src = "./images/" + role.name.toLowerCase() + ".png";
        img.alt = role.name;

        div.append(img);
        roleGrid.append(div);

        div.addEventListener("click", () => {
            if (!div.style.border || div.style.border === "none") {
                div.style.border = "white 5px solid";
                activatedRoles.push(role);
            } else {
                div.style.border = "none";
                activatedRoles = activatedRoles.filter(role1 => role1 !== role);
            }
        });
    }

    window.scrollTo(0, 0);

    document.querySelector(".start-button").addEventListener("click", async () => {
        if (activatedRoles.length === 0) return;
        gameIsRunning = true;
        let phases = await fetch("./phases.json").then(res => res.json());
        if (!activatedRoles.find(role => role.name.toLowerCase().includes("wolf"))) phases = phases.filter(phase => phase.name !== "werewolves");

        roleGrid.style.display = "none";
        document.querySelector(".bottom-bar").style.display = "none";
        document.querySelector(".night-phase").style.visibility = "visible";

        const nightPhaseImage = document.querySelector(".image");
        const nightPhaseText = document.getElementById("night-phase-text");

        for (const phase of phases) {
            if (!gameIsRunning) return;
            if (roles.find(role => role.name.toLowerCase() === phase.name)) {
                nightPhaseImage.src = "./images/" + roles.find(role => role.name.toLowerCase() === phase.name).name.toLowerCase() + ".png";
            } else {
                nightPhaseImage.src = "./images/villager.png";
            }
            if (phase.name === "werewolves") {
                nightPhaseImage.src = "./images/werewolf.png";
            }
            nightPhaseText.textContent = phase.text;
            await speak("./voices/" + phase.name + ".mp3");
            if (phase.secondText) {
                await sleep(1);
                nightPhaseText.textContent = phase.secondText;
                await speak("./voices/" + phase.name + "_second.mp3");
            }
            if (phase.name === "move_card") await sleep(2);
            if (!phase.endingText) continue;
            for (let i = 5; i >= 0; i--) {
                if (!gameIsRunning) return;
                nightPhaseText.textContent = "(Pause: 5 Sekunden)";
                const div = document.createElement("div");
                div.textContent = "00:" + (i < 10 ? "0" : "") + i.toString();
                nightPhaseText.append(div);
                await sleep(1);
                nightPhaseText.removeChild(div);
            }
            nightPhaseText.textContent = phase.endingText;
            await speak("./voices/" + phase.name + "_ending.mp3");
        }

        document.querySelector(".night-content").removeChild(nightPhaseImage);
        document.querySelector(".night-content").removeChild(nightPhaseText);
        const voteTimer = document.createElement("h2");
        document.querySelector(".app").append(voteTimer);
        voteTimer.setAttribute("class", "vote-timer");
        voteTimer.textContent = "05:00";
        const maxSeconds = 23;

        for (let i = maxSeconds; i >= 0; i--) {
            voteTimer.textContent = Math.floor(i / 60) + ":" + (i % 60 < 10 ? "0" : "") + (i % 60);
            await sleep(1);
            if (i === 0) {
                voteTimer.textContent = "Stimmt nun alle ab. 3 2 1 zeigen";
                await speak("Stimmt nun alle ab. 3 2 1 zeigen");
                window.location.reload();
            }
        }
    });

    async function speak(filePath) {
        return new Promise(resolve => {
            const audio = new Audio(filePath);
            audio.onended = resolve;
            audio.play();
        });
    }

    document.getElementById("pause-button").addEventListener("click", () => {
        console.log("Hier passiert noch nichts");
    });

    document.getElementById("stop-button").addEventListener("click", () => {
        window.location.reload();
    });

    async function sleep(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }
});