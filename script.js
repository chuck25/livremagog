const CART_KEY = "cart";

// -------- Panier
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Exemple: appel depuis un bouton "Commander"
function addToCart(sku, qty = 1) {
  const cart = getCart();
  const q = Number(qty);
  if (!sku || !Number.isFinite(q) || q <= 0) return;

  const found = cart.find(i => i.sku === sku);
  if (found) found.qty += q;
  else cart.push({ sku, qty: q });

  saveCart(cart);
  console.log("Panier:", cart);
}

// -------- Paiement
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

  window.location.href = data.url;
}

// -------- Init
document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.querySelector("#payBtn");
  if (payBtn) payBtn.addEventListener("click", payNow);
});
