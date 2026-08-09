const products = [
  {id: 1,name:"Brown Casual Shirt",cat:"Shirts",price:1599,tag:"New",desc:"A stylish brown casual shirt with a comfortable everyday fit.",img:"brown-shirt.jpg"},
  {id:4,name:"Minimal Logo Tee",cat:"T-Shirts",price:799,tag:"New",desc:"Minimal branding and a comfortable regular fit.",img:"blue"},
  {id:5,name:"Textured Resort Shirt",cat:"Shirts",price:1599,tag:"Trending",desc:"Lightweight textured shirt for effortless summer looks.",img:"beige"},
  {id:6,name:"Straight Fit Denim",cat:"Bottoms",price:1899,tag:"New",desc:"A timeless straight-leg denim with a modern finish.",img:"alt"},
  {id:7,name:"Heavyweight Street Tee",cat:"T-Shirts",price:999,tag:"Trending",desc:"Structured heavyweight cotton with a streetwear fit.",img:""},
  {id:8,name:"Everyday Linen Shirt",cat:"Shirts",price:1699,tag:"New",desc:"Breathable linen blend designed for everyday comfort.",img:"blue"},
  {id:9,name:"Relaxed Jogger",cat:"Bottoms",price:1299,tag:"Trending",desc:"Soft, relaxed joggers for travel and everyday wear.",img:""},
  {id:10,name:"Contrast Pocket Tee",cat:"T-Shirts",price:949,tag:"New",desc:"A contemporary tee with a subtle contrast detail.",img:"alt"},
  {id:11,name:"Overshirt Jacket",cat:"Shirts",price:1999,tag:"Trending",desc:"A versatile overshirt that layers effortlessly.",img:"beige"},
  {id:12,name:"Wide Leg Trouser",cat:"Bottoms",price:1699,tag:"New",desc:"Relaxed wide-leg trousers with a clean drape.",img:"blue"}
];

let cart = JSON.parse(localStorage.getItem("veloraCart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("veloraWishlist") || "[]");

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const money = n => `₹${n.toLocaleString("en-IN")}`;

function imageHTML(p, mini=false){
  return `<div class="${mini?'mini-img':'product-image'} ${p.img||''}"><div class="shape"></div></div>`;
}

function card(p){
  const active = wishlist.includes(p.id) ? "active" : "";
  return `<article class="product-card" data-id="${p.id}">
    <div class="product-image-wrap">
      ${imageHTML(p)}
      <span class="tag">${p.tag}</span>
      <button class="wish ${active}" data-wish="${p.id}" aria-label="Add to wishlist">♡</button>
    </div>
    <div class="product-info"><h3>${p.name}</h3><div class="price">${money(p.price)}</div></div>
  </article>`;
}

function render(id, list){ $(id).innerHTML = list.map(card).join(""); bindCards(); }

function bindCards(){
  $$(".product-card").forEach(c => c.addEventListener("click", e => {
    if(e.target.closest("[data-wish]")) return;
    openProduct(Number(c.dataset.id));
  }));
  $$("[data-wish]").forEach(b => b.addEventListener("click", e => {
    e.stopPropagation(); toggleWish(Number(b.dataset.wish));
  }));
}

function toggleWish(id){
  wishlist = wishlist.includes(id) ? wishlist.filter(x=>x!==id) : [...wishlist,id];
  localStorage.setItem("veloraWishlist", JSON.stringify(wishlist));
  updateCounts(); renderAll();
  if($("#wishlistDrawer").classList.contains("open")) renderWishlist();
  toast(wishlist.includes(id) ? "Added to wishlist" : "Removed from wishlist");
}

function renderAll(){
  render("#trendingGrid", products.filter(p=>p.tag==="Trending").slice(0,4));
  render("#newGrid", products.filter(p=>p.tag==="New").slice(0,4));
  render("#tshirtGrid", products.filter(p=>p.cat==="T-Shirts"));
  render("#shirtGrid", products.filter(p=>p.cat==="Shirts"));
  render("#bottomGrid", products.filter(p=>p.cat==="Bottoms"));
}
function updateCounts(){
  $("#cartCount").textContent = cart.reduce((s,x)=>s+x.qty,0);
  $("#wishCount").textContent = wishlist.length;
}
function addToCart(id, qty=1){
  const item=cart.find(x=>x.id===id);
  if(item) item.qty += qty; else cart.push({id,qty});
  localStorage.setItem("veloraCart", JSON.stringify(cart));
  updateCounts(); renderCart(); toast("Added to bag");
}
function renderCart(){
  const box=$("#cartItems");
  if(!cart.length){box.innerHTML="<p>Your bag is empty.</p>";$("#cartTotal").textContent="₹0";return}
  let total=0;
  box.innerHTML=cart.map(x=>{
    const p=products.find(p=>p.id===x.id); total+=p.price*x.qty;
    return `<div class="cart-row">${imageHTML(p,true)}<div><strong>${p.name}</strong><div>${money(p.price)}</div><div class="qty"><button data-minus="${p.id}">−</button>${x.qty}<button data-plus="${p.id}">+</button></div></div><button class="close" data-remove="${p.id}">×</button></div>`;
  }).join("");
  $("#cartTotal").textContent=money(total);
  $$("[data-minus]").forEach(b=>b.onclick=()=>changeQty(+b.dataset.minus,-1));
  $$("[data-plus]").forEach(b=>b.onclick=()=>changeQty(+b.dataset.plus,1));
  $$("[data-remove]").forEach(b=>b.onclick=()=>removeCart(+b.dataset.remove));
}
function changeQty(id,d){
  const x=cart.find(i=>i.id===id); if(!x)return;
  x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);
  localStorage.setItem("veloraCart",JSON.stringify(cart));updateCounts();renderCart();
}
function removeCart(id){cart=cart.filter(x=>x.id!==id);localStorage.setItem("veloraCart",JSON.stringify(cart));updateCounts();renderCart()}
function renderWishlist(){
  const items=products.filter(p=>wishlist.includes(p.id));
  $("#wishItems").innerHTML=items.length?items.map(card).join(""):"<p>Your wishlist is empty.</p>";
  bindCards();
}
function openDrawer(id){
  $("#overlay").classList.add("show");$(id).classList.add("open");
  if(id==="#cartDrawer")renderCart(); else renderWishlist();
}
function closeDrawers(){$("#overlay").classList.remove("show");$$(".drawer").forEach(d=>d.classList.remove("open"))}
function openProduct(id){
  const p=products.find(x=>x.id===id);
  $("#modalContent").innerHTML=`<div class="modal-product">${imageHTML(p)}<div><p class="eyebrow">${p.cat}</p><h2>${p.name}</h2><strong>${money(p.price)}</strong><p>${p.desc}</p><p><b>Available sizes</b></p><div class="size-row">${["S","M","L","XL"].map(s=>`<button>${s}</button>`).join("")}</div><button class="btn btn-dark full" id="modalAdd">Add to Bag</button></div></div>`;
  $("#productModal").classList.add("show");
  $$(".size-row button").forEach(b=>b.onclick=()=>{$$(".size-row button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected")});
  $("#modalAdd").onclick=()=>{addToCart(id);$("#productModal").classList.remove("show")};
}
function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),1600)}

$("#menuToggle").onclick=()=>$("#mainNav").classList.toggle("open");
$("#cartBtn").onclick=()=>openDrawer("#cartDrawer");
$("#wishlistBtn").onclick=()=>openDrawer("#wishlistDrawer");
$("#overlay").onclick=closeDrawers;
$$("[data-close]").forEach(b=>b.onclick=closeDrawers);
$("#closeModal").onclick=()=>$("#productModal").classList.remove("show");
$("#searchBtn").onclick=()=>{$("#searchPanel").classList.add("show");$("#searchInput").focus()};
$("#closeSearch").onclick=()=>$("#searchPanel").classList.remove("show");
$("#searchInput").oninput=e=>{
  const q=e.target.value.toLowerCase().trim();
  render("#searchResults", q?products.filter(p=>(p.name+" "+p.cat+" "+p.desc).toLowerCase().includes(q)):products);
};
$("#checkoutBtn").onclick=()=>cart.length?toast("Checkout will be connected after the payment gateway is added."):toast("Your bag is empty.");
$("#newsletterForm").onsubmit=e=>{e.preventDefault();$("#newsletterMsg").textContent="Thanks! You're on the list.";e.target.reset()};
$$(".text-btn").forEach(b=>b.onclick=()=>{const c=b.dataset.category;if(c==="new")document.querySelector("#new").scrollIntoView();else document.querySelector("#trending").scrollIntoView()});
renderAll();updateCounts();
