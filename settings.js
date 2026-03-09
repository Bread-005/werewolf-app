import {saveLocalStorage, storage} from "./main.js";

document.addEventListener("DOMContentLoaded", () => {
    const actionTimeInput = document.getElementById("action-time-input");

    actionTimeInput.value = storage.actionTime;

    actionTimeInput.addEventListener("input", () => {
        if (actionTimeInput.value < 1) actionTimeInput.value = 1;
        if (actionTimeInput.value > 10) actionTimeInput.value = 10;
        storage.actionTime = Math.floor(Number(actionTimeInput.value));
        saveLocalStorage();
    });
});