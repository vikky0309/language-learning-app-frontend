import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// ---------------------- SVG Microphone Component --------------------------
// This replaces the emoji for a professional look.
const MicIcon = ({ isListening }) => (
  // SVG path for a standard microphone icon (Material Design style)
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    width="100%" 
    height="100%"
    className={isListening ? "mic-icon listening" : "mic-icon"}
  >
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.91V21h2v-3.09c3.39-.48 6-3.38 6-6.91h-2z"/>
  </svg>
);
// --------------------------------------------------------------------------


// --- Language Selector Component (unchanged) ---
const LanguageSelector = ({
  selectedLang,
  setSelectedLang,
  placeholder,
  languageOptions,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  const filteredLanguages = languageOptions.filter((lang) =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (lang) => {
    setSelectedLang(lang.code);
    setIsOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languageOptions.find((lang) => lang.code === selectedLang);
  const displayValue = currentLang ? currentLang.name : placeholder;
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
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus
            />
          )}

          {!isLoading &&
            (filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <li
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  onMouseDown={(e) => e.preventDefault()}
                  className={selectedLang === lang.code ? "selected" : ""}
                >
                  {lang.name}
                </li>
              ))
            ) : (
              <li className="no-results">No results found.</li>
            ))}
        </ul>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------

const App = () => {
  const [inputText, setInputText] = useState("hello");
  const [translatedText, setTranslatedText] = useState("Halo");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("id");
  const [languages, setLanguages] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [listening, setListening] = useState(false);

  // Load languages
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await axios.get(
          "https://text-translator2.p.rapidapi.com/getLanguages",
          {
            headers: {
              "X-RapidAPI-Key": "61f487d004msh9cd3b694cc0c745p1fe8f7jsn2f795d92f8b6",
              "X-RapidAPI-Host": "text-translator2.p.rapidapi.com",
            },
          }
        );

        const list = res.data.data.languages || [];
        setLanguages(list);

        const defaultSource =
          list.find((l) => l.code === "en")?.code || list[0]?.code;
        const defaultTarget =
          list.find((l) => l.code === "id")?.code || list[1]?.code;

        setSourceLang(defaultSource);
        setTargetLang(defaultTarget);
      } catch (err) {
        console.error("Error fetching languages:", err);
        setNotification("Error: Could not load language list.");
      }
    };

    fetchLanguages();
  }, []);

  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Translate
  const handleTranslate = async () => {
    if (!inputText.trim() || isTranslating) {
      setNotification("Please enter text to translate.");
      return;
    }

    setIsTranslating(true);
    setTranslatedText("Translating...");

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
            "X-RapidAPI-Key": "61f487d004msh9cd3b694cc0c745p1fe8f7jsn2f795d92f8b6",
            "X-RapidAPI-Host": "text-translator2.p.rapidapi.com",
          },
        }
      );

      setTranslatedText(res.data.data.translatedText);
    } catch (err) {
      console.error(err);
      setNotification("Translation failed.");
      setTranslatedText("Translation error.");
    }

    setIsTranslating(false);
  };

  // Swap languages
  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (inputText.trim()) handleTranslate();
  };

  // --- Map language codes for speech recognition ---
  const langMap = {
    en: "en-US",
    yo: "yo-NG",
    fr: "fr-FR",
    es: "es-ES",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-PT",
    ar: "ar-SA",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
    id: "id-ID",
  };
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  // ---------------------- SPEECH TO TEXT --------------------------
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported on this device.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = langMap[sourceLang] || "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setInputText(spoken);
      setListening(false);
      handleTranslate();
    };

    recognition.onerror = () => {
      setListening(false);
      setNotification("Speech recognition error.");
    };

    recognition.onend = () => setListening(false);
  };

  // ---------------------- TEXT TO SPEECH --------------------------
  const speak = (text, lang) => {
    if (!text) return;

    const msg = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const found = voices.find((v) =>
      v.lang.toLowerCase().includes(lang.toLowerCase())
    );

    if (found) msg.voice = found;

    window.speechSynthesis.speak(msg);
  };

  const isLoading = languages.length === 0;

  return (
    <div className="translator-container">
      <h2>🌍 Language Translator</h2>

      {notification && (
        <div className="notification-bar">{notification}</div>
      )}

      {/* NEW WRAPPER FOR TEXTAREA AND ICON */}
      <div className="input-field-wrapper">
        <textarea
          rows="4"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to translate"
          className="text-input"
        />

        {/* MIC BUTTON - Positioned absolutely inside the wrapper */}
        <button 
          onClick={startListening} 
          className="mic-btn" 
          aria-label={listening ? "Listening..." : "Start voice input"}
        >
          <MicIcon isListening={listening} />
        </button>
      </div>


      {/* SPEAK INPUT BUTTON (Moved outside the wrapper) */}
      <button
        onClick={() => speak(inputText, sourceLang)}
        className="speak-btn input-speaker-btn" /* Added a new class for styling */
      >
        🔊 Speak Input
      </button>

      {/* LANGUAGE CONTROLS */}
      <div className="horizontal-controls">
        <LanguageSelector
          selectedLang={sourceLang}
          setSelectedLang={setSourceLang}
          placeholder="From"
          languageOptions={languages}
          isLoading={isLoading}
        />

        <button onClick={handleSwap} className="swap-btn">
          ⇄
        </button>

        <LanguageSelector
          selectedLang={targetLang}
          setSelectedLang={setTargetLang}
          placeholder="To"
          languageOptions={languages}
          isLoading={isLoading}
        />

        <button
          onClick={handleTranslate}
          disabled={isTranslating || !inputText.trim() || isLoading}
          className="translate-button"
        >
          {isTranslating ? "..." : "Translate"}
        </button>
      </div>

      {/* RESULT */}
      <div className="result-box">{translatedText}</div>

      <button
        className="speak-btn output-speaker"
        onClick={() => speak(translatedText, targetLang)}
      >
        🔊 Speak Translation
      </button>
    </div>
  );
};

export default App;