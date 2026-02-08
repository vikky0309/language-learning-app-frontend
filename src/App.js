import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import "./App.css";

// --- STATIC DATA ---
const FULL_QUIZ_DATA = [
  { q: "How do you say 'Thank You' in Indonesian?", a: ["Halo", "Terima Kasih", "Apa kabar?", "Sama-sama"], correct: 1 },
  { q: "What does 'Dimana' mean?", a: ["Who", "When", "Where", "How"], correct: 2 },
  { q: "What is 'Selamat Pagi' in English?", a: ["Good Evening", "Good Morning", "Goodbye", "Please"], correct: 1 },
  { q: "Which word means 'Excuse Me'?", a: ["Permisi", "Ya", "Tidak", "Berapa"], correct: 0 },
  { q: "How do you ask 'How much?'", a: ["Siapa?", "Apa?", "Dimana?", "Berapa?"], correct: 3 },
  { q: "What is 'Water' in Indonesian?", a: ["Api", "Udara", "Air", "Tanah"], correct: 2 },
  { q: "What is 'Rice' in Indonesian?", a: ["Nasi", "Mie", "Ayam", "Ikan"], correct: 0 },
  { q: "How do you say 'Beautiful'?", a: ["Jelek", "Besar", "Cantik", "Kecil"], correct: 2 },
  { q: "What does 'Hati-hati' mean?", a: ["Hurry up", "Be careful", "I love you", "Stop"], correct: 1 },
  { q: "How do you say 'I want'?", a: ["Saya mau", "Kamu bisa", "Dia pergi", "Mereka ada"], correct: 0 }
];

const GUIDE_DATA = [
  { category: "👋 Essentials", list: [{ e: "Hello / Hi", i: "Halo / Hai" }, { e: "How are you?", i: "Apa kabar?" }, { e: "Good Night", i: "Selamat Malam" }, { e: "I am sorry", i: "Maaf" }, { e: "Please", i: "Silahkan / Tolong" }] },
  { category: "🍴 Dining & Social", list: [{ e: "I want to eat", i: "Saya mau makan" }, { e: "Delicious", i: "Enak" }, { e: "Drinking water", i: "Air minum" }, { e: "The bill, please", i: "Minta bon" }, { e: "What is your name?", i: "Siapa nama kamu?" }] },
  { category: "🚕 Directions", list: [{ e: "Where is the toilet?", i: "Dimana kamar kecil?" }, { e: "Stop here", i: "Berhenti di sini" }, { e: "Turn left", i: "Belok kiri" }, { e: "Turn right", i: "Belok kanan" }] }
];

// --- COMPONENTS ---
const MicIcon = ({ isListening }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24" className={isListening ? "mic-icon listening" : "mic-icon"}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.91V21h2v-3.09c3.39-.48 6-3.38 6-6.91h-2z"/>
  </svg>
);

const LanguageSelector = ({ selectedLang, setSelectedLang, placeholder, languageOptions, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const filtered = useMemo(() => languageOptions.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 40), [languageOptions, searchTerm]);
  
  useEffect(() => {
    const clickOutside = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const currentName = languageOptions.find(l => l.code === selectedLang)?.name || "";
  
  return (
    <div className="language-selector-container" ref={containerRef} style={{ flex: 1 }}>
      <input type="text" className="lang-selector-display" placeholder={isLoading ? "Loading..." : placeholder} value={isOpen ? searchTerm : currentName} onChange={(e) => setSearchTerm(e.target.value)} onClick={() => setIsOpen(true)} readOnly={!isOpen} />
      {isOpen && <ul className="language-list">{filtered.map(l => (<li key={l.code} onClick={() => { setSelectedLang(l.code); setIsOpen(false); setSearchTerm(""); }}>{l.name}</li>))}</ul>}
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

  // --- NEW: THEME STATE ---
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") !== "light");

  const [phrasebook, setPhrasebook] = useState(() => JSON.parse(localStorage.getItem("phrasebook")) || []);
  const [librarySearch, setLibrarySearch] = useState("");

  const [userXP, setUserXP] = useState(() => parseInt(localStorage.getItem("userXP")) || 0);
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("userStreak")) || 0);
  const [hasFreeze, setHasFreeze] = useState(() => localStorage.getItem("streakFreeze") === "true");

  const [quizPool, setQuizPool] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  // --- PERSISTENCE & THEME EFFECT ---
  useEffect(() => { localStorage.setItem("phrasebook", JSON.stringify(phrasebook)); }, [phrasebook]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme');
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add('light-theme');
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // --- STREAK LOGIC ---
  useEffect(() => {
    const lastVisit = localStorage.getItem("lastVisit");
    const today = new Date().setHours(0, 0, 0, 0);
    if (!lastVisit) { setStreak(1); localStorage.setItem("userStreak", "1"); }
    else {
      const lastDate = new Date(parseInt(lastVisit)).setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - lastDate) / (86400000));
      if (diffDays === 1) { setStreak(prev => { const next = prev + 1; localStorage.setItem("userStreak", next.toString()); return next; }); }
      else if (diffDays > 1) {
        if (localStorage.getItem("streakFreeze") === "true" && diffDays === 2) {
          setNotification("Streak Freeze used! ❄️");
          localStorage.setItem("streakFreeze", "false");
          setHasFreeze(false);
        } else { setStreak(1); localStorage.setItem("userStreak", "1"); }
      }
    }
    localStorage.setItem("lastVisit", today.toString());
  }, []);

  useEffect(() => {
    const fetchLangs = async () => {
      try {
        const res = await axios.get("https://text-translator2.p.rapidapi.com/getLanguages", {
          headers: { "X-RapidAPI-Key": "61f487d004msh9cd3b694cc0c745p1fe8f7jsn2f795d92f8b6", "X-RapidAPI-Host": "text-translator2.p.rapidapi.com" }
        });
        setLanguages(res.data.data.languages || []);
      } catch (e) { setNotification("Offline Mode: Language list limited."); }
    };
    fetchLangs();
  }, []);

  const saveToPhrasebook = () => {
    if (!translatedText || translatedText === "...") return;
    if (phrasebook.some(p => p.original === inputText)) {
        setNotification("Already in your Phrasebook! ⭐");
        return;
    }
    const entry = { id: Date.now(), original: inputText, translated: translatedText, pair: `${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()}` };
    setPhrasebook([entry, ...phrasebook]);
    setNotification("Saved to Library! 📚");
  };

  const filteredLibrary = useMemo(() => {
    return phrasebook.filter(p => 
      p.original.toLowerCase().includes(librarySearch.toLowerCase()) || 
      p.translated.toLowerCase().includes(librarySearch.toLowerCase())
    );
  }, [phrasebook, librarySearch]);

  const handleTranslate = async () => {
    if (!inputText.trim() || isTranslating) return;
    setIsTranslating(true);
    try {
      const res = await axios.post("https://text-translator2.p.rapidapi.com/translate", 
        new URLSearchParams({ source_language: sourceLang, target_language: targetLang, text: inputText }),
        { headers: { "X-RapidAPI-Key": "61f487d004msh9cd3b694cc0c745p1fe8f7jsn2f795d92f8b6", "X-RapidAPI-Host": "text-translator2.p.rapidapi.com" } }
      );
      setTranslatedText(res.data.data.translatedText);
    } catch (e) { setNotification("Translation failed."); }
    setIsTranslating(false);
  };

  const handleAnswer = (idx) => {
    if (isAnswered) return;
    const correct = quizPool[currentQuestion].correct;
    setIsAnswered(true);
    if (idx === correct) { 
      setLastResult("AWESOME! 🎉 ✨"); 
      setScore(s => s + 1); 
    } else { 
      setLastResult("OOPS! ❌"); 
      setWrongAnswers(p => [...p, { q: quizPool[currentQuestion].q, correct: quizPool[currentQuestion].a[correct] }]); 
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 < quizPool.length) { setCurrentQuestion(p => p + 1); setIsAnswered(false); setLastResult(null); }
      else {
        const earned = (score + (idx === correct ? 1 : 0)) * 20;
        setUserXP(p => { const n = p + earned; localStorage.setItem("userXP", n.toString()); return n; });
        setShowScore(true);
      }
    }, 1200);
  };

  const resetQuiz = useCallback(() => {
    const shuffled = [...FULL_QUIZ_DATA].sort(() => 0.5 - Math.random()).slice(0, 5);
    setQuizPool(shuffled);
    setCurrentQuestion(0); setScore(0); setShowScore(false); setIsAnswered(false); setLastResult(null); setWrongAnswers([]);
  }, []);

  useEffect(() => { resetQuiz(); }, [resetQuiz]);

  return (
    <div className="app-main-wrapper">
      <nav className="nav-tabs">
        <button className={activeTab === 'translator' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('translator')}>🔄 Translator</button>
        <button className={activeTab === 'library' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('library')}>⭐ Library</button>
        <button className={activeTab === 'quiz' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('quiz')}>🎯 Quiz</button>
        <button className={activeTab === 'social' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('social')}>🏆 Profile</button>
        <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      </nav>

      {notification && <div className="notification-bar">{notification}</div>}

      <main className="content-area">
        {activeTab === 'translator' && (
          <section className="translator-container">
            <div className="top-stats-row"><span className="streak-badge">🔥 {streak} Day Streak</span></div>
            <h2>Smart Translator</h2>
            <div className="input-field-wrapper">
              <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} className="text-input" placeholder="Type here..." />
              <button onClick={() => setListening(!listening)} className="mic-btn"><MicIcon isListening={listening} /></button>
            </div>
            <div className="horizontal-controls" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <LanguageSelector selectedLang={sourceLang} setSelectedLang={setSourceLang} placeholder="From" languageOptions={languages} isLoading={languages.length === 0} />
              <button className="swap-btn" onClick={() => { setSourceLang(targetLang); setTargetLang(sourceLang); }}>⇄</button>
              <LanguageSelector selectedLang={targetLang} setSelectedLang={setTargetLang} placeholder="To" languageOptions={languages} isLoading={languages.length === 0} />
            </div>
            <button onClick={handleTranslate} className="translate-button" disabled={isTranslating} style={{ width: '100%', marginBottom: '15px' }}>
              {isTranslating ? "Processing..." : "Translate"}
            </button>
            <div className="result-box">{translatedText}</div>
            
            <div className="action-row" style={{display: 'flex', gap: '10px'}}>
              <button className="speak-btn" style={{flex: 1}} onClick={() => {
                const msg = new SpeechSynthesisUtterance(translatedText);
                msg.lang = targetLang;
                window.speechSynthesis.speak(msg);
              }}>🔊 Pronounce</button>
              <button className="save-btn" onClick={saveToPhrasebook}>⭐ Save</button>
            </div>
          </section>
        )}

        {activeTab === 'library' && (
          <section className="guide-container">
            <h2>My Phrasebook</h2>
            <input type="text" className="search-bar" placeholder="Search your saved phrases..." value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} />
            {filteredLibrary.length === 0 ? (
                <p style={{textAlign: 'center', opacity: 0.6}}>No phrases found.</p>
            ) : (
                filteredLibrary.map(item => (
                    <div key={item.id} className="phrase-card">
                        <div>
                            <small className="pair-label">{item.pair}</small>
                            <h4>{item.original}</h4>
                            <p className="translated-text">{item.translated}</p>
                        </div>
                        <button className="delete-btn" onClick={() => setPhrasebook(phrasebook.filter(p => p.id !== item.id))}>🗑️</button>
                    </div>
                ))
            )}
          </section>
        )}

        {activeTab === 'guide' && (
          <section className="guide-container">
            <h2>Language Guide</h2>
            {GUIDE_DATA.map((cat, i) => (
              <div key={i} className="guide-card">
                <h3 className="gold-text">{cat.category}</h3>
                {cat.list.map((item, j) => (
                  <div key={j} className="phrase-row">
                    <span>{item.e}</span>
                    <span className="gold-text"><strong>{item.i}</strong></span>
                  </div>
                ))}
              </div>
            ))}
          </section>
        )}

        {activeTab === 'quiz' && (
          <section className="quiz-container">
            <h2>Practice</h2>
            {showScore ? (
              <div className="result-screen">
                <div className="score-circle"><span>{score}/5</span></div>
                <p>Earned: {score * 20} XP</p>
                {wrongAnswers.length > 0 && (
                  <div className="review-section">
                    <h4>Review:</h4>
                    {wrongAnswers.map((w, idx) => (
                      <div key={idx} className="review-item"><p>{w.q}</p><strong>{w.correct}</strong></div>
                    ))}
                  </div>
                )}
                <button className="translate-button" onClick={resetQuiz} style={{ marginTop: '15px' }}>Play Again</button>
              </div>
            ) : (
              quizPool.length > 0 && (
                <div className="question-box">
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}></div></div>
                  <h3 className="question-text">{quizPool[currentQuestion].q}</h3>
                  {lastResult && <div className={`quiz-feedback ${lastResult.includes("AWESOME") ? "success" : "error"}`}>{lastResult}</div>}
                  <div className="options-grid">
                    {quizPool[currentQuestion].a.map((opt, i) => (
                      <button key={i} className="option-btn" onClick={() => handleAnswer(i)} disabled={isAnswered}>{opt}</button>
                    ))}
                  </div>
                </div>
              )
            )}
          </section>
        )}

        {activeTab === 'social' && (
          <section className="guide-container">
            <div className="streak-card">
              <div className="streak-flame">🔥</div>
              <h3>{streak} Day Streak</h3>
              <div className="xp-bar-container">
                 <div className="xp-fill" style={{width: `${(userXP % 1000) / 10}%`}}></div>
              </div>
              <p>Total Balance: {userXP} XP</p>
            </div>
            <h3 className="gold-text" style={{marginTop: '20px'}}>Store</h3>
            <div className={`freeze-buy-card ${hasFreeze ? 'owned' : ''}`} onClick={() => {
               if (userXP >= 150 && !hasFreeze) {
                 setUserXP(p => p - 150); setHasFreeze(true); localStorage.setItem("streakFreeze", "true");
               }
            }}>
              <span>Streak Freeze (150 XP)</span>
              <strong>{hasFreeze ? "OWNED" : "BUY"}</strong>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;