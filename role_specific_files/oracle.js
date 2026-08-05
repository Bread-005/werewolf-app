import {sleep, speak, waitCycle} from "../main.js";
import {storage, buildWeightedActionPool} from "../storage.js";

let selectedAnswer = null;
let selectedEvilTeam = "";
let selectedQuestion = null;
let selectedCorrectNumber = null;
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
    selectedQuestion = randomActions.sort(() => Math.random() - 0.5)[0] || phase.randomActions[2];
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

    if (selectedQuestion.name === "guess_number") {
        selectedCorrectNumber = Math.floor(Math.random() * 5) + 1;

        for (let number = 1; number <= 5; number++) {
            const button = document.createElement("button");
            button.classList.add("oracle-picker-button", "oracle-picker-button-number");
            button.textContent = number.toString();
            answerContainer.append(button);

            button.addEventListener("click", () => {
                for (const numberButton of answerContainer.children) {
                    numberButton.classList.remove("selected");
                }
                button.classList.add("selected");
                selectedAnswer = number.toString();
            });
        }
    } else {
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
    }

    if (selectedQuestion.name === "join_evil_team") {
        await speak("./voices/oracle/questions/" + selectedEvilTeam + " werden.mp3");
    }
    if (selectedQuestion.name === "alien_exchange") {
        await speak("./voices/oracle/questions/aliens_exchange_cards.mp3");
    }
    if (selectedQuestion.name === "center_exchange") {
        await speak("./voices/oracle/questions/center_exchange.mp3");
    }
    if (selectedQuestion.name === "guess_number") {
        await speak("./voices/oracle/questions/guess_number.mp3");
    }
}

/**
 * Evaluates the Oracle's selected answer and announces the matching result text.
 */
async function oracleQuestionEvaluation(nightPhaseText) {
    document.querySelector(".oracle-picker").innerHTML = "";

    if (selectedQuestion.name === "guess_number") {
        const guessedCorrectly = !selectedAnswer || Number(selectedAnswer) === selectedCorrectNumber;
        nightPhaseText.textContent = guessedCorrectly ? selectedQuestion.answers[0] : selectedQuestion.answers[1];
        await speak("./voices/oracle/answers/guess_number_" + (guessedCorrectly ? "correct" : "wrong") + ".mp3");

        if (guessedCorrectly) {
            await waitCycle({name: "oracle"}, nightPhaseText);
        }
        selectedCorrectNumber = null;
    } else {
        if (!selectedAnswer) {
            if (Math.random() < 0.5) {
                selectedAnswer = "Ja";
            } else {
                selectedAnswer = "Nein";
            }
        }

        const answeredYes = selectedAnswer === "Ja";
        nightPhaseText.textContent = (answeredYes ? selectedQuestion.answers[0] : selectedQuestion.answers[1]).replace("x", selectedEvilTeam);

        if (selectedQuestion.name === "join_evil_team") {
            await speak("./voices/oracle/answers/" + (answeredYes ? "werde " + selectedEvilTeam + (doppelgangerOracleIsAnswering ? " Doppelganger" : "") : (!doppelgangerOracleIsAnswering ? "stay Oracle" : "stay Doppelganger Oracle")) + ".mp3");
        }
        if (selectedQuestion.name === "alien_exchange") {
            await speak("./voices/oracle/answers/alien_swap_" + (answeredYes ? "yes" : "no") + ".mp3");
            alienExchangeDecision = answeredYes;
        }
        if (selectedQuestion.name === "center_exchange") {
            await speak("./voices/oracle/answers/center_exchange_" + (answeredYes ? "yes" : "no") + ".mp3");

            if (answeredYes) {
                await waitCycle({name: "oracle"}, nightPhaseText);
            }
        }
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
