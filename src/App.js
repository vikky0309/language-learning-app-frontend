import React, { useState, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Lessons from './Lessons.js';
import Vocabulary from './vocabulary.js';
import Profile from './Profile.js';
import './styles.css';

function App() {
    const [text, setText] = useState('');
    const [targetLang, setTargetLang] = useState('es');
    const [translatedText, setTranslatedText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const debounceTimeout = useRef(null);
const handleTranslate = async () => {
    setIsLoading(true);
    setError('');
    try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/translate`, { // Corrected URL
            text,
            targetLang,
        });
        setTranslatedText(response.data.translatedText);
    } catch (err) {
        // ... error handling
    }
};
            if (err.response) {
                setError(`Translation failed: ${err.response.data.message || err.response.statusText}`);
            } else if (err.request) {
                setError('Network error. Please check your connection to the backend server.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        
    };

    const handleInputChange = (e) => {
        setText(e.target.value);
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            handleTranslate();
        }, 500);
    };

    const handleSpeak = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(translatedText);
            window.speechSynthesis.speak(utterance);
        } else {
            setError('Text-to-speech is not supported in this browser.');
        }
    };

    const handleRetry = () => {
        if (!isLoading) {
            handleTranslate();
        }
    };

    const handleClear = () => {
        setText('');
        setTranslatedText('');
    };

    return (
        <Router>
            <div className="app bg-gray-100 min-h-screen">
                <nav className="bg-blue-600 p-4 text-white shadow-md">
                    <div className="container mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-semibold">Language Learning App</h1>
                        <div className="space-x-4">
                            <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
                            <li><Link to="/lessons" className="hover:text-gray-300">Lessons</Link></li>
                            <li><Link to="/vocabulary" className="hover:text-gray-300">Vocabulary</Link></li>
                            <li><Link to="/profile" className="hover:text-gray-300">Profile</Link></li>
                        </div>
                    </div>
                </nav>
                <div className="container mx-auto p-6">
                    <header className="header text-center mb-8">
                        <h1 className="text-4xl font-bold text-blue-800">Language Learning App</h1>
                        <p className="text-lg opacity-80 mt-2">Translate & learn with ease</p>
                    </header>
                    <Routes>
                        <Route path="/lessons" element={<Lessons />} />
                        <Route path="/vocabulary" element={<Vocabulary />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/" element={
                            <div className="content bg-white shadow-lg rounded-xl p-8 w-full max-w-lg mx-auto">
                                <textarea
                                    className="w-full border-2 border-gray-300 rounded-lg p-4 text-lg focus:border-blue-500 focus:outline-none mb-4"
                                    value={text}
                                    onChange={handleInputChange}
                                    placeholder="Type something to translate..."
                                    rows="4"
                                ></textarea>
                                <div className="flex justify-between items-center mb-4">
                                    <select
                                        className="border-2 border-gray-300 rounded-lg p-3 text-lg focus:border-blue-500 focus:outline-none"
                                        value={targetLang}
                                        onChange={(e) => setTargetLang(e.target.value)}
                                    >
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                        <option value="de">German</option>
                                        <option value="zh-cn">Chinese</option>
                                    </select>
                                </div>
                                <div className="mt-6 flex justify-center">
                                    <button
                                        className="bg-blue-500 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-600 transition-all text-lg"
                                        onClick={handleTranslate}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Translating...' : 'Translate'}
                                    </button>
                                </div>
                                {error && <div className="text-red-500 mt-3">{error}</div>}
                                {isLoading && <div className="mt-3">Loading...</div>}
                                <div className="translation-output bg-gray-100 p-6 mt-8 rounded-lg">
                                    <h2 className="font-semibold text-xl mb-3 text-gray-800">Translation:</h2>
                                    <p className="text-gray-700 text-lg">
                                        {translatedText || 'Your translated text will appear here.'}
                                    </p>
                                    {translatedText && (
                                        <div className="mt-6 flex justify-between">
                                            <button
                                                className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-all text-lg mr-2"
                                                onClick={handleSpeak}
                                            >
                                                Speak
                                            </button>
                                            <button
                                                className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition-all text-lg"
                                                onClick={handleClear}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                    {error && (
                                        <div className="mt-4 flex justify-center">
                                            <button
                                                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all text-lg"
                                                onClick={handleRetry}
                                                disabled={isLoading}
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        } />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
