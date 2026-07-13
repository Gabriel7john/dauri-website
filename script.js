const WHATSAPP_NUMBER = "5574999431435";

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});

mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

let cart = [];

const cartToggle = document.getElementById("cart-toggle");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartClose = document.getElementById("cart-close");
const cartItemsEl = document.getElementById("cart-items");
const cartEmptyEl = document.getElementById("cart-empty");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartCheckoutBtn = document.getElementById("cart-checkout");

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("show");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("show");
  cartDrawer.setAttribute("aria-hidden", "true");
}

cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

function formatBRL(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function addToCart(product) {
  const existing = cart.find((item) => item.name === product.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  openCart();
}

function changeQty(name, delta) {
  const item = cart.find((i) => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.name !== name);
  }
  renderCart();
}

function removeItem(name) {
  cart = cart.filter((i) => i.name !== name);
  renderCart();
}

function renderCart() {
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "";
    cartItemsEl.appendChild(cartEmptyEl);
    cartTotalEl.textContent = formatBRL(0);
    cartCheckoutBtn.disabled = true;
    return;
  }

  cartCheckoutBtn.disabled = false;
  cartItemsEl.innerHTML = "";

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.qty;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-price">${formatBRL(item.price)}</p>
        <div class="cart-item-controls">
          <button class="qty-btn" data-action="dec">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="inc">+</button>
          <button class="cart-item-remove" data-action="remove">Remover</button>
        </div>
      </div>
    `;

    row
      .querySelector('[data-action="inc"]')
      .addEventListener("click", () => changeQty(item.name, 1));
    row
      .querySelector('[data-action="dec"]')
      .addEventListener("click", () => changeQty(item.name, -1));
    row
      .querySelector('[data-action="remove"]')
      .addEventListener("click", () => removeItem(item.name));

    cartItemsEl.appendChild(row);
  });

  cartTotalEl.textContent = formatBRL(total);
}

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".card");
    const name = card?.dataset.product || "Produto";
    const price = parseFloat(card?.dataset.price || "0");
    const image = card.querySelector("img")?.getAttribute("src") || "";

    addToCart({ name, price, image });
    showToast(`${name} adicionado ao carrinho`);
  });
});

cartCheckoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  let message = "Olá! Quero fazer um pedido na D'AURI:%0A%0A";
  let total = 0;

  cart.forEach((item) => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    message += `• ${item.qty}x ${item.name} - ${formatBRL(subtotal)}%0A`;
  });

  message += `%0A*Total: ${formatBRL(total)}*`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, "_blank");
});
