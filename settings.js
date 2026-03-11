import {saveLocalStorage, storage} from "./main.js";

document.addEventListener("DOMContentLoaded", () => {
    const actionTimeInput = document.getElementById("action-time-input");
    const votingTimeInput = document.getElementById("voting-time-input");

    actionTimeInput.value = storage.actionTime;

    actionTimeInput.addEventListener("input", () => {
        if (actionTimeInput.value < 1) actionTimeInput.value = 1;
        if (actionTimeInput.value > 10) actionTimeInput.value = 10;
        storage.actionTime = Math.floor(Number(actionTimeInput.value));
        saveLocalStorage();
    });

    votingTimeInput.value = storage.votingTime;

    votingTimeInput.addEventListener("input", () => {
        if (votingTimeInput.value < 1) votingTimeInput.value = 1;
        if (votingTimeInput.value > 600) votingTimeInput.value = 600;
        storage.votingTime = Math.floor(Number(votingTimeInput.value));
        saveLocalStorage();
    });
});