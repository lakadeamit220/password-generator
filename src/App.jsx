import { useState, useCallback, useEffect, useRef } from 'react';

function App() {
  const [length, setLength] = useState(12);
  const [numberAllowed, setNumberAllowed] = useState(true);
  const [charAllowed, setCharAllowed] = useState(true);
  const [upperAllowed, setUpperAllowed] = useState(true);
  const [lowerAllowed, setLowerAllowed] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const passwordRef = useRef(null);

  const commonPatterns = [
    'password', '123456', 'qwerty', 'abc123', 'letmein', 'admin',
    'welcome', 'monkey', 'dragon', 'baseball', 'football'
  ];

  const generateSecureRandom = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  };

  const calculateEntropy = (pwd) => {
    const charSet = new Set(pwd.split(''));
    return Math.log2(Math.pow(charSet.size, pwd.length));
  };

  const passwordGenerator = useCallback(() => {
    let pass = '';
    let str = '';
    if (upperAllowed) str += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowerAllowed) str += 'abcdefghijklmnopqrstuvwxyz';
    if (numberAllowed) str += '0123456789';
    if (charAllowed) str += '!@#$%^&*()-_=+[]{}|;:,.<>?';

    if (!str) {
      alert('Please select at least one character type');
      return;
    }

    // Ensure at least one character from each selected type
    if (upperAllowed) pass += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(generateSecureRandom() * 26));
    if (lowerAllowed) pass += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(generateSecureRandom() * 26));
    if (numberAllowed) pass += '0123456789'.charAt(Math.floor(generateSecureRandom() * 10));
    if (charAllowed) pass += '!@#$%^&*()-_=+[]{}|;:,.<>?'.charAt(Math.floor(generateSecureRandom() * 20));

    // Fill remaining length
    while (pass.length < length) {
      const index = Math.floor(generateSecureRandom() * str.length);
      pass += str.charAt(index);
    }

    // Shuffle the password
    pass = pass.split('').sort(() => generateSecureRandom() - 0.5).join('');

    // Check for common patterns
    if (commonPatterns.some(pattern => pass.toLowerCase().includes(pattern))) {
      return passwordGenerator();
    }

    setPassword(pass);
  }, [length, numberAllowed, charAllowed, upperAllowed, lowerAllowed]);

  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select();
    navigator.clipboard.writeText(password)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => alert('Failed to copy password'));
  }, [password]);

  useEffect(() => {
    passwordGenerator();
  }, [length, numberAllowed, charAllowed, upperAllowed, lowerAllowed, passwordGenerator]);

  const getPasswordStrength = () => {
    const entropy = calculateEntropy(password);
    if (entropy > 80 && length >= 12 && numberAllowed && charAllowed && upperAllowed && lowerAllowed) {
      return { text: 'Strong', color: 'bg-green-500', width: '100%' };
    } else if (entropy > 50 && length >= 8) {
      return { text: 'Medium', color: 'bg-yellow-500', width: '66%' };
    } else {
      return { text: 'Weak', color: 'bg-red-500', width: '33%' };
    }
  };

  const strength = getPasswordStrength();

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
              aria-label={copied ? 'Password copied' : 'Copy password to clipboard'}
            >
              {copied ? 'Copied!' : 'Copy'}
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
                min={8}
                max={50}
                value={length}
                className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer accent-green-500"
                onChange={(e) => setLength(Number(e.target.value))}
                aria-label={`Password length: ${length}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={upperAllowed}
                  id="upperInput"
                  onChange={() => setUpperAllowed(prev => !prev)}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="upperInput" className="ml-2 text-gray-300">
                  Uppercase Letters
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={lowerAllowed}
                  id="lowerInput"
                  onChange={() => setLowerAllowed(prev => !prev)}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="lowerInput" className="ml-2 text-gray-300">
                  Lowercase Letters
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={numberAllowed}
                  id="numberInput"
                  onChange={() => setNumberAllowed(prev => !prev)}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="numberInput" className="ml-2 text-gray-300">
                  Numbers
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={charAllowed}
                  id="charInput"
                  onChange={() => setCharAllowed(prev => !prev)}
                  className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-400 focus:ring-2"
                />
                <label htmlFor="charInput" className="ml-2 text-gray-300">
                  Special Characters
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div className={`${strength.color} h-full`} style={{ width: strength.width }}></div>
            </div>
            <p className="text-center text-gray-400 text-sm" id="password-strength" aria-live="polite">
              Password strength: {strength.text} (Entropy: {calculateEntropy(password).toFixed(2)} bits)
            </p>
          </div>

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