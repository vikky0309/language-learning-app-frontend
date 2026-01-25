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

  // --- PROGRESS & SOCIAL STATES ---
  const [userXP, setUserXP] = useState(parseInt(localStorage.getItem("userXP")) || 0);
  const [weeklyTarget] = useState(500);

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
        setLanguages(res.data.data.languages || []);
      } catch (err) {
        setNotification("Error: Could not load languages.");
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
    if (!inputText.trim() || isTranslating) return;
    setIsTranslating(true);
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
    }
    setIsTranslating(false);
  };

  const handleSwap = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = sourceLang;
    setListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      setInputText(event.results[0][0].transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const speak = (text, lang) => {
    if (!text) return;
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = lang;
    window.speechSynthesis.speak(msg);
  };

  const requestNotification = () => {
    if (!("Notification" in window)) return;
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        setNotification("Reminders active! 🔔");
      }
    });
  };

  const handleAnswer = (index) => {
    if (isAnswered) return;
    const correctIdx = quizQuestions[currentQuestion].correct;
    setIsAnswered(true);

    if (index === correctIdx) {
      setScore(prev => prev + 1);
      setLastResult("Correct! ✨");
    } else {
      setLastResult(`Wrong. Correct was: ${quizQuestions[currentQuestion].a[correctIdx]}`);
      setWrongAnswers(prev => [...prev, { q: quizQuestions[currentQuestion].q, correct: quizQuestions[currentQuestion].a[correctIdx] }]);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < quizQuestions.length) {
        setCurrentQuestion(prev => prev + 1);
        setIsAnswered(false);
        setLastResult(null);
      } else {
        const earnedXP = (score + (index === correctIdx ? 1 : 0)) * 20;
        const totalXP = userXP + earnedXP;
        setUserXP(totalXP);
        localStorage.setItem("userXP", totalXP);
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

  const leaderboardData = [
    { name: "You", xp: userXP },
    { name: "Ahmad", xp: 1200 },
    { name: "Sarah", xp: 850 },
  ].sort((a, b) => b.xp - a.xp);

  const isLoading = languages.length === 0;

  return (
    <div className="app-main-wrapper">
      <div className="nav-tabs">
        <button className={activeTab === 'translator' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('translator')}>🔄 Translator</button>
        <button className={activeTab === 'guide' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('guide')}>📚 Guide</button>
        <button className={activeTab === 'quiz' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('quiz')}>🎯 Quiz</button>
        <button className={activeTab === 'social' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('social')}>🏆 Social</button>
      </div>

      {notification && <div className="notification-bar">{notification}</div>}

      {activeTab === 'translator' && (
        <div className="translator-container">
          <h2>🌍 Language Translator</h2>
          <div className="input-field-wrapper">
            <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="text-input" placeholder="Type here..." />
            <button onClick={startListening} className="mic-btn">
              <MicIcon isListening={listening} />
            </button>
          </div>
          <div className="horizontal-controls">
            <LanguageSelector selectedLang={sourceLang} setSelectedLang={setSourceLang} placeholder="From" languageOptions={languages} isLoading={isLoading} />
            <button onClick={handleSwap} className="swap-btn">⇄</button>
            <LanguageSelector selectedLang={targetLang} setSelectedLang={setTargetLang} placeholder="To" languageOptions={languages} isLoading={isLoading} />
            <button onClick={handleTranslate} className="translate-button" disabled={isTranslating}>{isTranslating ? "..." : "Translate"}</button>
          </div>
          <div className="result-box">{translatedText}</div>
          <button className="speak-btn" onClick={() => speak(translatedText, targetLang)}>🔊 Speak Translation</button>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="guide-container">
          <h2 className="gold-text">🏆 Leaderboard</h2>
          <div className="leaderboard-list">
            {leaderboardData.map((user, i) => (
              <div key={i} className="leaderboard-item">
                <span><span className="rank">#{i + 1}</span> {user.name}</span>
                <span className="gold-text">{user.xp} XP</span>
              </div>
            ))}
          </div>
          <h2 className="gold-text" style={{ marginTop: '30px' }}>🎯 Weekly Challenge</h2>
          <div className="challenge-card">
            <p>Goal: Reach 500 XP</p>
            <div className="challenge-progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min((userXP / weeklyTarget) * 100, 100)}%` }}></div>
            </div>
            <p className="small-text">{userXP} / {weeklyTarget} XP</p>
          </div>
          <button className="speak-btn" style={{ width: '100%' }} onClick={requestNotification}>🔔 Enable Daily Reminder</button>
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="quiz-container">
          <h2>🎯 Knowledge Quiz</h2>
          {showScore ? (
            <div className="result-screen">
              <div className="score-circle"><span>{score} / {quizQuestions.length}</span></div>
              <p>You earned {score * 20} XP!</p>
              {wrongAnswers.length > 0 && (
                <div className="review-section">
                   {wrongAnswers.map((item, i) => (
                     <div key={i} className="review-item">
                       <p>❓ {item.q}</p>
                       <p>✅ <span className="gold-text">{item.correct}</span></p>
                     </div>
                   ))}
                </div>
              )}
              <button className="translate-button" onClick={resetQuiz}>Restart</button>
            </div>
          ) : (
            <div className="question-box">
              <div className="progress-bar"><div className="progress-fill" style={{width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`}}></div></div>
              <h3 className="question-text">{quizQuestions[currentQuestion].q}</h3>
              {lastResult && <div className={`quiz-feedback ${lastResult.includes("Correct") ? "success" : "error"}`}>{lastResult}</div>}
              <div className="options-grid">
                {quizQuestions[currentQuestion].a.map((option, index) => (
                  <button key={index} className="option-btn" onClick={() => handleAnswer(index)} disabled={isAnswered}>{option}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'guide' && (
        <div className="guide-container">
          <h2>📚 Learning Guide</h2>
          <div className="guide-card">
            <h3>Essential Phrases</h3>
            <div className="phrase-row"><span>Hello</span><span className="gold-text">Halo</span></div>
            <div className="phrase-row"><span>Thank You</span><span className="gold-text">Terima Kasih</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;