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
        total: 0,
        discount: 0,
        finalTotal: 0,
        promotionApplied: false,
        promotionCode: ''
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
    const promotionCodeInput = document.getElementById('promotion-code');
    const applyPromotionButton = document.getElementById('apply-promotion');
    const promotionStatusElement = document.getElementById('promotion-status');
    const exportAllDataButton = document.getElementById('export-all-data');
    const importDataModal = document.getElementById('import-data-modal');
    const importFileInput = document.getElementById('import-file');
    const importDataButton = document.getElementById('import-data-btn');
    const importResultElement = document.getElementById('import-result');
    const viewStorageButton = document.getElementById('view-storage');
    const storageModal = document.getElementById('storage-modal');
    const storageFilterSelect = document.getElementById('storage-filter');
    const refreshStorageButton = document.getElementById('refresh-storage');
    const storageFilesList = document.getElementById('storage-files-list');
    
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

    // Apply promotion button
    applyPromotionButton.addEventListener('click', function() {
        applyPromotionCode();
    });

    // Apply promotion on Enter key
    promotionCodeInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyPromotionCode();
        }
    });

    // Export all data button
    exportAllDataButton.addEventListener('click', function() {
        exportAllData();
    });
    
    // Import data button
    importDataButton.addEventListener('click', function() {
        const file = importFileInput.files[0];
        if (!file) {
            importResultElement.textContent = 'Vui lòng chọn tệp tin để nhập';
            importResultElement.className = 'import-result import-error';
            return;
        }
        
        importDataFromFile(file)
            .then(data => {
                try {
                    // Import orders if they exist in the file
                    if (data.orders && Array.isArray(data.orders)) {
                        orders = data.orders;
                        saveOrders();
                    }
                    
                    // Import menu items if they exist in the file
                    if (data.menuItems && Array.isArray(data.menuItems)) {
                        menuItems = data.menuItems;
                        localStorage.setItem('menuItems', JSON.stringify(menuItems));
                        renderProductsList(menuItems);
                    }
                    
                    updateOrdersUI();
                    
                    importResultElement.textContent = 'Nhập dữ liệu thành công!';
                    importResultElement.className = 'import-result import-success';
                    
                    // Close modal after a delay
                    setTimeout(() => {
                        importDataModal.style.display = 'none';
                    }, 2000);
                } catch (error) {
                    console.error('Error importing data:', error);
                    importResultElement.textContent = 'Lỗi khi nhập dữ liệu: ' + error.message;
                    importResultElement.className = 'import-result import-error';
                }
            })
            .catch(error => {
                console.error('Error parsing file:', error);
                importResultElement.textContent = 'Lỗi khi đọc tệp tin: ' + error.message;
                importResultElement.className = 'import-result import-error';
            });
    });
    
    // Show import modal
    document.body.addEventListener('keydown', function(e) {
        // Ctrl+I to open import modal
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            importDataModal.style.display = 'block';
            importResultElement.textContent = '';
            importResultElement.className = 'import-result';
        }
    });
    
    // Close import modal
    importDataModal.querySelector('.close').addEventListener('click', function() {
        importDataModal.style.display = 'none';
    });
    
    // Click outside to close import modal
    window.addEventListener('click', function(e) {
        if (e.target === importDataModal) {
            importDataModal.style.display = 'none';
        }
    });

    // View storage button
    viewStorageButton.addEventListener('click', function() {
        showStorageModal();
    });
    
    // Refresh storage button
    refreshStorageButton.addEventListener('click', function() {
        loadStorageFiles(storageFilterSelect.value);
    });
    
    // Storage filter change
    storageFilterSelect.addEventListener('change', function() {
        loadStorageFiles(this.value);
    });
    
    // Close storage modal
    storageModal.querySelector('.close').addEventListener('click', function() {
        storageModal.style.display = 'none';
    });
    
    // Click outside to close storage modal
    window.addEventListener('click', function(e) {
        if (e.target === storageModal) {
            storageModal.style.display = 'none';
        }
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
        
        // Calculate final total based on promotion
        if (currentOrder.promotionApplied) {
            currentOrder.discount = currentOrder.total * 0.5; // 50% discount
            currentOrder.finalTotal = currentOrder.total - currentOrder.discount;
        } else {
            currentOrder.discount = 0;
            currentOrder.finalTotal = currentOrder.total;
        }

        // Update UI
        if (currentOrder.items.length === 0) {
            orderItemsElement.innerHTML = '<p class="empty-order">Chưa có sản phẩm nào</p>';
            
            // Clear promotion when cart is empty
            currentOrder.promotionApplied = false;
            currentOrder.promotionCode = '';
            currentOrder.discount = 0;
            promotionStatusElement.textContent = '';
            promotionStatusElement.className = 'promotion-status';
            promotionCodeInput.value = '';
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

        // Display subtotal, discount, and final total
        let totalHTML = `${formatCurrency(currentOrder.total)}`;
        
        if (currentOrder.promotionApplied) {
            totalHTML = `
                <div class="order-total-details">
                    <div class="order-subtotal">
                        <span>Tạm tính:</span>
                        <span>${formatCurrency(currentOrder.total)}</span>
                    </div>
                    <div class="order-discount">
                        <span>Giảm giá (50%):</span>
                        <span>-${formatCurrency(currentOrder.discount)}</span>
                    </div>
                    <div class="order-final">
                        <span>Thành tiền:</span>
                        <span>${formatCurrency(currentOrder.finalTotal)}</span>
                    </div>
                </div>
            `;
        }
        
        orderTotalElement.innerHTML = totalHTML;
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
            promotionApplied: currentOrder.promotionApplied,
            promotionCode: currentOrder.promotionCode,
            discount: currentOrder.discount,
            finalTotal: currentOrder.finalTotal,
            paymentStatus: paymentStatus
        };
        
        console.log("New order object:", order);

        orders.unshift(order);
        saveOrders();
        console.log("Orders after adding new order:", orders);
        updateOrdersUI();
        
        // Save this order to its own file
        saveOrderToFile(order);
        
        // Reset current order
        currentOrder = {
            items: [],
            total: 0,
            discount: 0,
            finalTotal: 0,
            promotionApplied: false,
            promotionCode: ''
        };
        updateCurrentOrderUI();
        
        // Clear customer name field and promotion fields
        document.getElementById('customer-name').value = '';
        document.getElementById('promotion-code').value = '';
        promotionStatusElement.textContent = '';
        promotionStatusElement.className = 'promotion-status';
        
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
        
        // Also save to file
        saveOrdersToFile();
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
            
            // Show discount info if applicable
            let priceDisplay = `${formatCurrency(order.finalTotal || order.total)}`;
            if (order.promotionApplied) {
                priceDisplay = `
                    <div>${formatCurrency(order.finalTotal)}</div>
                    <small class="discount-info">Giảm giá: ${formatCurrency(order.discount)}</small>
                `;
            }
            
            const orderHTML = `
                <tr data-id="${order.id}">
                    <td>${index + 1}</td>
                    <td>${order.date}<br><small>${order.time}</small></td>
                    <td>
                        <div><strong>${customerNameDisplay}</strong></div>
                        <div>${orderItemsText}</div>
                        ${order.promotionApplied ? `<small class="promotion-applied">Mã KM: ${order.promotionCode}</small>` : ''}
                    </td>
                    <td>${priceDisplay}</td>
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
        
        // Display promotion info if applicable
        const promotionInfoElement = document.getElementById('modal-promotion-info');
        if (order.promotionApplied) {
            promotionInfoElement.innerHTML = `
                <div class="modal-promotion">
                    <span class="promotion-label">Mã khuyến mãi:</span>
                    <span class="promotion-value">${order.promotionCode} (Giảm 50%)</span>
                </div>
            `;
            promotionInfoElement.style.display = 'block';
        } else {
            promotionInfoElement.style.display = 'none';
        }
        
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
        
        // Display total with discount if applicable
        if (order.promotionApplied) {
            document.getElementById('modal-order-subtotal').textContent = formatCurrency(order.total);
            document.getElementById('modal-order-discount').textContent = formatCurrency(order.discount);
            modalOrderTotal.textContent = formatCurrency(order.finalTotal);
            document.getElementById('modal-totals-with-discount').style.display = 'block';
            document.getElementById('modal-total-simple').style.display = 'none';
        } else {
            modalOrderTotal.textContent = formatCurrency(order.total);
            document.getElementById('modal-totals-with-discount').style.display = 'none';
            document.getElementById('modal-total-simple').style.display = 'block';
        }
        
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
            ['STT', 'Thời gian', 'Khách hàng', 'Sản phẩm', 'Số lượng', 'Đơn giá', 'Thành tiền', 'Khuyến mãi', 'Giảm giá', 'Thanh toán', 'Trạng thái']
        ];
        
        let rowIndex = 5;
        let totalRevenue = 0;
        let totalDiscount = 0;
        let totalPaidRevenue = 0;
        let totalDebtRevenue = 0;
        
        filteredOrders.forEach((order, orderIndex) => {
            const paymentStatus = order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Ghi nợ';
            const customerName = order.customerName ? order.customerName : 'Khách lẻ';
            
            // Add order items as separate rows
            order.items.forEach((item, itemIndex) => {
                const rowTotal = item.total;
                const finalTotal = order.promotionApplied ? 
                    Math.round(rowTotal * 0.5) : // 50% of item total
                    rowTotal;
                const discount = order.promotionApplied ? 
                    Math.round(rowTotal * 0.5) : // 50% of item total 
                    0;
                
                wsData.push([
                    orderIndex + 1,
                    `${order.date} ${order.time}`,
                    customerName,
                    item.name,
                    item.quantity,
                    formatCurrency(item.price),
                    formatCurrency(rowTotal),
                    order.promotionApplied ? order.promotionCode : '',
                    order.promotionApplied ? formatCurrency(discount) : '',
                    formatCurrency(finalTotal),
                    paymentStatus
                ]);
                rowIndex++;
                
                // Count revenue and discount
                if (order.paymentStatus === 'paid') {
                    totalPaidRevenue += finalTotal;
                } else {
                    totalDebtRevenue += finalTotal;
                }
                totalRevenue += finalTotal;
                totalDiscount += discount;
            });
        });
        
        // Add summary rows
        wsData.push([]);
        wsData.push(['', '', '', '', '', 'Tổng doanh thu:', '', '', formatCurrency(totalDiscount), formatCurrency(totalRevenue), '']);
        wsData.push(['', '', '', '', '', 'Đã thanh toán:', '', '', '', formatCurrency(totalPaidRevenue), '']);
        wsData.push(['', '', '', '', '', 'Ghi nợ:', '', '', '', formatCurrency(totalDebtRevenue), '']);
        wsData.push(['', '', '', '', '', 'Tổng giảm giá:', '', '', formatCurrency(totalDiscount), '', '']);
        
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
            {wch: 15},   // Khuyến mãi
            {wch: 15},   // Giảm giá
            {wch: 15},   // Thanh toán
            {wch: 15}    // Trạng thái
        ];
        ws['!cols'] = wscols;
        
        // Styling first row
        ws['A1'] = {v: 'BÁO CÁO DOANH THU QUÁN 340', t: 's'};
        ws['!merges'] = [{s: {r: 0, c: 0}, e: {r: 0, c: 10}}];
        
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

    // Apply promotion code
    function applyPromotionCode() {
        const code = promotionCodeInput.value.trim();
        if (!code) {
            promotionStatusElement.textContent = 'Vui lòng nhập mã khuyến mãi';
            promotionStatusElement.className = 'promotion-status promotion-error';
            return;
        }

        // Check which promotion code was entered
        if (code.toLowerCase() === 'nguoiquen') {
            currentOrder.promotionApplied = true;
            currentOrder.promotionCode = code;
            currentOrder.discount = currentOrder.total * 0.5; // 50% discount
            currentOrder.finalTotal = currentOrder.total - currentOrder.discount;
            
            promotionStatusElement.textContent = 'Mã khuyến mãi được áp dụng: Giảm 50%';
            promotionStatusElement.className = 'promotion-status promotion-active';
            
            // Update the UI to reflect the discount
            updateCurrentOrderUI();
        } else if (code.toLowerCase() === '5k') {
            currentOrder.promotionApplied = true;
            currentOrder.promotionCode = code;
            currentOrder.discount = 5000; // 5,000đ discount
            currentOrder.finalTotal = currentOrder.total - currentOrder.discount;
            
            promotionStatusElement.textContent = 'Mã khuyến mãi được áp dụng: Giảm 5,000đ';
            promotionStatusElement.className = 'promotion-status promotion-active';
            
            // Update the UI to reflect the discount
            updateCurrentOrderUI();
        } else if (code.toLowerCase() === '10k') {
            currentOrder.promotionApplied = true;
            currentOrder.promotionCode = code;
            currentOrder.discount = 10000; // 10,000đ discount
            currentOrder.finalTotal = currentOrder.total - currentOrder.discount;
            
            promotionStatusElement.textContent = 'Mã khuyến mãi được áp dụng: Giảm 10,000đ';
            promotionStatusElement.className = 'promotion-status promotion-active';
            
            // Update the UI to reflect the discount
            updateCurrentOrderUI();
        } else {
            currentOrder.promotionApplied = false;
            currentOrder.promotionCode = '';
            currentOrder.discount = 0;
            currentOrder.finalTotal = currentOrder.total;
            
            promotionStatusElement.textContent = 'Mã khuyến mãi không hợp lệ';
            promotionStatusElement.className = 'promotion-status promotion-error';
            
            // Update the UI
            updateCurrentOrderUI();
        }
    }

    // =================== File Storage Functions ===================
    
    // Function to save data to a file
    function saveToFile(data, filename) {
        // Check if GitHub storage is configured
        if (window.gitHubStorage && window.gitHubStorage.isConfigured()) {
            // Save to GitHub Gist
            window.gitHubStorage.saveData(filename, data, 'Quán 340 - Data file')
                .then(result => {
                    console.log(`Data saved to GitHub Gist: ${filename}`);
                })
                .catch(error => {
                    console.error('Error saving to GitHub:', error);
                    // Fall back to localStorage
                    saveToFileLocal(data, filename);
                });
        } else {
            // Use local storage fallback
            saveToFileLocal(data, filename);
        }
    }
    
    // Function to save data locally
    function saveToFileLocal(data, filename) {
        // Always use localStorage for persistence
        const storageKey = `storage_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
        try {
            localStorage.setItem(storageKey, JSON.stringify({
                content: data,
                timestamp: new Date().getTime(),
                filename: filename
            }));
            console.log(`Data saved to localStorage with key: ${storageKey}`);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
        
        // Optionally download as file
        if (document.getElementById('enable-file-download') && 
            document.getElementById('enable-file-download').checked) {
            // Create a Blob containing the data
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
            
            // Create a download link
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
            }, 100);
        }
    }
    
    // Save orders to file
    function saveOrdersToFile() {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const filename = `storage/orders_${dateStr}.json`;
        
        saveToFile(orders, filename);
    }
    
    // Save current order state to file (in case of browser crash)
    function saveCurrentOrderToFile() {
        if (currentOrder.items.length === 0) return; // Don't save empty orders
        
        const now = new Date();
        const timestamp = now.getTime();
        const filename = `storage/current_order_${timestamp}.json`;
        
        saveToFile(currentOrder, filename);
    }
    
    // Export all data (orders, menu items, etc.) to a single file
    function exportAllData() {
        const allData = {
            orders: orders,
            menuItems: menuItems,
            exportDate: new Date().toISOString()
        };
        
        const now = new Date();
        const dateTimeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        const filename = `storage/all_data_${dateTimeStr}.json`;
        
        saveToFile(allData, filename);
        
        // If GitHub is configured, also save there
        if (window.gitHubStorage && window.gitHubStorage.isConfigured()) {
            try {
                window.gitHubStorage.saveData(
                    `quan340_all_data_${dateTimeStr}.json`,
                    allData,
                    'Quán 340 - Full data backup'
                ).then(() => {
                    console.log('Data also backed up to GitHub Gist');
                });
            } catch (error) {
                console.error('GitHub backup failed:', error);
            }
        }
    }
    
    // Import data from a JSON file
    function importDataFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = function(event) {
                reject(new Error("Failed to read file"));
            };
            
            reader.readAsText(file);
        });
    }

    // Save individual order to file
    function saveOrderToFile(order) {
        const timestamp = order.timestamp || new Date().getTime();
        const customer = order.customerName ? order.customerName.replace(/\s+/g, '_') : 'guest';
        const filename = `storage/order_${customer}_${timestamp}.json`;
        
        saveToFile(order, filename);
    }

    // Load storage files
    function loadStorageFiles(filter = null) {
        storageFilesList.innerHTML = '<tr><td colspan="4" class="loading-files">Đang tải danh sách file...</td></tr>';
        
        // Decide which source to use for listing files
        if (window.gitHubStorage && window.gitHubStorage.isConfigured()) {
            // Use GitHub for file listing
            window.gitHubStorage.listFiles()
                .then(githubFiles => {
                    const files = githubFiles.map(file => ({
                        name: file.name,
                        size: file.size || 0,
                        modified: Math.floor(file.updated.getTime() / 1000),
                        githubId: file.gistId,
                        isBackup: file.name.includes('all_data_')
                    }));
                    
                    // Filter files if needed
                    let filteredFiles = filter ? 
                        files.filter(file => file.name.includes(filter)) : 
                        files;
                    
                    // Special handling for "backups" filter
                    if (filter === 'backups') {
                        filteredFiles = files.filter(file => file.isBackup);
                    }
                    
                    displayStorageFilesList(filteredFiles);
                })
                .catch(error => {
                    console.error('Error listing files from GitHub:', error);
                    // Fall back to local files
                    loadFileListLocal(filter)
                        .then(files => displayStorageFilesList(files));
                });
        } else {
            // Use local storage
            loadFileListLocal(filter)
                .then(files => displayStorageFilesList(files));
        }
    }

    // Load list of files from localStorage
    function loadFileListLocal(filter = null) {
        return new Promise((resolve) => {
            const files = [];
            
            // Scan localStorage for saved files
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('storage_')) {
                    try {
                        const storageData = JSON.parse(localStorage.getItem(key));
                        if (storageData && storageData.filename) {
                            const filename = storageData.filename;
                            const modified = storageData.timestamp || Date.now();
                            // Estimate size based on JSON content length
                            const size = JSON.stringify(storageData.content).length;
                            
                            // Check if file matches filter
                            if (!filter || filename.includes(filter)) {
                                files.push({
                                    name: filename,
                                    size: size,
                                    modified: Math.floor(modified / 1000), // Convert to seconds
                                    storageKey: key
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing storage item:', key, error);
                    }
                }
            }
            
            // Sort by modified timestamp (newest first)
            files.sort((a, b) => b.modified - a.modified);
            
            resolve(files);
        });
    }

    // Display the list of storage files in the UI
    function displayStorageFilesList(files) {
        if (files.length === 0) {
            storageFilesList.innerHTML = '<tr><td colspan="4" class="loading-files">Không có file nào</td></tr>';
            return;
        }
        
        storageFilesList.innerHTML = '';
        
        // Find newest backup file if any
        let newestBackupFile = null;
        const backupFiles = files.filter(file => file.name.includes('all_data_'));
        
        if (backupFiles.length > 0) {
            // Sort by modified time (newest first)
            backupFiles.sort((a, b) => b.modified - a.modified);
            newestBackupFile = backupFiles[0];
        }
        
        files.forEach(file => {
            const date = new Date(file.modified * 1000);
            const formattedDate = `${formatDate(date)} ${formatTime(date)}`;
            const sizeKB = Math.round(file.size / 1024);
            
            // Check if it's a backup file (all_data)
            const isBackup = file.name.includes('all_data_');
            const isNewestBackup = isBackup && newestBackupFile && file.modified === newestBackupFile.modified;
            
            // Create row with appropriate classes
            const row = document.createElement('tr');
            
            if (isBackup) {
                row.classList.add('backup-file');
                if (isNewestBackup) {
                    row.classList.add('newest');
                }
            }
            
            // Format filename with tags
            let filenameDisplay = `<span class="file-name">${file.name}</span>`;
            if (isBackup) {
                filenameDisplay += `<span class="backup-tag${isNewestBackup ? ' newest-tag' : ''}">
                    ${isNewestBackup ? 'Mới nhất' : 'Sao lưu'}
                </span>`;
            }
            
            row.innerHTML = `
                <td>${filenameDisplay}</td>
                <td>${sizeKB} KB</td>
                <td>${formattedDate}</td>
                <td class="file-actions">
                    <button class="btn-load-file" data-file="${file.name}" ${file.githubId ? `data-github-id="${file.githubId}"` : ''}>Tải</button>
                    <button class="btn-delete-file" data-file="${file.name}" ${file.githubId ? `data-github-id="${file.githubId}"` : ''}>Xóa</button>
                </td>
            `;
            
            storageFilesList.appendChild(row);
        });
        
        // Add event listeners for load and delete buttons
        const loadButtons = storageFilesList.querySelectorAll('.btn-load-file');
        loadButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filename = this.getAttribute('data-file');
                const githubId = this.getAttribute('data-github-id');
                
                // Decide which source to use for loading the file
                if (githubId && window.gitHubStorage && window.gitHubStorage.isConfigured()) {
                    // Load from GitHub
                    window.gitHubStorage.getGistContent(githubId, filename)
                        .then(handleLoadedData)
                        .catch(error => {
                            console.error('Error loading file from GitHub:', error);
                            alert('Lỗi khi tải file từ GitHub: ' + error.message);
                        });
                } else {
                    // Load from localStorage
                    loadFileFromStorageLocal(filename)
                        .then(handleLoadedData)
                        .catch(error => {
                            alert('Lỗi khi tải file: ' + error.message);
                        });
                }
            });
        });
        
        const deleteButtons = storageFilesList.querySelectorAll('.btn-delete-file');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filename = this.getAttribute('data-file');
                const githubId = this.getAttribute('data-github-id');
                
                if (!confirm(`Bạn có chắc chắn muốn xóa file ${filename}?`)) {
                    return;
                }
                
                // Decide which delete method to use
                if (githubId && window.gitHubStorage && window.gitHubStorage.isConfigured()) {
                    // Delete from GitHub
                    window.gitHubStorage.deleteGist(githubId)
                        .then(result => {
                            // Tải lại danh sách file
                            loadStorageFiles(storageFilterSelect.value);
                            alert('Đã xóa file thành công từ GitHub!');
                        })
                        .catch(error => {
                            console.error('Error deleting file from GitHub:', error);
                            alert('Lỗi khi xóa file từ GitHub: ' + error.message);
                        });
                } else {
                    // Delete from localStorage
                    deleteFileFromStorageLocal(filename)
                        .then(result => {
                            if (result.success) {
                                // Tải lại danh sách file
                                loadStorageFiles(storageFilterSelect.value);
                                alert('Đã xóa file thành công!');
                            } else {
                                alert('Lỗi khi xóa file: ' + result.error);
                            }
                        })
                        .catch(error => {
                            console.error('Error deleting file:', error);
                            alert('Lỗi khi xóa file: ' + error.message);
                        });
                }
            });
        });
    }

    // Handle loaded data based on filename
    function handleLoadedData(data) {
        if (!data) {
            alert('Không thể tải dữ liệu từ file');
            return;
        }
        
        // Determine data type based on filename or content
        if (data.items && Array.isArray(data.items)) {
            // This is an order
            showOrderDetails(data.id);
        } else if (data.orders && Array.isArray(data.orders)) {
            // This is all data or orders list
            orders = data.orders;
            saveOrders();
            
            if (data.menuItems && Array.isArray(data.menuItems)) {
                menuItems = data.menuItems;
                localStorage.setItem('menuItems', JSON.stringify(menuItems));
                renderProductsList(menuItems);
            }
            
            updateOrdersUI();
            alert('Đã tải dữ liệu thành công');
        } else if (Array.isArray(data)) {
            // This is probably just an orders array
            orders = data;
            saveOrders();
            updateOrdersUI();
            alert('Đã tải danh sách đơn hàng');
        }
        
        // Close modal
        storageModal.style.display = 'none';
    }

    // Load data from localStorage
    function loadFileFromStorageLocal(filename) {
        return new Promise((resolve, reject) => {
            const storageKey = `storage_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
            
            try {
                const storageData = localStorage.getItem(storageKey);
                if (!storageData) {
                    reject(new Error('File not found in storage'));
                    return;
                }
                
                const data = JSON.parse(storageData);
                if (!data || !data.content) {
                    reject(new Error('Invalid file format'));
                    return;
                }
                
                resolve(data.content);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Delete file from localStorage
    function deleteFileFromStorageLocal(filename) {
        return new Promise((resolve, reject) => {
            try {
                const storageKey = `storage_${filename.replace(/[^a-zA-Z0-9]/g, '_')}`;
                
                // Check if file exists
                if (!localStorage.getItem(storageKey)) {
                    reject(new Error('File not found in storage'));
                    return;
                }
                
                // Remove from localStorage
                localStorage.removeItem(storageKey);
                
                resolve({ success: true, message: 'File deleted successfully' });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Show storage modal with improved UI
    function showStorageModal() {
        storageModal.style.display = 'block';
        
        // Update the filter options to include backups
        if (!document.querySelector('#storage-filter option[value="backups"]')) {
            const backupOption = document.createElement('option');
            backupOption.value = 'backups';
            backupOption.textContent = 'Bản sao lưu (all_data)';
            storageFilterSelect.appendChild(backupOption);
        }
        
        // Load files with current filter
        loadStorageFiles(storageFilterSelect.value);
    }
});
