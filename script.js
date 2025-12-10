import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


let cart = JSON.parse(localStorage.getItem("cart")) || [];


function saveCart() {
localStorage.setItem("cart", JSON.stringify(cart));
}


export function addToCart(name, price) {
cart.push({ name, price });
saveCart();
alert("Ajouté au panier !");
}


export function getTotal() {
return cart.reduce((sum, item) => sum + item.price, 0);
}


async function saveOrderToFirestore(total) {
await addDoc(collection(db, "orders"), {
items: cart,
total,
date: new Date().toISOString(),
});
}


export async function pay() {
const total = getTotal();


const res = await fetch("/create-checkout-session", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ total }),
});


const data = await res.json();
window.location.href = data.url;
}


// Page de succès
if (window.location.search.includes("success=1")) {
const total = getTotal();
saveOrderToFirestore(total);
cart = [];
saveCart();
alert("Commande payée et enregistrée !");
}
