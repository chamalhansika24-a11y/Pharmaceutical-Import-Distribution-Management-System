document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = {
        action: "login",
        username: formData.get("username"),
        password: formData.get("password")
    };

    fetch("index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => { 
        if (data.success) {
            if (data.isAdmin) {
                alert("Admin Access Granted!");
                window.location.href = "admin_dashboard.html";
            } else {
                localStorage.setItem("client_id", data.user.client_id); 
                localStorage.setItem("current_client", JSON.stringify(data.user));
                alert("Login successful!");
                window.location.href = "client_dashboard.html";
            }
        } else {
            alert(data.message); 
        }
    });
});