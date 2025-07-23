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
  // State to toggle password visibility (show/hide password)
  const [showPassword, setShowPassword] = useState(false);
  // Ref to access the password input element for copying to clipboard
  const passwordRef = useRef(null);

  // Array of common password patterns to avoid for security
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

  // Generates cryptographically secure random numbers using Web Crypto API
  // Returns a normalized value between 0 and 1 for secure random selection
  const generateSecureRandom = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  };

  // Calculates password entropy (measure of randomness) in bits
  // Entropy = log2(character_set_size^password_length)
  const calculateEntropy = (pwd) => {
    const charSet = new Set(pwd.split("")); // Unique characters in the password
    return Math.log2(Math.pow(charSet.size, pwd.length));
  };

  // Memoized function to generate a secure password
  // useCallback prevents unnecessary re-renders when dependencies don't change
  const passwordGenerator = useCallback(() => {
    let pass = ""; // Initialize empty password
    let str = ""; // Initialize character pool

    // Build character pool based on user-selected options
    if (upperAllowed) str += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowerAllowed) str += "abcdefghijklmnopqrstuvwxyz";
    if (numberAllowed) str += "0123456789";
    if (charAllowed) str += "!@#$%^&*()-_=+[]{}|;:,.<>?"; // Safe special characters

    // Check if at least one character type is selected
    if (!str) {
      alert("Please select at least one character type");
      return;
    }

    // Ensure at least one character from each selected type for complexity
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

    // Fill remaining length with random characters from the pool
    while (pass.length < length) {
      const index = Math.floor(generateSecureRandom() * str.length);
      pass += str.charAt(index);
    }

    // Shuffle password using Fisher-Yates principle with secure random numbers
    pass = pass
      .split("")
      .sort(() => generateSecureRandom() - 0.5)
      .join("");

    // Regenerate if password contains common patterns (e.g., "password", "123456")
    if (
      commonPatterns.some((pattern) => pass.toLowerCase().includes(pattern))
    ) {
      return passwordGenerator(); // Recursive call to regenerate
    }

    // Update password state with the generated password
    setPassword(pass);
  }, [length, numberAllowed, charAllowed, upperAllowed, lowerAllowed]);

  // Memoized function to copy password to clipboard
  // Selects input for accessibility and uses modern Clipboard API
  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select();
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

  // Evaluates password strength based on entropy and settings
  // Returns an object with strength text, color, width, and text color for UI
  const getPasswordStrength = () => {
    const entropy = calculateEntropy(password);
    if (
      entropy > 80 &&
      length >= 12 &&
      numberAllowed &&
      charAllowed &&
      upperAllowed &&
      lowerAllowed
    ) {
      return {
        text: "Very Strong",
        color: "bg-emerald-500",
        width: "100%",
        textColor: "text-emerald-500",
      };
    } else if (
      entropy > 60 &&
      length >= 10 &&
      (numberAllowed || charAllowed) &&
      (upperAllowed || lowerAllowed)
    ) {
      return {
        text: "Strong",
        color: "bg-green-500",
        width: "80%",
        textColor: "text-green-500",
      };
    } else if (entropy > 40 && length >= 8) {
      return {
        text: "Medium",
        color: "bg-yellow-500",
        width: "60%",
        textColor: "text-yellow-500",
      };
    } else if (entropy > 20) {
      return {
        text: "Weak",
        color: "bg-orange-500",
        width: "40%",
        textColor: "text-orange-500",
      };
    } else {
      return {
        text: "Very Weak",
        color: "bg-red-500",
        width: "20%",
        textColor: "text-red-500",
      };
    }
  };

  // Get current password strength for UI rendering
  const strength = getPasswordStrength();

  // JSX for the UI, using Tailwind CSS for styling
  return (
    // Full-screen container with gradient background
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4">
      {/* Card container for the password generator */}
      <div className="w-full max-w-2xl bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50">
        {/* Header with title and description */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
            Secure Password Generator
          </h1>
          <p className="text-gray-400">
            Create strong, random passwords to keep your accounts safe
          </p>
        </div>

        {/* Main content container */}
        <div className="space-y-6">
          {/* Password input with show/hide and copy buttons */}
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password input type
              value={password}
              className="w-full py-4 px-5 bg-gray-700/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50 text-lg font-mono border border-gray-600/50 transition-all duration-200 group-hover:border-emerald-400/30"
              placeholder="Generating secure password..."
              readOnly // Prevent manual editing
              ref={passwordRef} // Reference for clipboard functionality
              aria-describedby="password-strength" // Link to strength indicator for accessibility
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              {/* Show/hide password toggle button */}
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-gray-400 hover:text-emerald-400 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                )}
              </button>
              {/* Copy to clipboard button */}
              <button
                onClick={copyPasswordToClipboard}
                className={`${
                  copied
                    ? "bg-emerald-600"
                    : "bg-emerald-500/90 hover:bg-emerald-600"
                } text-white px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-1 shadow-md`}
                aria-label={
                  copied ? "Password copied" : "Copy password to clipboard"
                }
              >
                {copied ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Password settings controls */}
          <div className="space-y-6">
            {/* Password length slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-300 font-medium">
                  Password Length: {length}
                </label>
                <span className="text-emerald-400 font-mono font-medium px-2 py-1 bg-gray-700/50 rounded-md">
                  {length}
                </span>
              </div>
              <input
                type="range"
                min={8} // Minimum length for security
                max={50} // Maximum length for performance
                value={length}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                onChange={(e) => setLength(Number(e.target.value))}
                aria-label={`Password length: ${length}`} // Accessibility label
              />
            </div>

            {/* Character type checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Uppercase checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={upperAllowed}
                  id="upperInput"
                  onChange={() => setUpperAllowed((prev) => !prev)}
                  className="w-5 h-5 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-400 focus:ring-2"
                />
                <label
                  htmlFor="upperInput"
                  className="text-gray-300 select-none"
                >
                  Uppercase Letters (A-Z)
                </label>
              </div>
              {/* Lowercase checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={lowerAllowed}
                  id="lowerInput"
                  onChange={() => setLowerAllowed((prev) => !prev)}
                  className="w-5 h-5 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-400 focus:ring-2"
                />
                <label
                  htmlFor="lowerInput"
                  className="text-gray-300 select-none"
                >
                  Lowercase Letters (a-z)
                </label>
              </div>
              {/* Numbers checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={numberAllowed}
                  id="numberInput"
                  onChange={() => setNumberAllowed((prev) => !prev)}
                  className="w-5 h-5 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-400 focus:ring-2"
                />
                <label
                  htmlFor="numberInput"
                  className="text-gray-300 select-none"
                >
                  Numbers (0-9)
                </label>
              </div>
              {/* Special characters checkbox */}
              <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={charAllowed}
                  id="charInput"
                  onChange={() => setCharAllowed((prev) => !prev)}
                  className="w-5 h-5 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-400 focus:ring-2"
                />
                <label
                  htmlFor="charInput"
                  className="text-gray-300 select-none"
                >
                  Special Characters (!@#$)
                </label>
              </div>
            </div>
          </div>

          {/* Password strength indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">
                Password Strength:
              </span>
              <span className={`${strength.textColor} font-semibold`}>
                {strength.text}
              </span>
            </div>
            {/* Visual progress bar for strength */}
            <div className="w-full bg-gray-700/50 rounded-full h-2.5">
              <div
                className={`${strength.color} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: strength.width }}
              ></div>
            </div>
            {/* Entropy value display */}
            <p className="text-right text-xs text-gray-500">
              Entropy: {calculateEntropy(password).toFixed(2)} bits
            </p>
          </div>

          {/* Generate new password button */}
          <button
            onClick={passwordGenerator}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Generate New Password
          </button>
        </div>

        {/* Footer with security tip */}
        <div className="mt-6 pt-6 border-t border-gray-700/50 text-center text-sm text-gray-500">
          <p>
            For maximum security, use passwords with high entropy and never
            reuse them.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
