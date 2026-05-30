// ── Yarnia Cart ──
const DELIVERY_CHARGE = 300;

function getCart() {
  try { return JSON.parse(localStorage.getItem('yarnia_cart') || '[]'); }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem('yarnia_cart', JSON.stringify(cart));
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function addToCart(name, price) {
  const qtyEl = document.getElementById('qty');
  const qty = qtyEl ? parseInt(qtyEl.value) : 1;
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) { existing.qty += qty; }
  else { cart.push({ name, price, qty }); }
  saveCart(cart);
  updateCartBadge();
  showToast('✓ ' + name + ' added to cart');
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = total > 0 ? total : '';
    b.style.display = total > 0 ? 'inline-flex' : 'none';
  });
}

function updateQty(index, newQty) {
  const cart = getCart();
  if (newQty < 1) { removeItem(index); return; }
  cart[index].qty = newQty;
  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartBadge();
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const tbody = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const headerEl = document.getElementById('cart-header');
  if (!tbody) return;

  if (cart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:#888;">Your cart is empty.</td></tr>';
    if (totalEl) totalEl.textContent = '';
    if (headerEl) headerEl.style.display = 'none';
    return;
  }

  if (headerEl) headerEl.style.display = '';

  tbody.innerHTML = cart.map((item, i) => `
    <tr>
      <td>${item.name}</td>
      <td>Rs. ${item.price.toLocaleString()}</td>
      <td>
        <div class="qty-control">
          <button onclick="updateQty(${i}, ${item.qty - 1})">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${i}, ${item.qty + 1})">+</button>
        </div>
      </td>
      <td>Rs. ${(item.price * item.qty).toLocaleString()}</td>
      <td><button class="remove-btn" onclick="removeItem(${i})">✕</button></td>
    </tr>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const grandTotal = subtotal + DELIVERY_CHARGE;
  if (totalEl) totalEl.innerHTML =
    '<span style="font-size:0.85rem;opacity:0.65;">Subtotal: Rs. ' + subtotal.toLocaleString() + '</span><br>' +
    '<span style="font-size:0.85rem;opacity:0.65;">Delivery: Rs. ' + DELIVERY_CHARGE.toLocaleString() + '</span><br>' +
    'Total: Rs. ' + grandTotal.toLocaleString();
}

function clearCart() {
  if (confirm('Clear your entire cart?')) {
    localStorage.removeItem('yarnia_cart');
    updateCartBadge();
    renderCart();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();
});
