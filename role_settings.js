import {saveLocalStorage, storage} from "./storage.js";

const GERMAN_LABELS = {
    view: "Karte ansehen",
    stare: "Nur angucken",
    timer: "Timer",
    left: "Links",
    right: "Rechts",
    show: "Zeigen",
    new_alien: "Neuer Alien",
    neighbor: "Nachbar",
    even_player: "Gerader Spieler",
    odd_player: "Ungerader Spieler",
    not_neighbor: "Kein Nachbar",
    any_player: "Beliebiger Spieler",
    middle: "Mitte",
    self: "Sich selbst",
    left_neighbor: "Linker Nachbar",
    right_neighbor: "Rechter Nachbar",
    middle1: "Mittelkarte 1",
    middle2: "Mittelkarte 2",
    middle3: "Mittelkarte 3",
    robber: "Räuber",
    witch: "Hexe",
    troublemaker: "Unruhestifter",
    drunk: "Betrunkener",
    join_evil_team: "Böses Team beitreten",
    alien_exchange: "Alien-Kartentausch",
    center_exchange: "Mitteltausch"
};

document.addEventListener("DOMContentLoaded", () => {

    const bigDiv = document.createElement("div");
    bigDiv.setAttribute("class","all-settings");
    const randomActionRoles = ["alien", "psychic", "mortician", "body_snatcher", "rascal", "oracle"];

    let settings = [];
    if (randomActionRoles.includes(storage.currentSettingRole)) {
        settings = Object.keys(storage[storage.currentSettingRole + "RandomActionChances"])
            .map(key => ({key, label: GERMAN_LABELS[key] ?? key}));
    }
    if (storage.currentSettingRole === "leader") settings = [{key: null, label: "All wissender Boss"}];
    if (storage.currentSettingRole === "body_snatcher") {
        settings.push({key: null, label: "Karte ansehen"});
    }
    for (const setting of settings) {
        const div = document.createElement("div");
        div.setAttribute("class", "single-setting");
        const span = document.createElement("span");
        span.textContent = setting.label;
        const change = document.createElement("div");
        change.style.display = "flex";
        change.style.flexDirection = "column";
        const up = document.createElement("button");
        const upIcon = document.createElement("i");
        upIcon.className = "fa-solid fa-arrow-up";
        const currentSetting = document.createElement("span");
        if (setting.key !== null) {
            currentSetting.textContent = storage[storage.currentSettingRole + "RandomActionChances"][setting.key];
        } else {
            currentSetting.textContent = setting.label;
        }
        const down = document.createElement("button");
        const downIcon = document.createElement("i");
        downIcon.className = "fa-solid fa-arrow-down";

        if (setting.key !== null) {
            up.append(upIcon);
            down.append(downIcon);
            change.append(up, currentSetting, down);
        } else {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            if (storage.currentSettingRole === "leader") checkbox.checked = storage.leaderKnowsEverything;
            if (setting.label === "Karte ansehen") checkbox.checked = storage.bodySnatcherViewsCard;

            checkbox.addEventListener("click", () => {
                if (storage.currentSettingRole === "leader") storage.leaderKnowsEverything = checkbox.checked;
                if (setting.label === "Karte ansehen") storage.bodySnatcherViewsCard = checkbox.checked;
                saveLocalStorage();
            });

            change.append(checkbox);
        }

        div.append(span, change);
        bigDiv.append(div);

        up.addEventListener("click", () => {
            storage[storage.currentSettingRole + "RandomActionChances"][setting.key] += 5;
            currentSetting.textContent = storage[storage.currentSettingRole + "RandomActionChances"][setting.key];
            saveLocalStorage();
        });

        down.addEventListener("click", () => {
            storage[storage.currentSettingRole + "RandomActionChances"][setting.key] -= 5;
            currentSetting.textContent = storage[storage.currentSettingRole + "RandomActionChances"][setting.key];
            saveLocalStorage();
        });
    }

    document.querySelector(".role-settings").append(bigDiv);
});
