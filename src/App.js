import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './App.css';

// --- Language Selector Component (Defined internally for App.js) ---
const LanguageSelector = ({ 
    selectedLang, 
    setSelectedLang, 
    placeholder, 
    languageOptions, 
    isLoading 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    // Filter languages based on the component's current search term
    const filteredLanguages = languageOptions.filter(lang =>
        lang.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (lang) => {
        setSelectedLang(lang.code);
        setIsOpen(false);
        setSearchTerm('');
    };

    // Effect to handle clicking outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const currentLang = languageOptions.find(lang => lang.code === selectedLang);
    const displayValue = currentLang ? currentLang.name : placeholder;
    // When open, show the search term; when closed, show the selected language name
    const inputValue = isOpen ? searchTerm : displayValue;

    return (
        <div className="language-selector-container" ref={containerRef}>
            <input
                type="text"
                className="lang-selector-display"
                placeholder={isLoading ? "Loading..." : placeholder}
                value={inputValue}
                readOnly={!isOpen || isLoading}
                onClick={() => !isLoading && setIsOpen(true)}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {isOpen && (
                <ul className="language-list">
                    {isLoading && <li className="loading">Loading...</li>} 

                    {!isLoading && (
                        <input
                            type="text"
                            className="language-search-bar"
                            placeholder="Search language..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            // Prevent the list from closing when focusing the search bar
                            onMouseDown={(e) => e.stopPropagation()} 
                            autoFocus
                        />
                    )}
                    
                    {!isLoading && (
                        filteredLanguages.length > 0 ? (
                            filteredLanguages.map(lang => (
                                <li 
                                    key={lang.code} 
                                    onClick={() => handleSelect(lang)}
                                    // Prevent external click handler from firing too quickly
                                    onMouseDown={(e) => e.preventDefault()}
                                    className={selectedLang === lang.code ? 'selected' : ''}
                                >
                                    {lang.name}
                                </li>
                            ))
                        ) : (
                            <li className="no-results">No results found.</li>
                        )
                    )}
                </ul>
            )}
        </div>
    );
};
// ------------------------------------------------------------------


const App = () => {
    const [inputText, setInputText] = useState("hello"); 
    const [translatedText, setTranslatedText] = useState("Halo"); 
    const [sourceLang, setSourceLang] = useState("en"); 
    const [targetLang, setTargetLang] = useState("id"); 
    const [languages, setLanguages] = useState([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [notification, setNotification] = useState(null); // New state for in-app messages

    // 🔹 Load languages from API on mount
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const res = await axios.get(
                    "https://text-translator2.p.rapidapi.com/getLanguages",
                    {
                        headers: {
                            "X-RapidAPI-Key":
                                "61f487d004msh9cd3b694cc0c745p1fe8f7jsn2f795d92f8b6",
                            "X-RapidAPI-Host": "text-translator2.p.rapidapi.com",
                        },
                    }
                );

                const languageList = res.data.data.languages || [];
                setLanguages(languageList);

                // Set initial default codes
                const defaultSource = languageList.find(lang => lang.code === "en") ? "en" : languageList[0]?.code || "";
                const defaultTarget = languageList.find(lang => lang.code === "id") ? "id" : languageList[1]?.code || languageList[0]?.code || "";
                
                setSourceLang(defaultSource);
                setTargetLang(defaultTarget);

            } catch (error) {
                console.error("Error fetching languages:", error);
                setNotification("Error: Could not load language list from API.");
            }
        };

        fetchLanguages();
    }, []);

    // 🔹 Effect to clear notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // 🔹 Handle translation
    const handleTranslate = async () => {
        if (!inputText.trim() || isTranslating) {
            setNotification("Please enter text to translate.");
            return;
        }

        setIsTranslating(true);
        setTranslatedText("Translating...");
        setNotification(null); // Clear previous notifications

        try {
            const res = await axios.post(
                "https://text-translator2.p.rapidapi.com/translate",
                new URLSearchParams({
                    source_language: sourceLang,
                    target_language: targetLang,
                    text: inputText,
                }),
                {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        "X-RapidAPI-Key":
                            "61f487d004msh9cd3b694cc0c745p1fe8f7jsn2f795d92f8b6",
                        "X-RapidAPI-Host": "text-translator2.p.rapidapi.com",
                    },
                }
            );

            setTranslatedText(res.data.data.translatedText);
        } catch (error) {
            console.error("Error translating text:", error);
            setTranslatedText("Translation failed.");
            setNotification("Error: Translation failed. Check API key/limit.");
        } finally {
            setIsTranslating(false);
        }
    };

    // 🔹 Handle language swap
    const handleSwap = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        if (inputText.trim()) {
            handleTranslate();
        }
    };

    const isLoading = languages.length === 0;

    return (
        <div className="translator-container">
            <h2>🌍 Language Translator</h2>

            {/* Notification Message */}
            {notification && (
                <div className="notification-bar">
                    {notification}
                </div>
            )}

            {/* Input Text */}
            <textarea
                rows="4"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to translate"
                className="text-input"
            />

            {/* Language Selectors and Swap Button */}
            <div className="language-controls">
                
                {/* 1. Source Language Selector (REPLACES <select>) */}
                <LanguageSelector
                    selectedLang={sourceLang}
                    setSelectedLang={setSourceLang}
                    placeholder="Select Source Language"
                    languageOptions={languages}
                    isLoading={isLoading}
                />

                {/* Swap Button */}
                <button 
                    onClick={handleSwap} 
                    className="swap-button"
                    title="Swap Languages"
                >
                    &#8644; {/* Unicode for Left Right Arrow */}
                </button>

                {/* 2. Target Language Selector (REPLACES <select>) */}
                <LanguageSelector
                    selectedLang={targetLang}
                    setSelectedLang={setTargetLang}
                    placeholder="Select Target Language"
                    languageOptions={languages}
                    isLoading={isLoading}
                />

                <button 
                    onClick={handleTranslate} 
                    disabled={isTranslating || !inputText.trim() || isLoading}
                    className="translate-button"
                >
                    {isTranslating ? "Translating..." : "Translate"}
                </button>

            </div>

            {/* Output */}
            <h3>Result:</h3>
            <div className="result-box">
                {translatedText}
            </div>
        </div>
    );
};

export default App;