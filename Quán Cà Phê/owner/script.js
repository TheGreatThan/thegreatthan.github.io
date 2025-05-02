// Import the cloudStorage from the Firebase config
import { cloudStorage } from '../firebase-config.js';

// DOM Elements
const tabLinks = document.querySelectorAll('nav ul li a');
const tabContents = document.querySelectorAll('.tab-content');
const pendingOrdersContainer = document.getElementById('pending-orders-container');
const completedOrdersContainer = document.getElementById('completed-orders-container');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const orderNotification = document.getElementById('new-order-notification');
const dismissNotification = document.getElementById('dismiss-notification');
const orderDetailsModal = document.getElementById('order-details-modal');
const closeModal = document.querySelector('.close');
const notificationSound = document.getElementById('notification-sound');
const editButtons = document.querySelectorAll('.btn-edit');
const toggleButtons = document.querySelectorAll('.btn-toggle');

// Modal detail elements
const detailOrderNumber = document.getElementById('detail-order-number');
const detailCustomer = document.getElementById('detail-customer');
const detailTable = document.getElementById('detail-table');
const detailTime = document.getElementById('detail-time');
const detailItems = document.getElementById('detail-items');
const detailTotal = document.getElementById('detail-total');
const detailInstructions = document.getElementById('detail-instructions');
const detailActions = document.getElementById('detail-actions');

// Order data
let pendingOrders = [];
let completedOrders = [];
let menuItems = [];
let orderUnsubscribe = null; // Firebase order listener
let menuUnsubscribe = null; // Firebase menu listener

// State
let currentViewingOrder = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Register this device as an owner device
    initializeOwnerDevice();
    
    // Initialize data
    initializeOrderListener();
    initializeMenuListener();
    
    // Set up tab navigation
    setupTabs();
    
    // Setup menu management
    setupMenuManagement();
});

// Register this device as an owner device
function initializeOwnerDevice() {
    if (!localStorage.getItem('device_id')) {
        const deviceId = 'owner_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', deviceId);
    }
    localStorage.setItem('is_owner_device', 'true');
}

// Initialize Firebase order listener
function initializeOrderListener() {
    orderUnsubscribe = cloudStorage.listenForOrders((orders) => {
        // Filter orders into pending and completed
        pendingOrders = orders.filter(order => !order.completed && !order.cancelled);
        completedOrders = orders.filter(order => order.completed || order.cancelled);
        
        // Update UI
        renderPendingOrders();
        renderCompletedOrders();
        
        // Show notification for new orders
        if (pendingOrders.length > 0) {
            showNotification();
            playNotificationSound();
        }
    });
}

// Initialize Firebase menu listener
function initializeMenuListener() {
    menuUnsubscribe = cloudStorage.listenForMenuChanges((updatedMenu) => {
        menuItems = updatedMenu;
        
        // Update menu tables if we're on the menu tab
        const menuTab = document.getElementById('menu-management');
        if (menuTab.classList.contains('active')) {
            updateMenuTables();
        }
    });
}

// Event Listeners
dismissNotification.addEventListener('click', hideNotification);
closeModal.addEventListener('click', closeOrderDetails);

// Window event to close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === orderDetailsModal) {
        closeOrderDetails();
    }
});

// Functions
function setupTabs() {
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabLinks.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to clicked tab
            link.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the corresponding tab content
            const tabId = link.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function renderPendingOrders() {
    // Clear current display
    pendingOrdersContainer.innerHTML = '';
    
    // Update count
    pendingCount.textContent = pendingOrders.length;
    
    // Show empty state if no orders
    if (pendingOrders.length === 0) {
        pendingOrdersContainer.innerHTML = `
            <div class="empty-state" id="empty-pending">
                <p>No pending orders at the moment</p>
            </div>
        `;
        return;
    }
    
    // Add each order to the display
    pendingOrders.forEach(order => {
        const orderElement = createOrderCard(order, 'pending');
        pendingOrdersContainer.appendChild(orderElement);
    });
}

function renderCompletedOrders() {
    // Clear current display
    completedOrdersContainer.innerHTML = '';
    
    // Update count
    completedCount.textContent = completedOrders.length;
    
    // Show empty state if no orders
    if (completedOrders.length === 0) {
        completedOrdersContainer.innerHTML = `
            <div class="empty-state" id="empty-completed">
                <p>No completed orders yet</p>
            </div>
        `;
        return;
    }
    
    // Add each order to the display
    completedOrders.forEach(order => {
        const orderElement = createOrderCard(order, 'completed');
        completedOrdersContainer.appendChild(orderElement);
    });
}

function createOrderCard(order, type) {
    const card = document.createElement('div');
    card.className = 'order-card';
    
    // Mark as new if order was created within the last 5 minutes
    const now = new Date();
    const orderTime = order.timestamp ? new Date(order.timestamp.seconds * 1000) : now; // Handle Firestore timestamp
    const timeDiff = (now - orderTime) / 1000 / 60; // difference in minutes
    
    if (timeDiff < 5 && type === 'pending') {
        card.classList.add('new');
    }
    
    // Format timestamp
    const formattedTime = formatTime(orderTime);
    
    // Get summary of items
    const itemSummary = getItemSummary(order.items);
    
    // Create the order card content
    card.innerHTML = `
        <div class="order-header">
            <div class="order-number">Order #${order.orderNumber}</div>
            <div class="order-time">${formattedTime}</div>
        </div>
        <div class="order-customer">Customer: <span>${order.customer}</span></div>
        <div class="order-table">Table: <span>${order.tableNumber}</span></div>
        <div class="order-summary">${itemSummary}</div>
        <div class="order-total">Total: $${order.total.toFixed(2)}</div>
        <div class="order-actions">
            <button class="btn btn-view" data-order-id="${order.id}">View Details</button>
            ${type === 'pending' ? `
                <button class="btn btn-complete" data-order-id="${order.id}">Complete</button>
                <button class="btn btn-cancel" data-order-id="${order.id}">Cancel</button>
            ` : ''}
        </div>
    `;
    
    // Add event listeners
    const viewButton = card.querySelector('.btn-view');
    viewButton.addEventListener('click', () => viewOrderDetails(order));
    
    if (type === 'pending') {
        const completeButton = card.querySelector('.btn-complete');
        completeButton.addEventListener('click', () => completeOrder(order));
        
        const cancelButton = card.querySelector('.btn-cancel');
        cancelButton.addEventListener('click', () => cancelOrder(order));
    }
    
    return card;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getItemSummary(items) {
    // Get total count of items
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Get names of first two items
    const itemNames = items.slice(0, 2).map(item => item.name);
    
    // Create summary text
    let summary = `${totalItems} item${totalItems !== 1 ? 's' : ''}: `;
    
    if (items.length <= 2) {
        summary += itemNames.join(', ');
    } else {
        summary += `${itemNames.join(', ')} +${items.length - 2} more`;
    }
    
    return summary;
}

function viewOrderDetails(order) {
    currentViewingOrder = order;
    
    // Fill in the details
    detailOrderNumber.textContent = order.orderNumber;
    detailCustomer.textContent = order.customer;
    detailTable.textContent = order.tableNumber;
    
    // Format the time
    const orderTime = order.timestamp ? new Date(order.timestamp.seconds * 1000) : new Date(); // Handle Firestore timestamp
    const formattedDate = `${orderTime.toLocaleDateString()} ${orderTime.toLocaleTimeString()}`;
    detailTime.textContent = formattedDate;
    
    // Clear items container
    detailItems.innerHTML = '';
    
    // Add each item
    order.items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-price">$${item.price.toFixed(2)}</span>
            </div>
            <div>
                <span class="item-quantity">x${item.quantity}</span>
            </div>
        `;
        detailItems.appendChild(itemElement);
    });
    
    // Set total
    detailTotal.textContent = order.total.toFixed(2);
    
    // Set special instructions
    detailInstructions.textContent = order.specialInstructions || 'None';
    
    // Set actions
    detailActions.innerHTML = '';
    
    if (!order.completed && !order.cancelled) {
        const completeButton = document.createElement('button');
        completeButton.className = 'btn btn-complete';
        completeButton.textContent = 'Complete Order';
        completeButton.addEventListener('click', () => {
            completeOrder(order);
            closeOrderDetails();
        });
        detailActions.appendChild(completeButton);
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-cancel';
        cancelButton.textContent = 'Cancel Order';
        cancelButton.addEventListener('click', () => {
            cancelOrder(order);
            closeOrderDetails();
        });
        detailActions.appendChild(cancelButton);
    }
    
    // Show modal
    orderDetailsModal.style.display = 'block';
}

function closeOrderDetails() {
    orderDetailsModal.style.display = 'none';
    currentViewingOrder = null;
}

async function completeOrder(order) {
    try {
        // Update order in Firebase
        await cloudStorage.updateOrder(order.id, {
            completed: true,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // UI will be updated automatically by the Firebase listener
    } catch (error) {
        console.error("Error completing order:", error);
        alert('There was a problem completing the order. Please try again.');
    }
}

async function cancelOrder(order) {
    try {
        // Update order in Firebase
        await cloudStorage.updateOrder(order.id, {
            cancelled: true,
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // UI will be updated automatically by the Firebase listener
    } catch (error) {
        console.error("Error cancelling order:", error);
        alert('There was a problem cancelling the order. Please try again.');
    }
}

function showNotification() {
    orderNotification.style.display = 'flex';
}

function hideNotification() {
    orderNotification.style.display = 'none';
}

function playNotificationSound() {
    // Try to play the sound if it exists
    if (notificationSound && notificationSound.src) {
        try {
            notificationSound.play();
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }
}

// Menu Management Functions
function setupMenuManagement() {
    // Get all menu tables
    const menuTables = document.querySelectorAll('.menu-table tbody');
    
    // Load menu data from Firebase
    cloudStorage.loadMenu().then(menu => {
        if (menu) {
            menuItems = menu;
            // Update menu tables with current data
            updateMenuTables();
        }
    });
    
    // Add event listener for the "Add New Item" button
    const addItemButton = document.getElementById('add-item-button');
    if (addItemButton) {
        addItemButton.addEventListener('click', addMenuItem);
    }
}

function updateMenuTables() {
    // Get all category sections
    const coffeeTable = document.querySelector('.menu-section:nth-child(1) .menu-table tbody');
    const teaTable = document.querySelector('.menu-section:nth-child(2) .menu-table tbody');
    const pastryTable = document.querySelector('.menu-section:nth-child(3) .menu-table tbody');
    
    // Clear all tables
    coffeeTable.innerHTML = '';
    teaTable.innerHTML = '';
    pastryTable.innerHTML = '';
    
    // Filter menu items by category
    const coffeeItems = menuItems.filter(item => item.category === 'coffee');
    const teaItems = menuItems.filter(item => item.category === 'tea');
    const pastryItems = menuItems.filter(item => item.category === 'pastry');
    
    // Add items to tables
    coffeeItems.forEach(item => {
        coffeeTable.appendChild(createMenuRow(item));
    });
    
    teaItems.forEach(item => {
        teaTable.appendChild(createMenuRow(item));
    });
    
    pastryItems.forEach(item => {
        pastryTable.appendChild(createMenuRow(item));
    });
    
    // Setup buttons again after updating tables
    setupMenuButtons();
}

function createMenuRow(item) {
    const row = document.createElement('tr');
    row.setAttribute('data-item-id', item.id);
    
    row.innerHTML = `
        <td>${item.name}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>${item.available ? 'Available' : 'Unavailable'}</td>
        <td>
            <button class="btn-edit" data-item-id="${item.id}">Edit</button>
            <button class="btn-toggle" data-item-id="${item.id}">${item.available ? 'Set Unavailable' : 'Set Available'}</button>
        </td>
    `;
    
    return row;
}

function setupMenuButtons() {
    // Get all edit and toggle buttons
    const editButtons = document.querySelectorAll('.btn-edit');
    const toggleButtons = document.querySelectorAll('.btn-toggle');
    
    // Add event listeners to edit buttons
    editButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-item-id');
            editMenuItem(itemId);
        });
    });
    
    // Add event listeners to toggle buttons
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.getAttribute('data-item-id');
            toggleMenuItemAvailability(itemId);
        });
    });
}

async function editMenuItem(itemId) {
    // Find the item
    const item = menuItems.find(item => item.id == itemId);
    
    if (!item) return;
    
    // Prompt for new values
    const newName = prompt('Enter new name:', item.name);
    if (newName === null) return; // User cancelled
    
    const newPrice = prompt('Enter new price:', item.price.toFixed(2));
    if (newPrice === null) return; // User cancelled
    
    // Update item
    item.name = newName;
    item.price = parseFloat(newPrice);
    
    try {
        // Save changes to Firebase
        await cloudStorage.saveMenu(menuItems);
        
        // Show confirmation
        alert(`Menu item "${item.name}" has been updated.`);
        
        // UI will be updated automatically by the Firebase listener
    } catch (error) {
        console.error("Error updating menu item:", error);
        alert('There was a problem updating the menu item. Please try again.');
    }
}

async function toggleMenuItemAvailability(itemId) {
    // Find the item
    const item = menuItems.find(item => item.id == itemId);
    
    if (!item) return;
    
    // Toggle availability
    item.available = !item.available;
    
    try {
        // Save changes to Firebase
        await cloudStorage.saveMenu(menuItems);
        
        // Show confirmation
        alert(`Menu item "${item.name}" is now ${item.available ? 'available' : 'unavailable'}.`);
        
        // UI will be updated automatically by the Firebase listener
    } catch (error) {
        console.error("Error toggling menu item availability:", error);
        alert('There was a problem updating the menu item. Please try again.');
    }
}

// Add New Menu Item Function
async function addMenuItem() {
    // Prompt for values
    const name = prompt('Enter item name:');
    if (name === null || name.trim() === '') return; // User cancelled or empty name
    
    const price = prompt('Enter price:');
    if (price === null) return; // User cancelled
    
    const categoryOptions = ['coffee', 'tea', 'pastry'];
    let category = prompt(`Enter category (${categoryOptions.join(', ')}):`);
    
    // Validate category
    while (!categoryOptions.includes(category)) {
        if (category === null) return; // User cancelled
        category = prompt(`Invalid category. Please enter one of: ${categoryOptions.join(', ')}`);
    }
    
    // Create new item
    const newId = Math.max(...menuItems.map(item => item.id), 0) + 1;
    const newItem = {
        id: newId,
        name: name,
        price: parseFloat(price),
        category: category,
        available: true
    };
    
    // Add to menu
    menuItems.push(newItem);
    
    try {
        // Save changes to Firebase
        await cloudStorage.saveMenu(menuItems);
        
        // Show confirmation
        alert(`New menu item "${name}" has been added.`);
        
        // UI will be updated automatically by the Firebase listener
    } catch (error) {
        console.error("Error adding menu item:", error);
        alert('There was a problem adding the menu item. Please try again.');
    }
}