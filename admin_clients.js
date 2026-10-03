function loadClients() {
    fetch("index.php?action=get_all_clients")
    .then(res => res.json())
    .then(response => {
        const tbody = document.getElementById("clientTableBody");
        if (response.success) {
            tbody.innerHTML = "";
            response.data.forEach(client => {
                let detailsHTML = "";

                if (client.client_type === 'Hospital') {
                    detailsHTML = `
                        <strong>${client.hospital_name}</strong><br>
                        <small>Branch: ${client.branch}</small><br>
                        <small>Director: ${client.director_name}</small><br>
                        <small>Wards: ${client.ward_count}</small>
                    `;
                } else if (client.client_type === 'Pharmacy') {
                    detailsHTML = `
                        <strong>${client.pharmacy_name}</strong><br>
                        <small>Reg No: ${client.pharmacist_reg_no}</small>
                    `;
                }

                tbody.innerHTML += `<tr>
                    <td>${client.client_id}</td>
                    <td>${client.username}</td>
                    <td>${detailsHTML}</td>
                    <td>${client.client_type}</td>
                    <td>${client.city}<br><small>${client.street}, ${client.building_no}</small></td>
                    <td>${client.phone_no}<br><small>${client.email}</small></td>
                    <td>
                        <button onclick="deleteClient(${client.client_id})" style="background-color:#ff4d4d; color:white; border:none; padding:5px 10px; cursor:pointer;">Delete</button>
                    </td>
                </tr>`;
            });
        }
    })
    .catch(err => console.error("Error loading clients:", err));
}

function deleteClient(id) {
    if(confirm("Are you sure you want to delete this client? This will remove all their data!")) {
        fetch("index.php", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: "delete_client", client_id: id })
        })
        .then(res => res.json())
        .then(res => {
            alert(res.message);
            
            if(res.success) {
                loadClients();
            }
        })
        .catch(err => {
            console.error("Error deleting client:", err);
            alert("An error occurred while trying to delete the client.");
        });
    }
}

window.onload = loadClients;