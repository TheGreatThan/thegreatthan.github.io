# Quán Cà Phê - Coffee Shop Ordering System

A simple, web-based ordering system for a coffee shop with two components:
1. A customer-facing website for browsing the menu and placing orders
2. An owner dashboard for receiving and managing orders

## How to Use

### Setup
1. Make sure to add image files to the `images` directory as specified in the `images/README.md` file
2. Optionally, add a notification sound file to the `sounds` directory as specified in the `sounds/README.md` file

### Running the System
1. Open `index.html` in your web browser to access the main page
2. From there, you can navigate to either the customer ordering system or the owner dashboard

### Customer Ordering System
- Browse the menu items by category
- Add items to your cart by clicking the "Add to Cart" button
- Click the cart icon in the top-right corner to view your cart
- Fill in your information and place the order
- Your order will be sent to the owner dashboard

### Owner Dashboard
- View pending orders in real-time
- Receive notifications when new orders come in
- View order details including customer information, items ordered, and special instructions
- Mark orders as completed or canceled
- View order history in the "Completed Orders" tab

## Technical Details
- Built using HTML, CSS, and plain JavaScript
- Data is stored in the browser's localStorage (no server required)
- Communication between the customer and owner pages is handled through localStorage and the window.postMessage API
- Responsive design that works on both desktop and mobile devices

## Customization
- Menu items can be modified in the `customer/index.html` file
- Styles can be adjusted in the CSS files (`customer/styles.css` and `owner/styles.css`)
- Business information can be updated in the footer section of both HTML files 