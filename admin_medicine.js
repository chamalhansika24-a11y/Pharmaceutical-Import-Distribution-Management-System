function loadMedicines() {
    fetch("index.php?action=get_all_medicines")
    .then(res => res.json())
    .then(response => {
        const tbody = document.getElementById("medicineTableBody");
        if (response.success) {
            tbody.innerHTML = "";
            response.data.forEach(med => {
                tbody.innerHTML += `<tr>
                    <td>${med.medicine_id}</td>
                    <td>${med.brand_name} (${med.generic_name})</td>
                    <td>${med.dosage}</td>
                    <td>${med.unit_price}</td>
                    <td>${med.current_quantity}</td>
                    <td>${med.expiry_date}</td>
                    <td><button onclick="deleteMedicine(${med.medicine_id})" style="background-color:#ff4d4d; color:white; border:none; padding:5px 10px; cursor:pointer;">Delete</button></td>
                </tr>`;
            });
        }
    })
    .catch(err => console.error("Error loading medicines:", err));
}

function addMedicine(event) {
    event.preventDefault();
    const data = {
        action: "add_medicine",
        generic_name: document.getElementById("m_generic").value,
        brand_name: document.getElementById("m_brand").value,
        dosage: document.getElementById("m_dosage").value,
        unit_price: document.getElementById("m_price").value,
        expiry_date: document.getElementById("m_expiry").value,
        current_quantity: document.getElementById("m_qty").value
    };

    fetch("index.php", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json()) 
    .then(res => {
        alert(res.message); 
        if(res.success) {
            loadMedicines();
            event.target.reset();
        }
    })
    .catch(err => {
        console.error(err);
        alert("Error: Could not add medicine. Check console for details. (Exclamation!)");
    });
}

function deleteMedicine(id) {
    if(confirm("Are you sure you want to delete this medicine?")) {
        fetch("index.php", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "delete_medicine", medicine_id: id })
        })
        .then(res => res.json()) 
        .then(res => {
            alert(res.message);
            if (res.success) {
                loadMedicines();
            }
        })
        .catch(err => {
            console.error(err);
            alert("⚠️ Delete Failed: PHP response is not valid JSON. Check if medicine has orders! (Exclamation!)");
        });
    }
}

window.onload = loadMedicines;