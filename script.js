// Pricing Calculator App
class PricingCalculator {
    constructor() {
        this.items = [];
        this.predefinedItems = [];
        this.loadProducts();
        
        this.initializeEventListeners();
        this.updateDisplay();
        this.loadProductGrid();
    }

    async loadProducts() {
        try {
            const response = await fetch('products.json');
            this.predefinedItems = await response.json();
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to some basic items if products.json fails to load
            this.predefinedItems = [
                { name: "WOW Adventure Pack", price: 60.00 },
                { name: "WOW Recovery Pack", price: 35.00 },
                { name: "WOW Essentials Pack", price: 25.00 }
            ];
        }
    }

    loadProductGrid() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        // Wait for products to load
        setTimeout(() => {
            productsGrid.innerHTML = this.predefinedItems.map((product, index) => `
                <div class="product-card" data-product-id="${index}">
                    <div class="product-image" data-product-id="${index}">
                        <!-- Product image placeholder -->
                    </div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-quantity">
                        <button class="quantity-btn" onclick="pricingApp.decreaseQuantity(${index})">-</button>
                        <span class="quantity-display" id="qty-${index}">1</span>
                        <button class="quantity-btn" onclick="pricingApp.increaseQuantity(${index})">+</button>
                    </div>
                    <button class="add-btn" onclick="pricingApp.addProductToCart(${index})">
                        Add to Cart
                    </button>
                </div>
            `).join('');
        }, 100);
    }

    initializeEventListeners() {
        // Add item button
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.addItem();
        });

        // Enter key support for form inputs
        document.getElementById('itemName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('itemPrice').focus();
            }
        });

        document.getElementById('itemPrice').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('itemQuantity').focus();
            }
        });

        document.getElementById('itemQuantity').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addItem();
            }
        });

        // No search functionality needed for visual grid

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllItems();
        });

        // New sale button
        document.getElementById('newSaleBtn').addEventListener('click', () => {
            this.newSale();
        });
    }

    addItem() {
        const name = document.getElementById('itemName').value.trim();
        const price = parseFloat(document.getElementById('itemPrice').value);
        const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;

        if (!name || isNaN(price) || price <= 0) {
            this.showNotification('Please enter valid item name and price', 'error');
            return;
        }

        const item = {
            id: Date.now(),
            name: name,
            price: price,
            quantity: quantity,
            total: price * quantity
        };

        this.items.push(item);
        this.updateDisplay();
        this.clearForm();
        this.hideSearchResults();

        // Focus back to item name for quick entry
        document.getElementById('itemName').focus();
        
        this.showNotification(`Added ${quantity}x ${name}`, 'success');
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.updateDisplay();
        this.showNotification('Item removed', 'info');
    }

    clearAllItems() {
        if (this.items.length === 0) return;
        
        if (confirm('Are you sure you want to clear all items?')) {
            this.items = [];
            this.updateDisplay();
            this.showNotification('All items cleared', 'info');
        }
    }

    newSale() {
        if (this.items.length === 0) return;
        
        if (confirm('Start a new sale? This will clear all current items.')) {
            this.items = [];
            this.updateDisplay();
            this.clearForm();
            this.showNotification('New sale started', 'success');
        }
    }

    // Search functionality removed - using visual grid instead

    addPredefinedItem(item) {
        const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;
        
        const newItem = {
            id: Date.now(),
            name: item.name,
            price: item.price,
            quantity: quantity,
            total: item.price * quantity
        };

        this.items.push(newItem);
        this.updateDisplay();
        this.hideSearchResults();
        document.getElementById('itemSearch').value = '';
        
        this.showNotification(`Added ${quantity}x ${item.name}`, 'success');
    }

    // Product grid methods
    addProductToCart(productIndex) {
        const product = this.predefinedItems[productIndex];
        const quantity = parseInt(document.getElementById(`qty-${productIndex}`).textContent) || 1;
        
        const newItem = {
            id: Date.now(),
            name: product.name,
            price: product.price,
            quantity: quantity,
            total: product.price * quantity
        };

        this.items.push(newItem);
        this.updateDisplay();
        
        this.showNotification(`Added ${quantity}x ${product.name}`, 'success');
        
        // Reset quantity to 1
        document.getElementById(`qty-${productIndex}`).textContent = '1';
    }

    increaseQuantity(productIndex) {
        const quantityDisplay = document.getElementById(`qty-${productIndex}`);
        const currentQty = parseInt(quantityDisplay.textContent) || 1;
        const newQty = Math.min(currentQty + 1, 99); // Max 99
        quantityDisplay.textContent = newQty;
    }

    decreaseQuantity(productIndex) {
        const quantityDisplay = document.getElementById(`qty-${productIndex}`);
        const currentQty = parseInt(quantityDisplay.textContent) || 1;
        const newQty = Math.max(currentQty - 1, 1); // Min 1
        quantityDisplay.textContent = newQty;
    }

    updateDisplay() {
        this.updateTotal();
        this.updateItemCount();
        this.updateItemsList();
    }

    updateTotal() {
        const total = this.items.reduce((sum, item) => sum + item.total, 0);
        document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    }

    updateItemCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('itemCount').textContent = count;
    }

    updateItemsList() {
        const itemsList = document.getElementById('itemsList');
        
        if (this.items.length === 0) {
            itemsList.innerHTML = `
                <div class="empty-state">
                    <p>No items added yet</p>
                    <p>Add items above or search for quick pricing</p>
                </div>
            `;
            return;
        }

        itemsList.innerHTML = this.items.map(item => `
            <div class="item">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-details">
                        $${item.price.toFixed(2)} × ${item.quantity}
                    </div>
                </div>
                <div class="item-price">$${item.total.toFixed(2)}</div>
                <div class="item-actions">
                    <button class="btn btn-small btn-danger" onclick="pricingApp.removeItem(${item.id})">
                        ×
                    </button>
                </div>
            </div>
        `).join('');
    }

    clearForm() {
        document.getElementById('itemName').value = '';
        document.getElementById('itemPrice').value = '';
        document.getElementById('itemQuantity').value = '1';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '1000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '90%',
            textAlign: 'center'
        });

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pricingApp = new PricingCalculator();
});

// Add some utility functions for quick access
window.quickAdd = (name, price, quantity = 1) => {
    if (window.pricingApp) {
        const item = {
            id: Date.now(),
            name: name,
            price: price,
            quantity: quantity,
            total: price * quantity
        };
        window.pricingApp.items.push(item);
        window.pricingApp.updateDisplay();
        window.pricingApp.showNotification(`Added ${quantity}x ${name}`, 'success');
    }
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add item
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (window.pricingApp) {
            window.pricingApp.addItem();
        }
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        if (window.pricingApp) {
            window.pricingApp.hideSearchResults();
            document.getElementById('itemSearch').value = '';
        }
    }
});
