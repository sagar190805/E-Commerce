// --- State ---
const products = [
    {
        id: 1,
        title: "Aura Pro Noise-Cancelling Headphones",
        category: "audio",
        price: 349.99,
        image: "assets/images/headphones.jpg",
        description: "Experience pure silence with our next-gen active noise-cancelling technology. Features 40 hours of battery life, plush memory foam ear cups, and studio-quality sound.",
        features: ["Active Noise Cancellation", "40-hour Battery", "High-Fidelity Audio", "Bluetooth 5.3"],
        featured: true
    },
    {
        id: 2,
        title: "Nexus Smartwatch Series X",
        category: "wearables",
        price: 299.99,
        image: "assets/images/smartwatch.jpg",
        description: "Your fitness and life companion. The Nexus Series X features an edge-to-edge AMOLED display, advanced health tracking, and up to 5 days of battery life.",
        features: ["AMOLED Display", "Heart Rate Monitor", "GPS Tracking", "5-Day Battery"],
        featured: true
    },
    {
        id: 3,
        title: "Tactile V2 Mechanical Keyboard",
        category: "peripherals",
        price: 159.99,
        image: "assets/images/keyboard.jpg",
        description: "Elevate your typing experience. Built with premium aluminum, customizable RGB per-key lighting, and hot-swappable tactile switches for the ultimate typing feel.",
        features: ["Hot-swappable Switches", "Per-key RGB", "Aluminum Body", "Wireless / Wired"],
        featured: false
    },
    {
        id: 4,
        title: "Lumina Mirrorless Camera",
        category: "cameras",
        price: 1299.99,
        image: "assets/images/camera.jpg",
        description: "Capture the world in stunning detail. The Lumina features a 45MP full-frame sensor, 8K video recording, and lightning-fast autofocus in a sleek, compact body.",
        features: ["45MP Full-Frame Sensor", "8K Video", "Eye Autofocus", "Weather Sealed"],
        featured: true
    },
    // Adding some extra products to make the catalog look full, even if we reuse images
    {
        id: 5,
        title: "Aura Studio Earbuds",
        category: "audio",
        price: 149.99,
        image: "assets/images/headphones.jpg",
        description: "Compact design, massive sound. The Aura Studio Earbuds offer punchy bass, crystal-clear vocals, and an IPX7 water resistance rating.",
        features: ["IPX7 Water Resistance", "Punchy Bass", "Compact Case", "Touch Controls"],
        featured: false
    },
    {
        id: 6,
        title: "Pro Creator Mouse",
        category: "peripherals",
        price: 89.99,
        image: "assets/images/keyboard.jpg", // Reusing keyboard image for peripherals demo
        description: "Ergonomic precision for creators. Features a 25K DPI sensor, horizontal scroll wheel, and up to 3 devices multi-connect.",
        features: ["25K DPI Sensor", "Ergonomic Design", "Multi-device", "USB-C Charging"],
        featured: false
    }
];

let cart = [];
let currentCategory = 'all';
let currentSearch = '';
let currentMaxPrice = 3000;
let currentSort = 'featured';

// --- DOM Elements ---
const productGrid = document.getElementById('productGrid');
const noResults = document.getElementById('noResults');
const categoryList = document.getElementById('categoryList');
const searchInput = document.getElementById('searchInput');
const priceRange = document.getElementById('priceRange');
const priceValueLabel = document.getElementById('priceValueLabel');
const sortSelect = document.getElementById('sortSelect');

const cartToggleBtn = document.getElementById('cartToggleBtn');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartCount = document.getElementById('cartCount');
const cartTotalPrice = document.getElementById('cartTotalPrice');
const checkoutBtn = document.getElementById('checkoutBtn');

const productModal = document.getElementById('productModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalBody = document.getElementById('modalBody');
const toastContainer = document.getElementById('toastContainer');

// --- Initialization ---
function init() {
    renderProducts();
    setupEventListeners();
    loadCart();
}

// --- Render Logic ---
function renderProducts() {
    let filteredProducts = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.title.toLowerCase().includes(currentSearch.toLowerCase()) || 
                              product.description.toLowerCase().includes(currentSearch.toLowerCase());
        const matchesPrice = product.price <= currentMaxPrice;
        
        return matchesCategory && matchesSearch && matchesPrice;
    });

    // Sorting
    if (currentSort === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'featured') {
        filteredProducts.sort((a, b) => (a.featured === b.featured) ? 0 : a.featured ? -1 : 1);
    }

    productGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        
        filteredProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card glass-panel';
            card.innerHTML = `
                <div class="product-img-wrapper" onclick="openProductModal(${product.id})">
                    <span class="category-badge">${product.category}</span>
                    <img src="${product.image}" alt="${product.title}">
                </div>
                <div class="product-info">
                    <h3 class="product-title" onclick="openProductModal(${product.id})">${product.title}</h3>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }
}

// --- Cart Logic ---
function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    saveCart();
    renderCart();
    showToast(`${product.title} added to cart`, 'success');
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart();
        renderCart();
        showToast(`${item.title} removed from cart`, 'info');
    }
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 2rem;">Your cart is empty.</p>';
    }

    cartCount.textContent = count;
    cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('aura_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        renderCart();
    }
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    // Simulate checkout
    cart = [];
    saveCart();
    renderCart();
    closeCart();
    showToast('Order placed successfully!', 'success');
}

// --- Modals ---
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    modalBody.innerHTML = `
        <div class="modal-img-container">
            <img src="${product.image}" alt="${product.title}">
        </div>
        <div class="modal-info">
            <div class="modal-category">${product.category}</div>
            <h2 class="modal-title">${product.title}</h2>
            <div class="modal-price">$${product.price.toFixed(2)}</div>
            <p class="modal-desc">${product.description}</p>
            <ul class="modal-features">
                ${product.features.map(f => `<li><i class="fa-solid fa-check"></i> ${f}</li>`).join('')}
            </ul>
            <div class="modal-actions">
                <button class="add-to-cart-btn" onclick="addToCart(${product.id}); closeProductModal();">
                    <i class="fa-solid fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        </div>
    `;

    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
}

function openCart() {
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// --- Utilities ---
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Categories
    categoryList.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderProducts();
        }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderProducts();
    });

    // Price Range
    priceRange.addEventListener('input', (e) => {
        currentMaxPrice = parseInt(e.target.value);
        priceValueLabel.textContent = `$${currentMaxPrice}`;
        renderProducts();
    });

    // Sort
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderProducts();
    });

    // Cart Toggles
    cartToggleBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) closeCart();
    });
    checkoutBtn.addEventListener('click', checkout);

    // Product Modal Toggles
    closeModalBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
    });
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
