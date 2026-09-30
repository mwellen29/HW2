import { WORDS_BY_LENGTH } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let wordLength = 5;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = "";
let hintsUsed = false;

function resetGame() {
    guessesRemaining = NUMBER_OF_GUESSES;
    currentGuess = [];
    nextLetter = 0;
    hintsUsed = false;

    const wordList = WORDS_BY_LENGTH[wordLength] || WORDS_BY_LENGTH[5];
    rightGuessString = wordList[Math.floor(Math.random() * wordList.length)];

    initBoard();
    resetKeyboard();
}

function initBoard() {
    let board = document.getElementById("game-board");
    if (!board) return;
    board.innerHTML = "";

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < wordLength; j++) {
            let box = document.createElement("div");
            box.className = "letter-box";
            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

function resetKeyboard() {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        elem.style.backgroundColor = "#f0f0f0";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    resetGame();

    document.getElementById("word-length-select")?.addEventListener("change", (e) => {
        wordLength = parseInt(e.target.value);
        resetGame();
    });

    document.getElementById("hint-button")?.addEventListener("click", () => {
        if (hintsUsed) {
            toastr.info("You already used your hint for this round!");
            return;
        }
        if (guessesRemaining === 0) return;

        let unrevealedIndices = [];
        for (let i = 0; i < wordLength; i++) {
            if (currentGuess[i] !== rightGuessString[i]) {
                unrevealedIndices.push(i);
            }
        }

        if (unrevealedIndices.length > 0) {
            let randomIndex = unrevealedIndices[0];
            let letterToReveal = rightGuessString[randomIndex];
            toastr.info(`Hint: Letter #${randomIndex + 1} is "${letterToReveal.toUpperCase()}"`);
            hintsUsed = true;
        }
    });
});

document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) return;

    let pressedKey = String(e.key);

    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess();
        return;
    }

    let found = pressedKey.match(/[a-z]/gi);
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
});

function insertLetter(pressedKey) {
    if (nextLetter === wordLength) return;

    pressedKey = pressedKey.toLowerCase();
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let box = row.children[nextLetter];

    animateCSS(box, "pulse");
    box.textContent = pressedKey;
    box.classList.add("filled-box");

    currentGuess.push(pressedKey);
    nextLetter += 1;
}

function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let box = row.children[nextLetter - 1];

    box.textContent = "";
    box.classList.remove("filled-box");

    currentGuess.pop();
    nextLetter -= 1;
}

function checkGuess() {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let guessString = currentGuess.join('');
    let rightGuess = Array.from(rightGuessString);
    const wordList = WORDS_BY_LENGTH[wordLength];

    if (guessString.length !== wordLength) {
        toastr.error("Not enough letters!");
        return;
    }

    if (!wordList.includes(guessString)) {
        toastr.error("Word not in list!");
        return;
    }

    for (let i = 0; i < wordLength; i++) {
        let letterColor = '';
        let box = row.children[i];
        let letter = currentGuess[i];
        let letterPosition = rightGuess.indexOf(currentGuess[i]);

        if (letterPosition === -1) {
            letterColor = 'grey';
        } else {
            if (currentGuess[i] === rightGuess[i]) {
                letterColor = 'green';
            } else {
                letterColor = 'yellow';
            }
            rightGuess[letterPosition] = "#";
        }

        let delay = 250 * i;

        setTimeout(() => {
            animateCSS(box, 'flipInX');
            box.style.backgroundColor = letterColor;
            shadeKeyBoard(letter, letterColor);
        }, delay);
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game over!");
        guessesRemaining = 0;
        return;
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!");
            toastr.info(`The right word was: "${rightGuessString}"`);
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor;
            if (oldColor === 'green') return;
            if (oldColor === 'yellow' && color !== 'green') return;

            elem.style.backgroundColor = color;
            break;
        }
    }
}

document.getElementById("keyboard-cont")?.addEventListener("click", (e) => {
    const target = e.target;
    if (!target.classList.contains("keyboard-button")) return;

    let key = target.textContent;
    if (key === "Del") key = "Backspace";

    document.dispatchEvent(new KeyboardEvent("keyup", { 'key': key }));
});

const animateCSS = (element, animation, prefix = 'animate_') =>
    new Promise((resolve) => {
        const animationName = `${prefix}${animation}`;
        const node = element;

        node.style.setProperty('--animate-duration', '0.3s');
        node.classList.add(`${prefix}animated`, animationName);

        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
        }

        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });