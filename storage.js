const storage = JSON.parse(localStorage.getItem("werewolf-app"));

function saveLocalStorage() {
    localStorage.setItem("werewolf-app", JSON.stringify(storage));
}

export {storage, saveLocalStorage};
