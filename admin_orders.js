window.onload = function() {
    loadAllOrders();
};

function loadAllOrders() {
    fetch("index.php?action=get_all_orders")
    .then(res => res.json())
    .then(response => {
        const tbody = document.getElementById("adminOrdersBody");
        tbody.innerHTML = "";

        if(response.success && response.data.length > 0) {
            response.data.forEach(order => {
                let row = `<tr>
                    <td>#${order.sales_order_id}</td>
                    <td>${order.username} (${order.client_type})</td>
                    <td>${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td>${order.order_date}</td>
                    <td>
                        <select id="status_${order.sales_order_id}">
                            <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Approved" ${order.status === 'Approved' ? 'selected' : ''}>Approved</option>
                            <option value="Dispatched" ${order.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
                            <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td><button class="btn-update" onclick="updateStatus(${order.sales_order_id})">Update</button></td>
                    <td><button class="btn-view" onclick="viewItems(${order.sales_order_id})">View Items</button></td>
                </tr>`;
                tbody.innerHTML += row;
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='7' style='text-align:center;'>No orders available.</td></tr>";
        }
    });
}

function updateStatus(orderId) {
    const newStatus = document.getElementById(`status_${orderId}`).value;
    const data = { action: "update_order_status", order_id: orderId, status: newStatus };

    fetch("index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        alert(response.message);
        loadAllOrders();
    });
}

function viewItems(orderId) {
    document.getElementById("displayOrderId").innerText = orderId;
    fetch(`index.php?action=get_order_items&order_id=${orderId}`)
    .then(res => res.json())
    .then(response => {
        const modalDiv = document.getElementById("modalBody");
        let html = "<table><tr><th>Medicine Name</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>";
        
        if(response.success && response.data.length > 0) {
            response.data.forEach(item => {
                let subtotal = item.quantity * item.unit_price;
                html += `<tr>
                    <td>${item.brand_name} <br><small>${item.generic_name}</small></td>
                    <td>${item.quantity}</td>
                    <td>${item.unit_price}</td>
                    <td>${subtotal.toFixed(2)}</td>
                </tr>`;
            });
        }
        html += "</table>";
        modalDiv.innerHTML = html;
        document.getElementById("itemsModal").style.display = "block";
    });
}

function closeModal() {
    document.getElementById("itemsModal").style.display = "none";
}