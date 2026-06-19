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
  updateCartBadge(true);
  showToast('✓ ' + name + ' added to cart');
}

function updateCartBadge(bump) {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  // make sure every cart link carries a badge
  document.querySelectorAll('a[href$="cart.html"]').forEach(link => {
    link.classList.add('cart-link');
    let b = link.querySelector('.cart-badge');
    if (!b) {
      b = document.createElement('span');
      b.className = 'cart-badge';
      link.appendChild(b);
    }
  });
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.textContent = total > 0 ? total : '';
    b.style.display = total > 0 ? 'inline-flex' : 'none';
    if (bump && total > 0) {
      b.classList.remove('bump');
      void b.offsetWidth; // restart animation
      b.classList.add('bump');
    }
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
  initStickyHeader();
  injectWhatsAppFloat();
  initReveal();
});

// ── Scroll reveal (fades in .reveal elements as they enter view) ──
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) { items.forEach(el => el.classList.add('in')); return; }
  document.querySelectorAll('.product-card').forEach((c, i) => { c.style.transitionDelay = (i % 4) * 70 + 'ms'; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
}

// ── Sticky header soft-shadow on scroll (all pages) ──
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Persistent WhatsApp float button (all pages) ──
function injectWhatsAppFloat() {
  if (document.querySelector('.wa-float')) return;
  const a = document.createElement('a');
  a.className = 'wa-float';
  a.href = 'https://wa.me/923328234439?text=' +
    encodeURIComponent("Hi Yarnia! I have a question about your handmade pieces \u2661");
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Chat with Yarnia on WhatsApp');
  a.innerHTML =
    '<span class="wa-tip">Questions? Message me \u2661</span>' +
    '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">' +
    '<path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.7 1.4 5.8 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-4.9 1 1-4.7-.3-.4A9.7 9.7 0 016.3 15c0-5.4 4.4-9.8 9.7-9.8s9.8 4.4 9.8 9.8-4.4 9.8-9.8 9.8zm5.4-7.3c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7 1-.9 1.2-.2.2-.3.2-.6.1-1.7-.9-2.9-1.6-4-3.5-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/>' +
    '</svg>';
  document.body.appendChild(a);
}
