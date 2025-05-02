function caesarCipher(text, shift) {
  return text.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = code < 97 ? 65 : 97; // 65 for uppercase A, 97 for lowercase a
      return String.fromCharCode(base + (code - base + shift) % 26);
    }
    return char;
  }).join('');
}



function substitutionCipher(text, key) {
  if (key.length !== 26 || !/^[a-zA-Z]+$/.test(key)) {
    return "Invalid key: Key must be 26 unique alphabetic characters.";
  }
  const keyLower = key.toLowerCase();
  const keyUpper = key.toUpperCase();
  const alphabetLower = "abcdefghijklmnopqrstuvwxyz";
  const alphabetUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return text.split("").map(char => {
    let index = alphabetLower.indexOf(char);
    if (index !== -1) {
      return keyLower[index];
    }
    index = alphabetUpper.indexOf(char);
    if (index !== -1) {
      return keyUpper[index];
    }
    return char; // Keep non-alphabetic characters unchanged
  }).join("");
}



function vigenereCipher(text, key) {
  if (!/^[a-zA-Z]+$/.test(key)) {
    return "Invalid key: Key must contain only alphabetic characters.";
  }
  let keyIndex = 0;
  const keyLower = key.toLowerCase();

  return text.split("").map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = code < 97 ? 65 : 97; // 65 for uppercase A, 97 for lowercase a
      const keyChar = keyLower[keyIndex % keyLower.length];
      const keyShift = keyChar.charCodeAt(0) - 97; // Get shift value (0-25) from key character
      keyIndex++; // Move to the next key character only for alphabetic plaintext characters
      return String.fromCharCode(base + (code - base + keyShift) % 26);
    }
    return char; // Keep non-alphabetic characters unchanged
  }).join("");
}



// --- Hill Cipher (2x2) ---

// Helper function to convert letter to number (A=0, Z=25)
function letterToNum(char) {
  return char.toUpperCase().charCodeAt(0) - 65;
}

// Helper function to convert number back to letter (0=A, 25=Z)
function numToLetter(num) {
  return String.fromCharCode(num + 65);
}

// Helper function for matrix multiplication (2x2 matrix * 2x1 vector) mod 26
function multiplyMatrixVector(matrix, vector) {
  const result = [0, 0];
  result[0] = (matrix[0][0] * vector[0] + matrix[0][1] * vector[1]) % 26;
  result[1] = (matrix[1][0] * vector[0] + matrix[1][1] * vector[1]) % 26;
  // Ensure result is positive
  result[0] = (result[0] + 26) % 26;
  result[1] = (result[1] + 26) % 26;
  return result;
}

// Helper function to calculate determinant of 2x2 matrix mod 26
function determinant(matrix) {
    let det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    return (det % 26 + 26) % 26; // Ensure positive result
}

// Helper function to check if a number is coprime with 26
function isCoprimeWith26(num) {
    return num % 2 !== 0 && num % 13 !== 0;
}

function hillCipher(text, keyString) {
  // Basic validation
  if (!/^[a-zA-Z]{4}$/.test(keyString)) {
    return "Invalid key: Key must be exactly 4 alphabetic characters for a 2x2 Hill Cipher.";
  }

  // Create 2x2 key matrix
  const keyMatrix = [
    [letterToNum(keyString[0]), letterToNum(keyString[1])],
    [letterToNum(keyString[2]), letterToNum(keyString[3])]
  ];

  // Check if the key matrix is invertible modulo 26 (required for valid Hill cipher)
  const det = determinant(keyMatrix);
  if (!isCoprimeWith26(det)) {
      return `Invalid key: The key matrix determinant (${det}) is not coprime with 26. Choose a different key.`;
  }

  // Prepare plaintext: uppercase, remove non-alpha, pad if odd length
  let processedText = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (processedText.length % 2 !== 0) {
    processedText += 'X'; // Pad with 'X'
  }

  let ciphertext = "";
  for (let i = 0; i < processedText.length; i += 2) {
    const vector = [
      letterToNum(processedText[i]),
      letterToNum(processedText[i + 1])
    ];
    const resultVector = multiplyMatrixVector(keyMatrix, vector);
    ciphertext += numToLetter(resultVector[0]) + numToLetter(resultVector[1]);
  }

  return ciphertext;
}



// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Caesar Cipher
    const caesarEncryptBtn = document.getElementById('caesar-encrypt');
    if (caesarEncryptBtn) {
        caesarEncryptBtn.addEventListener('click', () => {
            const text = document.getElementById('caesar-text').value;
            const shift = parseInt(document.getElementById('caesar-shift').value, 10);
            const outputArea = document.getElementById('caesar-output');
            if (isNaN(shift) || shift < 1 || shift > 25) {
                outputArea.value = "Shift must be a number between 1 and 25.";
            } else {
                outputArea.value = caesarCipher(text, shift);
            }
        });
    }

    // Substitution Cipher
    const substEncryptBtn = document.getElementById('subst-encrypt');
    if (substEncryptBtn) {
        substEncryptBtn.addEventListener('click', () => {
            const text = document.getElementById('subst-text').value;
            const key = document.getElementById('subst-key').value;
            const outputArea = document.getElementById('subst-output');
            const errorArea = document.getElementById('subst-error');
            errorArea.textContent = ''; // Clear previous errors
            const result = substitutionCipher(text, key);
            if (result.startsWith("Invalid key:")) {
                errorArea.textContent = result;
                outputArea.value = '';
            } else {
                outputArea.value = result;
            }
        });
    }

    // Vigenere Cipher
    const vigEncryptBtn = document.getElementById('vig-encrypt');
    if (vigEncryptBtn) {
        vigEncryptBtn.addEventListener('click', () => {
            const text = document.getElementById('vig-text').value;
            const key = document.getElementById('vig-key').value;
            const outputArea = document.getElementById('vig-output');
            const errorArea = document.getElementById('vig-error');
            errorArea.textContent = ''; // Clear previous errors
            const result = vigenereCipher(text, key);
             if (result.startsWith("Invalid key:")) {
                errorArea.textContent = result;
                outputArea.value = '';
            } else {
                outputArea.value = result;
            }
        });
    }

    // Hill Cipher
    const hillEncryptBtn = document.getElementById('hill-encrypt');
    if (hillEncryptBtn) {
        hillEncryptBtn.addEventListener('click', () => {
            const text = document.getElementById('hill-text').value;
            const key = document.getElementById('hill-key').value;
            const outputArea = document.getElementById('hill-output');
            const errorArea = document.getElementById('hill-error');
            errorArea.textContent = ''; // Clear previous errors
            const result = hillCipher(text, key);
            if (result.startsWith("Invalid key:")) {
                errorArea.textContent = result;
                outputArea.value = '';
            } else {
                outputArea.value = result;
            }
        });
    }
});

