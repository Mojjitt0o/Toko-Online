document.addEventListener("DOMContentLoaded", () => {
    function loadPage() {
        const hash = window.location.hash.substring(1) || "home";
        const content = document.getElementById("content");

        let pageContent = "";

        switch (hash) {
            case "home":
                pageContent = `
                    <div class="hero">
                        <div class="moon"></div>
                        <div class="stars">
                            <span></span><span></span><span></span><span></span><span></span>
                        </div>
                        <div class="kubah"></div>
                        <div class="lentera"></div>
                        <h1>Selamat Datang di Toko Online</h1>
                        <p>Temukan berbagai produk menarik dengan harga terbaik!</p>
                    </div>
                `;
                break;
                case "produk":
                    pageContent = `
                        <h2 class="text-center">Daftar Produk</h2>
                        <div class="d-flex justify-content-between mb-3">
                            <input type="text" id="searchInput" class="form-control w-50" placeholder="Cari produk...">
                            <select id="categoryFilter" class="form-select w-25">
                                <option value="">Semua Kategori</option>
                            </select>
                        </div>
                        <div class="row" id="product-list"></div>
                    `;
                    content.innerHTML = pageContent;
                    loadProducts();
                    
                    document.getElementById("searchInput").addEventListener("input", filterProducts);
                    document.getElementById("categoryFilter").addEventListener("change", filterProducts);
                    return;
                
            case "keranjang":
                pageContent = `
                    <h2 class="text-center">Keranjang Belanja</h2>
                    <ul id="cart-list" class="list-group"></ul>
                    <h4 id="total-harga" class="text-end mt-3"></h4>
                    <h5 id="total-items" class="text-end mt-2"></h5>
                    <button class="btn btn-primary mt-3" id="checkout-btn">Checkout</button>
                `;
                content.innerHTML = pageContent;
                loadCart();
                document.getElementById("checkout-btn").addEventListener("click", handleCheckout);
                return;
            case "login":
                pageContent = `
                    <h2 class="text-center">Login</h2>
                    <form id="login-form" class="login-form">
                        <div class="mb-3">
                            <label for="email" class="form-label">Email:</label>
                            <input type="email" id="email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password:</label>
                            <input type="password" id="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Login</button>
                        <button type="button" class="btn btn-secondary" onclick="window.location.hash='register'">Registrasi</button>
                    </form>
                `;
                content.innerHTML = pageContent;
                document.getElementById("login-form").addEventListener("submit", handleLogin);
                return;
        }

        content.innerHTML = pageContent;
    }

    function handleCheckout() {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Anda harus login untuk checkout!");
            window.location.hash = "login";
            return;
        }
        alert("Proses checkout berjalan!");
    }

    window.addEventListener("hashchange", loadPage);
    loadPage();

    let allProducts = []; // Menyimpan semua produk

function loadProducts() {
    fetch("/api/products")
        .then(response => response.json())
        .then(products => {
            allProducts = products; // Simpan semua produk ke dalam variabel global
            displayProducts(products);

            // Ambil daftar kategori unik
            const categories = [...new Set(products.map(product => product.category))];
            const categoryFilter = document.getElementById("categoryFilter");
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        })
        .catch(error => console.error("Error saat memuat produk:", error));
}


    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("add-to-cart")) {
            const productId = event.target.dataset.id;
            addToCart(productId);
        }
    });

    function loadCart() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const cartList = document.getElementById("cart-list");
        const totalContainer = document.getElementById("total-harga");
        const totalItemsContainer = document.getElementById("total-items");
    
        let totalHarga = 0;
        let totalItems = 0;
    
        if (cart.length === 0) {
            cartList.innerHTML = `<li class="list-group-item text-center">Keranjang kosong</li>`;
            totalContainer.innerHTML = `<h4 class="text-end fw-bold">Total: Rp 0</h4>`;
            totalItemsContainer.innerHTML = `<h5 class="text-end">Total Barang: 0</h5>`;
            return;
        }
    
        cartList.innerHTML = `
            <table class="table table-striped text-center">
                <thead>
                    <tr>
                        <th>Produk</th>
                        <th>Harga</th>
                        <th>Jumlah</th>
                        <th>Total</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${cart.map(item => {
                        const hargaFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(item.price);
                        const totalItem = item.price * item.quantity;
                        const totalItemFormatted = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(totalItem);
    
                        totalHarga += totalItem;
                        totalItems += item.quantity;
    
                        return `
                            <tr>
                                <td>${item.name}</td>
                                <td>${hargaFormatted}</td>
                                <td>
                                    <button class="btn btn-sm btn-secondary update-quantity" data-id="${item.id}" data-change="-1">-</button>
                                    ${item.quantity}
                                    <button class="btn btn-sm btn-secondary update-quantity" data-id="${item.id}" data-change="1">+</button>
                                </td>
                                <td>${totalItemFormatted}</td>
                                <td>
                                    <button class="btn btn-sm btn-danger remove-from-cart" data-id="${item.id}">Hapus</button>
                                </td>
                            </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        `;
    
        totalContainer.innerHTML = `<h4 class="text-end fw-bold">Total: ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(totalHarga)}</h4>`;
        totalItemsContainer.innerHTML = `<h5 class="text-end">Total Barang: ${totalItems}</h5>`;
    }
    

    document.addEventListener("click", (event) => {
        if (event.target.classList.contains("update-quantity")) {
            const productId = parseInt(event.target.dataset.id);
            const change = parseInt(event.target.dataset.change);
            updateQuantity(productId, change);
        }

        if (event.target.classList.contains("remove-from-cart")) {
            const productId = parseInt(event.target.dataset.id);
            removeFromCart(productId);
        }
    });

    function filterProducts() {
        const searchText = document.getElementById("searchInput").value.toLowerCase();
        const selectedCategory = document.getElementById("categoryFilter").value;
    
        const filteredProducts = allProducts.filter(product => {
            const matchesName = product.name.toLowerCase().includes(searchText);
            const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
            return matchesName && matchesCategory;
        });
    
        displayProducts(filteredProducts);
    }
    

    function displayProducts(products) {
        const productList = document.getElementById("product-list");
        productList.innerHTML = products.map(product => `
            <div class="col-md-4">
                <div class="card product-card">
                    <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="card-text"><strong>Rp ${product.price}</strong></p>
                        <button class="btn btn-success add-to-cart" data-id="${product.id}">Tambah ke Keranjang</button>
                    </div>
                </div>
            </div>
        `).join("");
    }
    

    function addToCart(productId) {
        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                let cart = JSON.parse(localStorage.getItem("cart")) || [];
                const existingItem = cart.find(item => item.id === product.id);

                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cart.push({ ...product, quantity: 1 });
                }

                localStorage.setItem("cart", JSON.stringify(cart));
                showToast("Produk berhasil ditambahkan ke keranjang!");
                loadCart();
            })
            .catch(error => console.error("Error saat menambahkan ke keranjang:", error));
    }

    function updateQuantity(productId, change) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const item = cart.find(item => item.id === productId);

        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        loadCart();
    }

    function removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem("cart", JSON.stringify(cart));
        showToast("Produk berhasil dihapus dari keranjang!");
        loadCart();
    }

    function handleCheckout() {
        const token = localStorage.getItem("token");
        if (!token) {
            showToast("Silahkan login terlebih dahulu!");
            window.location.hash = "login";
            return;
        }
        alert("Proses checkout berjalan!");
    }

    function handleLogin(event) {
        event.preventDefault();
        alert("Fitur login belum terhubung ke backend.");
    }

    function showToast(message, type = "success") {
        const toastContainer = document.getElementById("toast-container");
    
        if (!toastContainer) {
            console.error("Toast container tidak ditemukan di HTML.");
            return;
        }
    
        const toast = document.createElement("div");
        toast.className = `toast ${type} show`;
        toast.innerHTML = message;
    
        toastContainer.appendChild(toast);
    
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
    
    
    

    window.addEventListener("hashchange", loadPage);
    loadPage();
});
