document.addEventListener("DOMContentLoaded", () => {

    // alle Werewolf Cards: https://boardgamegeek.com/thread/2111933/all-roles-tile-images

    const roleGrid = document.querySelector(".roles-grid");
    const roles = [
        {
            "id": "werewolf1",
            "name": "Werewolf"
        },
        {
            "id": "werewolf2",
            "name": "Werewolf"
        },
        {
            "id": "seer",
            "name": "Seer"
        },
        {
            "id": "villager1",
            "name": "Villager"
        },
        {
            "id": "villager2",
            "name": "Villager"
        },
        {
            "id": "villager3",
            "name": "Villager"
        }
    ]
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
            console.log(div.style.border);
            if (!div.style.border || div.style.border === "none") {
                div.style.border = "white 5px solid";
                activatedRoles.push(role);
            } else {
                div.style.border = "none";
                activatedRoles = activatedRoles.filter(role1 => role1 !== role);
            }
            console.log(activatedRoles);
        });
    }
});