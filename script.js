/***********************
 * CONFIG
 ***********************/
const CART_KEY = "cart";
const BACKEND_URL = "https://livremagog-backend.vercel.app";

/***********************
 * PANIER (localStorage)
 ***********************/
function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(cart)) return [];
    return cart
      .map(i => ({
        sku: String(i.sku),
        qty: Number(i.qty)
      }))
      .filter(i => i.sku && i.qty > 0);
  } catch (e) {
    console.error("❌ Erreur getCart:", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(sku, qty = 1) {
  const cart = getCart();
  const q = Number(qty);

  if (!sku || !Number.isFinite(q) || q <= 0) return;

  const found = cart.find(i => i.sku === sku);
  if (found) {
    found.qty += q;
  } else {
    cart.push({ sku, qty: q });
  }

  saveCart(cart);
  console.log("✅ Panier mis à jour:", cart);
  updateCartBadge();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  console.log("🧹 Panier vidé");
  updateCartBadge();
}

/***********************
 * PAIEMENT STRIPE
 ***********************/
async function payNow() {
  const cart = getCart();

  console.log("🚀 PAY payload:", cart);

  if (!Array.isArray(cart) || cart.length === 0) {
    alert("Panier vide");
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ cart })
    });

    const text = await response.text();
    console.log("⬅️ Backend response:", response.status, text);

    if (!response.ok) {
      alert("Erreur backend : " + text);
      return;
    }

    const data = JSON.parse(text);

    if (!data.url) {
      alert("Erreur : URL Stripe manquante");
      return;
    }

    // Redirection vers Stripe Checkout
    window.location.href = data.url;

  } catch (err) {
    console.error("❌ Erreur payNow:", err);
    alert("Erreur réseau lors du paiement");
  }
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

function updateCartBadge() {
  const badge = document.querySelector("#cartBadge");
  if (!badge) return;
  badge.textContent = `🛒 Panier (${getCartCount()})`;
}

/***********************
 * INIT
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.querySelector("#payBtn");

  if (!payBtn) {
    console.warn("⚠️ Bouton #payBtn introuvable");
    return;
  }

  payBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("🖱️ Click sur Payer");
    payNow();
  });
  updateCartBadge();
  console.log("🛒 Panier au chargement:", getCart());

});

