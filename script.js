// Panier + commandes locales
let panier = JSON.parse(localStorage.getItem('panier')) || [];
let commandes = JSON.parse(localStorage.getItem('commandesDuJour')) || [];

// Stripe
const stripe = Stripe('pk_test_51SanAQEeNVdROugjrFHqlkGYVR3qQeDPT0a0X23gAjPHYDBvszs6ArDueXe4r8wgwyYomUhKjnnzBFD7b0ol26qV00zSrTaCu6');

// Restaurants & menus
const restaurants = [
  {nom:"Canton Brasse",img:"https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",id:"canton"},
  {nom:"La Memphré",img:"https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",id:"memphre"},
  {nom:"Pizzeria Magog",img:"https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",id:"pizza"}
];

const menus = {
  canton: [{nom:"Poutine classique",prix:14.99},{nom:"Burger Canton",prix:18.99},{nom:"Fish & Chips",prix:19.99}],
  memphre: [{nom:"Salade César",prix:12.99},{nom:"Sandwich au poulet",prix:14.99},{nom:"Soupe du jour",prix:9.99}],
  pizza: [{nom:"Pizza Margherita",prix:15.99},{nom:"Pizza Pepperoni",prix:17.99},{nom:"Calzone",prix:16.99}]
};

// Fonctions Toast, Panier, Rendu, Stripe Checkout
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3000);}
function updatePanierCount(){document.getElementById('panierCount').textContent=panier.reduce((s,i)=>s+(i.quantite||1),0);}
function addToCart(nom,prix){let item=panier.find(i=>i.nom===nom);if(item)item.quantite+=1;else panier.push({nom,prix,quantite:1});localStorage.setItem('panier',JSON.stringify(panier));updatePanierCount();showToast(`${nom} ajouté`);}
function clearPanier(){panier=[];localStorage.removeItem('panier');updatePanierCount();}
function fraisLivraison(t){return t>=100?0:t>=50?2.99:3.99;}

function renderHome(){
  document.getElementById("app").innerHTML = `<section class="hero"><h2>Livraison express à Magog</h2><p>Frais fixes 3,99 $ • 25-35 min</p></section>
    <section><h2 style="text-align:center;margin-bottom:30px;color:#003366;">Restaurants</h2><div class="grid" id="restoGrid"></div></section>`;
  renderRestos();
}

function renderRestos(){
  const g=document.getElementById('restoGrid'); g.innerHTML='';
  restaurants.forEach(r=>{
    const c=document.createElement('div'); c.className='resto-card';
    c.innerHTML=`<img src="${r.img}" alt="${r.nom}"><h3>${r.nom}</h3><button class="btn" onclick="openMenu('${r.id}')">Menu</button>`;
    g.appendChild(c);
  });
}

function openMenu(id){
  const m = menus[id] || [];
  let h=`<h2 style="text-align:center;color:#003366;margin:30px;">${restaurants.find(r=>r.id===id).nom}</h2><div style="max-width:600px;margin:0 auto;">`;
  m.forEach(i=>h+=`<div class="menu-item"><span style="flex:1;">${i.nom}</span><span>${i.prix.toFixed(2)} $</span>
    <button onclick="addToCart('${i.nom}',${i.prix})" class="btn-ajout">+</button></div>`);
  h+=`</div><div style="text-align:center;margin:40px;"><button class="btn" onclick="renderHome()">Retour</button><button class="btn" onclick="openPanier()">Panier</button></div>`;
  document.getElementById("app").innerHTML=h;
}

function openPanier(){
  if(panier.length===0) return alert("Vide !");
  const totalHT = panier.reduce((s,i)=>s+(i.prix*(i.quantite||1)),0);
  const livraison = fraisLivraison(totalHT);
  const totalTTC = (totalHT*1.12 + livraison).toFixed(2);
  let liste = "";
  panier.forEach(i=>liste+=`<div style="display:flex;justify-content:space-between;padding:15px;background:white;margin:10px 0;border-radius:10px;">
    <span>${i.quantite||1} × ${i.nom}</span><span>${(i.prix*(i.quantite||1)).toFixed(2)} $</span></div>`);
  document.getElementById("app").innerHTML = `<h2 style="text-align:center;color:#003366;margin:30px;">Ton panier</h2>
    <div style="max-width:600px;margin:0 auto;">${liste}
      <div style="background:#f0f0f0;padding:30px;border-radius:15px;text-align:center;">
        <p style="font-size:2rem;font-weight:bold;color:#00b300;">TOTAL : ${totalTTC} $</p>
        <button class="btn" onclick="prePay()">PAYER PAR CARTE</button>
        <button class="vider-btn" onclick="clearPanier()">Vider</button>
      </div>
    </div>`;
}

// Stripe Checkout
function prePay(){
  if(panier.length===0) return;

  const totalHT = panier.reduce((s,i)=>s+(i.prix*(i.quantite||1)),0);
  const livraison = fraisLivraison(totalHT);

  const lineItems = panier.map(i => ({
    price_data: { currency:'cad', product_data:{ name: i.nom + (i.quantite>1 ? ` ×${i.quantite}` : '') }, unit_amount: Math.round(i.prix*100) },
    quantity: 1
  }));

  if(livraison>0){
    lineItems.push({ price_data:{ currency:'cad', product_data:{ name:'Livraison' }, unit_amount: Math.round(livraison*100) }, quantity:1 });
  }

  stripe.redirectToCheckout({
    lineItems: lineItems,
    mode: 'payment',
    successUrl: window.location.origin + '?success=1',
    cancelUrl: window.location.origin,
    billingAddressCollection:'required',
    shippingAddressCollection:{ allowedCountries:['CA'] },
    locale:'fr'
  }).then(r=>{ if(r.error) showToast(r.error.message); });
}

// Admin caché
function adminAccess(){ const pass = prompt("Mot de passe admin ?"); if(pass==="magog2025"){ document.getElementById("suivi").style.display="block"; showOrders(); }}
function showOrders(){ if(commandes.length===0) return document.getElementById('orders').innerHTML="<p>Aucune commande aujourd'hui</p>"; let html="<ul>"; commandes.forEach(c=>html+=`<li><strong>${c.heure}</strong> – ${c.items.map(i=>i.nom).join(', ')} – ${c.total} $</li>`); html+="</ul>"; document.getElementById('orders').innerHTML=html; }
function effacerSuivi(){ if(confirm("Effacer ?")){ commandes=[]; localStorage.setItem('commandesDuJour',JSON.stringify(commandes)); showOrders(); } }

// Démarrage
renderHome();
updatePanierCount();

