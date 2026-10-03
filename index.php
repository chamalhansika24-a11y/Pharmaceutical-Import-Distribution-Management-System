<?php

include "db.php";

$method = $_SERVER["REQUEST_METHOD"];

if ($method == "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $action = $data['action'] ?? '';

    $response = ["success" => false, "message" => "Invalid Action"];

    switch ($action) {
        case "login": 
            $response = handleLogin($conn, $data); 
            break;
        case "submit_order": 
            $response = submitOrder($conn, $data); 
            break;
        case "update_order_status": 
            $response = updateOrderStatus($conn, $data); 
            break;
        case "add_medicine": 
            $response = addMedicine($conn, $data); 
            break;
        case "delete_medicine": 
            $response = deleteMedicine($conn, $data); 
            break;
        case "delete_client": 
            $response = deleteClient($conn, $data); 
            break;
        case "update_hospital_profile": 
            $response = updateHospitalProfile($conn, $data); 
            break;
        case "update_pharmacy_profile": 
            $response = updatePharmacyProfile($conn, $data); 
            break;
        case "register_client": 
            $response = registerClient($conn, $data); 
            break;
    }
    echo json_encode($response);
    exit;
}


if ($method == "GET") {
    $action = $_GET['action'] ?? '';
    $response = null;

    switch ($action) {
        case "client_get_medicine":
            $response = clientGetMedicine($conn);
            break;
        case "get_client_previous_orders":
            $response = getClientPreviousOrders($conn, $_GET['client_id'] ?? '');
            break;
        case "get_all_orders":
            $response = getAllOrders($conn);
            break;
        case "get_order_items":
            $response = getOrderItems($conn, $_GET['order_id'] ?? '');
            break;
        case "get_all_medicines":
            $response = getAllMedicines($conn);
            break;
        case "get_all_clients":
            $response = getAllClients($conn);
            break;

        
        case "get_monthly_sales": 
            $response = getMonthlySales($conn); 
            break;
        case "get_most_selling": 
            $response = getMostSellingMedicines($conn); 
            break;
        case "get_top_clients": 
            $response = getTopClients($conn); 
            break;
        case "get_expiry_report": 
            $response = getExpiryReport($conn); 
            break;
        case "get_low_stock": 
            $response = getLowStockReport($conn); 
            break;

        case "get_expired_list": 
            $response = getExpiredMedicines($conn); 
            break;


        default:
            $response = ["success" => false, "message" => "Invalid GET Action"];
    }
    
    echo json_encode($response);
    exit;
}



/* ---------- POST ACTIONS FUNCTIONS ---------- */

// 1. handleLogin
function handleLogin($conn, $data) {
    $username = mysqli_real_escape_string($conn, $data["username"]);
    $password = mysqli_real_escape_string($conn, $data["password"]);

    if ($username === "admin" && $password === "admin123") {
        return ["success" => true, "isAdmin" => true, "message" => "Welcome Admin!"];
    }

    $query = "SELECT * FROM client WHERE username = '$username' AND password = '$password'";
    $result = mysqli_query($conn, $query);
    if (mysqli_num_rows($result) > 0) {
        $user = mysqli_fetch_assoc($result);
        $client_id = $user['client_id'];
        $user['organization_name'] = $user['username'];
        if ($user['client_type'] === 'Hospital') {
            $h_res = mysqli_query($conn, "SELECT hospital_name FROM hospital WHERE client_id = '$client_id'");
            if ($row = mysqli_fetch_assoc($h_res)) $user['organization_name'] = $row['hospital_name'];
        } else {
            $p_res = mysqli_query($conn, "SELECT pharmacy_name FROM pharmacy WHERE client_id = '$client_id'");
            if ($row = mysqli_fetch_assoc($p_res)) $user['organization_name'] = $row['pharmacy_name'];
        }
        return ["success" => true, "isAdmin" => false, "user" => $user, "message" => "Login successful!"];
    }
    return ["success" => false, "message" => "Invalid credentials."];
}

// 2. submitOrder
function submitOrder($conn, $data) {
    $items = $data['items'];
    $total = $data['total'];
    $client_id = $data['client_id'];

    
    $sql = "INSERT INTO sales_order (total_amount, status, client_id) VALUES ('$total', 'Pending', '$client_id')";
    
    if (mysqli_query($conn, $sql)) {
        $orderId = mysqli_insert_id($conn);
        foreach ($items as $item) {
            $m_id = $item['medicine_id'];
            $qty = $item['quantity'];
            $price = $item['unit_price'];
            mysqli_query($conn, "INSERT INTO sales_item (sales_order_id, medicine_id, quantity, unit_price) VALUES ('$orderId', '$m_id', '$qty', '$price')");
        }
        return ["success" => true, "message" => "Order Success! "];
    }
    return ["success" => false, "message" => mysqli_error($conn)];
}

// 3. updateOrderStatus
function updateOrderStatus($conn, $data) {
    $id = mysqli_real_escape_string($conn, $data['order_id']);
    $status = mysqli_real_escape_string($conn, $data['status']);

   
    $checkStatus = mysqli_query($conn, "SELECT status FROM sales_order WHERE sales_order_id = '$id'");
    $row = mysqli_fetch_assoc($checkStatus);
    $currentStatus = strtolower($row['status']); 
    $newStatus = strtolower($status);

    
    if ($currentStatus === 'pending' && $newStatus === 'approved') {
        $itemsQuery = mysqli_query($conn, "SELECT medicine_id, quantity FROM sales_item WHERE sales_order_id = '$id'");
        while ($item = mysqli_fetch_assoc($itemsQuery)) {
            $medId = $item['medicine_id'];
            $qty = $item['quantity'];
            
            
            mysqli_query($conn, "UPDATE medicine_stock SET current_quantity = current_quantity - $qty 
                                 WHERE medicine_id = '$medId' AND current_quantity >= $qty");
        }
    }

    
    if (($newStatus === 'canceled' || $newStatus === 'cancelled') && ($currentStatus === 'approved' || $currentStatus === 'dispatched')) {
        $itemsQuery = mysqli_query($conn, "SELECT medicine_id, quantity FROM sales_item WHERE sales_order_id = '$id'");
        while ($item = mysqli_fetch_assoc($itemsQuery)) {
            $medId = $item['medicine_id'];
            $qty = $item['quantity'];
            mysqli_query($conn, "UPDATE medicine_stock SET current_quantity = current_quantity + $qty WHERE medicine_id = '$medId'");
        }
    }

    $sql = "UPDATE sales_order SET status = '$status' WHERE sales_order_id = '$id'";
    return mysqli_query($conn, $sql) ? ["success" => true, "message" => "Status updated successfully!"] : ["success" => false];
}

// 4. addMedicine
function addMedicine($conn, $data) {
    $g = mysqli_real_escape_string($conn, $data['generic_name'] ?? '');
    $b = mysqli_real_escape_string($conn, $data['brand_name'] ?? '');
    $d = mysqli_real_escape_string($conn, $data['dosage'] ?? '');
    $p = mysqli_real_escape_string($conn, $data['unit_price'] ?? 0);
    $e = mysqli_real_escape_string($conn, $data['expiry_date'] ?? '');
    $q = mysqli_real_escape_string($conn, $data['current_quantity'] ?? 0);

    $sql = "INSERT INTO medicine_stock (generic_name, brand_name, dosage, unit_price, expiry_date, current_quantity) 
            VALUES ('$g', '$b', '$d', '$p', '$e', '$q')";
    
    if (mysqli_query($conn, $sql)) {
        return ["success" => true, "message" => "Medicine added successfully!"];
    } else {
        return ["success" => false, "message" => "Database Error: " . mysqli_error($conn)];
    }
}

// 5. deleteMedicine
function deleteMedicine($conn, $data) {
    $id = mysqli_real_escape_string($conn, $data['medicine_id'] ?? '');

    $checkQuery = "SELECT COUNT(*) as item_count FROM sales_item WHERE medicine_id = '$id'";
    $result = mysqli_query($conn, $checkQuery);
    $row = mysqli_fetch_assoc($result);

    if ($row['item_count'] > 0) {
        return [
            "success" => false, 
            "message" => "Cannot delete! This medicine is linked to previous orders and must be kept for sales history. (Exclamation!)"
        ];
    }

    $sql = "DELETE FROM medicine_stock WHERE medicine_id = '$id'";
    if(mysqli_query($conn, $sql)) {
        return ["success" => true, "message" => "Medicine deleted successfully!"];
    } else {
        return ["success" => false, "message" => "Database error occurred."];
    }
}


// 6. deleteClient
function deleteClient($conn, $data) {
    $id = mysqli_real_escape_string($conn, $data['client_id']);

    $orderCheckQuery = "SELECT COUNT(*) as order_count FROM sales_order WHERE client_id = '$id'";
    $result = mysqli_query($conn, $orderCheckQuery);
    $row = mysqli_fetch_assoc($result);

    if ($row['order_count'] > 0) {
        return [
            "success" => false, 
            "message" => "This client has placed orders and cannot be deleted to preserve business history!" 
        ];
    }

    mysqli_query($conn, "DELETE FROM hospital WHERE client_id = '$id'");
    mysqli_query($conn, "DELETE FROM pharmacy WHERE client_id = '$id'");
    $res = mysqli_query($conn, "DELETE FROM client WHERE client_id = '$id'");

    return $res ? ["success" => true, "message" => "Client deleted successfully!"] : ["success" => false];
}

// 7. updateHospitalProfile
function updateHospitalProfile($conn, $data) {
    $c_id = $data['client_id'];
    $sql1 = "UPDATE client SET username='{$data['username']}', email='{$data['email']}', phone_no='{$data['phone_no']}', city='{$data['city']}' WHERE client_id='$c_id'";
    $sql2 = "UPDATE hospital SET hospital_name='{$data['hospital_name']}', branch='{$data['branch']}' WHERE client_id='$c_id'";
    return (mysqli_query($conn, $sql1) && mysqli_query($conn, $sql2)) ? ["success" => true] : ["success" => false];
}

// 8. updatePharmacyProfile
function updatePharmacyProfile($conn, $data) {
    $c_id = $data['client_id'];
    $sql1 = "UPDATE client SET username='{$data['username']}', email='{$data['email']}', phone_no='{$data['phone_no']}' WHERE client_id='$c_id'";
    $sql2 = "UPDATE pharmacy SET pharmacy_name='{$data['pharmacy_name']}', pharmacist_reg_no='{$data['pharmacist_reg_no']}' WHERE client_id='$c_id'";
    return (mysqli_query($conn, $sql1) && mysqli_query($conn, $sql2)) ? ["success" => true] : ["success" => false];
}

// 9. registerClient
function registerClient($conn, $data) {
    $sql1 = "INSERT INTO client (username, password, email, phone_no, building_no, street, city, client_type) 
            VALUES ('{$data['username']}', '{$data['password']}', '{$data['email']}', '{$data['phone_no']}', 
                    '{$data['building_no']}', '{$data['street']}', '{$data['city']}', '{$data['client_type']}')";

    if (mysqli_query($conn, $sql1)) {
        $id = mysqli_insert_id($conn);
        if ($data['client_type'] === "Hospital") {
            $sql2 = "INSERT INTO hospital (client_id, hospital_name, branch, director_name, ward_count) 
                    VALUES ('$id', '{$data['hospital_name']}', '{$data['branch']}', '{$data['director_name']}', '{$data['ward_count']}')";
        } else {
            $sql2 = "INSERT INTO pharmacy (client_id, pharmacy_name, pharmacist_reg_no) 
                    VALUES ('$id', '{$data['pharmacy_name']}', '{$data['pharmacist_reg_no']}')";
        }
        return mysqli_query($conn, $sql2) ? ["success" => true, "message" => "Registration Successful!"] : ["success" => false, "message" => mysqli_error($conn)];
    }
    return ["success" => false, "message" => mysqli_error($conn)];
}




/* ---------- GET ACTIONS FUNCTIONS ---------- */

// 1. client_get_medicine
function clientGetMedicine($conn) {
    $query = "SELECT * FROM medicine_stock WHERE current_quantity > 0 AND expiry_date > CURDATE()";
    $result = mysqli_query($conn, $query);
    $list = [];
    while ($row = mysqli_fetch_assoc($result)) { $list[] = $row; }
    return $list; 
}

// 2. get_client_previous_orders 
function getClientPreviousOrders($conn, $c_id) {
    $c_id = mysqli_real_escape_string($conn, $c_id);
    $query = "SELECT * FROM sales_order WHERE client_id = '$c_id'";
    $result = mysqli_query($conn, $query);
    $orders = [];
    while ($row = mysqli_fetch_assoc($result)) { $orders[] = $row; }
    return ["success" => true, "data" => $orders];
}

// 3. get_all_orders
function getAllOrders($conn) {
    $sql = "SELECT sales_order.*, client.username 
            FROM sales_order 
            JOIN client ON sales_order.client_id = client.client_id";
    $result = mysqli_query($conn, $sql);
    $orders = [];
    while($row = mysqli_fetch_assoc($result)) { $orders[] = $row; }
    return ["success" => true, "data" => $orders];
}

// 4. get_order_items
function getOrderItems($conn, $order_id) {
    $order_id = mysqli_real_escape_string($conn, $order_id);
    $sql = "SELECT si.*, m.brand_name, m.generic_name 
            FROM sales_item si 
            JOIN medicine_stock m ON si.medicine_id = m.medicine_id 
            WHERE si.sales_order_id = '$order_id'";
    $result = mysqli_query($conn, $sql);
    $items = [];
    while($row = mysqli_fetch_assoc($result)) { $items[] = $row; }
    return ["success" => true, "data" => $items];
}

// 5. get_all_medicines 
function getAllMedicines($conn) {
    $result = mysqli_query($conn, "SELECT * FROM medicine_stock");
    $medicines = [];
    while($row = mysqli_fetch_assoc($result)) { $medicines[] = $row; }
    return ["success" => true, "data" => $medicines];
}

// 6. get_all_clients
function getAllClients($conn) {
    $sql = "SELECT c.*, h.hospital_name, h.branch, h.director_name, h.ward_count, 
                   p.pharmacy_name, p.pharmacist_reg_no 
            FROM client c
            LEFT JOIN hospital h ON c.client_id = h.client_id
            LEFT JOIN pharmacy p ON c.client_id = p.client_id";
    $result = mysqli_query($conn, $sql);
    $clients = [];
    while($row = mysqli_fetch_assoc($result)) { $clients[] = $row; }
    return ["success" => true, "data" => $clients];
}



/* ---------- REPORT FUNCTIONS ---------- */

// 1. Monthly Sales Report
function getMonthlySales($conn) {
    $sql = "SELECT MONTHNAME(order_date) as month, SUM(total_amount) as total 
            FROM sales_order WHERE status = 'Approved' 
            GROUP BY MONTH(order_date)";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while($row = mysqli_fetch_assoc($result)) { $data[] = $row; }
    return ["success" => true, "data" => $data];
}

// 2. Most Selling Medicines
function getMostSellingMedicines($conn) {
    $sql = "SELECT m.brand_name, SUM(si.quantity) as total_qty 
            FROM sales_item si 
            JOIN medicine_stock m ON si.medicine_id = m.medicine_id 
            GROUP BY si.medicine_id ORDER BY total_qty DESC LIMIT 5";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while($row = mysqli_fetch_assoc($result)) { $data[] = $row; }
    return ["success" => true, "data" => $data];
}

// 3. Top Purchasing Clients
function getTopClients($conn) {
    $sql = "SELECT c.username, SUM(so.total_amount) as total_spent 
            FROM sales_order so 
            JOIN client c ON so.client_id = c.client_id 
            GROUP BY so.client_id ORDER BY total_spent DESC LIMIT 5";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while($row = mysqli_fetch_assoc($result)) { $data[] = $row; }
    return ["success" => true, "data" => $data];
}

// 4. Expiry Date Report (Next 6 Months)
function getExpiryReport($conn) {
    // CURDATE() 
    $sql = "SELECT brand_name, expiry_date FROM medicine_stock 
            WHERE expiry_date > CURDATE() 
            AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 6 MONTH) 
            ORDER BY expiry_date ASC";
            
    $result = mysqli_query($conn, $sql);
    $data = [];
    while($row = mysqli_fetch_assoc($result)) { $data[] = $row; }
    return ["success" => true, "data" => $data];
}

// 5. Low Stock Alert
function getLowStockReport($conn) {
    $sql = "SELECT brand_name, current_quantity FROM medicine_stock 
            WHERE current_quantity < 50";
    $result = mysqli_query($conn, $sql);
    $data = [];
    while($row = mysqli_fetch_assoc($result)) { $data[] = $row; }
    return ["success" => true, "data" => $data];
}

// 6. Already Expired Medicines Report 
function getExpiredMedicines($conn) {
    // 
    $sql = "SELECT brand_name, expiry_date, current_quantity 
            FROM medicine_stock 
            WHERE expiry_date <= CURDATE() 
            ORDER BY expiry_date DESC";
            
    $result = mysqli_query($conn, $sql);
    $data = [];
    if($result) {
        while($row = mysqli_fetch_assoc($result)) { 
            $data[] = $row; 
        }
    }
    return ["success" => true, "data" => $data];
}
    







?>