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

// State
let currentViewingOrder = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load orders from localStorage
    loadOrders();
    
    // Check for new orders
    checkForNewOrders();
    
    // Render orders
    renderPendingOrders();
    renderCompletedOrders();
    
    // Set up tab navigation
    setupTabs();
    
    // Set up listeners for window messages
    setupMessageListener();
    
    // Refresh orders every 10 seconds
    setInterval(checkForNewOrders, 10000);
});

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

function setupMessageListener() {
    // Listen for messages from the customer page
    window.addEventListener('message', (event) => {
        if (event.data.type === 'new_order') {
            // Add the new order
            const order = event.data.order;
            pendingOrders.push(order);
            
            // Save to localStorage
            saveOrders();
            
            // Update UI
            renderPendingOrders();
            
            // Show notification
            showNotification();
            
            // Play sound
            playNotificationSound();
        }
    });
}

function loadOrders() {
    // Load from localStorage
    const savedOrders = localStorage.getItem('coffee_shop_orders');
    if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        
        // Filter into pending and completed
        pendingOrders = allOrders.filter(order => !order.completed && !order.cancelled);
        completedOrders = allOrders.filter(order => order.completed || order.cancelled);
        
        // Sort by timestamp (newest first)
        pendingOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        completedOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
}

function saveOrders() {
    // Combine pending and completed orders
    const allOrders = [...pendingOrders, ...completedOrders];
    
    // Save to localStorage
    localStorage.setItem('coffee_shop_orders', JSON.stringify(allOrders));
}

function checkForNewOrders() {
    // Check if there are new orders in localStorage
    const savedOrders = localStorage.getItem('coffee_shop_orders');
    if (savedOrders) {
        const allOrders = JSON.parse(savedOrders);
        const newPendingOrders = allOrders.filter(order => !order.completed && !order.cancelled);
        
        // Check if there are more pending orders than we have
        if (newPendingOrders.length > pendingOrders.length) {
            // Update our orders
            pendingOrders = newPendingOrders;
            
            // Sort by timestamp (newest first)
            pendingOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Update UI
            renderPendingOrders();
            
            // Show notification
            showNotification();
            
            // Play sound
            playNotificationSound();
        }
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