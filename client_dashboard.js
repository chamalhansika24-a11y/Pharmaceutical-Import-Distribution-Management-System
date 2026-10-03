window.onload = function() {
    const user = localStorage.getItem("current_client");
    const clientId = localStorage.getItem("client_id");

    if (!user || !clientId) {
        window.location.href = "login.html";
    } else {
        const userData = JSON.parse(user);
        
        
        document.getElementById("prof-org-name").innerText = userData.organization_name || "N/A";
        document.getElementById("prof-username").innerText = userData.username || "N/A";
        document.getElementById("prof-type").innerText = userData.client_type || "N/A";
        document.getElementById("prof-email").innerText = userData.email || "N/A";
        document.getElementById("prof-phone").innerText = userData.phone_no || "N/A";
        document.getElementById("prof-address").innerText = userData.city || "N/A";
        
        
        document.getElementById("welcomeText").innerText = "Welcome, " + (userData.organization_name || "User");
    }
};


function goToEditProfile() {
    const clientData = JSON.parse(localStorage.getItem("current_client"));
    if (clientData.client_type === "Hospital") {
        window.location.href = "update_hospital.html";
    } else {
        window.location.href = "update_pharmacy.html";
    }
}


function logout() {
    localStorage.removeItem("current_client");
    window.location.href = "login.html";
}