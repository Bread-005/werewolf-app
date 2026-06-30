const storage = JSON.parse(localStorage.getItem("werewolf-app"));

function saveLocalStorage() {
    localStorage.setItem("werewolf-app", JSON.stringify(storage));
}

/**
 * Builds a weighted pool of random actions for a phase.
 * Each action appears once per weight unit defined in storage.
 * @param {object} phase - The phase object from phases.json.
 * @returns {object[]} The weighted pool of actions.
 */
function buildWeightedActionPool(phase) {
    const pool = [];
    for (const action of phase.randomActions) {
        const weight = storage[phase.name + "RandomActionChances"][action.name];
        for (let i = 0; i < weight; i++) {
            pool.push(action);
        }
    }
    return pool;
}

export {storage, saveLocalStorage, buildWeightedActionPool};
