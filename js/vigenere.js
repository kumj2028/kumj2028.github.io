function vigenereCipher(text, key, encrypt = true) {
  if (!/^[a-zA-Z]+$/.test(key)) {
    return { error: "Invalid key: Key must contain only alphabetic characters." };
  }
  let keyIndex = 0;
  const keyLower = key.toLowerCase();

  const resultText = text.split("").map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = code < 97 ? 65 : 97; // 65 for uppercase A, 97 for lowercase a
      const keyChar = keyLower[keyIndex % keyLower.length];
      const keyShift = keyChar.charCodeAt(0) - 97; // Get shift value (0-25) from key character
      keyIndex++; // Move to the next key character only for alphabetic plaintext characters

      let shiftedCode;
      if (encrypt) {
        shiftedCode = base + (code - base + keyShift) % 26;
      } else { // Decrypt
        shiftedCode = base + (code - base - keyShift + 26) % 26; // Add 26 to handle negative results
      }
      return String.fromCharCode(shiftedCode);
    }
    return char; // Keep non-alphabetic characters unchanged
  }).join("");
  return { result: resultText };
}

// --- Kasiski Examination & Decryption Analysis ---

// Standard English letter frequencies (approximate)
const englishFrequencies = [
    0.08167, 0.01492, 0.02782, 0.04253, 0.12702, 0.02228, 0.02015, // A-G
    0.06094, 0.06966, 0.00153, 0.00772, 0.04025, 0.02406, 0.06749, // H-N
    0.07507, 0.01929, 0.00095, 0.05987, 0.06327, 0.09056, 0.02758, // O-U
    0.00978, 0.02360, 0.00150, 0.01974, 0.00074  // V-Z
];

// Helper function: Greatest Common Divisor (GCD)
function gcd(a, b) {
    while (b) {
        a = a % b;
        [a, b] = [b, a]; // Swap
    }
    return a;
}

// Helper function: Find factors of a number
function getFactors(num) {
    const factors = new Set();
    for (let i = 2; i * i <= num; i++) {
        if (num % i === 0) {
            factors.add(i);
            factors.add(num / i);
        }
    }
    return Array.from(factors).sort((a, b) => a - b);
}

// Kasiski Examination: Find repeated sequences and distances
function kasiskiExamination(text, minLen = 3, maxLen = 5) {
    const sequences = {};
    const distances = [];
    const upperText = text.toUpperCase().replace(/[^A-Z]/g, "");

    for (let len = minLen; len <= maxLen; len++) {
        for (let i = 0; i <= upperText.length - len; i++) {
            const seq = upperText.substring(i, i + len);
            if (sequences[seq]) {
                sequences[seq].push(i);
            } else {
                sequences[seq] = [i];
            }
        }
    }

    const sequenceDistances = {};
    for (const seq in sequences) {
        const positions = sequences[seq];
        if (positions.length > 1) {
            sequenceDistances[seq] = [];
            for (let i = 1; i < positions.length; i++) {
                const dist = positions[i] - positions[0]; // Distance from the first occurrence
                distances.push(dist);
                sequenceDistances[seq].push(dist);
            }
        }
    }
    return { distances, sequenceDistances };
}

// Calculate likely key lengths based on GCDs of distances
function findLikelyKeyLengths(distances, maxKeyLength = 20) {
    if (distances.length === 0) return [];
    const factorCounts = {};
    let totalFactors = 0;

    distances.forEach(dist => {
        const factors = getFactors(dist);
        factors.forEach(factor => {
            if (factor <= maxKeyLength) {
                factorCounts[factor] = (factorCounts[factor] || 0) + 1;
                totalFactors++;
            }
        });
    });

    // Score factors based on frequency
    const sortedFactors = Object.entries(factorCounts)
        .map(([factor, count]) => ({ length: parseInt(factor), score: count }))
        .sort((a, b) => b.score - a.score);

    return sortedFactors;
}

// Calculate Index of Coincidence (IoC)
function calculateIoC(text) {
    const upperText = text.toUpperCase().replace(/[^A-Z]/g, "");
    const n = upperText.length;
    if (n < 2) return 0;

    const counts = {};
    for (let i = 0; i < 26; i++) {
        counts[String.fromCharCode(65 + i)] = 0;
    }
    for (let char of upperText) {
        counts[char]++;
    }

    let sum = 0;
    for (let char in counts) {
        const ni = counts[char];
        sum += ni * (ni - 1);
    }

    return sum / (n * (n - 1));
}

// Find key length using IoC method
function findKeyLengthIoC(text, maxKeyLength = 20) {
    const upperText = text.toUpperCase().replace(/[^A-Z]/g, "");
    const results = [];
    const englishIoC = 0.0667; // Approximate IoC for English text

    for (let keyLen = 1; keyLen <= maxKeyLength; keyLen++) {
        let avgIoC = 0;
        for (let i = 0; i < keyLen; i++) {
            let subtext = "";
            for (let j = i; j < upperText.length; j += keyLen) {
                subtext += upperText[j];
            }
            avgIoC += calculateIoC(subtext);
        }
        avgIoC /= keyLen;
        results.push({ length: keyLen, score: Math.abs(avgIoC - englishIoC) }); // Lower score is better
    }

    results.sort((a, b) => a.score - b.score);
    return results;
}


// Frequency analysis for a single Caesar-shifted column
function analyzeCaesarColumn(columnText) {
    const n = columnText.length;
    if (n === 0) return 0; // Default shift 0 (A)

    const counts = Array(26).fill(0);
    for (let char of columnText) {
        counts[char.charCodeAt(0) - 65]++;
    }

    let bestShift = 0;
    let minChiSquared = Infinity;

    // Try all 26 possible shifts
    for (let shift = 0; shift < 26; shift++) {
        let chiSquared = 0;
        const shiftedCounts = Array(26).fill(0);

        // Apply the shift to the counts
        for(let i=0; i<26; i++) {
            shiftedCounts[(i + shift) % 26] = counts[i];
        }

        // Calculate Chi-squared statistic against English frequencies
        for (let i = 0; i < 26; i++) {
            const expected = englishFrequencies[i] * n;
            const observed = shiftedCounts[i];
            if (expected === 0) continue; // Avoid division by zero
            chiSquared += Math.pow(observed - expected, 2) / expected;
        }

        if (chiSquared < minChiSquared) {
            minChiSquared = chiSquared;
            bestShift = shift;
        }
    }
    return bestShift;
}

// Guess the Vigenere key using frequency analysis for a given key length
function guessVigenereKey(text, keyLength) {
    const upperText = text.toUpperCase().replace(/[^A-Z]/g, "");
    let guessedKey = "";

    for (let i = 0; i < keyLength; i++) {
        let columnText = "";
        for (let j = i; j < upperText.length; j += keyLength) {
            columnText += upperText[j];
        }
        const shift = analyzeCaesarColumn(columnText);
        guessedKey += String.fromCharCode(65 + shift); // Convert shift (0-25) back to letter (A-Z)
    }
    return guessedKey;
}


// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    // Encryption
    const encryptBtn = document.getElementById("vig-encrypt-btn");
    if (encryptBtn) {
        encryptBtn.addEventListener("click", () => {
            const text = document.getElementById("vig-encrypt-text").value;
            const keyInput = document.getElementById("vig-encrypt-key");
            const outputArea = document.getElementById("vig-encrypt-output");
            const errorArea = document.getElementById("vig-encrypt-error");
            errorArea.textContent = "";
            outputArea.value = "";

            const key = keyInput.value;
            const result = vigenereCipher(text, key, true);

            if (result.error) {
                errorArea.textContent = result.error;
            } else {
                outputArea.value = result.result;
            }
        });
    }

    // Decryption Analysis
    const analyzeBtn = document.getElementById("vig-decrypt-btn");
    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", () => {
            const ciphertext = document.getElementById("vig-decrypt-text").value;
            const outputDiv = document.getElementById("vig-decrypt-output");
            const keyGuessInput = document.getElementById("vig-decrypt-key-guess");
            const errorArea = document.getElementById("vig-decrypt-error");
            const finalOutputArea = document.getElementById("vig-decrypt-final-output");

            outputDiv.innerHTML = "";
            keyGuessInput.value = "";
            errorArea.textContent = "";
            finalOutputArea.value = "";

            if (!ciphertext) {
                errorArea.textContent = "Please enter ciphertext to analyze.";
                return;
            }

            let analysisHTML = "";

            // 1. Kasiski Examination
            analysisHTML += "<h4>Kasiski Examination Results:</h4>";
            const kasiskiResult = kasiskiExamination(ciphertext);
            if (kasiskiResult.distances.length > 0) {
                analysisHTML += `<p>Distances between repeated sequences (>=3 chars): ${kasiskiResult.distances.join(", ")}</p>`;
                const likelyLengthsKasiski = findLikelyKeyLengths(kasiskiResult.distances);
                if (likelyLengthsKasiski.length > 0) {
                    analysisHTML += `<p>Likely key lengths based on GCDs (Top 5): ${likelyLengthsKasiski.slice(0, 5).map(item => `${item.length} (score: ${item.score})`).join(", ")}</p>`;
                } else {
                    analysisHTML += "<p>Could not determine likely key lengths from Kasiski distances.</p>";
                }
            } else {
                analysisHTML += "<p>No significant repeated sequences found for Kasiski examination.</p>";
            }

            // 2. Index of Coincidence (IoC)
            analysisHTML += "<h4>Index of Coincidence (IoC) Analysis:</h4>";
            const likelyLengthsIoC = findKeyLengthIoC(ciphertext);
             if (likelyLengthsIoC.length > 0) {
                 analysisHTML += `<p>Likely key lengths based on IoC (Lower score is better, Top 5): ${likelyLengthsIoC.slice(0, 5).map(item => `${item.length} (score: ${item.score.toFixed(4)})`).join(", ")}</p>`;
             } else {
                 analysisHTML += "<p>Could not determine likely key lengths from IoC analysis.</p>";
             }

            // 3. Guess Key based on top IoC result
            let guessedKey = "";
            if (likelyLengthsIoC.length > 0) {
                const bestKeyLength = likelyLengthsIoC[0].length;
                analysisHTML += `<p>Attempting frequency analysis assuming key length = ${bestKeyLength} (from IoC result).</p>`;
                guessedKey = guessVigenereKey(ciphertext, bestKeyLength);
                keyGuessInput.value = guessedKey;
                analysisHTML += `<p><strong>Guessed Key: ${guessedKey}</strong></p>`;
            } else {
                 analysisHTML += "<p>Cannot guess key without a likely key length.</p>";
            }

            outputDiv.innerHTML = analysisHTML;
        });
    }

    // Decryption - Apply Guessed Key
    const applyKeyBtn = document.getElementById("vig-apply-key-btn");
    if (applyKeyBtn) {
        applyKeyBtn.addEventListener("click", () => {
            const ciphertext = document.getElementById("vig-decrypt-text").value;
            const keyInput = document.getElementById("vig-decrypt-key-guess");
            const outputArea = document.getElementById("vig-decrypt-final-output");
            const errorArea = document.getElementById("vig-decrypt-error"); // Use the same error area
            errorArea.textContent = "";
            outputArea.value = "";

            if (!ciphertext) {
                errorArea.textContent = "Please enter ciphertext first.";
                return;
            }
            const key = keyInput.value;
            if (!key) {
                errorArea.textContent = "No key guessed or provided.";
                return;
            }

            // Decrypt using the guessed key
            const result = vigenereCipher(ciphertext, key, false);

            if (result.error) {
                errorArea.textContent = result.error;
            } else {
                outputArea.value = result.result;
            }
        });
    }
});

