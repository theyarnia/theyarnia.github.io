let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(product, price) {
  cart.push({ product, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(product + " added to cart!");
}

function showCart() {
  let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  let container = document.getElementById("cart-items");
  container.innerHTML = "";
  cartItems.forEach((item, index) => {
    container.innerHTML += `<p>${item.product} - Rs. ${item.price} 
      <button onclick="removeItem(${index})">Remove</button></p>`;
  });
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  showCart();
}
