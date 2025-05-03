document.addEventListener('DOMContentLoaded', function() {
    // =================== Data Store ===================
    // Import menu items from script.js
    let menuItems = [];
    try {
        // Luôn cố gắng tải từ script.js trước
        fetch('src/script.js')
            .then(response => response.text())
            .then(data => {
                const menuItemsMatch = data.match(/const menuItems = (\[[\s\S]*?\]);/);
                if (menuItemsMatch && menuItemsMatch[1]) {
                    // Warning: Using eval is generally not recommended, but it's simple for this case
                    // In a production environment, consider a safer method to parse the data
                    menuItems = eval(menuItemsMatch[1]);
                    localStorage.setItem('menuItems', JSON.stringify(menuItems));
                    renderProductsList(menuItems);
                } else {
                    // Nếu không thấy định dạng mong đợi trong script.js, thử lấy từ localStorage
                    const storedMenuItems = localStorage.getItem('menuItems');
                    if (storedMenuItems) {
                        menuItems = JSON.parse(storedMenuItems);
                        renderProductsList(menuItems);
                    } else {
                        // Nếu không có gì, dùng menu mặc định
                        menuItems = getDefaultMenuItems();
                        localStorage.setItem('menuItems', JSON.stringify(menuItems));
                        renderProductsList(menuItems);
                    }
                }
            })
            .catch(error => {
                console.error('Error loading menu items from script.js:', error);
                // Thử lấy từ localStorage nếu không tải được từ file
                const storedMenuItems = localStorage.getItem('menuItems');
                if (storedMenuItems) {
                    menuItems = JSON.parse(storedMenuItems);
                    renderProductsList(menuItems);
                } else {
                    // Nếu không có gì, dùng menu mặc định
                    menuItems = getDefaultMenuItems();
                    localStorage.setItem('menuItems', JSON.stringify(menuItems));
                    renderProductsList(menuItems);
                }
            });
    } catch (error) {
        console.error('Error processing menu items:', error);
        menuItems = getDefaultMenuItems();
        renderProductsList(menuItems);
    }

    // Initial rendering if we already have items
    if (menuItems.length > 0) {
        renderProductsList(menuItems);
    }

    // Current order state
    let currentOrder = {
        items: [],
        total: 0
    };

    // Orders storage
    let orders = [];
    
    // Load orders from localStorage if they exist
    try {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
            orders = JSON.parse(storedOrders);
            updateOrdersUI();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        orders = [];
    }

    // =================== DOM References ===================
    const productsListElement = document.getElementById('products-list');
    const categoryFilterElement = document.getElementById('category-filter');
    const orderItemsElement = document.getElementById('order-items');
    const orderTotalElement = document.getElementById('order-total-amount');
    const submitOrderButton = document.getElementById('submit-order');
    const ordersListElement = document.getElementById('orders-list');
    const totalOrdersElement = document.getElementById('total-orders');
    const totalRevenueElement = document.getElementById('total-revenue');
    const totalProductsElement = document.getElementById('total-products');
    const searchOrdersInput = document.getElementById('search-orders');
    const dateFilterElement = document.getElementById('date-filter');
    const exportExcelButton = document.getElementById('export-excel');
    const currentDateElement = document.getElementById('current-date');
    const syncMenuButton = document.getElementById('sync-menu');
    
    // Modal elements
    const modal = document.getElementById('order-detail-modal');
    const closeModalButton = document.querySelector('.close');
    const modalOrderId = document.getElementById('modal-order-id');
    const modalOrderTime = document.getElementById('modal-order-time');
    const modalOrderItems = document.getElementById('modal-order-items');
    const modalOrderTotal = document.getElementById('modal-order-total');

    // =================== Event Listeners ===================
    // Filter products by category
    categoryFilterElement.addEventListener('change', function() {
        const category = this.value;
        let filteredItems;

        if (category === 'all') {
            filteredItems = menuItems;
        } else {
            filteredItems = menuItems.filter(item => item.category === category);
        }

        renderProductsList(filteredItems);
    });

    // Add product to current order
    productsListElement.addEventListener('click', function(e) {
        const productItem = e.target.closest('.product-item');
        if (productItem) {
            const productId = Number(productItem.getAttribute('data-id'));
            addProductToOrder(productId);
        }
    });

    // Handle order item quantity changes and removal
    orderItemsElement.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-decrease')) {
            const itemId = Number(e.target.closest('.order-item').getAttribute('data-id'));
            updateOrderItemQuantity(itemId, -1);
        } else if (e.target.classList.contains('quantity-increase')) {
            const itemId = Number(e.target.closest('.order-item').getAttribute('data-id'));
            updateOrderItemQuantity(itemId, 1);
        } else if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            const itemId = Number(e.target.closest('.order-item').getAttribute('data-id'));
            removeOrderItem(itemId);
        }
    });

    // Submit order
    submitOrderButton.addEventListener('click', function() {
        console.log("Submit order button clicked");
        if (currentOrder.items.length === 0) {
            alert('Vui lòng thêm sản phẩm vào đơn hàng');
            return;
        }

        submitOrder();
    });

    // Search orders
    searchOrdersInput.addEventListener('input', function() {
        const searchQuery = this.value.toLowerCase();
        filterOrders();
    });

    // Filter orders by date
    dateFilterElement.addEventListener('change', function() {
        filterOrders();
    });

    // Export to Excel
    exportExcelButton.addEventListener('click', function() {
        exportToExcel();
    });

    // View order details
    ordersListElement.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-view')) {
            const orderId = e.target.closest('tr').getAttribute('data-id');
            showOrderDetails(orderId);
        } else if (e.target.classList.contains('btn-delete')) {
            const orderId = e.target.closest('tr').getAttribute('data-id');
            deleteOrder(orderId);
        }
    });

    // Close modal
    closeModalButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Click outside to close modal
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Update current date
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000); // Update every minute

    // Sync menu button
    syncMenuButton.addEventListener('click', function() {
        syncMenuFromScript();
    });

    // =================== Functions ===================
    // Render products list
    function renderProductsList(products) {
        productsListElement.innerHTML = '';

        if (products.length === 0) {
            productsListElement.innerHTML = '<p class="empty-products">Không có sản phẩm nào</p>';
            return;
        }

        products.forEach(product => {
            const productItemHTML = `
                <div class="product-item" data-id="${product.id}">
                    <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='src/assets/images/placeholder.jpg'">
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">${product.price}</div>
                    </div>
                </div>
            `;
            productsListElement.innerHTML += productItemHTML;
        });
    }

    // Add product to current order
    function addProductToOrder(productId) {
        console.log("Adding product to order, productId:", productId);
        const product = menuItems.find(item => item.id === productId);
        if (!product) {
            console.error("Product not found with ID:", productId);
            return;
        }

        console.log("Found product:", product);

        // Check if product already exists in order
        const existingItem = currentOrder.items.find(item => item.id === productId);
        
        if (existingItem) {
            console.log("Product already exists in order, increasing quantity");
            existingItem.quantity += 1;
            existingItem.total = calculateItemTotal(existingItem.price, existingItem.quantity);
        } else {
            console.log("Adding new product to order");
            const priceValue = parsePriceString(product.price);
            console.log("Parsed price:", priceValue);
            const newItem = {
                id: product.id,
                name: product.name,
                price: priceValue,
                priceFormatted: product.price,
                quantity: 1,
                total: priceValue
            };
            console.log("New order item:", newItem);
            currentOrder.items.push(newItem);
        }

        console.log("Current order after adding product:", currentOrder);
        updateCurrentOrderUI();
    }

    // Calculate item total
    function calculateItemTotal(price, quantity) {
        return price * quantity;
    }

    // Update order item quantity
    function updateOrderItemQuantity(itemId, change) {
        const item = currentOrder.items.find(item => item.id === itemId);
        if (!item) return;

        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeOrderItem(itemId);
            return;
        }

        item.total = calculateItemTotal(item.price, item.quantity);
        updateCurrentOrderUI();
    }

    // Remove order item
    function removeOrderItem(itemId) {
        currentOrder.items = currentOrder.items.filter(item => item.id !== itemId);
        updateCurrentOrderUI();
    }

    // Update current order UI
    function updateCurrentOrderUI() {
        // Calculate total
        currentOrder.total = currentOrder.items.reduce((sum, item) => sum + item.total, 0);

        // Update UI
        if (currentOrder.items.length === 0) {
            orderItemsElement.innerHTML = '<p class="empty-order">Chưa có sản phẩm nào</p>';
        } else {
            orderItemsElement.innerHTML = '';
            currentOrder.items.forEach(item => {
                const orderItemHTML = `
                    <div class="order-item" data-id="${item.id}">
                        <div class="order-item-info">
                            <div class="order-item-name">${item.name}</div>
                            <div class="order-item-price">${formatCurrency(item.price)}</div>
                        </div>
                        <div class="order-item-quantity">
                            <div class="quantity-btn quantity-decrease">-</div>
                            <div class="quantity-value">${item.quantity}</div>
                            <div class="quantity-btn quantity-increase">+</div>
                        </div>
                        <div class="order-item-total">${formatCurrency(item.total)}</div>
                        <div class="remove-item"><i class="fas fa-times"></i></div>
                    </div>
                `;
                orderItemsElement.innerHTML += orderItemHTML;
            });
        }

        orderTotalElement.textContent = formatCurrency(currentOrder.total);
    }

    // Submit order
    function submitOrder() {
        console.log("Submit order function called");
        
        if (currentOrder.items.length === 0) {
            alert('Vui lòng thêm sản phẩm vào đơn hàng');
            return;
        }

        console.log("Current order items:", currentOrder.items);
        const customerName = document.getElementById('customer-name').value.trim();
        const paymentStatus = document.querySelector('input[name="payment-status"]:checked').value;
        
        console.log("Customer name:", customerName);
        console.log("Payment status:", paymentStatus);
        
        const now = new Date();
        const order = {
            id: generateOrderId(),
            timestamp: now.getTime(),
            date: formatDate(now),
            time: formatTime(now),
            customerName: customerName,
            items: [...currentOrder.items],
            total: currentOrder.total,
            paymentStatus: paymentStatus
        };
        
        console.log("New order object:", order);

        orders.unshift(order);
        saveOrders();
        console.log("Orders after adding new order:", orders);
        updateOrdersUI();
        
        // Reset current order
        currentOrder = {
            items: [],
            total: 0
        };
        updateCurrentOrderUI();
        
        // Clear customer name field
        document.getElementById('customer-name').value = '';
        
        // Show confirmation message
        alert('Đơn hàng đã được xác nhận!');
    }

    // Generate a unique order ID
    function generateOrderId() {
        return Date.now().toString();
    }

    // Save orders to localStorage
    function saveOrders() {
        localStorage.setItem('orders', JSON.stringify(orders));
    }

    // Update orders UI
    function updateOrdersUI() {
        // Summary stats
        const filteredOrders = getFilteredOrders();
        
        totalOrdersElement.textContent = filteredOrders.length;
        
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        totalRevenueElement.textContent = formatCurrency(totalRevenue);
        
        // Calculate total products by summing up the quantities of all items in all orders
        const totalProducts = filteredOrders.reduce((sum, order) => {
            return sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        totalProductsElement.textContent = totalProducts;

        // Orders list
        renderOrdersList(filteredOrders);
    }

    // Get filtered orders based on search and date filter
    function getFilteredOrders() {
        const searchQuery = searchOrdersInput.value.toLowerCase();
        const dateFilter = dateFilterElement.value;
        
        console.log("Filtering orders - Search query:", searchQuery, "Date filter:", dateFilter);
        
        return orders.filter(order => {
            // Search filter
            const orderText = order.items.map(item => item.name).join(' ').toLowerCase();
            const customerText = (order.customerName || '').toLowerCase();
            const matchesSearch = !searchQuery || 
                orderText.includes(searchQuery) || 
                customerText.includes(searchQuery);
            
            // Date filter
            let orderDate;
            
            // Convert timestamp or date string to Date object
            if (order.timestamp) {
                orderDate = new Date(order.timestamp);
            } else if (typeof order.date === 'string') {
                // Parse date in format DD/MM/YYYY
                const parts = order.date.split('/');
                if (parts.length === 3) {
                    // Note: month is 0-based in JavaScript Date
                    orderDate = new Date(parts[2], parts[1] - 1, parts[0]);
                } else {
                    // Fallback to current date if format is unexpected
                    orderDate = new Date();
                }
            } else {
                // If date is already a Date object
                orderDate = new Date(order.date);
            }
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const last7Days = new Date(today);
            last7Days.setDate(last7Days.getDate() - 7);
            
            const thisMonth = new Date(today);
            thisMonth.setDate(1);
            
            let matchesDate = true;
            
            switch (dateFilter) {
                case 'today':
                    matchesDate = orderDate >= today;
                    console.log(`Order ${order.id}: Comparing date ${orderDate} with today ${today}, matches: ${matchesDate}`);
                    break;
                case 'yesterday':
                    matchesDate = orderDate >= yesterday && orderDate < today;
                    console.log(`Order ${order.id}: Comparing date ${orderDate} with yesterday ${yesterday} and today ${today}, matches: ${matchesDate}`);
                    break;
                case 'last7days':
                    matchesDate = orderDate >= last7Days;
                    console.log(`Order ${order.id}: Comparing date ${orderDate} with last7Days ${last7Days}, matches: ${matchesDate}`);
                    break;
                case 'thisMonth':
                    matchesDate = orderDate >= thisMonth;
                    console.log(`Order ${order.id}: Comparing date ${orderDate} with thisMonth ${thisMonth}, matches: ${matchesDate}`);
                    break;
                default:
                    matchesDate = true;
                    console.log(`Order ${order.id}: No date filter applied`);
            }
            
            return matchesSearch && matchesDate;
        });
    }

    // Render orders list
    function renderOrdersList(filteredOrders) {
        ordersListElement.innerHTML = '';

        if (filteredOrders.length === 0) {
            ordersListElement.innerHTML = '<tr><td colspan="6" class="empty-orders">Không có đơn hàng nào</td></tr>';
            return;
        }

        filteredOrders.forEach((order, index) => {
            const paymentStatusClass = order.paymentStatus === 'paid' ? 'status-paid' : 'status-debt';
            const paymentStatusText = order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Ghi nợ';
            const customerNameDisplay = order.customerName ? order.customerName : 'Khách lẻ';
            
            const orderItemsText = order.items.map(item => 
                `${item.name} x ${item.quantity}`
            ).join(', ');
            
            const orderHTML = `
                <tr data-id="${order.id}">
                    <td>${index + 1}</td>
                    <td>${order.date}<br><small>${order.time}</small></td>
                    <td>
                        <div><strong>${customerNameDisplay}</strong></div>
                        <div>${orderItemsText}</div>
                    </td>
                    <td>${formatCurrency(order.total)}</td>
                    <td><span class="payment-status ${paymentStatusClass}">${paymentStatusText}</span></td>
                    <td class="action-buttons">
                        <button class="btn-view">Xem</button>
                        <button class="btn-delete">Xóa</button>
                    </td>
                </tr>
            `;
            ordersListElement.innerHTML += orderHTML;
        });
    }

    // Filter orders
    function filterOrders() {
        updateOrdersUI();
    }

    // Show order details in modal
    function showOrderDetails(orderId) {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        modalOrderId.textContent = order.id;
        modalOrderTime.textContent = `${order.date} ${order.time}`;
        
        // Display customer name
        const customerNameDisplay = order.customerName ? order.customerName : 'Khách lẻ';
        document.getElementById('modal-customer-name').textContent = customerNameDisplay;
        
        // Display payment status
        const paymentStatusClass = order.paymentStatus === 'paid' ? 'status-paid' : 'status-debt';
        const paymentStatusText = order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Ghi nợ';
        document.getElementById('modal-payment-status').textContent = paymentStatusText;
        document.getElementById('modal-payment-status').className = paymentStatusClass;
        
        modalOrderItems.innerHTML = '';
        order.items.forEach(item => {
            const rowHTML = `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.total)}</td>
                </tr>
            `;
            modalOrderItems.innerHTML += rowHTML;
        });
        
        modalOrderTotal.textContent = formatCurrency(order.total);
        
        // Set up toggle payment button
        const togglePaymentBtn = document.getElementById('toggle-payment-status');
        togglePaymentBtn.textContent = order.paymentStatus === 'paid' ? 'Chuyển sang Ghi nợ' : 'Chuyển sang Đã thanh toán';
        togglePaymentBtn.onclick = function() {
            order.paymentStatus = order.paymentStatus === 'paid' ? 'debt' : 'paid';
            saveOrders();
            updateOrdersUI();
            modal.style.display = 'none';
        };
        
        modal.style.display = 'block';
    }

    // Delete order
    function deleteOrder(orderId) {
        if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
        
        orders = orders.filter(order => order.id !== orderId);
        saveOrders();
        updateOrdersUI();
    }

    // Export to Excel
    function exportToExcel() {
        // Get filtered orders based on current filter settings
        const filteredOrders = getFilteredOrders();
        
        if (filteredOrders.length === 0) {
            alert('Không có dữ liệu để xuất');
            return;
        }
        
        // Prepare data for Excel export
        const workbook = XLSX.utils.book_new();
        
        // Create worksheet with orders summary
        const wsData = [
            ['BÁO CÁO DOANH THU QUÁN 340'],
            [`Thời gian xuất: ${formatDate(new Date())} ${formatTime(new Date())}`],
            [],
            ['STT', 'Thời gian', 'Khách hàng', 'Sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Trạng thái']
        ];
        
        let rowIndex = 5;
        let totalRevenue = 0;
        let totalPaidRevenue = 0;
        let totalDebtRevenue = 0;
        
        filteredOrders.forEach((order, orderIndex) => {
            const paymentStatus = order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Ghi nợ';
            const customerName = order.customerName ? order.customerName : 'Khách lẻ';
            
            // Add order items as separate rows
            order.items.forEach((item, itemIndex) => {
                wsData.push([
                    orderIndex + 1,
                    `${order.date} ${order.time}`,
                    customerName,
                    item.name,
                    item.quantity,
                    formatCurrency(item.price),
                    formatCurrency(item.total),
                    paymentStatus
                ]);
                rowIndex++;
                
                // Count revenue
                if (order.paymentStatus === 'paid') {
                    totalPaidRevenue += item.total;
                } else {
                    totalDebtRevenue += item.total;
                }
                totalRevenue += item.total;
            });
        });
        
        // Add summary rows
        wsData.push([]);
        wsData.push(['', '', '', '', '', 'Tổng doanh thu:', formatCurrency(totalRevenue), '']);
        wsData.push(['', '', '', '', '', 'Đã thanh toán:', formatCurrency(totalPaidRevenue), '']);
        wsData.push(['', '', '', '', '', 'Ghi nợ:', formatCurrency(totalDebtRevenue), '']);
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        
        // Set column widths
        const wscols = [
            {wch: 5},    // STT
            {wch: 20},   // Thời gian
            {wch: 20},   // Khách hàng
            {wch: 25},   // Sản phẩm
            {wch: 10},   // Số lượng
            {wch: 15},   // Đơn giá
            {wch: 15},   // Thành tiền
            {wch: 15}    // Trạng thái
        ];
        ws['!cols'] = wscols;
        
        // Styling first row
        ws['A1'] = {v: 'BÁO CÁO DOANH THU QUÁN 340', t: 's'};
        ws['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: 7}}];
        
        XLSX.utils.book_append_sheet(workbook, ws, 'Báo cáo doanh thu');
        
        // Generate file name with current date
        const now = new Date();
        const fileName = `Quan340_BaoCao_${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}.xlsx`;
        
        // Export workbook
        XLSX.writeFile(workbook, fileName);
    }

    // Update current date
    function updateCurrentDate() {
        const now = new Date();
        currentDateElement.textContent = `${formatDate(now)} ${formatTime(now)}`;
    }

    // Helper functions
    function formatCurrency(value) {
        // Format number to currency (e.g., 15000 -> 15,000đ)
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
    }

    function parsePriceString(priceStr) {
        // Parse price string (e.g., "15,000đ" -> 15000)
        try {
            console.log("Parsing price string:", priceStr);
            if (!priceStr || typeof priceStr !== 'string') {
                console.error("Invalid price string:", priceStr);
                return 0;
            }
            
            // Remove currency symbol and commas, then parse
            const cleanPrice = priceStr.replace(/[,.đ₫\s]/g, '');
            console.log("Cleaned price string:", cleanPrice);
            
            const price = parseInt(cleanPrice, 10);
            if (isNaN(price)) {
                console.error("Failed to parse price:", priceStr);
                return 0;
            }
            
            console.log("Parsed price:", price);
            return price;
        } catch (e) {
            console.error("Error parsing price:", e);
            return 0;
        }
    }

    function formatDate(date) {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }

    function formatTime(date) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    function getDefaultMenuItems() {
        return [
            {
                id: 1,
                name: 'Cà phê đen',
                price: '20,000đ',
                category: 'coffee',
                description: 'Cà phê nguyên chất đậm đà, thơm nồng',
                image: 'src/assets/images/cafe-den.jpg',
                isFeatured: true
            },
            {
                id: 2,
                name: 'Cà phê sữa',
                price: '20,000đ',
                category: 'coffee',
                description: 'Cà phê pha sữa đặc, ngọt ngào và đậm vị',
                image: 'src/assets/images/cafe-sua.jpg',
                isFeatured: false
            },
            {
                id: 3,
                name: 'C2',
                price: '20,000đ',
                category: 'tea',
                description: 'Trà xanh C2 mát lạnh, giải khát',
                image: 'src/assets/images/c2.jpg',
                isFeatured: false
            },
            {
                id: 4,
                name: 'Wake-up 247',
                price: '20,000đ',
                category: 'coffee',
                description: 'Cà phê sữa Wake-up 247 sẵn sàng tiếp thêm năng lượng',
                image: 'src/assets/images/wake-up.jpg',
                isFeatured: false
            },
            {
                id: 5,
                name: 'Trà bí đao Wonderfarm',
                price: '20,000đ',
                category: 'tea',
                description: 'Trà bí đao thanh mát, giải nhiệt ngày hè',
                image: 'src/assets/images/tra-bi-dao.jpg',
                isFeatured: false
            },
            {
                id: 6,
                name: 'Tea+',
                price: '20,000đ',
                category: 'tea',
                description: 'Trà Tea+ hương vị thơm ngon, sảng khoái',
                image: 'src/assets/images/tea-plus.jpg',
                isFeatured: false
            },
            {
                id: 7,
                name: 'Revive',
                price: '20,000đ',
                category: 'softdrinks',
                description: 'Nước tăng lực Revive giúp phục hồi năng lượng',
                image: 'src/assets/images/revive.jpg',
                isFeatured: false
            },
            {
                id: 8,
                name: 'Coca Cola',
                price: '20,000đ',
                category: 'softdrinks',
                description: 'Nước ngọt Coca Cola sảng khoái',
                image: 'src/assets/images/coca.jpg',
                isFeatured: false
            },
            {
                id: 9,
                name: 'Red Bull',
                price: '20,000đ',
                category: 'softdrinks',
                description: 'Nước tăng lực Red Bull giúp tỉnh táo và tràn đầy năng lượng',
                image: 'src/assets/images/redbull.jpg',
                isFeatured: false
            },
            {
                id: 10,
                name: 'Number 1',
                price: '20,000đ',
                category: 'softdrinks',
                description: 'Nước tăng lực Number 1 sảng khoái, tiếp thêm năng lượng',
                image: 'src/assets/images/number1.jpg',
                isFeatured: false
            },
            {
                id: 11,
                name: 'Sữa đậu nành Tribeco',
                price: '20,000đ',
                category: 'softdrinks',
                description: 'Sữa đậu nành Tribeco dinh dưỡng, tốt cho sức khỏe',
                image: 'src/assets/images/sua-dau-nanh.jpg',
                isFeatured: false
            },
            {
                id: 12,
                name: 'Nước dừa',
                price: '30,000đ',
                category: 'softdrinks',
                description: 'Nước dừa tươi mát, ngọt thanh',
                image: 'src/assets/images/nuoc-dua.jpg',
                isFeatured: true
            },
            {
                id: 13,
                name: 'Thuốc lá Jet',
                price: '30,000đ',
                category: 'others',
                description: 'Thuốc lá Jet',
                image: 'src/assets/images/thuoc-la-jet.jpg',
                isFeatured: false
            },
            {
                id: 14,
                name: 'Thuốc lá Thăng Long',
                price: '20,000đ',
                category: 'others',
                description: 'Thuốc lá Thăng Long',
                image: 'src/assets/images/thuoc-la-thang-long.jpg',
                isFeatured: false
            },
            {
                id: 15,
                name: 'Thuốc lá Sài Gòn',
                price: '20,000đ',
                category: 'others',
                description: 'Thuốc lá Sài Gòn',
                image: 'src/assets/images/thuoc-la-sai-gon.jpg',
                isFeatured: false
            },
            {
                id: 16,
                name: 'Thuốc lá Mèo Mi',
                price: '20,000đ',
                category: 'others',
                description: 'Thuốc lá Mèo Mi',
                image: 'src/assets/images/thuoc-la-meo-mi.jpg',
                isFeatured: false
            }
        ];
    }

    // Sync menu from script.js
    function syncMenuFromScript() {
        fetch('src/script.js')
            .then(response => response.text())
            .then(data => {
                const menuItemsMatch = data.match(/const menuItems = (\[[\s\S]*?\]);/);
                if (menuItemsMatch && menuItemsMatch[1]) {
                    try {
                        const newMenuItems = eval(menuItemsMatch[1]);
                        menuItems = newMenuItems;
                        localStorage.setItem('menuItems', JSON.stringify(menuItems));
                        renderProductsList(menuItems);
                        alert('Đồng bộ menu thành công!');
                    } catch (error) {
                        console.error('Error parsing menu items:', error);
                        alert('Lỗi khi xử lý dữ liệu menu. Vui lòng kiểm tra console.');
                    }
                } else {
                    alert('Không tìm thấy định dạng menu trong script.js');
                }
            })
            .catch(error => {
                console.error('Error loading script.js:', error);
                alert('Lỗi khi tải script.js. Vui lòng kiểm tra console.');
            });
    }
}); 