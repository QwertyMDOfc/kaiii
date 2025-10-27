// Utility functions for the application

// Format currency
function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID');
}

// Generate unique ID
function generateId(prefix = 'id') {
    return prefix + Date.now() + Math.random().toString(36).substr(2, 9);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate password strength
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: 'Password minimal 8 karakter' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung huruf besar' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung huruf kecil' };
    }
    
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password harus mengandung angka' };
    }
    
    return { valid: true, message: 'Password valid' };
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

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Clear all data
function clearAllData() {
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Ini tidak dapat dibatalkan!')) {
        const user = getCurrentUser();
        if (user && user.role === 'admin') {
            // Clear all data from Firebase
            database.ref().remove().then(() => {
                localStorage.clear();
                showToast('Semua data berhasil dihapus', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }).catch((error) => {
                console.error('Error clearing data:', error);
                showToast('Terjadi kesalahan saat menghapus data', 'error');
            });
        } else {
            showToast('Hanya admin yang dapat menghapus data', 'error');
        }
    }
}

// Export data to JSON
function exportData() {
    const user = getCurrentUser();
    if (user && user.role === 'admin') {
        database.ref().once('value', (snapshot) => {
            const data = snapshot.val();
            downloadFile(JSON.stringify(data, null, 'kaiistore-backup.json'));
            showToast('Data berhasil diexport', 'success');
        });
    }
}