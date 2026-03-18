import {saveLocalStorage, storage} from "./main.js";

document.addEventListener("DOMContentLoaded", () => {

    const bigDiv = document.createElement("div");
    bigDiv.setAttribute("class","all-settings");
    const alienSettings = ["View", "Stare", "Timer", "Left", "Right", "Show", "New Alien"];
    for (const alienSetting of alienSettings) {
        const div = document.createElement("div");
        div.setAttribute("class", "single-setting");
        const span = document.createElement("span");
        span.textContent = alienSetting;
        const change = document.createElement("div");
        change.style.display = "flex";
        change.style.flexDirection = "column";
        const up = document.createElement("button");
        const upIcon = document.createElement("i");
        upIcon.className = "fa-solid fa-arrow-up";
        const currentSetting = document.createElement("span");
        currentSetting.textContent = storage.alienRandomActionChances[alienSetting.toLowerCase().replaceAll(" ", "_")];
        const down = document.createElement("button");
        const downIcon = document.createElement("i");
        downIcon.className = "fa-solid fa-arrow-down";

        up.append(upIcon);
        change.append(up);
        change.append(currentSetting);
        down.append(downIcon);
        change.append(down);

        div.append(span);
        div.append(change);
        bigDiv.append(div);

        up.addEventListener("click", () => {
            storage.alienRandomActionChances[alienSetting.toLowerCase().replaceAll(" ", "_")] += 5;
            currentSetting.textContent = storage.alienRandomActionChances[alienSetting.toLowerCase().replaceAll(" ", "_")];
            saveLocalStorage();
        });

        down.addEventListener("click", () => {
            storage.alienRandomActionChances[alienSetting.toLowerCase().replaceAll(" ", "_")] -= 5;
            currentSetting.textContent = storage.alienRandomActionChances[alienSetting.toLowerCase().replaceAll(" ", "_")];
            saveLocalStorage();
        });
    }

    document.querySelector(".role-settings").append(bigDiv);
});