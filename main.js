document.addEventListener("DOMContentLoaded", async () => {

    // alle Werewolf Cards: https://boardgamegeek.com/thread/2111933/all-roles-tile-images

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
});