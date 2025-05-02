// DOM Elements
const cartButton = document.getElementById('cart-button');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.querySelector('.close');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const orderForm = document.getElementById('order-form');
const orderConfirmation = document.getElementById('order-confirmation');
const closeConfirmation = document.querySelector('.close-confirmation');
const orderNumber = document.getElementById('order-number');

// Cart data
let cart = [];
let orderCounter = 1000; // Starting order number
let menuItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get device ID or create one if it doesn't exist
    initializeDeviceId();
    
    // Initialize order counter
    initializeOrderCounter();
    
    // Load menu items from localStorage
    loadMenuItems();
    
    // Update menu UI based on availability
    updateMenuUI();
    
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('coffee_shop_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        renderCart();
    }
    
    // Set up polling for menu updates
    setInterval(checkForMenuUpdates, 5000);
});

// Generate a unique device ID if one doesn't exist
function initializeDeviceId() {
    if (!localStorage.getItem('device_id')) {
        const deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', deviceId);
    }
}

// Initialize order counter
function initializeOrderCounter() {
    const lastOrderCounter = localStorage.getItem('last_order_number');
    if (lastOrderCounter) {
        orderCounter = parseInt(lastOrderCounter, 10) + 1;
    } else {
        // Start from 1000 if no previous orders
        orderCounter = 1000;
    }
}

// Event Listeners
cartButton.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartModal);
closeConfirmation.addEventListener('click', closeConfirmationModal);
orderForm.addEventListener('submit', handleOrderSubmit);

// Add items to cart
addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
        const menuItem = button.closest('.menu-item');
        const id = menuItem.dataset.id;
        const name = menuItem.dataset.name;
        const price = parseFloat(menuItem.dataset.price);
        
        // Check if item is available before adding to cart
        const item = menuItems.find(item => item.id == id);
        if (item && item.available) {
            addToCart(id, name, price);
        } else {
            alert('Sorry, this item is currently unavailable.');
        }
    });
});

// Window event to close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        closeCartModal();
    }
    if (e.target === orderConfirmation) {
        closeConfirmationModal();
    }
});

// Functions
function loadMenuItems() {
    // Load from localStorage or use defaults
    const savedMenu = localStorage.getItem('coffee_shop_menu');
    if (savedMenu) {
        menuItems = JSON.parse(savedMenu);
        // Store the last menu update timestamp
        localStorage.setItem('menu_last_loaded', Date.now().toString());
    } else {
        // Load from sessionStorage (cross-tab/cross-device storage)
        const sessionMenu = sessionStorage.getItem('coffee_shop_menu');
        if (sessionMenu) {
            menuItems = JSON.parse(sessionMenu);
            // Save to localStorage for future use
            localStorage.setItem('coffee_shop_menu', sessionMenu);
            localStorage.setItem('menu_last_loaded', Date.now().toString());
        } else {
            // Default menu items with all available
            menuItems = [
                { id: 1, name: 'Espresso', price: 3.50, category: 'coffee', available: true },
                { id: 2, name: 'Cappuccino', price: 4.50, category: 'coffee', available: true },
                { id: 3, name: 'Latte', price: 4.75, category: 'coffee', available: true },
                { id: 4, name: 'Green Tea', price: 3.25, category: 'tea', available: true },
                { id: 5, name: 'Black Tea', price: 3.25, category: 'tea', available: true },
                { id: 6, name: 'Croissant', price: 2.75, category: 'pastry', available: true },
                { id: 7, name: 'Chocolate Muffin', price: 3.00, category: 'pastry', available: true }
            ];
            
            // Save to both localStorage and sessionStorage
            localStorage.setItem('coffee_shop_menu', JSON.stringify(menuItems));
            sessionStorage.setItem('coffee_shop_menu', JSON.stringify(menuItems));
            localStorage.setItem('menu_last_loaded', Date.now().toString());
        }
    }
}

function checkForMenuUpdates() {
    // Get menu from sessionStorage (shared across tabs/windows)
    const sessionMenu = sessionStorage.getItem('coffee_shop_menu');
    if (!sessionMenu) return;
    
    const lastLoaded = parseInt(localStorage.getItem('menu_last_loaded') || '0', 10);
    const now = Date.now();
    
    // If it's been more than 5 seconds since last load, check for updates
    if (now - lastLoaded > 5000) {
        const newMenuItems = JSON.parse(sessionMenu);
        
        // Compare with current menu
        if (JSON.stringify(newMenuItems) !== JSON.stringify(menuItems)) {
            // Update menu items
            menuItems = newMenuItems;
            localStorage.setItem('coffee_shop_menu', sessionMenu);
            localStorage.setItem('menu_last_loaded', now.toString());
            
            // Update UI based on new menu
            updateMenuUI();
            
            // Also update cart if needed (remove unavailable items)
            renderCart();
        }
    }
}

function updateMenuUI() {
    // Update each menu item based on availability
    const menuItemElements = document.querySelectorAll('.menu-item');
    
    menuItemElements.forEach(element => {
        const id = element.dataset.id;
        const menuItem = menuItems.find(item => item.id == id);
        
        if (menuItem && !menuItem.available) {
            // Item is unavailable, grey it out and disable the button
            element.classList.add('unavailable');
            const button = element.querySelector('.add-to-cart');
            button.disabled = true;
            button.textContent = 'Unavailable';
        } else {
            // Item is available, ensure it's enabled
            element.classList.remove('unavailable');
            const button = element.querySelector('.add-to-cart');
            button.disabled = false;
            button.textContent = 'Add to Cart';
        }
    });
}

function openCart(e) {
    e.preventDefault();
    cartModal.style.display = 'block';
}

function closeCartModal() {
    cartModal.style.display = 'none';
}

function closeConfirmationModal() {
    orderConfirmation.style.display = 'none';
}

function addToCart(id, name, price) {
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    // Save to localStorage
    saveCart();
    
    // Update UI
    updateCartCount();
    renderCart();
    
    // Show feedback
    showAddedToCartFeedback(name);
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

function renderCart() {
    // Clear current cart display
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }
    
    // Filter out any unavailable items
    const availableItems = cart.filter(cartItem => {
        const menuItem = menuItems.find(item => item.id == cartItem.id);
        return menuItem && menuItem.available;
    });
    
    // If items were removed due to availability, update cart
    if (availableItems.length !== cart.length) {
        cart = availableItems;
        saveCart();
        alert('Some items in your cart are no longer available and have been removed.');
    }
    
    // Add each item to the cart display
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <span class="cart-item-name">${item.name}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                <span class="remove-item" data-id="${item.id}">🗑️</span>
            </div>
        `;
        cartItems.appendChild(cartItemElement);
    });
    
    // Add event listeners to the new buttons
    const decreaseButtons = document.querySelectorAll('.decrease');
    const increaseButtons = document.querySelectorAll('.increase');
    const removeButtons = document.querySelectorAll('.remove-item');
    
    decreaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            decreaseQuantity(button.dataset.id);
        });
    });
    
    increaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            increaseQuantity(button.dataset.id);
        });
    });
    
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            removeItem(button.dataset.id);
        });
    });
    
    // Update total
    updateTotal();
}

function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    
    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        removeItem(id);
        return;
    }
    
    saveCart();
    updateCartCount();
    renderCart();
}

function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    item.quantity += 1;
    
    saveCart();
    updateCartCount();
    renderCart();
}

function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    
    saveCart();
    updateCartCount();
    renderCart();
}

function updateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

function saveCart() {
    localStorage.setItem('coffee_shop_cart', JSON.stringify(cart));
}

function showAddedToCartFeedback(itemName) {
    const feedback = document.createElement('div');
    feedback.className = 'add-feedback';
    feedback.textContent = `${itemName} added to cart`;
    feedback.style.position = 'fixed';
    feedback.style.bottom = '20px';
    feedback.style.right = '20px';
    feedback.style.backgroundColor = '#4CAF50';
    feedback.style.color = 'white';
    feedback.style.padding = '10px 15px';
    feedback.style.borderRadius = '4px';
    feedback.style.zIndex = '1000';
    
    document.body.appendChild(feedback);
    
    // Remove feedback after 2 seconds
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 500);
    }, 2000);
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        return;
    }
    
    // Get form data
    const customerName = document.getElementById('customer-name').value;
    const tableNumber = document.getElementById('table-number').value;
    const specialInstructions = document.getElementById('special-instructions').value;
    
    // Update order counter
    localStorage.setItem('last_order_number', orderCounter.toString());
    
    // Create order object
    const order = {
        orderNumber: orderCounter++,
        timestamp: new Date().toISOString(),
        customer: customerName,
        tableNumber: tableNumber,
        specialInstructions: specialInstructions,
        items: cart,
        total: parseFloat(cartTotal.textContent),
        deviceId: localStorage.getItem('device_id')
    };
    
    // Send order to owner's dashboard
    sendOrderToOwner(order);
    
    // Show confirmation modal
    orderNumber.textContent = order.orderNumber;
    cartModal.style.display = 'none';
    orderConfirmation.style.display = 'block';
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Reset form
    orderForm.reset();
}

function sendOrderToOwner(order) {
    // Get existing orders
    let orders = JSON.parse(sessionStorage.getItem('coffee_shop_orders') || '[]');
    
    // Add the new order
    orders.push(order);
    
    // Store in sessionStorage (accessible across tabs/windows)
    sessionStorage.setItem('coffee_shop_orders', JSON.stringify(orders));
    
    // Also save to localStorage for persistence
    localStorage.setItem('coffee_shop_orders', JSON.stringify(orders));
    localStorage.setItem('orders_last_updated', Date.now().toString());
    
    // Create a timestamp of when the order was placed
    sessionStorage.setItem('last_order_time', Date.now().toString());
} 