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

// Helper function for matrix multiplication (2x2 matrix * 2x2 matrix) mod 26
function multiplyMatrices(matrixA, matrixB) {
    const result = [[0, 0], [0, 0]];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            let sum = 0;
            for (let k = 0; k < 2; k++) {
                sum += matrixA[i][k] * matrixB[k][j];
            }
            result[i][j] = (sum % 26 + 26) % 26; // Ensure positive result
        }
    }
    return result;
}

// Helper function to calculate determinant of 2x2 matrix mod 26
function determinant(matrix) {
    let det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    return (det % 26 + 26) % 26; // Ensure positive result
}

// Helper function to find modular multiplicative inverse
function modInverse(a, m) {
    a = (a % m + m) % m;
    for (let x = 1; x < m; x++) {
        if ((a * x) % m == 1) {
            return x;
        }
    }
    return null; // Inverse does not exist
}

// Helper function to check if a number is coprime with 26
function isCoprimeWith26(num) {
    return num % 2 !== 0 && num % 13 !== 0;
}

// Helper function to create the inverse key matrix for decryption or known-plaintext attack
function getInverseMatrix(matrix) {
    const det = determinant(matrix);
    const detInv = modInverse(det, 26);
    if (detInv === null) {
        return null; // Inverse doesn't exist
    }

    // Calculate adjugate matrix
    const adjugateMatrix = [
        [matrix[1][1], (-matrix[0][1] % 26 + 26) % 26],
        [(-matrix[1][0] % 26 + 26) % 26, matrix[0][0]]
    ];

    // Calculate inverse matrix: detInv * adjugate
    const inverseMatrix = [
        [0, 0],
        [0, 0]
    ];
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
            inverseMatrix[i][j] = (adjugateMatrix[i][j] * detInv % 26 + 26) % 26;
        }
    }
    return inverseMatrix;
}


function hillCipher(text, keyString, encrypt = true) {
  // Basic validation
  if (!/^[a-zA-Z]{4}$/.test(keyString)) {
    return { error: "Invalid key: Key must be exactly 4 alphabetic characters for a 2x2 Hill Cipher." };
  }

  // Create 2x2 key matrix
  const keyMatrix = [
    [letterToNum(keyString[0]), letterToNum(keyString[1])],
    [letterToNum(keyString[2]), letterToNum(keyString[3])]
  ];

  // Check if the key matrix is invertible modulo 26
  const det = determinant(keyMatrix);
  if (!isCoprimeWith26(det)) {
      return { error: `Invalid key: The key matrix determinant (${det}) is not coprime with 26. Choose a different key.` };
  }

  let matrixToUse = keyMatrix;
  if (!encrypt) {
      matrixToUse = getInverseMatrix(keyMatrix);
      if (!matrixToUse) {
          // This should theoretically not happen if determinant is coprime with 26
          return { error: "Error calculating inverse key matrix. The key might be invalid (determinant not coprime with 26)." };
      }
  }

  // Prepare text: uppercase, remove non-alpha, pad if odd length
  let processedText = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (processedText.length % 2 !== 0) {
    // Padding might differ based on encryption/decryption context, but 'X' is common
    processedText += 'X';
  }

  let resultText = "";
  for (let i = 0; i < processedText.length; i += 2) {
    const vector = [
      letterToNum(processedText[i]),
      letterToNum(processedText[i + 1])
    ];
    const resultVector = multiplyMatrixVector(matrixToUse, vector);
    resultText += numToLetter(resultVector[0]) + numToLetter(resultVector[1]);
  }

  return { result: resultText };
}

// --- Known-Plaintext Attack ---
function findKeyMatrixFromKnownPlaintext(plain, cipher) {
    const plainProcessed = plain.toUpperCase().replace(/[^A-Z]/g, "");
    const cipherProcessed = cipher.toUpperCase().replace(/[^A-Z]/g, "");

    if (plainProcessed.length < 4 || cipherProcessed.length < 4) {
        return { error: "Need at least 4 corresponding plaintext and ciphertext characters." };
    }

    // Form matrices P and C from the first 4 characters
    // P = [[p1, p3], [p2, p4]]
    // C = [[c1, c3], [c2, c4]]
    const P = [
        [letterToNum(plainProcessed[0]), letterToNum(plainProcessed[2])],
        [letterToNum(plainProcessed[1]), letterToNum(plainProcessed[3])]
    ];
    const C = [
        [letterToNum(cipherProcessed[0]), letterToNum(cipherProcessed[2])],
        [letterToNum(cipherProcessed[1]), letterToNum(cipherProcessed[3])]
    ];

    // Calculate P_inv
    const P_inv = getInverseMatrix(P);
    if (!P_inv) {
        const detP = determinant(P);
        return { error: `Known-plaintext attack failed: The plaintext matrix determinant (${detP}) is not coprime with 26. Try a different plaintext/ciphertext pair.` };
    }

    // Calculate Key Matrix K = C * P_inv (mod 26)
    const K = multiplyMatrices(C, P_inv);

    // Convert key matrix numbers back to letters
    const keyString = numToLetter(K[0][0]) + numToLetter(K[0][1]) +
                      numToLetter(K[1][0]) + numToLetter(K[1][1]);

    // Verify the found key works for the provided pairs
    const verificationResult1 = hillCipher(plainProcessed.substring(0, 2), keyString, true);
    const verificationResult2 = hillCipher(plainProcessed.substring(2, 4), keyString, true);
    if (verificationResult1.error || verificationResult2.error ||
        verificationResult1.result !== cipherProcessed.substring(0, 2) ||
        verificationResult2.result !== cipherProcessed.substring(2, 4)) {
            return { error: "Known-plaintext attack failed: Verification failed. Ensure the plaintext/ciphertext pair is correct and corresponds to a valid 2x2 Hill cipher key.", derivedKeyMatrix: K, derivedKeyString: keyString };
    }

    return { derivedKeyMatrix: K, derivedKeyString: keyString };
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
    // Encryption
    const encryptBtn = document.getElementById("hill-encrypt-btn");
    if (encryptBtn) {
        encryptBtn.addEventListener("click", () => {
            const text = document.getElementById("hill-encrypt-text").value;
            const keyInput = document.getElementById("hill-encrypt-key");
            const outputArea = document.getElementById("hill-encrypt-output");
            const errorArea = document.getElementById("hill-encrypt-error");
            errorArea.textContent = "";
            outputArea.value = "";

            const key = keyInput.value;
            const result = hillCipher(text, key, true);

            if (result.error) {
                errorArea.textContent = result.error;
            } else {
                outputArea.value = result.result;
            }
        });
    }

    // Decryption - Step 1: Find Key via Known-Plaintext Attack
    const findKeyBtn = document.getElementById("hill-find-key-btn");
    if (findKeyBtn) {
        findKeyBtn.addEventListener("click", () => {
            const knownPlain = document.getElementById("hill-known-plain").value;
            const knownCipher = document.getElementById("hill-known-cipher").value;
            const keyOutputDiv = document.getElementById("hill-derived-key-output");
            const decryptKeyInput = document.getElementById("hill-decrypt-key-input");
            const errorArea = document.getElementById("hill-find-key-error");
            keyOutputDiv.innerHTML = "";
            decryptKeyInput.value = "";
            errorArea.textContent = "";

            const result = findKeyMatrixFromKnownPlaintext(knownPlain, knownCipher);

            if (result.error) {
                errorArea.textContent = result.error;
                if (result.derivedKeyMatrix) {
                     keyOutputDiv.innerHTML = `Potential (but failed verification) Key Matrix:<br>
                                        [${result.derivedKeyMatrix[0].join(', ')}]<br>
                                        [${result.derivedKeyMatrix[1].join(', ')}]`;
                }
            } else {
                keyOutputDiv.innerHTML = `Derived Key Matrix:<br>
                                        [${result.derivedKeyMatrix[0].join(', ')}]<br>
                                        [${result.derivedKeyMatrix[1].join(', ')}]<br>
                                        Key String: ${result.derivedKeyString}`;
                decryptKeyInput.value = result.derivedKeyString;
            }
        });
    }

    // Decryption - Step 2: Apply Derived Key
    const decryptBtn = document.getElementById("hill-decrypt-btn");
    if (decryptBtn) {
        decryptBtn.addEventListener("click", () => {
            const ciphertext = document.getElementById("hill-decrypt-text").value;
            const keyInput = document.getElementById("hill-decrypt-key-input");
            const outputArea = document.getElementById("hill-decrypt-final-output");
            const errorArea = document.getElementById("hill-decrypt-error");
            errorArea.textContent = "";
            outputArea.value = "";

            if (!ciphertext) {
                errorArea.textContent = "Please enter the full ciphertext to decrypt.";
                return;
            }
            const key = keyInput.value;
            if (!key) {
                errorArea.textContent = "No key derived or provided. Use the known-plaintext attack first.";
                return;
            }

            // Decrypt using the derived key
            const result = hillCipher(ciphertext, key, false);

            if (result.error) {
                errorArea.textContent = result.error;
            } else {
                outputArea.value = result.result;
            }
        });
    }
});

