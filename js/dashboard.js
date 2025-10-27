// Dashboard DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const logoutBtn = document.getElementById('logoutBtn');
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');

// Load section data
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            loadProducts();
            break;
        case 'shop':
            loadShopProducts();
            break;
        case 'purchase-history':
            loadPurchaseHistory();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    database.ref('orders').once('value', (snapshot) => {
        const orders = snapshot.val() || {};
        
        let totalPurchases = 0;
        let successfulPurchases = 0;
        let failedPurchases = 0;
        let cancelledPurchases = 0;
        let totalSpend = 0;
        
        Object.values(orders).forEach(order => {
            if (isAdmin || order.userId === currentUser.uid) {
                totalPurchases++;
                
                if (order.status === 'success') {
                    successfulPurchases++;
                    totalSpend += order.total;
                } else if (order.status === 'failed') {
                    failedPurchases++;
                } else if (order.status === 'cancelled') {
                    cancelledPurchases++;
                }
            }
        });
        
        const totalPurchasesEl = document.getElementById('totalPurchases');
        const successfulPurchasesEl = document.getElementById('successfulPurchases');
        const failedPurchasesEl = document.getElementById('failedPurchases');
        const cancelledPurchasesEl = document.getElementById('cancelledPurchases');
        const totalSpendEl = document.getElementById('totalSpend');
        
        if (totalPurchasesEl) totalPurchasesEl.textContent = totalPurchases;
        if (successfulPurchasesEl) successfulPurchasesEl.textContent = successfulPurchases;
        if (failedPurchasesEl) failedPurchasesEl.textContent = failedPurchases;
        if (cancelledPurchasesEl) cancelledPurchasesEl.textContent = cancelledPurchases;
        if (totalSpendEl) totalSpendEl.textContent = 'Rp ' + totalSpend.toLocaleString('id-ID');
    });
}

// Load products
function loadProducts() {
    database.ref('products').once('value', (snapshot) => {
        products = snapshot.val() || {};
        const productsArray = Object.values(products);
        
        const availableProductsContainer = document.getElementById('availableProducts');
        if (availableProductsContainer) {
            availableProductsContainer.innerHTML = '';
            
            productsArray.forEach(product => {
                if (product.stock > 0) {
                    const productCard = createProductCard(product);
                    availableProductsContainer.appendChild(productCard);
                }
            });
            
            if (productsArray.length === 0) {
                availableProductsContainer.innerHTML = '<p style="text-align: center; color: var(--text-dim);">Tidak ada produk tersedia</p>';
            }
        }
    });
}

// Load shop products
function loadShopProducts() {
    database.ref('products').once('value', (snapshot) => {
        products = snapshot.val() || {};
        const productsArray = Object.values(products);
        
        const shopProductsContainer = document.getElementById('shopProducts');
        if (shopProductsContainer) {
            shopProductsContainer.innerHTML = '';
            
            productsArray.forEach(product => {
                const productCard = createProductCard(product);
                shopProductsContainer.appendChild(productCard);
            });
            
            if (productsArray.length === 0) {
                shopProductsContainer.innerHTML = '<p style="text-align: center; color: var(--text-dim);">Tidak ada produk tersedia</p>';
            }
        }
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    card.innerHTML = `
        <div class="product-image">
            <i class="fas fa-box"></i>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">Rp ${product.price.toLocaleString('id-ID')}</div>
            <div class="product-stock">Stock: ${product.stock}</div>
            <div class="product-actions">
                <button class="btn btn-small" onclick="viewProduct('${product.id}')">Lihat</button>
                ${product.stock > 0 ? `<button class="btn btn-small" onclick="buyProduct('${product.id}')">Beli</button>` : '<button class="btn btn-small btn-danger" disabled>Habis</button>'}
            </div>
        </div>
    `;
    
    return card;
}

// View product
function viewProduct(productId) {
    const product = products[productId];
    
    if (!product) return;
    
    const details = `
        <h3>${product.name}</h3>
        <p style="margin: 15px 0;">${product.description}</p>
        <p><strong>Harga:</strong> Rp ${product.price.toLocaleString('id-ID')}</p>
        <p><strong>Stock:</strong> ${product.stock}</p>
    `;
    
    const orderDetailsContent = document.getElementById('orderDetailsContent');
    if (orderDetailsContent) {
        orderDetailsContent.innerHTML = details;
        const orderDetailsModal = document.getElementById('orderDetailsModal');
        if (orderDetailsModal) orderDetailsModal.classList.add('active');
    }
}

// Buy product
function buyProduct(productId) {
    currentProduct = products[productId];
    
    if (!currentProduct) return;
    
    // Load payment methods and show modal
    database.ref('paymentMethods').once('value', (snapshot) => {
        paymentMethods = snapshot.val() || {};
        const paymentMethodsArray = Object.values(paymentMethods);
        
        const paymentMethodSelect = document.getElementById('paymentMethod');
        if (paymentMethodSelect) {
            paymentMethodSelect.innerHTML = '<option value="">Pilih Metode Pembayaran</option>';
            
            paymentMethodsArray.forEach(method => {
                const option = document.createElement('option');
                option.value = method.id;
                option.textContent = `${method.name} - ${method.account}`;
                paymentMethodSelect.appendChild(option);
            });
            
            const productDetails = document.getElementById('productDetails');
            if (productDetails) {
                productDetails.innerHTML = `
                    <h3>${currentProduct.name}</h3>
                    <p style="margin: 15px 0;">${currentProduct.description}</p>
                    <p><strong>Harga:</strong> Rp ${currentProduct.price.toLocaleString('id-ID')}</p>
                    <p><strong>Stock:</strong> ${currentProduct.stock}</p>
                `;
            }
            
            const purchaseQuantity = document.getElementById('purchaseQuantity');
            if (purchaseQuantity) {
                purchaseQuantity.max = currentProduct.stock;
                purchaseQuantity.value = 1;
            }
            
            updatePriceDisplay();
            
            const productModal = document.getElementById('productModal');
            if (productModal) productModal.classList.add('active');
        }
    });
}

// Update price display
function updatePriceDisplay() {
    const purchaseQuantity = document.getElementById('purchaseQuantity');
    const subtotalEl = document.getElementById('subtotal');
    const discountEl = document.getElementById('discount');
    const totalEl = document.getElementById('total');
    const discountRow = document.getElementById('discountRow');
    
    if (!currentProduct || !purchaseQuantity || !subtotalEl || !totalEl) return;
    
    const quantity = parseInt(purchaseQuantity.value) || 1;
    const subtotal = currentProduct.price * quantity;
    
    subtotalEl.textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
    
    if (appliedVoucher) {
        const discount = subtotal
// Load purchase history
function loadPurchaseHistory() {
    database.ref('orders').once('value', (snapshot) => {
        const orders = snapshot.val() || {};
        const ordersArray = Object.values(orders);
        
        const purchaseHistoryTable = document.getElementById('purchaseHistoryTable');
        if (purchaseHistoryTable) {
            purchaseHistoryTable.innerHTML = '';
            
            const userOrders = ordersArray.filter(order => order.userId === currentUser.uid);
            
            userOrders.forEach(order => {
                const row = document.createElement('tr');
                
                let statusBadge = '';
                switch(order.status) {
                    case 'pending':
                        statusBadge = '<span class="status-badge status-pending">Pending</span>';
                        break;
                    case 'success':
                        statusBadge = '<span class="status-badge status-success">Sukses</span>';
                        break;
                    case 'failed':
                        statusBadge = '<span class="status-badge status-failed">Gagal</span>';
                        break;
                    case 'cancelled':
                        statusBadge = '<span class="status-badge status-cancelled">Dibatalkan</span>';
                        break;
                }
                
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.productName}</td>
                    <td>${order.quantity}</td>
                    <td>Rp ${order.total.toLocaleString('id-ID')}</td>
                    <td>${getPaymentMethodName(order.paymentMethodId)}</td>
                    <td>${statusBadge}</td>
                    <td>${new Date(order.date).toLocaleDateString('id-ID')}</td>
                    <td>
                        <button class="btn btn-small" onclick="viewOrderDetails('${order.id}')">Detail</button>
                    </td>
                `;
                
                purchaseHistoryTable.appendChild(row);
            });
            
            if (userOrders.length === 0) {
                purchaseHistoryTable.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-dim);">Tidak ada riwayat pembelian</td></tr>';
            }
        }
    });
}

// Get payment method name
function getPaymentMethodName(paymentMethodId) {
    const method = paymentMethods[paymentMethodId];
    return method ? method.name : 'Unknown';
}

// View order details
function viewOrderDetails(orderId) {
    database.ref('orders/' + orderId).once('value', (snapshot) => {
        const order = snapshot.val();
        
        if (!order) return;
        
        let details = `
            <p><strong>ID Pesanan:</strong> ${order.id}</p>
            <p><strong>Produk:</strong> ${order.productName}</p>
            <p><strong>Jumlah:</strong> ${order.quantity}</p>
            <p><strong>Harga:</strong> Rp ${order.price.toLocaleString('id-ID')}</p>
            <p><strong>Total:</strong> Rp ${order.total.toLocaleString('id-ID')}</p>
            <p><strong>Metode Pembayaran:</strong> ${getPaymentMethodName(order.paymentMethodId)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Tanggal:</strong> ${new Date(order.date).toLocaleDateString('id-ID')}</p>
        `;
        
        if (order.status === 'success' && order.productInfo) {
            details += `<p><strong>Informasi Produk:</strong> ${order.productInfo}</p>`;
        }
        
        const orderDetailsContent = document.getElementById('orderDetailsContent');
        if (orderDetailsContent) {
            orderDetailsContent.innerHTML = details;
            const orderDetailsModal = document.getElementById('orderDetailsModal');
            if (orderDetailsModal) orderDetailsModal.classList.add('active');
        }
    });
}

// Load profile
function loadProfile() {
    const profileNameInput = document.getElementById('profileNameInput');
    const profileEmailInput = document.getElementById('profileEmailInput');
    const profileRole = document.getElementById('profileRole');
    
    if (profileNameInput) profileNameInput.value = currentUser.name;
    if (profileEmailInput) profileEmailInput.value = currentUser.email;
    if (profileRole) profileRole.value = isAdmin ? 'Admin' : 'User';
}

// Event Listeners for dashboard
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    sidebar.classList.toggle('active');
});

logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    currentUser = null;
    isAdmin = false;
    
    // Clear session
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    
    // Redirect to login
    window.location.href = 'index.html';
    
    showToast('Logout berhasil', 'info');
});

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        
        menuItems.forEach(mi => mi.classList.remove('active'));
        item.classList.add('active');
        
        contentSections.forEach(cs => cs.classList.remove('active'));
        const targetSection = document.getElementById(section + 'Section');
        if (targetSection) targetSection.classList.add('active');
        
        loadSectionData(section);
        
        if (window.innerWidth <= 767) {
            menuToggle.classList.remove('active');
            sidebar.classList.remove('active');
        }
    });
});

// Modal event listeners
const closeProductModal = document.getElementById('closeProductModal');
const closeOrderDetailsModal = document.getElementById('closeOrderDetailsModal');
const purchaseForm = document.getElementById('purchaseForm');
const paymentProof = document.getElementById('paymentProof');
const fileName = document.getElementById('fileName');
const applyVoucherBtn = document.getElementById('applyVoucher');
const voucherCodeInput = document.getElementById('voucherCode');
const voucherMessage = document.getElementById('voucherMessage');
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discount');
const totalEl = document.getElementById('total');
const discountRow = document.getElementById('discountRow');

if (closeProductModal) {
    closeProductModal.addEventListener('click', () => {
        productModal.classList.remove('active');
        resetPurchaseForm();
    });
}

if (closeOrderDetailsModal) {
    closeOrderDetailsModal.addEventListener('click', () => {
        orderDetailsModal.classList.remove('active');
    });
}

if (paymentProof) {
    paymentProof.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
        } else {
            fileName.textContent = 'Tidak ada file yang dipilih';
        }
    });
}

if (purchaseForm) {
    purchaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const quantity = parseInt(document.getElementById('purchaseQuantity').value);
        const paymentMethodId = document.getElementById('paymentMethod').value;
        const proofFile = paymentProof.files[0];
        
        if (!proofFile) {
            showToast('Silakan upload bukti pembayaran', 'error');
            return;
        }
        
        let total = currentProduct.price * quantity;
        if (appliedVoucher) {
            total = total * (1 - appliedVoucher.discount / 100);
        }
        
        const order = {
            id: 'order' + Date.now(),
            userId: currentUser.uid,
            userName: currentUser.name,
            productId: currentProduct.id,
            productName: currentProduct.name,
            quantity: quantity,
            price: currentProduct.price,
            total: total,
            paymentMethodId: paymentMethodId,
            status: 'pending',
            date: new Date().toISOString(),
            proofUrl: 'proof_' + Date.now() + '.jpg',
            voucherId: appliedVoucher ? appliedVoucher.id : null
        };
        
        database.ref('orders/' + order.id).set(order).then(() => {
            const updatedStock = currentProduct.stock - quantity;
            database.ref('products/' + currentProduct.id + '/stock').set(updatedStock);
            
            if (appliedVoucher) {
                const updatedUsage = appliedVoucher.usageCount + 1;
                database.ref('vouchers/' + appliedVoucher.id + '/usageCount').set(updatedUsage);
            }
            
            productModal.classList.remove('active');
            resetPurchaseForm();
            showToast('Pesanan berhasil dibuat, menunggu persetujuan admin', 'success');
            
            if (document.getElementById('purchaseHistorySection').classList.contains('active')) {
                loadPurchaseHistory();
            }
        }).catch((error) => {
            console.error('Error creating order:', error);
            showToast('Terjadi kesalahan saat membuat pesanan', 'error');
        });
    });
}

if (applyVoucherBtn) {
    applyVoucherBtn.addEventListener('click', () => {
        const code = voucherCodeInput.value.trim();
        
        if (!code) {
            voucherMessage.textContent = 'Masukkan kode voucher';
            voucherMessage.style.color = 'var(--danger)';
            return;
        }
        
        const voucher = vouchers.find(v => v.code === code);
        
        if (!voucher) {
            voucherMessage.textContent = 'Kode voucher tidak valid';
            voucherMessage.style.color = 'var(--danger)';
            return;
        }
        
        const expiryDate = new Date(voucher.expiry);
        const today = new Date();
        
        if (expiryDate < today) {
            voucherMessage.textContent = 'Voucher sudah kadaluarsa';
            voucherMessage.style.color = 'var(--danger)';
            return;
        }
        
        if (voucher.usageCount >= voucher.maxUsage) {
            voucherMessage.textContent = 'Voucher sudah mencapai batas penggunaan';
            voucherMessage.style.color = 'var(--danger)';
            return;
        }
        
        appliedVoucher = voucher;
        voucherMessage.textContent = `Voucher berhasil diterapkan: Diskon ${voucher.discount}%`;
        voucherMessage.style.color = 'var(--success)';
        
        updatePriceDisplay();
    });
}

// Update price display
function updatePriceDisplay() {
    const quantity = parseInt(document.getElementById('purchaseQuantity').value) || 1;
    const subtotal = currentProduct.price * quantity;
    
    if (subtotalEl) subtotalEl.textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
    
    if (appliedVoucher && discountEl && totalEl && discountRow) {
        const discount = subtotal * (appliedVoucher.discount / 100);
        discountEl.textContent = '- Rp ' + discount.toLocaleString('id-ID');
        totalEl.textContent = 'Rp ' + (subtotal - discount).toLocaleString('id-ID');
        discountRow.style.display = 'flex';
    } else if (totalEl && discountRow) {
        totalEl.textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
        discountRow.style.display = 'none';
    }
}

// Reset purchase form
function resetPurchaseForm() {
    if (purchaseForm) purchaseForm.reset();
    if (fileName) fileName.textContent = 'Tidak ada file yang dipilih';
    appliedVoucher = null;
    if (voucherMessage) voucherMessage.textContent = '';
    updatePriceDisplay();
}

// Initialize dashboard
window.addEventListener('load', () => {
    // Check for existing session
    const savedUser = localStorage.getItem('currentUser');
    const savedIsAdmin = localStorage.getItem('isAdmin');
    
    if (savedUser && savedIsAdmin) {
        currentUser = JSON.parse(savedUser);
        isAdmin = savedIsAdmin === 'true';
        
        if (isAdmin) {
            window.location.href = 'admindashboard.html';
        } else {
            window.location.href = 'userdashboard.html';
        }
    }
    
    // Load initial data
    loadDashboardData();
    loadProducts();
});