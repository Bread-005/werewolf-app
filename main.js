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

    document.querySelector(".start-button").addEventListener("click", async () => {
        if (activatedRoles.length === 0) return;
        gameIsRunning = true;
        let nightOrderRoles = Object.values(Object.fromEntries(activatedRoles.map(role => [role.name, role])));
        nightOrderRoles = nightOrderRoles.filter(role => role.nightOrder);
        nightOrderRoles.push({name: "Villager", text: "Schließt nun alle eure Augen.", nightOrder: 0.01});
        nightOrderRoles.sort((a, b) => a.nightOrder - b.nightOrder);
        nightOrderRoles.push({name: "Villager", text: "Wacht nun alle auf.", nightOrder: 100});

        roleGrid.style.display = "none";
        document.querySelector(".bottom-bar").style.display = "none";
        document.querySelector(".night-phase").style.visibility = "visible";

        for (const role of nightOrderRoles) {
            if (!gameIsRunning) return;
            document.querySelector(".image").src = "./images/" + role.name.toLowerCase() + ".png";
            const nightPhaseText = document.getElementById("night-phase-text");
            nightPhaseText.textContent = role.text;
            await speak(role.text);
            if (role.name === "Villager") continue;
            for (let i = 5; i >= 0; i--) {
                if (!gameIsRunning) return;
                nightPhaseText.textContent = "(Pause: 5 Sekunden)";
                const div = document.createElement("div");
                div.textContent = "00:" + (i < 10 ? "0" : "") + i.toString();
                nightPhaseText.append(div);
                await new Promise(resolve => setTimeout(resolve, 1000));
                nightPhaseText.removeChild(div);
            }
            nightPhaseText.textContent = role.endingText;
            await speak(role.endingText);
        }
    });

    async function speak(text) {
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = resolve;
            speechSynthesis.speak(utterance);
        });
    }

    document.getElementById("pause-button").addEventListener("click", () => {
        console.log("Hier passiert noch nichts");
    });

    document.getElementById("stop-button").addEventListener("click", () => {
        roleGrid.style.display = "grid";
        document.querySelector(".bottom-bar").style.display = "flex";
        document.querySelector(".night-phase").style.visibility = "hidden";
    });
});