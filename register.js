function toggleFields() {
    const type = document.getElementById("r_type").value;
    const hospitalFields = document.getElementById("hospitalFields");
    const pharmacyFields = document.getElementById("pharmacyFields");

    hospitalFields.classList.add("hidden");
    pharmacyFields.classList.add("hidden");

    if (type === "Hospital") {
        hospitalFields.classList.remove("hidden");
    } else if (type === "Pharmacy") {
        pharmacyFields.classList.remove("hidden");
    }
}

document.getElementById("registerForm").onsubmit = function(e) {
    e.preventDefault();
    
    const data = {
        action: "register_client",
        username: document.getElementById("r_username").value,
        password: document.getElementById("r_password").value,
        email: document.getElementById("r_email").value,
        phone_no: document.getElementById("r_phone").value,
        building_no: document.getElementById("r_bno").value,
        street: document.getElementById("r_street").value,
        city: document.getElementById("r_city").value,
        client_type: document.getElementById("r_type").value,
        
        // Hospital Fields
        hospital_name: document.getElementById("r_hname").value,
        branch: document.getElementById("r_branch").value,
        director_name: document.getElementById("r_director").value,
        ward_count: document.getElementById("r_wards").value,
        
        // Pharmacy Fields
        pharmacy_name: document.getElementById("r_pname").value,
        pharmacist_reg_no: document.getElementById("r_regno").value
    };

    fetch("index.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(res => {
        alert(res.message);
        if(res.success) {
            window.location.href = "login.html";
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Registration failed. Please check the console.");
    });
};