function loadPreviousOrders() {
    const current_clientData = JSON.parse(localStorage.getItem("current_client"));

    if (!current_clientData || !current_clientData.client_id) {
        console.error("Client not logged in!");
        return;
    }

    const clientId = current_clientData.client_id;
    const url = `index.php?action=get_client_previous_orders&client_id=${clientId}`;

    fetch(url)
        .then(res => res.json())
        .then(response => {
            const tableBody = document.getElementById("ordersBody");
            if (!tableBody) return;

            tableBody.innerHTML = ""; 

            if (response.success && response.data.length > 0) {
                response.data.forEach(order => {
                    let row = `<tr>
                        <td>${order.sales_order_id}</td>
                        <td>Rs. ${parseFloat(order.total_amount).toFixed(2)}</td>
                        <td><span style="color: ${order.status === 'Pending' ? 'orange' : 'green'}">${order.status}</span></td>
                        <td>${order.order_date || 'N/A'}</td>
                    </tr>`;
                    tableBody.innerHTML += row;
                });
            } else {
                tableBody.innerHTML = "<tr><td colspan='4'>No orders found.</td></tr>";
            }
        })
        .catch(error => console.error('Error:', error));
}

window.onload = loadPreviousOrders;