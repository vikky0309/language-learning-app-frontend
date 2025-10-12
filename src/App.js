import React, { useState, useEffect } from "react";
import axios from "axios";
import './App.css';

const App = () => {
  const [inputText, setInputText] = useState("hello"); // Set default text for demonstration
  const [translatedText, setTranslatedText] = useState("Halo"); // Set default result for demonstration
  const [sourceLang, setSourceLang] = useState("en"); // Default English
  const [targetLang, setTargetLang] = useState("id"); // Default Bahasa Indonesia
  const [languages, setLanguages] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false); // To disable button while translating

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

        // API response structure is res.data.data.languages
        const languageList = res.data.data.languages || [];
        setLanguages(languageList);

        // Optional: Ensure default codes are available, or update defaults
        const defaultSource = languageList.find(lang => lang.code === "en") ? "en" : languageList[0]?.code || "";
        const defaultTarget = languageList.find(lang => lang.code === "id") ? "id" : languageList[1]?.code || languageList[0]?.code || "";
        
        setSourceLang(defaultSource);
        setTargetLang(defaultTarget);

      } catch (error) {
        console.error("Error fetching languages:", error);
        // Optionally set a fallback language list or error state
      }
    };

    fetchLanguages();
  }, []);

  // 🔹 Handle translation
  const handleTranslate = async () => {
    if (!inputText.trim() || isTranslating) {
      alert("Please enter text to translate!");
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
      setTranslatedText("Translation failed. Please check your API key/limit or input text.");
    } finally {
      setIsTranslating(false);
    }
  };

  // 🔹 Handle language swap
  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    // Optionally re-run translation on swap if input is not empty
    if (inputText.trim()) {
        handleTranslate();
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2>🌍 Language Translator</h2>

      {/* Input Text */}
      <textarea
        rows="4"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter text to translate"
        style={{ width: "100%", marginBottom: "10px" }}
      />

      {/* Language Selectors and Swap Button */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        
        {/* Source Language Dropdown */}
        <select 
            value={sourceLang} 
            onChange={(e) => setSourceLang(e.target.value)}
            style={{ padding: "8px", minWidth: "150px" }}
        >
          {/* Add a default placeholder option */}
          <option value="" disabled>Select Source Language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        {/* Swap Button */}
        <button 
            onClick={handleSwap} 
            style={{ padding: "8px 12px", border: "1px solid #ccc", background: "#f0f0f0" }}
            title="Swap Languages"
        >
            &#8644; {/* Unicode for Left Right Arrow */}
        </button>

        {/* Target Language Dropdown */}
        <select 
            value={targetLang} 
            onChange={(e) => setTargetLang(e.target.value)}
            style={{ padding: "8px", minWidth: "150px" }}
        >
          {/* Add a default placeholder option */}
          <option value="" disabled>Select Target Language</option>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <button onClick={handleTranslate} disabled={isTranslating || !inputText.trim()}>
          {isTranslating ? "Translating..." : "Translate"}
        </button>

      </div>

      {/* Output */}
      <h3>Result:</h3>
      <div
        style={{
          minHeight: "60px",
          padding: "10px",
          border: "1px solid #ccc",
          background: "#f9f9f9",
          whiteSpace: "pre-wrap", // Preserve formatting
        }}
      >
        {translatedText}
      </div>
    </div>
  );
};

export default App;
