function caesarCipher(text, shift) {
  // Ensure shift is within 0-25 range for calculation
  const actualShift = (shift % 26 + 26) % 26;
  return text.split("").map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = code < 97 ? 65 : 97; // 65 for uppercase A, 97 for lowercase a
      return String.fromCharCode(base + (code - base + actualShift) % 26);
    }
    return char;
  }).join("");
}

let wordList = new Set();

// Function to load the word list
async function loadWordList() {
    try {
        const response = await fetch("js/english_words.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const words = await response.json();
        wordList = new Set(words.map(word => word.toLowerCase()));
        console.log("Word list loaded successfully.");
    } catch (error) {
        console.error("Failed to load word list:", error);
        // Optionally inform the user on the page
        const errorArea = document.getElementById("caesar-decrypt-error");
        if(errorArea) errorArea.textContent = "Failed to load dictionary for analysis.";
    }
}

// Function to count dictionary words in a text
function countDictionaryWords(text) {
    if (wordList.size === 0) return 0; // Dictionary not loaded
    const wordsInText = text.toLowerCase().match(/[a-z]+/g) || [];
    let count = 0;
    wordsInText.forEach(word => {
        if (wordList.has(word)) {
            count++;
        }
    });
    return count;
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    loadWordList(); // Load the dictionary when the page loads

    // Encryption
    const encryptBtn = document.getElementById("caesar-encrypt-btn");
    if (encryptBtn) {
        encryptBtn.addEventListener("click", () => {
            const text = document.getElementById("caesar-encrypt-text").value;
            const shiftInput = document.getElementById("caesar-encrypt-shift");
            const outputArea = document.getElementById("caesar-encrypt-output");
            const errorArea = document.getElementById("caesar-encrypt-error");
            errorArea.textContent = ""; // Clear previous errors
            outputArea.value = ""; // Clear previous output

            const shift = parseInt(shiftInput.value, 10);

            if (isNaN(shift) || shift < 1 || shift > 25) {
                errorArea.textContent = "Shift must be a number between 1 and 25.";
            } else {
                outputArea.value = caesarCipher(text, shift);
            }
        });
    }

    // Decryption (Brute-Force with Dictionary Analysis)
    const decryptBtn = document.getElementById("caesar-decrypt-btn");
    if (decryptBtn) {
        decryptBtn.addEventListener("click", () => {
            const ciphertext = document.getElementById("caesar-decrypt-text").value;
            const outputDiv = document.getElementById("caesar-decrypt-output");
            const errorArea = document.getElementById("caesar-decrypt-error");
            outputDiv.innerHTML = ""; // Clear previous results
            errorArea.textContent = ""; // Clear previous errors

            if (!ciphertext) {
                errorArea.textContent = "Please enter ciphertext to decrypt.";
                return;
            }
            if (wordList.size === 0) {
                 errorArea.textContent = "Dictionary not loaded. Cannot perform analysis.";
                 // Optionally, still show basic brute force results
            }

            outputDiv.innerHTML = "<h4>Attempting all possible shifts (1-25) with dictionary analysis:</h4>";
            const resultsTable = document.createElement("table");
            resultsTable.innerHTML = "<thead><tr><th>Shift</th><th>Dictionary Words Found</th><th>Decrypted Text Snippet</th></tr></thead><tbody></tbody>";
            const tbody = resultsTable.querySelector("tbody");

            let bestShift = -1;
            let maxWordsFound = -1;
            let results = [];

            for (let shift = 1; shift <= 25; shift++) {
                const decryptedText = caesarCipher(ciphertext, -shift);
                const wordsFound = countDictionaryWords(decryptedText);
                results.push({ shift, wordsFound, decryptedText });

                if (wordsFound > maxWordsFound) {
                    maxWordsFound = wordsFound;
                    bestShift = shift;
                }
            }

            // Sort results by words found (descending)
            results.sort((a, b) => b.wordsFound - a.wordsFound);

            results.forEach(result => {
                const row = tbody.insertRow();
                row.insertCell().textContent = result.shift;
                row.insertCell().textContent = result.wordsFound;
                const snippetCell = row.insertCell();
                snippetCell.textContent = result.decryptedText.length > 80 ? result.decryptedText.substring(0, 80) + "..." : result.decryptedText;
                snippetCell.title = result.decryptedText; // Show full text on hover

                // Highlight the best guess
                if (result.shift === bestShift && maxWordsFound > 0) {
                    row.style.fontWeight = "bold";
                    row.style.backgroundColor = "#e7f4e7";
                }
            });

            outputDiv.appendChild(resultsTable);

            if (maxWordsFound <= 0 && wordList.size > 0) {
                 outputDiv.innerHTML += "<p>No significant number of dictionary words found for any shift. The text might not be simple English Caesar cipher.</p>";
            } else if (bestShift !== -1) {
                 outputDiv.innerHTML += `<p><strong>Best Guess:</strong> Shift ${bestShift} (found ${maxWordsFound} dictionary words).</p>`;
            }
        });
    }
});

