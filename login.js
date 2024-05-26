document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:3000/users');
    const users = await response.json();

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        alert('Login successful');
        window.location.href = 'index.html';
    } else {
        alert('Invalid username or password');
    }
});
