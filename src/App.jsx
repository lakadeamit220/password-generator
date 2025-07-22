import { useState, useCallback, useEffect, useRef } from "react";

function App() {
  const [length, setLength] = useState(8);
  const [numberAllowed, setNumberAllowed] = useState(false);
  const [charAllowed, setCharAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const passwordRef = useRef(null);

  const passwordGenerator = useCallback(() => {
    let pass = "";
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    if (numberAllowed) str += "0123456789";
    if (charAllowed) str += "!@#$%^&*-_+=[]{}~`";

    for (let i = 0; i < length; i++) {
      let index = Math.floor(Math.random() * str.length);
      pass += str.charAt(index);
    }

    setPassword(pass);
  }, [length, numberAllowed, charAllowed, setPassword]);

  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select();
    passwordRef.current?.setSelectionRange(0, password.length);

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(password)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => {
          alert("Failed to copy password to clipboard.");
        });
    } else {
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          alert("Failed to copy password to clipboard.");
        }
      } catch (err) {
        alert("Failed to copy password to clipboard.");
      }
    }
  }, [password]);

  useEffect(() => {
    passwordGenerator();
  }, [length, numberAllowed, charAllowed, passwordGenerator]);

  const getPasswordStrength = () => {
    if (length >= 12 && numberAllowed && charAllowed) {
      return "Strong";
    } else if (length >= 8 && (numberAllowed || charAllowed)) {
      return "Medium";
    } else {
      return "Weak";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
        <h1 className="text-4xl font-bold text-center text-green-400 mb-6">
          Password Generator
        </h1>

        <div className="flex flex-col space-y-6">
          <div className="relative flex">
            <input
              type="text"
              value={password}
              className="w-full py-3 px-4 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-lg font-mono"
              placeholder="Password"
              readOnly
              ref={passwordRef}
              aria-describedby="password-strength"
            />
            <button
              onClick={copyPasswordToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              aria-label={
                copied ? "Password copied" : "Copy password to clipboard"
              }
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-gray-300">Length: {length}</label>
                <span className="text-green-400 font-medium">{length}</span>
              </div>
              <input
                tabIndex="0"
                type="range"
                min={6}
                max={100}
                value={length}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                onChange={(e) => {
                  setLength(Number(e.target.value));
                }}
                aria-label={`Password length: ${length}`}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={numberAllowed}
                  id="numberInput"
                  onChange={() => {
                    setNumberAllowed((prev) => !prev);
                  }}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="numberInput" className="ml-2 text-gray-300">
                  Include Numbers
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={charAllowed}
                  id="characterInput"
                  onChange={() => {
                    setCharAllowed((prev) => !prev);
                  }}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="characterInput" className="ml-2 text-gray-300">
                  Include Special Characters
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={passwordGenerator}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors duration-200"
            aria-label="Generate new password"
          >
            Generate New Password
          </button>
        </div>

        <div
          className="mt-6 text-center text-gray-400 text-sm"
          id="password-strength"
          aria-live="polite"
        >
          <p>Password strength: {getPasswordStrength()}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
