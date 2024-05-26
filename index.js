document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('product-grid');
    const cartCountElement = document.getElementById('cart-count');
    const addProductForm = document.getElementById('add-product-form');
    const orderButton = document.querySelector('nav ul li:nth-child(5) a'); // Assuming "Order" button is the 5th item in the list

    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:3000/product');
            if (!response.ok) throw new Error('Failed to fetch products');
            products = await response.json();
            renderProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    async function saveProduct(product) {
        try {
            const response = await fetch('http://localhost:3000/product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product),
            });

            if (!response.ok) throw new Error('Failed to add product');
            const newProduct = await response.json();
            products.push(newProduct);
            renderProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    }

    function addToCart(product) {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            const cartProduct = { ...product, quantity: 1 };
            cart.push(cartProduct);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        cartCountElement.textContent = cart.length;
    }

    function renderProducts() {
        productGrid.innerHTML = '';
        products.forEach(product => {
            const div = document.createElement('div');
            div.className = 'product';
            div.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            `;
            productGrid.appendChild(div);
        });
    }

    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value;

        const product = { name, price, image };

        await saveProduct(product);
        addProductForm.reset();
    });

    productGrid.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const id = parseInt(e.target.getAttribute('data-id'), 10);
            const product = products.find(product => product.id === id);
            addToCart(product);
            window.location.href = './cart.html';
        }
    });

    // Event listener for Order button
    orderButton.addEventListener('click', () => {
        window.location.href = './order.html';
    });

    await fetchProducts();
    updateCartCount();
});
