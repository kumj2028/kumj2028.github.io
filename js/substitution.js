function substitutionCipher(text, key, encrypt = true) {
    // Validate key: 26 unique alphabetic characters
    if (!/^[a-zA-Z]{26}$/.test(key)) {
        return { error: "Invalid key: Key must be exactly 26 alphabetic characters." };
    }
    const keyLower = key.toLowerCase();
    const uniqueChars = new Set(keyLower);
    if (uniqueChars.size !== 26) {
        return { error: "Invalid key: Key must contain 26 unique alphabetic characters." };
    }

    const alphabetLower = "abcdefghijklmnopqrstuvwxyz";
    const alphabetUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    let sourceAlphabet, targetAlphabet;
    if (encrypt) {
        sourceAlphabet = alphabetLower;
        targetAlphabet = keyLower;
    } else { // Decrypt
        sourceAlphabet = keyLower;
        targetAlphabet = alphabetLower;
    }

    const map = {};
    for (let i = 0; i < 26; i++) {
        map[sourceAlphabet[i]] = targetAlphabet[i];
        map[sourceAlphabet[i].toUpperCase()] = targetAlphabet[i].toUpperCase();
    }

    let resultText = text.split("").map(char => {
        return map[char] || char; // Substitute if in map, otherwise keep original
    }).join("");

    return { result: resultText };
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
    // Encryption
    const encryptBtn = document.getElementById("subst-encrypt-btn");
    if (encryptBtn) {
        encryptBtn.addEventListener("click", () => {
            const text = document.getElementById("subst-encrypt-text").value;
            const keyInput = document.getElementById("subst-encrypt-key");
            const outputArea = document.getElementById("subst-encrypt-output");
            const errorArea = document.getElementById("subst-encrypt-error");
            errorArea.textContent = "";
            outputArea.value = "";

            const key = keyInput.value;
            const result = substitutionCipher(text, key, true);

            if (result.error) {
                errorArea.textContent = result.error;
            } else {
                outputArea.value = result.result;
            }
        });
    }

    // Decryption - Step 1: Frequency Analysis
    const analyzeBtn = document.getElementById("subst-decrypt-btn");
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", () => {
            const ciphertext = document.getElementById("subst-decrypt-text").value;
            const outputDiv = document.getElementById("subst-decrypt-output");
            const keyGuessInput = document.getElementById("subst-decrypt-key-guess");
            const errorArea = document.getElementById("subst-decrypt-error");
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
    const applyKeyBtn = document.getElementById("subst-apply-key-btn");
    if (applyKeyBtn) {
        applyKeyBtn.addEventListener("click", () => {
            const ciphertext = document.getElementById("subst-decrypt-text").value;
            const keyInput = document.getElementById("subst-decrypt-key-guess");
            const outputArea = document.getElementById("subst-decrypt-final-output");
            const errorArea = document.getElementById("subst-decrypt-error"); // Use the same error area
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

