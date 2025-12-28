const CART_KEY = "cart";

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(sku, qty = 1) {
  const cart = getCart();
  const q = Number(qty);
  if (!sku || !Number.isFinite(q) || q <= 0) return;

  const found = cart.find(i => i.sku === sku);
  if (found) found.qty += q;
  else cart.push({ sku, qty: q });

  saveCart(cart);
  renderCart();
}

function setQty(sku, qty) {
  const cart = getCart();
  const q = Number(qty);

  const item = cart.find(i => i.sku === sku);
  if (!item) return;

  if (!Number.isInteger(q) || q <= 0) {
    // qty <=0 => remove
    const next = cart.filter(i => i.sku !== sku);
    saveCart(next);
  } else {
    item.qty = q;
    saveCart(cart);
  }
  renderCart();
}

function removeFromCart(sku) {
  const cart = getCart().filter(i => i.sku !== sku);
  saveCart(cart);
  renderCart();
}

// --- Affichage (tu peux adapter au HTML existant)
function renderCart() {
  const cart = getCart();
  const container = document.querySelector("#cartItems");
  const badge = document.querySelector("#cartCount");

  if (badge) badge.textContent = cart.reduce((s, i) => s + (i.qty || 0), 0);

  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `<p>Panier vide</p>`;
    return;
  }

  container.innerHTML = cart.map(i => `
    <div class="cart-row">
      <div>
        <strong>${i.sku}</strong>
        <div class="muted">Quantité: 
          <input type="number" min="1" value="${i.qty}" data-sku="${i.sku}" class="qtyInput" />
        </div>
      </div>
      <button class="removeBtn" data-sku="${i.sku}">Retirer</button>
    </div>
  `).join("");

  // listeners qty
  container.querySelectorAll(".qtyInput").forEach(input => {
    input.addEventListener("change", (e) => {
      const sku = e.target.getAttribute("data-sku");
      const qty = parseInt(e.target.value, 10);
      setQty(sku, qty);
    });
  });

  // listeners remove
  container.querySelectorAll(".removeBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const sku = e.target.getAttribute("data-sku");
      removeFromCart(sku);
    });
  });
}

// --- Checkout (branche Stripe via backend)
async function payNow() {
  const cart = getCart();
  if (!cart.length) {
    alert("Panier vide");
    return;
  }

  const backend = "https://livremagog-backend.vercel.app";

  const r = await fetch(`${backend}/api/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  });

  const data = await r.json();
  if (!r.ok) {
    alert(data.error || "Erreur paiement");
    return;
  }

  window.location.href = data.url; // redirection Stripe Checkout
}

// init
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const payBtn = document.querySelector("#payBtn");
  if (payBtn) payBtn.addEventListener("click", payNow);
});
