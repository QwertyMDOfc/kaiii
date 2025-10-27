// Utility functions for the application

// Format currency
function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID');
}

// Format number
function formatNumber(num) {
    return num.toLocaleString('id-ID');
}

// Generate unique ID
function generateId(prefix = 'id') {
    return prefix + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password strength
function validatePassword(password) {
    if (password.length < 6) {
        return { valid: false, message: 'Password minimal 6 karakter' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung huruf besar' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung huruf kecil' };
    }
    
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung angka' };
    }
    
    return { valid: true, message: 'Password kuat' };
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Tersalin ke clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Download file
function downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Show loading state
function showLoading(element) {
    if (element) {
        element.disabled = true;
        element.textContent = 'Loading...';
        element.style.opacity = '0.7';
    }
}

// Hide loading state
function hideLoading(element) {
    if (element) {
        element.disabled = false;
        element.style.opacity = '1';
        if (element.dataset.originalText) {
            element.textContent = element.dataset.originalText;
        }
    }
}

// Store original button text before showing loading
function storeButtonText(button) {
    if (button) {
        button.dataset.originalText = button.textContent;
    }
}

// Restore button text after hiding loading
function restoreButtonText(button) {
    if (button && button.dataset.originalText) {
        button.textContent = button.dataset.originalText;
    }
}

// Check if user is authenticated
function isUserAuthenticated() {
    return authState.isAuthenticated;
}

// Get current user
function getCurrentUser() {
    return authState.currentUser;
}

// Check if user is admin
function isAdminUser() {
    return authState.isAdmin;
}

// Get user role
function getUserRole() {
    return authState.currentUser ? authState.currentUser.role : 'guest';
}

// Show notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = toast.querySelector('.toast-icon i');
    
    if (toast && toastMessage && toastIcon) {
        toastMessage.textContent = message;
        toast.className = 'toast show ' + type;
        
        // Update icon based on type
        const iconClasses = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle'
        };
        
        toastIcon.className = iconClasses[type] || iconClasses.info;
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Generate random string
function generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Generate API key
function generateApiKey() {
    return generateRandomString(32);
}

// Hash password
function hashPassword(password) {
    // Simple hash function for demo purposes
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = ((hash << 5) - hash) + password.charCodeAt(i);
    }
    return hash.toString();
}

// Get device fingerprint
function getDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Collect device information
    const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
        timezone: Intl.DateTimeFormat().resolvedOptions(Int.DateTimeFormat.short, {
            timeZone: 'Asia/Jakarta'
        }).format(new Date()),
        hardwareConcurrency: navigator.hardwareConcurrency
    };
    
    // Create device fingerprint
    const fingerprint = {
        ...deviceInfo,
        fingerprint: generateRandomString(64)
    };
    
    return fingerprint;
}

// Check if device is mobile
function isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|IEMobile|webOS|Android|webOS|CriOS/.test(navigator.userAgent);
}

// Check if device is desktop
function isDesktop() {
    return !isMobile();
}

// Get device type
function getDeviceType() {
    if (isMobile()) return 'mobile';
    if (isDesktop()) return 'desktop';
    return 'unknown';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const unitIndex = Math.floor(Math.log(bytes) / 1024);
    
    return `${(bytes / Math.pow(1024, unitIndex)).toFixed(2)} ${units[unitIndex]}`;
}

// Throttle function
function throttle(func, limit) {
    let inThrottle = false;
    
    return function(...args) {
        if (!inThrottle) {
            inThrottle = true;
            func.apply(this, args);
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage wrapper
const storage = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },
    clear: () => {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    }
};

// Session storage wrapper
const session = {
    get: (key) => {
        try {
            return sessionStorage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    set: (key, value) => {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to sessionStorage:', e);
        }
    },
    remove: (key) => {
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from sessionStorage:', e);
        }
    },
    clear: () => {
        try {
            sessionStorage.clear();
        } catch (e) {
            console.error('Error clearing sessionStorage:', e);
        }
    }
};

// Cache storage wrapper
const cache = {
    get: (key) => {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            return null;
        }
    },
    set: (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },
    clear: () => {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('Error clearing localStorage:', e);
        }
    }
};

// Initialize app
function initializeApp() {
    // Check for existing session
    checkExistingSession();
    
    // Setup event listeners
    setupGlobalEventListeners();
    
    // Load initial data
    loadInitialData();
    
    // Initialize animations
    createStars();
}

// Check for existing session
function checkExistingSession() {
    const savedUser = storage.get('currentUser');
    const savedIsAdmin = storage.get('isAdmin');
    
    if (savedUser && savedIsAdmin) {
        authState.currentUser = JSON.parse(savedUser);
        authState.isAdmin = savedIsAdmin === 'true';
        authState.isAuthenticated = true;
        
        // Redirect to appropriate dashboard
        if (authState.isAdmin) {
            window.location.href = 'admindashboard.html';
        } else {
            window.location.href = 'userdashboard.html';
        }
    }
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Add logout button listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
        });
    }
}

// Logout function
function logout() {
    // Clear session
    storage.clear();
    
    // Clear auth state
    authState = {
        currentUser: null,
        isAdmin: false,
        isAuthenticated: false
    };
    
    // Show loading state
    showToast('Logging out...', 'info');
    
    // Redirect to login page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Load initial data
function loadInitialData() {
    // Load users from database
    database.ref('users').once('value').then((snapshot) => {
        const data = snapshot.val() || {};
        if (data) {
            users = Object.values(data);
        }
    });
    
    // Load other initial data
    loadProducts();
    loadPaymentMethods();
    loadVouchers();
}

// Load products
function loadProducts() {
    database.ref('products').once('value').then((snapshot) => {
        const data = snapshot.val() || {};
        if (data) {
            products = Object.values(data);
        }
    });
}

// Load payment methods
function loadPaymentMethods() {
    database.ref('paymentMethods').once('value').then((snapshot) => {
        const data = snapshot.val() || {};
        if (data) {
            paymentMethods = Object.values(data);
        }
    });
}

// Load vouchers
function loadVouchers() {
    database.ref('vouchers').once('value').then((snapshot) => {
        const data = snapshot.val() || {};
        if (data) {
            vouchers = Object.values(data);
        }
    });
}

// Create animated stars
function createStars() {
    const starsContainer = document.getElementById('starsContainer');
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        
        starsContainer.appendChild(star);
    }
    
    // Create shooting stars
    setInterval(() => {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        shootingStar.style.width = `${Math.random() * 200 + 100}px`;
        shootingStar.style.top = `${Math.random() * 50%`;
        shootingStar.style.left = '-100px';
        
        starsContainer.appendChild(shootingStar);
        
        setTimeout(() => {
            shootingStar.remove();
        }, 3000);
    }, 3000);
}

// Initialize app on page load
window.addEventListener('load', () => {
    initializeApp();
});

// Export all functions for use in other files
window.appFunctions = {
    // Authentication
    login: () => handleUserLogin(),
    register: () => handleUserRegistration(),
    adminLogin: () => handleAdminLogin(),
    logout: logout,
    
    // Dashboard
    showDashboard: () => showDashboard(),
    loadDashboardData: loadDashboardData(),
    
    // Users
    loadUsers: loadUsersFromDatabase(),
    renderUsersTable,
    showAddUserModal: showAddUserModal,
    closeAddUserModal: closeAddUserModal,
    showEditUserModal: showEditUserModal,
    closeEditUserModal: closeEditUserModal,
    viewUserDetails: viewUserDetails,
    deleteUser: deleteUser,
    exportUsers: exportUsers,
    
    // Utility
    showToast: showToast,
    formatCurrency,
    formatDate,
    generateId,
    validateEmail,
    validatePassword,
    debounce,
    copyToClipboard,
    downloadFile,
    isMobile: isMobile,
    isDesktop: isDesktop,
    getDeviceType,
    formatFileSize
};

// Initialize stars on page load
window.addEventListener('load', () => {
    createStars();
});