/**
 * Shared Storage Utility
 * 
 * This script helps synchronize data between different devices when the coffee shop
 * ordering system is hosted on a web server. It uses the Storage API to ensure data
 * is properly shared across different browsers and devices.
 * 
 * Include this script in both customer and owner HTML files.
 */

(function() {
    // Helper function to detect if storage is available and working
    function isStorageAvailable(type) {
        var storage;
        try {
            storage = window[type];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                (storage && storage.length !== 0);
        }
    }
    
    // Check if we have working localStorage and sessionStorage
    var hasLocalStorage = isStorageAvailable('localStorage');
    var hasSessionStorage = isStorageAvailable('sessionStorage');
    
    // If storage is not available, show warning
    if (!hasLocalStorage || !hasSessionStorage) {
        console.warn('Storage is not available. The coffee shop ordering system requires localStorage and sessionStorage to work properly.');
        
        // Display warning message on page
        var warning = document.createElement('div');
        warning.style.position = 'fixed';
        warning.style.top = '0';
        warning.style.left = '0';
        warning.style.right = '0';
        warning.style.backgroundColor = '#f44336';
        warning.style.color = 'white';
        warning.style.padding = '10px';
        warning.style.textAlign = 'center';
        warning.style.zIndex = '9999';
        warning.innerHTML = '<strong>Warning:</strong> Your browser does not support storage features needed for this application to work across devices.';
        document.body.appendChild(warning);
    }
    
    // Set up storage event listener to sync changes between tabs
    window.addEventListener('storage', function(e) {
        // When localStorage changes in another tab, update our sessionStorage
        if (e.storageArea === localStorage) {
            // Only update if the change is related to our app
            if (e.key && (e.key.includes('coffee_shop_') || e.key.includes('last_') || e.key === 'device_id')) {
                // Update our sessionStorage with the new value
                sessionStorage.setItem(e.key, e.newValue);
                
                // Dispatch a custom event to notify the application
                var event = new CustomEvent('storage-updated', { 
                    detail: { 
                        key: e.key, 
                        newValue: e.newValue,
                        oldValue: e.oldValue
                    } 
                });
                window.dispatchEvent(event);
            }
        }
    });
    
    // Synchronize data on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Sync localStorage to sessionStorage on page load
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && (key.includes('coffee_shop_') || key.includes('last_') || key === 'device_id')) {
                sessionStorage.setItem(key, localStorage.getItem(key));
            }
        }
    });
    
    // Periodically check for updates (useful for multi-device sync)
    setInterval(function() {
        // Dispatch a custom event to make the app check for updates
        window.dispatchEvent(new Event('check-storage-updates'));
    }, 3000);
    
    console.log('Shared storage utility initialized');
})(); 