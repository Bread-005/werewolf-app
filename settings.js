import {saveLocalStorage, storage} from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
    const actionTimeDisplay = document.getElementById("action-time-display");
    const votingTimeDisplay = document.getElementById("voting-time-display");

    actionTimeDisplay.textContent = storage.actionTime;
    votingTimeDisplay.textContent = storage.votingTime;

    document.getElementById("action-time-up").addEventListener("click", () => {
        if (storage.actionTime >= 10) return;
        storage.actionTime++;
        actionTimeDisplay.textContent = storage.actionTime;
        saveLocalStorage();
    });

    document.getElementById("action-time-down").addEventListener("click", () => {
        if (storage.actionTime <= 0) return;
        storage.actionTime--;
        actionTimeDisplay.textContent = storage.actionTime;
        saveLocalStorage();
    });

    document.getElementById("voting-time-up").addEventListener("click", () => {
        if (storage.votingTime >= 600) return;
        storage.votingTime += 10;
        votingTimeDisplay.textContent = storage.votingTime;
        saveLocalStorage();
    });

    document.getElementById("voting-time-down").addEventListener("click", () => {
        if (storage.votingTime <= 10) return;
        storage.votingTime -= 10;
        votingTimeDisplay.textContent = storage.votingTime;
        saveLocalStorage();
    });

    const moveCardInput = document.getElementById("move-card-input");
    moveCardInput.checked = storage.moveCard;
    moveCardInput.addEventListener("change", () => {
        storage.moveCard = moveCardInput.checked;
        saveLocalStorage();
    });

    document.querySelectorAll(".random-role-setting").forEach(div => div.addEventListener("click", () => {
        storage.currentSettingRole = div.id.replace("-settings", "");
        saveLocalStorage();
        window.location = "role_settings.html";
    }));
});