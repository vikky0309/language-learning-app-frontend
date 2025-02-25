import React, { useState } from 'react';

function Profile() {
    const [profile, setProfile] = useState({
        username: 'User123',
        email: 'user@example.com',
        language: 'Spanish',
    });

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Save the updated profile (e.g., to local storage or an API)
        console.log('Profile updated:', profile);
    };

    return (
        <div>
            <h2>Profile</h2>
            <form onSubmit={handleSubmit}>
                <label>Username:</label>
                <input type="text" name="username" value={profile.username} onChange={handleChange} />
                <label>Email:</label>
                <input type="email" name="email" value={profile.email} onChange={handleChange} />
                <label>Language:</label>
                <input type="text" name="language" value={profile.language} onChange={handleChange} />
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
}

export default Profile;