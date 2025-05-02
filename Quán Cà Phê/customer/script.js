// Import the cloudStorage from the Firebase config
import { cloudStorage } from '../firebase-config.js';

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
let menuUnsubscribe = null; // For Firebase menu listener

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get device ID or create one if it doesn't exist
    initializeDeviceId();
    
    // Initialize menu items
    initializeMenu();
    
    // Load cart from localStorage (still using localStorage for cart only)
    const savedCart = localStorage.getItem('coffee_shop_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
        renderCart();
    }
});

// Generate a unique device ID if one doesn't exist
function initializeDeviceId() {
    if (!localStorage.getItem('device_id')) {
        const deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', deviceId);
    }
}

// Initialize menu from Firebase
async function initializeMenu() {
    try {
        // Load menu items from Firebase
        const loadedMenu = await cloudStorage.loadMenu();
        if (loadedMenu) {
            menuItems = loadedMenu;
            updateMenuUI();
        }
        
        // Set up real-time listener for menu changes
        menuUnsubscribe = cloudStorage.listenForMenuChanges((updatedMenu) => {
            menuItems = updatedMenu;
            updateMenuUI();
            renderCart(); // Update cart if items become unavailable
        });
    } catch (error) {
        console.error("Error initializing menu:", error);
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
    
    // Save cart to localStorage (keep using localStorage for cart)
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

async function handleOrderSubmit(e) {
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
    
    // Create order object
    const order = {
        orderNumber: Date.now(), // Use timestamp as order number for uniqueness
        customer: customerName,
        tableNumber: tableNumber,
        specialInstructions: specialInstructions,
        items: cart,
        total: parseFloat(cartTotal.textContent),
        deviceId: localStorage.getItem('device_id'),
        completed: false,
        cancelled: false
    };
    
    try {
        // Save order to Firebase
        const orderId = await cloudStorage.saveOrder(order);
        
        if (orderId) {
            // Show confirmation modal with the order number
            orderNumber.textContent = order.orderNumber;
            cartModal.style.display = 'none';
            orderConfirmation.style.display = 'block';
            
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();
            
            // Reset form
            orderForm.reset();
        } else {
            alert('There was a problem placing your order. Please try again.');
        }
    } catch (error) {
        console.error("Error submitting order:", error);
        alert('There was a problem placing your order. Please try again.');
    }
} 