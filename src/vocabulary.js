import React, { useState } from 'react';

function Vocabulary() {
    const [searchTerm, setSearchTerm] = useState('');
    const vocabulary = [
        { word: 'Hola', translation: 'Hello' },
        { word: 'Adiós', translation: 'Goodbye' },
        { word: 'Gracias', translation: 'Thank you' },
        { word: 'Por favor', translation: 'Please' },
        // Add more vocabulary words
    ];

    const filteredVocabulary = vocabulary.filter(item =>
        item.word.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <h2>Vocabulary</h2>
            <input
                type="text"
                placeholder="Search vocabulary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul>
                {filteredVocabulary.map((item, index) => (
                    <li key={index}>
                        {item.word} - {item.translation}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Vocabulary;