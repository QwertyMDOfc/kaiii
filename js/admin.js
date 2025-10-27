// Admin specific functions
function loadManageProducts() {
    database.ref('products').once('value', (snapshot) => {
        products = snapshot.val() || {};
        const productsArray = Object.values(products);
        
        const manageProductsTable = document.getElementById('manageProductsTable');
        if (manageProductsTable) {
            manageProductsTable.innerHTML = '';
            
            productsArray.forEach(product => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>Rp ${product.price.toLocaleString('id-ID')}</td>
                    <td>${product.stock}</td>
                    <td>
                        <button class="btn btn-small btn-danger" onclick="deleteProduct('${product.id}')">Hapus</button>
                    </td>
                `;
                
                manageProductsTable.appendChild(row);
            });
            
            if (productsArray.length === 0) {
                manageProductsTable.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">Tidak ada produk</td></tr>';
            }
        }
    });
}

function deleteProduct(productId) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        database.ref('products/' + productId).remove().then(() => {
            showToast('Produk berhasil dihapus', 'success');
            loadManageProducts();
        }).catch((error) => {
            console.error('Error deleting product:', error);
            showToast('Terjadi kesalahan saat menghapus produk', 'error');
        });
    }
}

function loadPendingOrders() {
    database.ref('orders').once('value', (snapshot) => {
        const orders = snapshot.val() || {};
        const ordersArray = Object.values(orders);
        
        const pendingOrders = ordersArray.filter(order => order.status === 'pending');
        
        const pendingOrdersTable = document.getElementById('pendingOrdersTable');
        if (pendingOrdersTable) {
            pendingOrdersTable.innerHTML = '';
            
            pendingOrders.forEach(order => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.userName}</td>
                    <td>${order.productName}</td>
                    <td>${order.quantity}</td>
                    <td>Rp ${order.total.toLocaleString('id-ID')}</td>
                    <td>${getPaymentMethodName(order.paymentMethodId)}</td>
                    <td><a href="#" onclick="viewProof('${order.proofUrl}')">Lihat</a></td>
                    <td>
                        <button class="btn btn-small btn-success" onclick="approveOrder('${order.id}')">Setujui</button>
                        <button class="btn btn-small btn-danger" onclick="declineOrder('${order.id}')">Tolak</button>
                    </td>
                `;
                
                pendingOrdersTable.appendChild(row);
            });
            
            if (pendingOrders.length === 0) {
                pendingOrdersTable.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-dim);">Tidak ada pesanan pending</td></tr>';
            }
        }
    });
}

function viewProof(proofUrl) {
    showToast('Bukti pembayaran: ' + proofUrl, 'info');
}

function approveOrder(orderId) {
    database.ref('orders/' + orderId).once('value', (snapshot) => {
        currentOrder = snapshot.val();
        
        if (!currentOrder) return;
        
        const approveOrderDetails = document.getElementById('approveOrderDetails');
        if (approveOrderDetails) {
            approveOrderDetails.innerHTML = `
                <p><strong>ID Pesanan:</strong> ${currentOrder.id}</p>
                <p><strong>Pengguna:</strong> ${currentOrder.userName}</p>
                <p><strong>Produk:</strong> ${currentOrder.productName}</p>
                <p><strong>Jumlah:</strong> ${currentOrder.quantity}</p>
                <p><strong>Total:</strong> Rp ${currentOrder.total.toLocaleString('id-ID')}</p>
            `;
            
            const approveOrderModal = document.getElementById('approveOrderModal');
            if (approveOrderModal) approveOrderModal.classList.add('active');
        }
    });
}

function declineOrder(orderId) {
    if (confirm('Apakah Anda yakin ingin menolak pesanan ini?')) {
        database.ref('orders/' + orderId).update({
            status: 'failed',
            declinedAt: new Date().toISOString()
        }).then(() => {
            database.ref('orders/' + orderId).once('value', (snapshot) => {
                const order = snapshot.val();
                
                if (order) {
                    database.ref('products/' + order.productId).once('value', (productSnapshot) => {
                        const product = productSnapshot.val();
                        
                        if (product) {
                            const updatedStock = product.stock + order.quantity;
                            database.ref('products/' + order.productId + '/stock').set(updatedStock);
                        }
                    });
                }
            });
            
            showToast('Pesanan ditolak', 'info');
            loadPendingOrders();
        }).catch((error) => {
            console.error('Error declining order:', error);
            showToast('Terjadi kesalahan saat menolak pesanan', 'error');
        });
    }
}

// Add product form
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('productName').value;
        const price = parseInt(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const description = document.getElementById('productDescription').value;
        
        const product = {
            id: 'product' + Date.now(),
            name: name,
            price: price,
            stock: stock,
            description: description
        };
        
        database.ref('products/' + product.id).set(product).then(() => {
            addProductForm.reset();
            showToast('Produk berhasil ditambahkan', 'success');
            loadManageProducts();
        }).catch((error) => {
            console.error('Error adding product:', error);
            showToast('Terjadi kesalahan saat menambah produk', 'error');
        });
    });
}

// Approve order form
const approveOrderForm = document.getElementById('approveOrderForm');
if (approveOrderForm) {
    approveOrderForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const productInfo = document.getElementById('productInfo').value;
        
        database.ref('orders/' + currentOrder.id).update({
            status: 'success',
            productInfo: productInfo,
            approvedAt: new Date().toISOString()
        }).then(() => {
            const approveOrderModal = document.getElementById('approveOrderModal');
            if (approveOrderModal) approveOrderModal.classList.remove('active');
            showToast('Pesanan berhasil disetujui', 'success');
            
            loadPendingOrders();
        }).catch((error) => {
            console.error('Error approving order:', error);
            showToast('Terjadi kesalahan saat menyetujui pesanan', 'error');
        });
    });
}

// Close approve order modal
const closeApproveOrderModal = document.getElementById('closeApproveOrderModal');
if (closeApproveOrderModal) {
    closeApproveOrderModal.addEventListener('click', () => {
        approveOrderModal.classList.remove('active');
    });
}

// Initialize admin dashboard
window.addEventListener('load', () => {
    // Load admin specific data
    loadManageProducts();
    loadPendingOrders();
});