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

    for (let i = 1; i <= length; i++) {
      let char = Math.floor(Math.random() * str.length + 1);
      pass += str.charAt(char);
    }

    setPassword(pass);
  }, [length, numberAllowed, charAllowed, setPassword]);

  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select();
    passwordRef.current?.setSelectionRange(0, 99);
    window.navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [password]);

  useEffect(() => {
    passwordGenerator();
  }, [length, numberAllowed, charAllowed, passwordGenerator]);

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
            />
            <button
              onClick={copyPasswordToClipboard}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
                type="range"
                min={6}
                max={100}
                value={length}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                onChange={(e) => {
                  setLength(e.target.value);
                }}
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
          >
            Generate New Password
          </button>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Password strength: {length >= 12 ? "Strong" : length >= 8 ? "Medium" : "Weak"}</p>
        </div>
      </div>
    </div>
  );
}

export default App;