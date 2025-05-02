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
let lastOrderCheckTime = 0;

// State
let currentViewingOrder = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Register this device as an owner device
    initializeOwnerDevice();
    
    // Load orders from storage
    loadOrders();
    
    // Load menu items
    loadMenuItems();
    
    // Check for new orders
    checkForNewOrders();
    
    // Render orders
    renderPendingOrders();
    renderCompletedOrders();
    
    // Set up tab navigation
    setupTabs();
    
    // Setup menu management
    setupMenuManagement();
    
    // Refresh orders every 3 seconds
    setInterval(checkForNewOrders, 3000);
});

// Register this device as an owner device
function initializeOwnerDevice() {
    if (!localStorage.getItem('device_id')) {
        const deviceId = 'owner_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('device_id', deviceId);
    }
    localStorage.setItem('is_owner_device', 'true');
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

function loadOrders() {
    // First check sessionStorage (for real-time updates)
    const sessionOrders = sessionStorage.getItem('coffee_shop_orders');
    if (sessionOrders) {
        const allOrders = JSON.parse(sessionOrders);
        
        // Filter into pending and completed
        pendingOrders = allOrders.filter(order => !order.completed && !order.cancelled);
        completedOrders = allOrders.filter(order => order.completed || order.cancelled);
    } else {
        // Fall back to localStorage if sessionStorage is empty
        const savedOrders = localStorage.getItem('coffee_shop_orders');
        if (savedOrders) {
            const allOrders = JSON.parse(savedOrders);
            
            // Filter into pending and completed
            pendingOrders = allOrders.filter(order => !order.completed && !order.cancelled);
            completedOrders = allOrders.filter(order => order.completed || order.cancelled);
            
            // Store in sessionStorage for cross-tab communication
            sessionStorage.setItem('coffee_shop_orders', savedOrders);
        }
    }
    
    // Sort by timestamp (newest first)
    pendingOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    completedOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Record when we last checked
    lastOrderCheckTime = Date.now();
}

function loadMenuItems() {
    // First check sessionStorage (for real-time updates)
    const sessionMenu = sessionStorage.getItem('coffee_shop_menu');
    if (sessionMenu) {
        menuItems = JSON.parse(sessionMenu);
    } else {
        // Fall back to localStorage
        const savedMenu = localStorage.getItem('coffee_shop_menu');
        if (savedMenu) {
            menuItems = JSON.parse(savedMenu);
            // Store in sessionStorage for cross-tab communication
            sessionStorage.setItem('coffee_shop_menu', savedMenu);
        } else {
            // Initialize with default menu
            menuItems = [
                { id: 1, name: 'Espresso', price: 3.50, category: 'coffee', available: true },
                { id: 2, name: 'Cappuccino', price: 4.50, category: 'coffee', available: true },
                { id: 3, name: 'Latte', price: 4.75, category: 'coffee', available: true },
                { id: 4, name: 'Green Tea', price: 3.25, category: 'tea', available: true },
                { id: 5, name: 'Black Tea', price: 3.25, category: 'tea', available: true },
                { id: 6, name: 'Croissant', price: 2.75, category: 'pastry', available: true },
                { id: 7, name: 'Chocolate Muffin', price: 3.00, category: 'pastry', available: true }
            ];
            saveMenuItems();
        }
    }
}

function saveMenuItems() {
    // Save to both localStorage and sessionStorage for cross-tab/cross-device sync
    const menuJson = JSON.stringify(menuItems);
    localStorage.setItem('coffee_shop_menu', menuJson);
    sessionStorage.setItem('coffee_shop_menu', menuJson);
    localStorage.setItem('menu_last_updated', Date.now().toString());
}

function saveOrders() {
    // Combine pending and completed orders
    const allOrders = [...pendingOrders, ...completedOrders];
    
    // Save to both localStorage and sessionStorage for cross-tab/cross-device sync
    const ordersJson = JSON.stringify(allOrders);
    localStorage.setItem('coffee_shop_orders', ordersJson);
    sessionStorage.setItem('coffee_shop_orders', ordersJson);
    localStorage.setItem('orders_last_updated', Date.now().toString());
}

function checkForNewOrders() {
    // First check for new orders in sessionStorage
    const sessionOrders = sessionStorage.getItem('coffee_shop_orders');
    if (sessionOrders) {
        const allOrders = JSON.parse(sessionOrders);
        const newPendingOrders = allOrders.filter(order => !order.completed && !order.cancelled);
        
        // Check if there are more pending orders than we have or if the last order time is newer
        const lastOrderTime = parseInt(sessionStorage.getItem('last_order_time') || '0', 10);
        
        if (newPendingOrders.length > pendingOrders.length || lastOrderTime > lastOrderCheckTime) {
            // Update our orders
            pendingOrders = newPendingOrders;
            completedOrders = allOrders.filter(order => order.completed || order.cancelled);
            
            // Sort by timestamp (newest first)
            pendingOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            completedOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Update UI
            renderPendingOrders();
            renderCompletedOrders();
            
            // Show notification
            showNotification();
            
            // Play sound
            playNotificationSound();
            
            // Update last check time
            lastOrderCheckTime = Date.now();
        }
    }
    
    // Also check localStorage (in case another window updated it)
    const localOrders = localStorage.getItem('coffee_shop_orders');
    const ordersLastUpdated = parseInt(localStorage.getItem('orders_last_updated') || '0', 10);
    
    if (localOrders && ordersLastUpdated > lastOrderCheckTime) {
        // Update sessionStorage with the latest orders
        sessionStorage.setItem('coffee_shop_orders', localOrders);
        
        // Re-check sessionStorage orders
        checkForNewOrders();
    }
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
    
    // Mark as new if less than 5 minutes old
    const orderTime = new Date(order.timestamp);
    const now = new Date();
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
            <button class="btn btn-view" data-order-id="${order.orderNumber}">View Details</button>
            ${type === 'pending' ? `
                <button class="btn btn-complete" data-order-id="${order.orderNumber}">Complete</button>
                <button class="btn btn-cancel" data-order-id="${order.orderNumber}">Cancel</button>
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
    const orderDate = new Date(order.timestamp);
    const formattedDate = `${orderDate.toLocaleDateString()} ${orderDate.toLocaleTimeString()}`;
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

function completeOrder(order) {
    // Update order
    order.completed = true;
    order.completedAt = new Date().toISOString();
    
    // Move from pending to completed
    pendingOrders = pendingOrders.filter(o => o.orderNumber !== order.orderNumber);
    completedOrders.unshift(order); // add to beginning
    
    // Save changes
    saveOrders();
    
    // Update UI
    renderPendingOrders();
    renderCompletedOrders();
}

function cancelOrder(order) {
    // Update order
    order.cancelled = true;
    order.cancelledAt = new Date().toISOString();
    
    // Move from pending to completed
    pendingOrders = pendingOrders.filter(o => o.orderNumber !== order.orderNumber);
    completedOrders.unshift(order); // add to beginning
    
    // Save changes
    saveOrders();
    
    // Update UI
    renderPendingOrders();
    renderCompletedOrders();
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
    
    // Update menu tables with current data
    updateMenuTables(menuTables);
    
    // Setup edit and toggle buttons
    setupMenuButtons();
}

function updateMenuTables(menuTables) {
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

function editMenuItem(itemId) {
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
    
    // Save changes
    saveMenuItems();
    
    // Update tables
    updateMenuTables();
    
    // Show confirmation
    alert(`Menu item "${item.name}" has been updated.`);
}

function toggleMenuItemAvailability(itemId) {
    // Find the item
    const item = menuItems.find(item => item.id == itemId);
    
    if (!item) return;
    
    // Toggle availability
    item.available = !item.available;
    
    // Save changes
    saveMenuItems();
    
    // Update tables
    updateMenuTables();
    
    // Show confirmation
    alert(`Menu item "${item.name}" is now ${item.available ? 'available' : 'unavailable'}.`);
}

// Add New Menu Item Function
function addMenuItem() {
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
    
    // Save changes
    saveMenuItems();
    
    // Update tables
    updateMenuTables();
    
    // Show confirmation
    alert(`New menu item "${name}" has been added.`);
}

// Add event listener for the "Add New Item" button
document.addEventListener('DOMContentLoaded', () => {
    const addItemButton = document.getElementById('add-item-button');
    if (addItemButton) {
        addItemButton.addEventListener('click', addMenuItem);
    }
});