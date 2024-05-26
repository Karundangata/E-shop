const baseUrl = "http://localhost:3000/users";

document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Check if any field is empty
    if (!username || !email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const user = {
        username,
        email,
        password
    };

    try {
        // Check if username already exists
        const usersResponse = await fetch(baseUrl);
        if (!usersResponse.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await usersResponse.json();

        if (users.some(existingUser => existingUser.username === username)) {
            alert('Username already exists');
            return;
        }

        // Create new user
        const postResponse = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (postResponse.ok) {
            alert('User created successfully');
            window.location.href = 'index.html';
        } else {
            const errorMessage = await postResponse.text();
            alert('Error creating user');
            console.error('Error response:', errorMessage);
        }
    } catch (error) {
        alert('An error occurred');
        console.error('Error:', error);
    }
});
