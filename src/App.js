import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
    const [text, setText] = useState('');
    const [targetLang, setTargetLang] = useState('es'); // Default language: Spanish
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Function to handle text translation
    const handleTranslate = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/translate', {
                text,
                targetLang,
            });
            setTranslatedText(response.data.translatedText);
        } catch (error) {
            setError('Translation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app bg-gradient-to-r from-blue-400 to-purple-500 min-h-screen flex flex-col items-center justify-center p-6">
            <header className="header text-center text-white mb-6">
                <h1 className="text-4xl font-bold">🌈 Language Learning App 🌍</h1>
                <p className="text-lg opacity-80">Translate & learn with ease</p>
            </header>
            <div className="content bg-white shadow-lg rounded-xl p-6 w-full max-w-lg">
                <textarea
                    className="w-full border-2 border-gray-300 rounded-lg p-3 text-lg focus:border-blue-500 focus:outline-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type something to translate..."
                    rows="4"
                ></textarea>
                <select
                    className="w-full mt-3 border-2 border-gray-300 rounded-lg p-2 text-lg focus:border-blue-500 focus:outline-none"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                >
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh-cn">Chinese</option>
                </select>
                <div className="mt-4 flex justify-center">
                    <button
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-all"
                        onClick={handleTranslate}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Translating...' : 'Translate'}
                    </button>
                </div>
                {error && <div className="text-red-500 mt-3">{error}</div>}
                <div className="translation-output bg-gray-100 p-4 mt-4 rounded-lg">
                    <h2 className="font-semibold text-lg">Translation:</h2>
                    <p className="text-gray-700">{translatedText || 'Your translated text will appear here.'}</p>
                </div>
            </div>
        </div>
    );
}

export default App;

