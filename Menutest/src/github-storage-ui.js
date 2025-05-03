/**
 * GitHub Storage UI Module for Quan340
 * Provides UI components for managing GitHub Gist storage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create and append GitHub storage setup modal to the document
    const modalHtml = `
        <div id="github-setup-modal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Cài đặt GitHub Storage</h2>
                
                <div id="github-setup-form">
                    <div class="form-group">
                        <label for="github-token">GitHub Personal Access Token:</label>
                        <input type="text" id="github-token" placeholder="GitHub token">
                        <div class="hint">
                            <p>Tạo token với quyền <strong>gist</strong> tại 
                            <a href="https://github.com/settings/tokens/new" target="_blank">GitHub Settings</a></p>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="github-username">GitHub Username:</label>
                        <input type="text" id="github-username" placeholder="GitHub username">
                    </div>
                    
                    <button id="github-save-config" class="btn-primary">Lưu cấu hình</button>
                    <button id="github-test-connection" class="btn-secondary">Kiểm tra kết nối</button>
                </div>
                
                <div id="github-status" class="github-status"></div>
                
                <div id="github-actions" style="display: none; margin-top: 20px;">
                    <h3>Quản lý dữ liệu trên GitHub</h3>
                    <div class="action-buttons">
                        <button id="github-sync-all" class="btn-primary">Đồng bộ tất cả dữ liệu</button>
                        <button id="github-load-all" class="btn-secondary">Tải tất cả dữ liệu</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Append modal HTML to document body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHtml;
    document.body.appendChild(modalContainer);
    
    // Add stylesheet
    const style = document.createElement('style');
    style.textContent = `
        #github-setup-modal .hint {
            font-size: 0.8em;
            color: #666;
            margin-top: 5px;
        }
        
        #github-setup-modal .form-group {
            margin-bottom: 15px;
        }
        
        #github-setup-modal label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        #github-setup-modal input[type="text"] {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        
        #github-setup-modal .btn-primary, 
        #github-setup-modal .btn-secondary {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        
        #github-setup-modal .btn-primary {
            background-color: #4CAF50;
            color: white;
        }
        
        #github-setup-modal .btn-secondary {
            background-color: #f1f1f1;
            color: #333;
        }
        
        #github-status {
            margin-top: 15px;
            padding: 10px;
            border-radius: 4px;
        }
        
        #github-status.success {
            background-color: #dff0d8;
            color: #3c763d;
        }
        
        #github-status.error {
            background-color: #f2dede;
            color: #a94442;
        }
        
        #github-status.info {
            background-color: #d9edf7;
            color: #31708f;
        }
        
        #github-actions .action-buttons {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);
    
    // Get references to modal elements
    const modal = document.getElementById('github-setup-modal');
    const closeBtn = modal.querySelector('.close');
    const tokenInput = document.getElementById('github-token');
    const usernameInput = document.getElementById('github-username');
    const saveConfigBtn = document.getElementById('github-save-config');
    const testConnectionBtn = document.getElementById('github-test-connection');
    const githubStatus = document.getElementById('github-status');
    const githubActions = document.getElementById('github-actions');
    const syncAllBtn = document.getElementById('github-sync-all');
    const loadAllBtn = document.getElementById('github-load-all');
    
    // Function to show the GitHub setup modal
    function showGitHubSetupModal() {
        // Try to load existing configuration
        if (window.gitHubStorage.loadConfig()) {
            tokenInput.value = window.gitHubStorage.token;
            usernameInput.value = window.gitHubStorage.username;
            githubActions.style.display = 'block';
        } else {
            githubActions.style.display = 'none';
        }
        
        modal.style.display = 'block';
    }
    
    // Function to close the modal
    function closeModal() {
        modal.style.display = 'none';
    }
    
    // Function to save GitHub configuration
    function saveGitHubConfig() {
        const token = tokenInput.value.trim();
        const username = usernameInput.value.trim();
        
        if (!token || !username) {
            showStatus('Vui lòng nhập cả token và username', 'error');
            return;
        }
        
        const configured = window.gitHubStorage.configure({
            token: token,
            username: username
        });
        
        if (configured) {
            showStatus('Đã lưu cấu hình thành công!', 'success');
            githubActions.style.display = 'block';
        } else {
            showStatus('Không thể lưu cấu hình', 'error');
        }
    }
    
    // Function to test GitHub connection
    async function testGitHubConnection() {
        try {
            showStatus('Đang kiểm tra kết nối...', 'info');
            
            // First ensure configuration is loaded
            const token = tokenInput.value.trim();
            const username = usernameInput.value.trim();
            
            if (!token || !username) {
                showStatus('Vui lòng nhập cả token và username', 'error');
                return;
            }
            
            window.gitHubStorage.configure({
                token: token,
                username: username
            });
            
            // Test connection by listing gists
            const gists = await window.gitHubStorage.listGists();
            showStatus(`Kết nối thành công! Tìm thấy ${gists.length} gists.`, 'success');
            githubActions.style.display = 'block';
        } catch (error) {
            console.error('GitHub connection test failed:', error);
            showStatus('Kết nối thất bại: ' + error.message, 'error');
        }
    }
    
    // Function to sync all data to GitHub
    async function syncAllDataToGitHub() {
        try {
            showStatus('Đang đồng bộ dữ liệu...', 'info');
            
            // Get data from localStorage
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
            
            // Create a single gist with all data
            const allData = {
                orders: orders,
                menuItems: menuItems,
                exportDate: new Date().toISOString(),
                exportVersion: '1.0'
            };
            
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const filename = `quan340_all_data_${dateStr}.json`;
            
            const result = await window.gitHubStorage.saveData(
                filename,
                allData,
                'Quán 340 - Full data backup'
            );
            
            // Also save orders and menu items separately
            const ordersFilename = `quan340_orders_${dateStr}.json`;
            await window.gitHubStorage.saveData(
                ordersFilename,
                orders,
                'Quán 340 - Orders data'
            );
            
            const menuFilename = `quan340_menu_${dateStr}.json`;
            await window.gitHubStorage.saveData(
                menuFilename,
                menuItems,
                'Quán 340 - Menu data'
            );
            
            showStatus('Đồng bộ dữ liệu thành công!', 'success');
        } catch (error) {
            console.error('Error syncing data to GitHub:', error);
            showStatus('Lỗi khi đồng bộ dữ liệu: ' + error.message, 'error');
        }
    }
    
    // Function to load all data from GitHub
    async function loadAllDataFromGitHub() {
        try {
            showStatus('Đang tải dữ liệu từ GitHub...', 'info');
            
            // Get list of all files
            const files = await window.gitHubStorage.listFiles();
            
            // Find the most recent all_data file
            const allDataFiles = files.filter(file => file.name.includes('quan340_all_data_'));
            
            if (allDataFiles.length === 0) {
                showStatus('Không tìm thấy file dữ liệu nào trên GitHub', 'error');
                return;
            }
            
            // Sort by updated date
            allDataFiles.sort((a, b) => b.updated - a.updated);
            
            // Load the most recent file
            const latestFile = allDataFiles[0];
            const data = await window.gitHubStorage.loadData(latestFile.name);
            
            if (!data) {
                showStatus('Không thể tải dữ liệu từ file ' + latestFile.name, 'error');
                return;
            }
            
            // Update localStorage with loaded data
            if (data.orders && Array.isArray(data.orders)) {
                localStorage.setItem('orders', JSON.stringify(data.orders));
            }
            
            if (data.menuItems && Array.isArray(data.menuItems)) {
                localStorage.setItem('menuItems', JSON.stringify(data.menuItems));
            }
            
            showStatus('Đã tải dữ liệu thành công từ ' + latestFile.name, 'success');
            
            // Reload the page to apply changes
            if (confirm('Dữ liệu đã được tải thành công. Bạn có muốn tải lại trang để áp dụng thay đổi?')) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error loading data from GitHub:', error);
            showStatus('Lỗi khi tải dữ liệu: ' + error.message, 'error');
        }
    }
    
    // Function to display status messages
    function showStatus(message, type) {
        githubStatus.textContent = message;
        githubStatus.className = 'github-status ' + type;
    }
    
    // Event listeners
    closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    saveConfigBtn.addEventListener('click', saveGitHubConfig);
    testConnectionBtn.addEventListener('click', testGitHubConnection);
    syncAllBtn.addEventListener('click', syncAllDataToGitHub);
    loadAllBtn.addEventListener('click', loadAllDataFromGitHub);
    
    // Create and add a button to open the GitHub setup modal
    function createGitHubButton() {
        // Check if button already exists
        if (document.getElementById('github-setup-btn')) {
            return;
        }
        
        const btn = document.createElement('button');
        btn.id = 'github-setup-btn';
        btn.innerHTML = '<i class="fab fa-github"></i> GitHub';
        btn.title = 'GitHub Storage Settings';
        btn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        `;
        
        btn.addEventListener('click', showGitHubSetupModal);
        document.body.appendChild(btn);
    }
    
    // Initialize
    createGitHubButton();
    
    // Add keyboard shortcut (Ctrl+G) to open GitHub setup
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            showGitHubSetupModal();
        }
    });
    
    // Export functions
    window.githubStorageUI = {
        showSetupModal: showGitHubSetupModal,
        syncData: syncAllDataToGitHub,
        loadData: loadAllDataFromGitHub
    };
}); 