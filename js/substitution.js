/**
 * Generate a random 26-letter substitution key (A–Z shuffled)
 */
function generateRandomKey() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letters = alphabet.split("");
    // Fisher–Yates shuffle
    for (let i = letters.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("");
}

/**
 * Perform a substitution cipher on `text` using `key`.
 * `key` should be a 26-char string mapping A→key[0], B→key[1], … 
 */
function substitutionCipher(text, key, encode = true) {
    const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const mapIn  = encode ? A : key.toUpperCase();
    const mapOut = encode ? key.toUpperCase() : A;
    return text
        .toUpperCase()
        .split("")
        .map(ch => {
          const idx = mapIn.indexOf(ch);
          return idx >= 0 ? mapOut[idx] : ch;
        })
        .join("");
}

// Standard English letter frequencies (approximate, from Wikipedia/common sources)
const englishFrequencies = {
    'E': 12.70, 'T': 9.06, 'A': 8.17, 'O': 7.51, 'I': 6.97, 'N': 6.75,
    'S': 6.33, 'H': 6.09, 'R': 5.99, 'D': 4.25, 'L': 4.03, 'C': 2.78,
    'U': 2.76, 'M': 2.41, 'W': 2.36, 'F': 2.23, 'G': 2.02, 'Y': 1.97,
    'P': 1.93, 'B': 1.29, 'V': 0.98, 'K': 0.77, 'J': 0.15, 'X': 0.15,
    'Q': 0.10, 'Z': 0.07
};
const sortedEnglishFreq = Object.entries(englishFrequencies).sort(([, a], [, b]) => b - a).map(([letter]) => letter);

// Function to perform frequency analysis
function frequencyAnalysis(text) {
    const upperText = text.toUpperCase().replace(/[^A-Z]/g, "");
    if (!upperText) {
        return { frequencies: {}, sortedLetters: [], suggestedKey: "" };
    }

    const counts = {};
    for (let i = 0; i < 26; i++) {
        counts[String.fromCharCode(65 + i)] = 0;
    }

    for (let char of upperText) {
        counts[char]++;
    }

    const totalLetters = upperText.length;
    const frequencies = {};
    for (let letter in counts) {
        frequencies[letter] = totalLetters > 0 ? (counts[letter] / totalLetters * 100) : 0;
    }

    // Sort ciphertext letters by frequency
    const sortedCipherLetters = Object.entries(frequencies).sort(([, a], [, b]) => b - a).map(([letter]) => letter);

    // Generate suggested key by mapping frequent cipher letters to frequent English letters
    const suggestedKeyMap = {};
    for (let i = 0; i < 26; i++) {
        suggestedKeyMap[sortedCipherLetters[i]] = sortedEnglishFreq[i];
    }

    // Build the key string (A->Z)
    let suggestedKey = "";
    for (let i = 0; i < 26; i++) {
        const cipherLetter = String.fromCharCode(65 + i);
        suggestedKey += suggestedKeyMap[cipherLetter] || "."; // Use '.' if a letter wasn't found (shouldn't happen)
    }

    return { frequencies, sortedLetters: sortedCipherLetters, suggestedKey };
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    const keyInput    = document.getElementById("substitution-key");
    const randKeyBtn  = document.getElementById("substitution-random-key-btn");
    const encryptBtn  = document.getElementById("substitution-encrypt-btn");
    const inputArea   = document.getElementById("substitution-input");
    const outputArea  = document.getElementById("substitution-output");
    const analyzeBtn = document.getElementById("subst-decrypt-btn");
    const applyKeyBtn = document.getElementById("subst-apply-key-btn");
    const ciphertext = document.getElementById("subst-decrypt-text").value;
    const outputDiv = document.getElementById("subst-decrypt-output");
    const keyGuessInput = document.getElementById("subst-decrypt-key-guess");
    const errorArea = document.getElementById("subst-decrypt-error");

    // Random Key Button
    if (randKeyBtn && keyInput) {
        randKeyBtn.addEventListener("click", () => {
            keyInput.value = generateRandomKey();
        });
    }
    
    // Encryption
    if (encryptBtn) {
        encryptBtn.addEventListener("click", () => {
            const key  = keyInput.value.trim();
            const text = inputArea.value;
            if (key.length !== 26) {
                alert("Key must be exactly 26 letters A-Z.");
                return;
            }
            outputArea.value = substitutionCipher(text, key, true);
        });
    }

    // Decryption - Step 1: Frequency Analysis
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", () => {
            outputDiv.innerHTML = "";
            keyGuessInput.value = "";
            errorArea.textContent = "";

            if (!ciphertext) {
                errorArea.textContent = "Please enter ciphertext to analyze.";
                return;
            }

            const analysis = frequencyAnalysis(ciphertext);

            // Display frequency table
            let tableHTML = "<h4>Ciphertext Letter Frequency vs. Standard English:</h4>";
            tableHTML += "<table><thead><tr><th>Cipher Letter</th><th>Frequency (%)</th><th>Mapped English Letter (Guess)</th><th>Standard English Freq (%)</th></tr></thead><tbody>";
            const sortedAnalysis = Object.entries(analysis.frequencies).sort(([, a], [, b]) => b - a);

            for (let i = 0; i < sortedAnalysis.length; i++) {
                const [cipherLetter, freq] = sortedAnalysis[i];
                const englishLetterGuess = sortedEnglishFreq[i];
                const standardFreq = englishFrequencies[englishLetterGuess];
                tableHTML += `<tr><td>${cipherLetter}</td><td>${freq.toFixed(2)}%</td><td>${englishLetterGuess}</td><td>${standardFreq.toFixed(2)}%</td></tr>`;
            }
            tableHTML += "</tbody></table>";
            outputDiv.innerHTML = tableHTML;

            // Populate suggested key (needs inverse mapping for decryption key)
            const decryptKeyMap = {};
            for(let i=0; i<26; i++) {
                decryptKeyMap[sortedEnglishFreq[i]] = analysis.sortedLetters[i];
            }
            let decryptKey = "";
            for(let i=0; i<26; i++) {
                const englishLetter = String.fromCharCode(65 + i);
                decryptKey += decryptKeyMap[englishLetter] || ".";
            }
            keyGuessInput.value = decryptKey.toUpperCase(); // Show the key needed to decrypt

        });
    }

    // Decryption - Step 2: Apply Key
    if (applyKeyBtn) {
        applyKeyBtn.addEventListener("click", () => {
            errorArea.textContent = "";
            outputArea.value = "";

            if (!ciphertext) {
                errorArea.textContent = "Please enter ciphertext first.";
                return;
            }

            const key = keyInput.value;
            // Decrypt using the provided key
            const result = substitutionCipher(ciphertext, key, false);

            if (result.error) {
                errorArea.textContent = result.error;
            } else {
                outputArea.value = result.result;
            }
        });
    }
});

