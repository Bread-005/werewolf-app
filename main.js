document.addEventListener("DOMContentLoaded", () => {

    // alle Werewolf Cards: https://boardgamegeek.com/thread/2111933/all-roles-tile-images

    const roleGrid = document.querySelector(".roles-grid");
    const roles = ["Werewolf", "Werewolf", "Seer", "Villager", "Villager", "Villager"];

    for (const role of roles) {
        const div = document.createElement("div");
        div.classList.add("role-card");
        const img = document.createElement("img");
        img.src = "./images/" + role.toLowerCase() + ".png";
        img.alt = role;

        div.append(img);
        roleGrid.append(div);
    }
});