// ── Yarnia Cart ──
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
  showToast(`✓ ${name} added to cart`);
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

function renderCart() {
  const cart = getCart();
  const tbody = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!tbody) return;

  if (cart.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:#888;">Your cart is empty.</td></tr>';
    if (totalEl) totalEl.textContent = '';
    return;
  }

  tbody.innerHTML = cart.map((item, i) => `
    <tr>
      <td>${item.name}</td>
      <td>Rs. ${item.price.toLocaleString()}</td>
      <td>${item.qty}</td>
      <td>Rs. ${(item.price * item.qty).toLocaleString()}</td>
    </tr>
  `).join('');

  const grand = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (totalEl) totalEl.textContent = `Total: Rs. ${grand.toLocaleString()}`;
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
