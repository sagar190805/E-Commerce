// --- State ---
let products = [];

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
async function init() {
    await fetchProducts();
    populateCategories();
    renderProducts();
    setupEventListeners();
    loadCart();
}

async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        showToast('Failed to load products', 'error');
    }
}

function populateCategories() {
    const categories = [...new Set(products.map(p => p.category))];
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '<li class="active" data-category="all">All Products</li>';
    categories.forEach(category => {
        const li = document.createElement('li');
        li.dataset.category = category;
        li.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryList.appendChild(li);
    });
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
        filteredProducts.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
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
            <div class="modal-features">
                <p><i class="fa-solid fa-star" style="color: #fbbf24;"></i> ${product.rating?.rate} / 5 (${product.rating?.count} reviews)</p>
            </div>
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
