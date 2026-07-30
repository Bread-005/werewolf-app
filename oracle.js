import {sleep, speak} from "./main.js";
import {storage, buildWeightedActionPool} from "./storage.js";

let selectedAnswer = null;
let selectedEvilTeam = "";
let selectedQuestion = null;
let alienExchangeDecision = null;
let alienExchangeAlreadyAsked = false;
let doppelgangerOracleIsAnswering = false;

/**
 * Determines the evil team to substitute into the "join_evil_team" question, based on which
 * evil roles are currently in play.
 */
function pickEvilTeam() {
    const evilTeams = [];
    if (storage.activatedRoles.find(role => role.name.toLowerCase().includes("wolf") || role.name === "Minion" || role.name === "Squire")) {
        evilTeams.push("Werwolf");
    }
    if (storage.activatedRoles.find(role => role.name === "Vampire" || role.name === "The Master" || role.name === "The Count" || role.name === "Renfield")) {
        evilTeams.push("Vampir");
    }
    if (storage.activatedRoles.find(role => role.name === "Alien" || role.name === "Zerb" || role.name === "Groob" || role.name === "Body Snatcher")) {
        evilTeams.push("Alien");
    }
    if (evilTeams.length === 0) {
        evilTeams.push("Werwolf");
    }
    return evilTeams[0];
}

/**
 * Renders the Ja/Nein answer picker for a randomly, weight-based selected Oracle question.
 */
async function renderOraclePicker(phase) {
    await sleep(0.5);

    selectedAnswer = null;
    selectedEvilTeam = pickEvilTeam();
    let randomActions = buildWeightedActionPool(phase);
    if (!storage.activatedRoles.find(role => role.name === "Synthetic Alien" || role.name === "Zerb" || role.name === "Groob" || role.name === "Body Snatcher")) {
        randomActions = randomActions.filter(action => action.name !== "alien_exchange");
    }
    if (alienExchangeAlreadyAsked) {
        randomActions = randomActions.filter(action => action.name !== "alien_exchange");
    }
    selectedQuestion = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[0];
    if (selectedQuestion.name === "alien_exchange") {
        alienExchangeAlreadyAsked = true;
    }

    document.querySelector(".oracle-picker").innerHTML = "";

    const questionText = document.createElement("div");
    questionText.classList.add("oracle-picker-question");
    questionText.textContent = selectedQuestion.question.replace("x", selectedEvilTeam);
    document.querySelector(".oracle-picker").append(questionText);

    const answerContainer = document.createElement("div");
    answerContainer.classList.add("oracle-picker-answers");
    document.querySelector(".oracle-picker").append(answerContainer);

    for (const answer of ["Ja", "Nein"]) {
        const button = document.createElement("button");
        button.classList.add("oracle-picker-button");
        button.textContent = answer;
        answerContainer.append(button);

        button.addEventListener("click", () => {
            for (const answerButton of answerContainer.children) {
                answerButton.classList.remove("selected");
            }
            button.classList.add("selected");
            selectedAnswer = answer;
        });
    }

    if (selectedQuestion.name === "join_evil_team") {
        await speak("./voices/oracle/questions/" + selectedEvilTeam + " werden.mp3");
    }
    if (selectedQuestion.name === "alien_exchange") {
        await speak("./voices/oracle/questions/aliens_exchange_cards.mp3");
    }
}

/**
 * Evaluates the Oracle's selected answer and announces the matching result text.
 */
async function oracleQuestionEvaluation(nightPhaseText) {
    document.querySelector(".oracle-picker").innerHTML = "";

    if (!selectedAnswer) {
        if (Math.random() < 0.5) selectedAnswer = "Ja";
        else selectedAnswer = "Nein";
    }

    const answeredYes = selectedAnswer === "Ja";
    nightPhaseText.textContent = (answeredYes ? selectedQuestion.answers[0] : selectedQuestion.answers[1]).replace("x", selectedEvilTeam);

    if (selectedQuestion.name === "join_evil_team") {
        await speak("./voices/oracle/answers/" + (answeredYes ? "werde " + selectedEvilTeam + (doppelgangerOracleIsAnswering ? " Doppelganger" : "") : (!doppelgangerOracleIsAnswering ? "stay Oracle" : "stay Doppelganger Oracle")) + ".mp3");
    }
    if (selectedQuestion.name === "alien_exchange") {
        await speak("./voices/oracle/answers/" + (answeredYes ? "alien_swap_yes" : "alien_swap_no") + ".mp3");
        alienExchangeDecision = answeredYes;
    }
    await sleep(0.5);

    selectedAnswer = null;
    selectedQuestion = null;
    doppelgangerOracleIsAnswering = true;
}

/**
 * Returns the Oracle's alien_exchange decision (true = forced swap, false = no swap,
 * null = question was not asked) and resets it so it only applies to the next Alien phase.
 */
function consumeAlienExchangeDecision() {
    const decision = alienExchangeDecision;
    alienExchangeDecision = null;
    return decision;
}

export {oracleQuestionEvaluation, renderOraclePicker, consumeAlienExchangeDecision};
