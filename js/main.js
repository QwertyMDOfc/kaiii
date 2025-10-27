// Global Variables
let currentUser = null;
let isAdmin = false;
let currentProduct = null;
let currentOrder = null;
let appliedVoucher = null;
let products = [];
let paymentMethods = [];
let vouchers = [];
let users = [];

// DOM Elements
const authContainer = document.getElementById('authContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const toastClose = document.getElementById('toastClose');

// Create animated stars background
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
    
    setInterval(() => {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        shootingStar.style.width = `${Math.random() * 200 + 100}px`;
        shootingStar.style.top = `${Math.random() * 50}%`;
        shootingStar.style.left = '-100px';
        
        starsContainer.appendChild(shootingStar);
        
        setTimeout(() => {
            shootingStar.remove();
        }, 3000);
    }, 3000);
}

// Toast Notification
function showToast(message, type = 'info') {
    toastMessage.textContent = message;
    toast.className = 'toast show ' + type;
    
    const icon = toast.querySelector('.toast-icon i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : 
                   type === 'error' ? 'fas fa-exclamation-circle' : 
                   'fas fa-info-circle';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initialize app
window.addEventListener('load', () => {
    createStars();
    
    toastClose.addEventListener('click', () => {
        toast.classList.remove('show');
    });
});