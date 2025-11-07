import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// --- Language Selector Component ---
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
// -----------------------------------------------------

const App = () => {
  const [inputText, setInputText] = useState("hello");
  const [translatedText, setTranslatedText] = useState("Halo");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("id");
  const [languages, setLanguages] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load languages
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

        const list = res.data.data.languages || [];
        setLanguages(list);
        const defaultSource =
          list.find((lang) => lang.code === "en")?.code || list[0]?.code || "";
        const defaultTarget =
          list.find((lang) => lang.code === "id")?.code ||
          list[1]?.code ||
          list[0]?.code ||
          "";

        setSourceLang(defaultSource);
        setTargetLang(defaultTarget);
      } catch (err) {
        console.error("Error fetching languages:", err);
        setNotification("Error: Could not load language list.");
      }
    };

    fetchLanguages();
  }, []);

  // Clear notification
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
      setNotification("Error: Translation failed.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Swap
  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (inputText.trim()) handleTranslate();
  };

  const isLoading = languages.length === 0;

  return (
    <div className="translator-container">
      <h2>🌍 Language Translator</h2>

      {notification && <div className="notification-bar">{notification}</div>}

      <textarea
        rows="4"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text to translate"
        className="text-input"
      />

      {/* ✅ Horizontal Section */}
      <div className="horizontal-controls">
        <LanguageSelector
          selectedLang={sourceLang}
          setSelectedLang={setSourceLang}
          placeholder="From"
          languageOptions={languages}
          isLoading={isLoading}
        />

        <button onClick={handleSwap} className="swap-btn" title="Swap Languages">
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

      <div className="result-box">{translatedText}</div>
    </div>
  );
};

export default App;
