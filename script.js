// Pricing Calculator App
class PricingCalculator {
    constructor() {
        this.items = [];
        this.predefinedItems = [];
        this.loadProducts();
        
        this.initializeEventListeners();
        this.updateDisplay();
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

        // Search functionality
        const searchInput = document.getElementById('itemSearch');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Clear search when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchResults();
            }
        });

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

    handleSearch(query) {
        const searchResults = document.getElementById('searchResults');
        
        if (query.length < 2) {
            this.hideSearchResults();
            return;
        }

        const results = this.predefinedItems.filter(item =>
            item.name.toLowerCase().includes(query.toLowerCase())
        );

        if (results.length === 0) {
            this.hideSearchResults();
            return;
        }

        this.showSearchResults(results);
    }

    showSearchResults(results) {
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';

        results.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <div class="search-result-name">${item.name}</div>
                <div class="search-result-price">$${item.price.toFixed(2)}</div>
            `;
            
            resultItem.addEventListener('click', () => {
                this.addPredefinedItem(item);
            });
            
            searchResults.appendChild(resultItem);
        });

        searchResults.style.display = 'block';
    }

    hideSearchResults() {
        const searchResults = document.getElementById('searchResults');
        searchResults.style.display = 'none';
    }

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
