// caesar.js

function caesarCipher(text, shift) {
    // Ensure shift is within 0-25 range for calculation
    const actualShift = (shift % 26 + 26) % 26;
    return text
      .split("")
      .map((char) => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const base = code < 97 ? 65 : 97; // 65 for 'A', 97 for 'a'
          return String.fromCharCode(
            base + ((code - base + actualShift) % 26)
          );
        }
        return char;
      })
      .join("");
  }
  
  let wordList = new Set();
  
  // Load English dictionary for brute-force analysis
  async function loadWordList() {
    try {
      const response = await fetch("js/english_words.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const words = await response.json();
      wordList = new Set(words.map((w) => w.toLowerCase()));
      console.log("Word list loaded");
    } catch (err) {
      console.error("Failed to load word list:", err);
      const errorArea = document.getElementById("caesar-decrypt-error");
      if (errorArea)
        errorArea.textContent = "Dictionary load failed; analysis unavailable.";
    }
  }
  
  // Count how many real English words appear in a snippet
  function countDictionaryWords(text) {
    if (wordList.size === 0) return 0;
    const tokens = text.toLowerCase().match(/[a-z]+/g) || [];
    return tokens.reduce(
      (count, w) => (wordList.has(w) ? count + 1 : count),
      0
    );
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    loadWordList();
  
    // —— Random-Shift Button ——
    const shiftInput = document.getElementById("caesar-encrypt-shift");
    const randomShiftBtn = document.getElementById("caesar-random-shift-btn");
    if (randomShiftBtn && shiftInput) {
      randomShiftBtn.addEventListener("click", () => {
        // pick an integer from 0 to 25
        const rand = Math.floor(Math.random() * 26);
        shiftInput.value = rand;
      });
    }
  
    // —— Encryption ——
    const encryptBtn = document.getElementById("caesar-encrypt-btn");
    if (encryptBtn) {
      encryptBtn.addEventListener("click", () => {
        const text = document.getElementById("caesar-encrypt-text").value;
        const shift = parseInt(shiftInput.value, 10) || 0;
        const output = caesarCipher(text, shift);
        document.getElementById("caesar-encrypt-output").value = output;
      });
    }
  
    // —— Decryption (Brute-Force + Dictionary) ——
    const decryptBtn = document.getElementById("caesar-decrypt-btn");
    if (decryptBtn) {
      decryptBtn.addEventListener("click", () => {
        const ciphertext = document.getElementById("caesar-decrypt-text").value;
        const outputDiv = document.getElementById("caesar-decrypt-output");
        const errorArea = document.getElementById("caesar-decrypt-error");
        outputDiv.innerHTML = "";
        errorArea.textContent = "";
  
        if (!ciphertext) {
          errorArea.textContent = "Please enter ciphertext to decrypt.";
          return;
        }
        if (wordList.size === 0) {
          errorArea.textContent =
            "Dictionary not loaded; cannot perform analysis.";
          // You could still show raw brute-force results here if desired
        }
  
        outputDiv.innerHTML =
          "<h4>Trying all shifts 1–25 (showing dictionary match count)…</h4>";
  
        // build results table
        const table = document.createElement("table");
        table.innerHTML =
          "<thead><tr><th>Shift</th><th># Words</th><th>Sample Plaintext</th></tr></thead><tbody></tbody>";
        const tbody = table.querySelector("tbody");
  
        let bestShift = -1;
        let maxWords = -1;
  
        for (let s = 1; s < 26; s++) {
          const plain = caesarCipher(ciphertext, -s);
          const found = countDictionaryWords(plain);
          const row = document.createElement("tr");
          if (found > maxWords) {
            maxWords = found;
            bestShift = s;
            row.style.backgroundColor = "#e7f4e7"; // highlight best so far
          }
          row.innerHTML = `<td>${s}</td><td>${found}</td><td>${plain.slice(
            0,
            50
          )}…</td>`;
          tbody.appendChild(row);
        }
  
        outputDiv.appendChild(table);
  
        if (maxWords <= 0) {
          outputDiv.innerHTML +=
            "<p>No dictionary words found for any shift; maybe not plain English.</p>";
        } else {
          outputDiv.innerHTML += `<p><strong>Best guess:</strong> shift ${bestShift} (found ${maxWords} English words).</p>`;
        }
      });
    }
  });
  