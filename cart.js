document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('product-grid');
    const cartCountElement = document.getElementById('cart-count');
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartModal = document.getElementById('cart-modal');
    const closeModal = document.querySelector('.close');
    const addProductForm = document.getElementById('add-product-form');
    const checkoutButton = document.getElementById('checkout-button');

    let products = [];
    let cart = [];

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

    async function fetchCart() {
        try {
            const response = await fetch('http://localhost:3000/cart');
            if (!response.ok) throw new Error('Failed to fetch cart');
            cart = await response.json();
            updateCart();
        } catch (error) {
            console.error('Error fetching cart:', error);
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

    async function saveCart() {
        try {
            await fetch(`http://localhost:3000/cart`, {
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

    function addToCart(product) {
        const existingProductIndex = cart.findIndex(item => item.id === product.id);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            const cartProduct = { ...product, quantity: 1 };
            cart.push(cartProduct);
        }
        saveCart();
        updateCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        saveCart();
        updateCart();
    }

    function updateCart() {
        cartItemsElement.innerHTML = '';
        let total = 0;
        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.name} - $${item.price.toFixed(2)} x ${item.quantity}
                <button class="decrease" data-index="${index}">-</button>
                <button class="increase" data-index="${index}">+</button>
                <button class="remove" data-index="${index}">Remove</button>
            `;
            cartItemsElement.appendChild(li);
            total += item.price * item.quantity;
        });
        cartTotalElement.textContent = total.toFixed(2);
        cartCountElement.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
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
            cartModal.style.display = 'block';
        }
    });

    cartItemsElement.addEventListener('click', e => {
        if (e.target.classList.contains('remove')) {
            const index = e.target.getAttribute('data-index');
            removeFromCart(index);
        } else if (e.target.classList.contains('decrease')) {
            const index = e.target.getAttribute('data-index');
            if (cart[index].quantity > 1) {
                cart[index].quantity--;
                saveCart();
                updateCart();
            } else {
                removeFromCart(index);
            }
        } else if (e.target.classList.contains('increase')) {
            const index = e.target.getAttribute('data-index');
            cart[index].quantity++;
            saveCart();
            updateCart();
        }
    });

    document.getElementById('cart-icon').addEventListener('click', () => {
        cartModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target == cartModal) {
            cartModal.style.display = 'none';
        }
    });

    checkoutButton.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });

    await fetchProducts();
    await fetchCart();
});
