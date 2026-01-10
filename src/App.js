import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// ---------------------- SVG Microphone Component --------------------------
const MicIcon = ({ isListening }) => (
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

const App = () => {
  const [activeTab, setActiveTab] = useState("translator");
  const [inputText, setInputText] = useState("hello");
  const [translatedText, setTranslatedText] = useState("Halo");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("id");
  const [languages, setLanguages] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [notification, setNotification] = useState(null);
  const [listening, setListening] = useState(false);

  // --- QUIZ STATE ---
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const quizQuestions = [
    { q: "How do you say 'Thank You' in Indonesian?", a: ["Halo", "Terima Kasih", "Apa kabar?", "Sama-sama"], correct: 1 },
    { q: "What does 'Dimana' mean?", a: ["Who", "When", "Where", "How"], correct: 2 },
    { q: "What is 'Selamat Pagi' in English?", a: ["Good Evening", "Good Morning", "Goodbye", "Please"], correct: 1 },
    { q: "Which word means 'Excuse Me'?", a: ["Permisi", "Ya", "Tidak", "Berapa"], correct: 0 },
    { q: "How do you ask 'How much?'", a: ["Siapa?", "Apa?", "Dimana?", "Berapa?"], correct: 3 },
  ];

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
        const defaultSource = list.find((l) => l.code === "en")?.code || list[0]?.code;
        const defaultTarget = list.find((l) => l.code === "id")?.code || list[1]?.code;
        setSourceLang(defaultSource);
        setTargetLang(defaultTarget);
      } catch (err) {
        setNotification("Error: Could not load language list.");
      }
    };
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      setNotification("Translation failed.");
      setTranslatedText("Translation error.");
    }
    setIsTranslating(false);
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (inputText.trim()) handleTranslate();
  };

  const langMap = {
    en: "en-US", yo: "yo-NG", fr: "fr-FR", es: "es-ES", de: "de-DE",
    it: "it-IT", pt: "pt-PT", ar: "ar-SA", zh: "zh-CN", ja: "ja-JP",
    ko: "ko-KR", id: "id-ID",
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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

  const speak = (text, lang) => {
    if (!text) return;
    const msg = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const found = voices.find((v) => v.lang.toLowerCase().includes(lang.toLowerCase()));
    if (found) msg.voice = found;
    window.speechSynthesis.speak(msg);
  };

  // --- QUIZ LOGIC ---
  const handleAnswer = (index) => {
    if (isAnswered) return;
    const correctIdx = quizQuestions[currentQuestion].correct;
    setIsAnswered(true);

    if (index === correctIdx) {
      setScore(score + 1);
      setLastResult("Correct! ✨");
    } else {
      const correctAnswerText = quizQuestions[currentQuestion].a[correctIdx];
      setLastResult(`Wrong. The correct answer was: ${correctAnswerText}`);
      setWrongAnswers([...wrongAnswers, {
        q: quizQuestions[currentQuestion].q,
        correct: correctAnswerText
      }]);
    }

    // Delay to let user read the feedback
    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < quizQuestions.length) {
        setCurrentQuestion(nextQuestion);
        setIsAnswered(false);
        setLastResult(null);
      } else {
        setShowScore(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setIsAnswered(false);
    setLastResult(null);
    setWrongAnswers([]);
  };

  const isLoading = languages.length === 0;

  return (
    <div className="app-main-wrapper">
      <div className="nav-tabs">
        <button 
          className={activeTab === 'translator' ? 'nav-btn active' : 'nav-btn'} 
          onClick={() => setActiveTab('translator')}
        >
          🔄 Translator
        </button>
        <button 
          className={activeTab === 'guide' ? 'nav-btn active' : 'nav-btn'} 
          onClick={() => setActiveTab('guide')}
        >
          📚 Learning Guide
        </button>
        <button 
          className={activeTab === 'quiz' ? 'nav-btn active' : 'nav-btn'} 
          onClick={() => setActiveTab('quiz')}
        >
          🎯 Quiz
        </button>
      </div>

      {activeTab === 'translator' && (
        <div className="translator-container">
          <h2>🌍 Language Translator</h2>
          {notification && <div className="notification-bar">{notification}</div>}
          <div className="input-field-wrapper">
            <textarea
              rows="4"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate"
              className="text-input"
            />
            <button onClick={startListening} className="mic-btn">
              <MicIcon isListening={listening} />
            </button>
          </div>
          <button onClick={() => speak(inputText, sourceLang)} className="speak-btn input-speaker-btn">
            🔊 Speak Input
          </button>
          <div className="horizontal-controls">
            <LanguageSelector
              selectedLang={sourceLang} setSelectedLang={setSourceLang}
              placeholder="From" languageOptions={languages} isLoading={isLoading}
            />
            <button onClick={handleSwap} className="swap-btn">⇄</button>
            <LanguageSelector
              selectedLang={targetLang} setSelectedLang={setTargetLang}
              placeholder="To" languageOptions={languages} isLoading={isLoading}
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
          <button className="speak-btn output-speaker" onClick={() => speak(translatedText, targetLang)}>
            🔊 Speak Translation
          </button>
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="guide-container">
          <div className="guide-header">
            <h2>📚 Language Mastery Guide</h2>
            <p>Master essential phrases with phonetics and pro learning tips.</p>
          </div>

          <div className="guide-grid">
            <div className="guide-card">
              <div className="card-tag">Essentials</div>
              <h3>👋 Greetings</h3>
              <div className="phrase-row">
                <div><strong>Hello</strong> <small>/ha-loh/</small></div>
                <div className="gold-text">Halo</div>
              </div>
              <div className="phrase-row">
                <div><strong>Thank You</strong> <small>/te-ri-ma ka-sih/</small></div>
                <div className="gold-text">Terima Kasih</div>
              </div>
            </div>

            <div className="guide-card">
              <div className="card-tag social">Social</div>
              <h3>💬 Socializing</h3>
              <div className="phrase-row">
                <div><strong>How are you?</strong> <small>/ah-pah kah-bar/</small></div>
                <div className="gold-text">Apa kabar?</div>
              </div>
              <div className="phrase-row">
                <div><strong>Excuse me</strong> <small>/per-mee-see/</small></div>
                <div className="gold-text">Permisi</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="quiz-container">
          <h2>🎯 Knowledge Quiz</h2>
          {showScore ? (
            <div className="result-screen">
              <h3>Quiz Finished!</h3>
              <div className="score-circle">
                <span>{score} / {quizQuestions.length}</span>
              </div>
              
              {wrongAnswers.length > 0 && (
                <div className="review-section">
                  <h4>Review Your Errors:</h4>
                  {wrongAnswers.map((item, index) => (
                    <div key={index} className="review-item">
                      <p className="review-q">❓ {item.q}</p>
                      <p className="review-a">✅ Correct Answer: <span>{item.correct}</span></p>
                    </div>
                  ))}
                </div>
              )}

              <p>{score === quizQuestions.length ? "Perfect! You're a pro! 🏆" : "Keep practicing to improve! 💪"}</p>
              <button className="translate-button" onClick={resetQuiz}>Restart Quiz</button>
            </div>
          ) : (
            <div className="question-box">
              <div className="progress-bar">
                <div className="progress-fill" style={{width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`}}></div>
              </div>
              <p className="question-counter">Question {currentQuestion + 1} of {quizQuestions.length}</p>
              <h3 className="question-text">{quizQuestions[currentQuestion].q}</h3>
              
              {lastResult && (
                <div className={`quiz-feedback ${lastResult.includes("Correct") ? "success" : "error"}`}>
                  {lastResult}
                </div>
              )}

              <div className="options-grid">
                {quizQuestions[currentQuestion].a.map((option, index) => (
                  <button 
                    key={index} 
                    className={`option-btn ${isAnswered ? "disabled" : ""}`} 
                    onClick={() => handleAnswer(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;