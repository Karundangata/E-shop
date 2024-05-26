document.addEventListener('DOMContentLoaded', async () => {
    const orderSummaryElement = document.getElementById('order-summary');
    const orderForm = document.getElementById('order-form');
    const cartCountElement = document.getElementById('cart-count');

    let cart = [];

    async function fetchCart() {
        try {
            const response = await fetch('http://localhost:3000/cart');
            if (!response.ok) throw new Error('Failed to fetch cart');
            cart = await response.json();
            updateCart();
            renderOrderSummary();
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    }

    async function placeOrder(order) {
        try {
            const response = await fetch('http://localhost:3000/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order),
            });

            if (!response.ok) throw new Error('Failed to place order');
            await response.json();
            alert('Order placed successfully!');
            clearCart();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error placing order:', error);
        }
    }

    function clearCart() {
        cart = [];
        saveCart();
        updateCart();
    }

    async function saveCart() {
        try {
            await fetch('http://localhost:3000/cart', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cart),
            });
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    function updateCart() {
        cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    function renderOrderSummary() {
        orderSummaryElement.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'order-item';
            div.innerHTML = `
                <p>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</p>
            `;
            orderSummaryElement.appendChild(div);
            total += item.price * item.quantity;
        });
        const totalDiv = document.createElement('div');
        totalDiv.className = 'order-total';
        totalDiv.innerHTML = `<p>Total: $${total.toFixed(2)}</p>`;
        orderSummaryElement.appendChild(totalDiv);
    }

    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const order = {
            fullName: document.getElementById('full-name').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postal-code').value,
            country: document.getElementById('country').value,
            cardNumber: document.getElementById('card-number').value,
            expiryDate: document.getElementById('expiry-date').value,
            cvv: document.getElementById('cvv').value,
            cart,
        };

        await placeOrder(order);
    });

    await fetchCart();
});
// server.js

app.post('/order', (req, res) => {
    const newOrder = req.body;
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) return res.status(500).send('Error reading data');
        const jsonData = JSON.parse(data);
        jsonData.orders = jsonData.orders || [];
        jsonData.orders.push(newOrder);
        fs.writeFile(DATA_FILE, JSON.stringify(jsonData, null, 2), err => {
            if (err) return res.status(500).send('Error writing data');
            res.sendStatus(200);
        });
    });
});
