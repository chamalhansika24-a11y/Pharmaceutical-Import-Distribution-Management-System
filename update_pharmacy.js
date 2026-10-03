window.onload = function() {
    const clientData = JSON.parse(localStorage.getItem("current_client"));
    if (!clientData) { window.location.href = "login.html"; return; }

    document.getElementById("u_username").value = clientData.username;
    document.getElementById("u_email").value = clientData.email;
    document.getElementById("u_phone").value = clientData.phone_no;
    document.getElementById("u_bno").value = clientData.building_no;
    document.getElementById("u_street").value = clientData.street;
    document.getElementById("u_city").value = clientData.city;
    document.getElementById("u_password").value = clientData.password;

    fetch("index.php", {
        method: "POST",
        body: JSON.stringify({ action: "get_pharmacy_details", client_id: clientData.client_id })
    })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            document.getElementById("u_pname").value = res.data.pharmacy_name;
            document.getElementById("u_regno").value = res.data.pharmacist_reg_no;
        }
    });
};

document.getElementById("updatePharmacyForm").onsubmit = function(e) {
    e.preventDefault();
    const clientData = JSON.parse(localStorage.getItem("current_client"));
    
    const updatedData = {
        action: "update_pharmacy_profile",
        client_id: clientData.client_id,
        username: document.getElementById("u_username").value,
        password: document.getElementById("u_password").value,
        email: document.getElementById("u_email").value,
        phone_no: document.getElementById("u_phone").value,
        building_no: document.getElementById("u_bno").value,
        street: document.getElementById("u_street").value,
        city: document.getElementById("u_city").value,
        pharmacy_name: document.getElementById("u_pname").value,
        pharmacist_reg_no: document.getElementById("u_regno").value
    };

    fetch("index.php", { method: "POST", body: JSON.stringify(updatedData) })
    .then(res => res.json())
    .then(res => {
        if(res.success) {
            alert(res.message);
            const newClientData = { ...clientData, ...updatedData };
            localStorage.setItem("current_client", JSON.stringify(newClientData));
            window.location.href = "client_dashboard.html";
        }
    });
};