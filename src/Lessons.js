import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';

// Individual Lesson Components
function Lesson1() {
    return (
        <div>
            <h2>Lesson 1: Introduction to Spanish</h2>
            <p>Welcome to your first Spanish lesson! Let's start with the basics...</p>
            {/* Add more content for Lesson 1 */}
        </div>
    );
}

function Lesson2() {
    return (
        <div>
            <h2>Lesson 2: Basic Vocabulary</h2>
            <p>Let's learn some essential Spanish words...</p>
            {/* Add more content for Lesson 2 */}
        </div>
    );
}

function Lessons() {
    return (
        <div>
            <h2>Lessons</h2>
            <p>Welcome to the Lessons section!</p>
            <ul>
                <li><Link to="/lessons/lesson1">Lesson 1: Introduction to Spanish</Link></li>
                <li><Link to="/lessons/lesson2">Lesson 2: Basic Vocabulary</Link></li>
                {/* Add more lessons as needed */}
            </ul>
            <Routes>
                <Route path="/lessons/lesson1" element={<Lesson1 />} />
                <Route path="/lessons/lesson2" element={<Lesson2 />} />
            </Routes>
        </div>
    );
}

export default Lessons;