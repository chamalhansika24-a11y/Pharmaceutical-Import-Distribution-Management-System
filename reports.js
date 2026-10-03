/* ---------- REPORTS MANAGEMENT JS ---------- */

document.addEventListener('DOMContentLoaded', () => {
    loadAllReports();
});

async function loadAllReports() {
    console.log("Fetching all reports...");
    
    await fetchReport('get_monthly_sales', 'monthlySalesTable', ['month', 'total']);
    await fetchReport('get_most_selling', 'mostSellingTable', ['brand_name', 'total_qty']);
    await fetchReport('get_top_clients', 'topClientsTable', ['username', 'total_spent']);
    await fetchReport('get_expiry_report', 'expiryTable', ['brand_name', 'expiry_date']);
    await fetchReport('get_low_stock', 'lowStockTable', ['brand_name', 'current_quantity']);
    await fetchReport('get_expired_list', 'expiredTable', ['brand_name', 'expiry_date', 'current_quantity']);
}


async function fetchReport(action, tableId, columns) {
    try {
        const response = await fetch(`index.php?action=${action}`);
        const result = await response.json();

        if (result.success) {
            const table = document.getElementById(tableId);
            const tbody = table.querySelector('tbody'); // 
            tbody.innerHTML = ""; // 

            if (result.data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${columns.length}" style="text-align:center;">No data available</td></tr>`;
                return;
            }

            result.data.forEach(item => {
                let row = "<tr>";
                columns.forEach(col => {
                    let value = item[col] || "-"; // 
                    if (col === 'total' || col === 'total_spent') {
                        value = "Rs. " + parseFloat(value).toLocaleString();
                    }
                    row += `<td>${value}</td>`;
                });
                row += "</tr>";
                tbody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error(`Error loading ${action}:`, error);
    }
}

function refreshReports() {
    loadAllReports();
}