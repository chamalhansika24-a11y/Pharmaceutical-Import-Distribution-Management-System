let cart = [];

function loadAvailableMedicines() {
    fetch("index.php?action=get_all_medicines")
    .then(res => res.json())
    .then(response => {
        const listDiv = document.getElementById("medicineList");
        if (response.success) {
            let html = `<table><thead><tr><th>ID</th><th>Brand</th><th>Price</th><th>Stock</th><th>Qty</th><th>Add</th></tr></thead><tbody>`;
            response.data.forEach(med => {
                html += `<tr>
                    <td>${med.medicine_id}</td>
                    <td>${med.brand_name}</td>
                    <td>Rs. ${med.unit_price}</td>
                    <td>${med.current_quantity}</td>
                    <td><input type="number" id="qty_${med.medicine_id}" value="1" min="1" style="width:50px;"></td>
                    <td><button onclick="addToBill(${med.medicine_id}, '${med.brand_name}', ${med.unit_price}, ${med.current_quantity})" style="background:#87EE62; cursor:pointer; padding:5px; border-radius:5px; border:none;">Add</button></td>
                </tr>`;
            });
            html += `</tbody></table>`;
            listDiv.innerHTML = html;
        }
    });
}

function addToBill(id, name, price, stock) {
    const qtyInput = document.getElementById(`qty_${id}`);
    const qty = parseInt(qtyInput.value);
    if (qty > stock) { alert("Not enough stock! (Exclamation!)"); return; }

    cart.push({ medicine_id: id, unit_price: price, quantity: qty, total: price * qty });
    updateBillTable();
}

function updateBillTable() {
    const billBody = document.getElementById("bill-body");
    const grandTotalElement = document.getElementById("grand-total");
    billBody.innerHTML = "";
    let grandTotal = 0;
    cart.forEach((item, index) => {
        grandTotal += item.total;
        billBody.innerHTML += `<tr><td>${item.medicine_id}</td><td>Rs. ${item.unit_price}</td><td>${item.quantity}</td><td>Rs. ${item.total.toFixed(2)}</td><td><button onclick="removeItem(${index})" style="background:#ff7675; color:white; border:none; padding:5px; cursor:pointer;">Remove</button></td></tr>`;
    });
    grandTotalElement.innerText = `Total: Rs. ${grandTotal.toFixed(2)}`;
}

function submitOrder() {
    const currentId = localStorage.getItem("client_id");

    if (!currentId) {
        alert("❌ Error: You must be logged in! ");
        return;
    }

    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    const orderData = {
        action: "submit_order",
        client_id: currentId,
        total: cart.reduce((sum, item) => sum + item.total, 0),
        items: cart
    };

    fetch("index.php", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(res => res.json())
    .then(res => {
        alert(res.message);
        if (res.success) {
            cart = [];
            updateBillTable();
            loadAvailableMedicines();
        }
    });
}

function removeItem(index) { cart.splice(index, 1); updateBillTable(); }
function clearBill() { if(confirm("Clear bill?")) { cart = []; updateBillTable(); } }

window.onload = loadAvailableMedicines;