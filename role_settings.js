import {saveLocalStorage, storage} from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {

    const bigDiv = document.createElement("div");
    bigDiv.setAttribute("class","all-settings");
    let settings = [];
    if (storage.currentSettingRole === "alien") settings = ["View", "Stare", "Timer", "Left", "Right", "Show", "New Alien"];
    if (storage.currentSettingRole === "psychic") settings = ["Neighbor", "Even Player", "Odd Player", "Not Neighbor", "Any Player", "Middle"];
    if (storage.currentSettingRole === "mortician") settings = ["Self", "Left Neighbor", "Right Neighbor", "Neighbor"];
    if (storage.currentSettingRole === "leader") settings = ["All wissender Boss"];
    if (storage.currentSettingRole === "body_snatcher") settings = ["Neighbor", "Middle1", "Middle2", "Middle3", "Even Player", "Odd Player", "Middle", "Karte ansehen"];
    if (storage.currentSettingRole === "rascal") settings = ["Robber", "Witch", "Troublemaker", "Drunk"];
    for (const setting of settings) {
        const div = document.createElement("div");
        div.setAttribute("class", "single-setting");
        const span = document.createElement("span");
        span.textContent = setting;
        const change = document.createElement("div");
        change.style.display = "flex";
        change.style.flexDirection = "column";
        const up = document.createElement("button");
        const upIcon = document.createElement("i");
        upIcon.className = "fa-solid fa-arrow-up";
        const currentSetting = document.createElement("span");
        if (storage.currentSettingRole !== "leader" && setting !== "Karte ansehen") {
            currentSetting.textContent = storage[storage.currentSettingRole + "RandomActionChances"][setting.toLowerCase().replaceAll(" ","_")];
        } else {
            currentSetting.textContent = setting;
        }
        const down = document.createElement("button");
        const downIcon = document.createElement("i");
        downIcon.className = "fa-solid fa-arrow-down";

        if (storage.currentSettingRole !== "leader" && setting !== "Karte ansehen") {
            up.append(upIcon);
            down.append(downIcon);
            change.append(up, currentSetting, down);
        } else {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            if (storage.currentSettingRole === "leader") checkbox.checked = storage.leaderKnowsEverything;
            if (setting === "Karte ansehen") checkbox.checked = storage.bodySnatcherViewsCard;

            checkbox.addEventListener("click", () => {
                if (storage.currentSettingRole === "leader") storage.leaderKnowsEverything = checkbox.checked;
                if (setting === "Karte ansehen") storage.bodySnatcherViewsCard = checkbox.checked;
                saveLocalStorage();
            });

            change.append(checkbox);
        }

        div.append(span, change);
        bigDiv.append(div);

        up.addEventListener("click", () => {
            storage[storage.currentSettingRole + "RandomActionChances"][setting.toLowerCase().replaceAll(" ", "_")] += 5;
            currentSetting.textContent = storage[storage.currentSettingRole + "RandomActionChances"][setting.toLowerCase().replaceAll(" ", "_")];
            saveLocalStorage();
        });

        down.addEventListener("click", () => {
            storage[storage.currentSettingRole + "RandomActionChances"][setting.toLowerCase().replaceAll(" ", "_")] -= 5;
            currentSetting.textContent = storage[storage.currentSettingRole + "RandomActionChances"][setting.toLowerCase().replaceAll(" ", "_")];
            saveLocalStorage();
        });
    }

    document.querySelector(".role-settings").append(bigDiv);
});