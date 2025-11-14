// app.js
// ====== BƯỚC 1: CHỈ LÀM CHUYỂN MÀN (VIEW SWITCHING) ======

import { supabase } from "./supabase/config.js"; // để sẵn, chưa dùng cũng không sao

console.log("app.js đã load – navigation handler đang chạy");

// Lấy các phần view
const views = {
  dashboard: document.getElementById("view-dashboard"),
  customers: document.getElementById("view-customers"),
  orders: document.getElementById("view-orders"),
  settings: document.getElementById("view-settings"),
};

// Hàm show view
function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    if (!el) return;
    el.style.display = key === name ? "block" : "none";
  });

  // Active cho menu bên trái
  document
    .querySelectorAll(".sidebar-link")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.view === name)
    );

  // Active cho topnav
  document
    .querySelectorAll(".topnav-link")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.view === name)
    );
}

// Gắn event click cho tất cả button có data-view
function setupNavigation() {
  const allNavButtons = document.querySelectorAll("[data-view]");
  allNavButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = btn.dataset.view;
      if (!targetView) return;
      showView(targetView);
    });
  });

  // Mặc định vào Dashboard
  showView("dashboard");
}

// Khởi động
setupNavigation();

// BƯỚC SAU: Ở đây mình sẽ thêm:
// - loadDashboardStats()
// - loadCustomers(), createCustomer(), updateCustomer(), deleteCustomer()
// - loadOrders(), v.v.
// dùng Supabase.
