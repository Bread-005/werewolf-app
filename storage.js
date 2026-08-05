const storage = JSON.parse(localStorage.getItem("werewolf-app"));

const defaultStorage = {
    activatedRoles: [],
    enabledEditions: ["Werewolves"],
    actionTime: 5,
    votingTime: 300,
    currentSettingRole: "",
    alienRandomActionChances: {view: 10, stare: 10, timer: 10, left: 10, right: 10, show: 10, new_alien: 0},
    psychicRandomActionChances: {neighbor: 10, even_player: 10, odd_player: 10, not_neighbor: 10, any_player: 10, middle: 10},
    morticianRandomActionChances: {self: 10, left_neighbor: 10, right_neighbor: 10, neighbor: 10},
    body_snatcherRandomActionChances: {neighbor: 10, middle1: 5, middle2: 5, middle3: 5, even_player: 10, odd_player: 10, middle: 10},
    rascalRandomActionChances: {robber: 10, witch: 10, troublemaker: 10, drunk: 10},
    oracleRandomActionChances: {join_evil_team: 10, alien_exchange: 10, center_exchange: 10},
    empathRandomActionChances: {
        winner: 10, trust: 10, suspicious: 10, best_looking: 10, best_smell: 10, best_dressed: 10,
        smartest: 10, funniest: 10, friendliest: 10, most_liked: 10, most_pointed: 10, least_pointed: 10,
        suspected_empath: 10
    },
    leaderKnowsEverything: false,
    moveCard: true,
    bodySnatcherViewsCard: true
};

function saveLocalStorage() {
    localStorage.setItem("werewolf-app", JSON.stringify(storage));
}

/**
 * Fills in any missing keys on the stored state with their default values and persists
 * the result. Used both for first-time initialization and for backfilling new keys
 * added after a user's storage was already created.
 */
function applyStorageDefaults() {
    for (const key of Object.keys(defaultStorage)) {
        if (storage[key] === undefined) {
            storage[key] = defaultStorage[key];
        }
    }
    saveLocalStorage();
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

export {storage, saveLocalStorage, buildWeightedActionPool, defaultStorage, applyStorageDefaults};
