import { useState, useCallback, useEffect, useRef } from "react";

// Main App component for the password generator
function App() {
  // State to manage password length (default: 12, minimum: 8 for security)
  const [length, setLength] = useState(12);
  // State to toggle inclusion of numbers in the password (default: true for stronger passwords)
  const [numberAllowed, setNumberAllowed] = useState(true);
  // State to toggle inclusion of special characters (default: true for stronger passwords)
  const [charAllowed, setCharAllowed] = useState(true);
  // State to toggle inclusion of uppercase letters (default: true for stronger passwords)
  const [upperAllowed, setUpperAllowed] = useState(true);
  // State to toggle inclusion of lowercase letters (default: true for stronger passwords)
  const [lowerAllowed, setLowerAllowed] = useState(true);
  // State to store the generated password
  const [password, setPassword] = useState("");
  // State to track if the password has been copied to the clipboard
  const [copied, setCopied] = useState(false);
  // Ref to access the password input element for copying to clipboard
  const passwordRef = useRef(null);

  // List of common password patterns to avoid for security
  const commonPatterns = [
    "password",
    "123456",
    "qwerty",
    "abc123",
    "letmein",
    "admin",
    "welcome",
    "monkey",
    "dragon",
    "baseball",
    "football",
  ];

  // Function to generate cryptographically secure random numbers
  // Uses Web Crypto API to ensure unpredictability, critical for secure password generation
  const generateSecureRandom = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1); // Normalize to a value between 0 and 1
  };

  // Function to calculate password entropy (a measure of randomness)
  // Entropy = log2(character_set_size^password_length), measured in bits
  const calculateEntropy = (pwd) => {
    const charSet = new Set(pwd.split("")); // Unique characters in the password
    return Math.log2(Math.pow(charSet.size, pwd.length));
  };

  // Memoized function to generate a secure password
  // useCallback ensures the function is not recreated unnecessarily
  const passwordGenerator = useCallback(() => {
    let pass = ""; // Initialize empty password
    let str = ""; // Initialize character pool

    // Build character pool based on user selections
    if (upperAllowed) str += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowerAllowed) str += "abcdefghijklmnopqrstuvwxyz";
    if (numberAllowed) str += "0123456789";
    if (charAllowed) str += "!@#$%^&*()-_=+[]{}|;:,.<>?"; // Safe special characters

    // Check if at least one character type is selected
    if (!str) {
      alert("Please select at least one character type");
      return; // Exit if no character types are selected
    }

    // Ensure at least one character from each selected type is included
    // This guarantees password complexity requirements are met
    if (upperAllowed)
      pass += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(
        Math.floor(generateSecureRandom() * 26)
      );
    if (lowerAllowed)
      pass += "abcdefghijklmnopqrstuvwxyz".charAt(
        Math.floor(generateSecureRandom() * 26)
      );
    if (numberAllowed)
      pass += "0123456789".charAt(Math.floor(generateSecureRandom() * 10));
    if (charAllowed)
      pass += "!@#$%^&*()-_=+[]{}|;:,.<>?".charAt(
        Math.floor(generateSecureRandom() * 20)
      );

    // Fill the remaining length with random characters from the pool
    while (pass.length < length) {
      const index = Math.floor(generateSecureRandom() * str.length);
      pass += str.charAt(index);
    }

    // Shuffle the password to avoid predictable patterns
    // Uses Fisher-Yates shuffle principle with secure random numbers
    pass = pass
      .split("")
      .sort(() => generateSecureRandom() - 0.5)
      .join("");

    // Check if the password contains common patterns; regenerate if it does
    if (
      commonPatterns.some((pattern) => pass.toLowerCase().includes(pattern))
    ) {
      return passwordGenerator(); // Recursive call to regenerate
    }

    // Update the password state
    setPassword(pass);
  }, [length, numberAllowed, charAllowed, upperAllowed, lowerAllowed]);

  // Memoized function to copy the password to the clipboard
  // useCallback ensures the function is not recreated unnecessarily
  const copyPasswordToClipboard = useCallback(() => {
    // Select the password input for accessibility and visual feedback
    passwordRef.current?.select();
    // Use modern clipboard API to copy the password
    navigator.clipboard
      .writeText(password)
      .then(() => {
        setCopied(true); // Show "Copied!" feedback
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(() => alert("Failed to copy password")); // Handle errors
  }, [password]);

  // Effect to generate a new password when dependencies change
  // Runs on mount and when length or character type settings change
  useEffect(() => {
    passwordGenerator();
  }, [
    length,
    numberAllowed,
    charAllowed,
    upperAllowed,
    lowerAllowed,
    passwordGenerator,
  ]);

  // Function to evaluate password strength based on entropy and settings
  // Returns an object with strength text, color, and progress bar width
  const getPasswordStrength = () => {
    const entropy = calculateEntropy(password);
    // Strong: High entropy, length >= 12, all character types enabled
    if (
      entropy > 80 &&
      length >= 12 &&
      numberAllowed &&
      charAllowed &&
      upperAllowed &&
      lowerAllowed
    ) {
      return { text: "Strong", color: "bg-green-500", width: "100%" };
      // Medium: Moderate entropy, length >= 8
    } else if (entropy > 50 && length >= 8) {
      return { text: "Medium", color: "bg-yellow-500", width: "66%" };
      // Weak: Low entropy or insufficient length
    } else {
      return { text: "Weak", color: "bg-red-500", width: "33%" };
    }
  };

  // Get current password strength
  const strength = getPasswordStrength();

  // JSX for the UI, using Tailwind CSS for styling
  return (
    // Full-screen container with gradient background
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      {/* Card container for the password generator */}
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-green-400 mb-6">
          Password Generator
        </h1>

        {/* Main content container */}
        <div className="flex flex-col space-y-6">
          {/* Password input and copy button */}
          <div className="relative flex">
            <input
              type="text"
              value={password}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-lg font-mono"
              placeholder="Password"
              readOnly // Prevent manual editing
              ref={passwordRef} // Reference for clipboard functionality
              aria-describedby="password-strength" // Link to strength indicator
            />
            <button
              onClick={copyPasswordToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              aria-label={
                copied ? "Password copied" : "Copy password to clipboard"
              }
            >
              {copied ? "Copied!" : "Copy"}{" "}
              {/* Toggle button text based on copy state */}
            </button>
          </div>

          {/* Controls for password settings */}
          <div className="space-y-4">
            {/* Password length slider */}
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-gray-300">Length: {length}</label>
                <span className="text-green-400 font-medium">{length}</span>
              </div>
              <input
                type="range"
                min={8} // Enforce minimum length for security
                max={50} // Limit max length for performance
                value={length}
                className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer accent-green-500"
                onChange={(e) => setLength(Number(e.target.value))}
                aria-label={`Password length: ${length}`} // Accessibility label
              />
            </div>

            {/* Character type checkboxes */}
            <div className="grid grid-cols-2 gap-4">
              {/* Uppercase checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={upperAllowed}
                  id="upperInput"
                  onChange={() => setUpperAllowed((prev) => !prev)}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="upperInput" className="ml-2 text-gray-300">
                  Uppercase Letters
                </label>
              </div>
              {/* Lowercase checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={lowerAllowed}
                  id="lowerInput"
                  onChange={() => setLowerAllowed((prev) => !prev)}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="lowerInput" className="ml-2 text-gray-300">
                  Lowercase Letters
                </label>
              </div>
              {/* Numbers checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={numberAllowed}
                  id="numberInput"
                  onChange={() => setNumberAllowed((prev) => !prev)}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="numberInput" className="ml-2 text-gray-300">
                  Numbers
                </label>
              </div>
              {/* Special characters checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={charAllowed}
                  id="charInput"
                  onChange={() => setCharAllowed((prev) => !prev)}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="charInput" className="ml-2 text-gray-300">
                  Special Characters
                </label>
              </div>
            </div>
          </div>

          {/* Password strength indicator */}
          <div className="space-y-2">
            {/* Visual progress bar for strength */}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`${strength.color} h-full`}
                style={{ width: strength.width }}
              ></div>
            </div>
            {/* Text description of strength with entropy value */}
            <p
              className="text-center text-gray-400 text-sm"
              id="password-strength"
              aria-live="polite"
            >
              Password strength: {strength.text} (Entropy:{" "}
              {calculateEntropy(password).toFixed(2)} bits)
            </p>
          </div>

          {/* Generate new password button */}
          <button
            onClick={passwordGenerator}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200"
            aria-label="Generate new password"
          >
            Generate New Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
