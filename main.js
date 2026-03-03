document.addEventListener("DOMContentLoaded", () => {

    const roleGrid = document.querySelector(".roles-grid");
    const roles = ["Werewolf", "Villager"];

    for (const role of roles) {
        const div = document.createElement("div");
        div.classList.add("role-card");
        const img = document.createElement("img");
        img.src = "./images/" + role.toLowerCase() + ".png";
        img.alt = role;
        const span = document.createElement("span");
        span.textContent = role;

        div.append(img);
        div.append(span);
        roleGrid.append(div);
    }
});