// app.js
import { supabase } from "./supabase/config.js";

// ===== Helper =====
const $ = (selector) => document.querySelector(selector);

let editingCustomerId = null;
let editingOrderId = null;

// ===== Navigation =====
function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "dashboard-view") loadDashboardStats();
  if (id === "customers-view") loadCustomers();
  if (id === "orders-view") {
    loadOrders();
    loadOrderCustomerOptions();
  }

  document.querySelectorAll(".top-nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === id);
  });
}

function setupNavigation() {
  document.querySelectorAll("[data-view]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const view = el.dataset.view;
      showView(view);
    });
  });
}

// ===== Dashboard =====
async function loadDashboardStats() {
  try {
    const { count: customerCount } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    const { count: orderCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    const { data: revenueRows, error: revenueError } = await supabase
      .from("orders")
      .select("amount");

    if (revenueError) throw revenueError;

    const revenue = (revenueRows || []).reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );

    $("#dashboard-total-customers").textContent = customerCount ?? 0;
    $("#dashboard-total-orders").textContent = orderCount ?? 0;
    $("#dashboard-revenue").textContent = revenue.toLocaleString("vi-VN");
    $("#dashboard-products").textContent = orderCount ?? 0;
  } catch (err) {
    console.error("Dashboard error", err);
  }
}

// ===== Customers CRUD =====
async function loadCustomers() {
  const tbody = $("#customers-table-body");
  tbody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="4">Error loading customers</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No customers yet</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map(
      (c) => `
      <tr>
        <td>${c.name || ""}</td>
        <td>${c.phone || ""}</td>
        <td>${c.address || ""}</td>
        <td class="table-actions">
          <button class="btn secondary" data-edit-customer="${c.id}">Edit</button>
          <button class="btn ghost" data-delete-customer="${c.id}">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");

  // Buttons
  tbody.querySelectorAll("[data-edit-customer]").forEach((btn) => {
    btn.addEventListener("click", () =>
      startEditCustomer(btn.dataset.editCustomer)
    );
  });

  tbody.querySelectorAll("[data-delete-customer]").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteCustomer(btn.dataset.deleteCustomer)
    );
  });
}

function resetCustomerForm() {
  editingCustomerId = null;
  $("#customer-form").reset();
  $("#customer-form-title").textContent = "Add Customer";
  $("#customer-form-submit").textContent = "Add customer";
}

async function startEditCustomer(id) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    alert("Cannot load customer to edit");
    return;
  }

  editingCustomerId = id;
  $("#customer-name").value = data.name || "";
  $("#customer-phone").value = data.phone || "";
  $("#customer-address").value = data.address || "";

  $("#customer-form-title").textContent = "Edit Customer";
  $("#customer-form-submit").textContent = "Save changes";
}

async function deleteCustomer(id) {
  if (!confirm("Delete this customer and related orders?")) return;

  const { error } = await supabase.from("orders").delete().eq("customer_id", id);
  if (error) {
    console.error(error);
    alert("Cannot delete customer orders");
    return;
  }

  const { error: cError } = await supabase.from("customers").delete().eq("id", id);
  if (cError) {
    console.error(cError);
    alert("Cannot delete customer");
    return;
  }

  await loadCustomers();
  await loadDashboardStats();
}

async function handleCustomerSubmit(e) {
  e.preventDefault();

  const name = $("#customer-name").value.trim();
  const phone = $("#customer-phone").value.trim();
  const address = $("#customer-address").value.trim();

  if (!name) {
    alert("Please enter customer name");
    return;
  }

  let error;

  if (editingCustomerId) {
    ({ error } = await supabase
      .from("customers")
      .update({ name, phone, address })
      .eq("id", editingCustomerId));
  } else {
    ({ error } = await supabase
      .from("customers")
      .insert([{ name, phone, address }]));
  }

  if (error) {
    console.error(error);
    alert("Error saving customer");
    return;
  }

  resetCustomerForm();
  await loadCustomers();
  await loadDashboardStats();
}

// ===== Orders CRUD =====
async function loadOrderCustomerOptions() {
  const select = $("#order-customer");
  const { data, error } = await supabase
    .from("customers")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    select.innerHTML = `<option value="">(Error)</option>`;
    return;
  }

  if (!data || data.length === 0) {
    select.innerHTML = `<option value="">No customers yet</option>`;
    return;
  }

  select.innerHTML = data
    .map((c) => `<option value="${c.id}">${c.name}</option>`)
    .join("");
}

async function loadOrders() {
  const tbody = $("#orders-table-body");
  tbody.innerHTML = `<tr><td colspan="4">Loading...</td></tr>`;

  const { data, error } = await supabase
    .from("orders")
    .select("id, product, amount, created_at, customers(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="4">Error loading orders</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No orders yet</td></tr>`;
    return;
  }

  tbody.innerHTML = data
    .map((o) => {
      const customerName = o.customers?.name || "Unknown";
      const amount = Number(o.amount || 0).toLocaleString("vi-VN");
      return `
        <tr>
          <td>${customerName}</td>
          <td>${o.product || ""}</td>
          <td style="text-align:right">${amount}</td>
          <td class="table-actions">
            <button class="btn secondary" data-edit-order="${o.id}">Edit</button>
            <button class="btn ghost" data-delete-order="${o.id}">Delete</button>
          </td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll("[data-edit-order]").forEach((btn) => {
    btn.addEventListener("click", () => startEditOrder(btn.dataset.editOrder));
  });

  tbody.querySelectorAll("[data-delete-order]").forEach((btn) => {
    btn.addEventListener("click", () =>
      deleteOrder(btn.dataset.deleteOrder)
    );
  });
}

function resetOrderForm() {
  editingOrderId = null;
  $("#order-form").reset();
  $("#order-form-title").textContent = "Add Order";
  $("#order-form-submit").textContent = "Add order";
}

async function startEditOrder(id) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    alert("Cannot load order to edit");
    return;
  }

  editingOrderId = id;
  $("#order-customer").value = data.customer_id;
  $("#order-product").value = data.product || "";
  $("#order-amount").value = data.amount || 0;

  $("#order-form-title").textContent = "Edit Order";
  $("#order-form-submit").textContent = "Save changes";
}

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;

  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) {
    console.error(error);
    alert("Cannot delete order");
    return;
  }

  await loadOrders();
  await loadDashboardStats();
}

async function handleOrderSubmit(e) {
  e.preventDefault();

  const customerId = $("#order-customer").value;
  const product = $("#order-product").value.trim();
  const amount = Number($("#order-amount").value || 0);

  if (!customerId) {
    alert("Please choose a customer");
    return;
  }
  if (!product) {
    alert("Please enter product");
    return;
  }

  let error;

  if (editingOrderId) {
    ({ error } = await supabase
      .from("orders")
      .update({ customer_id: customerId, product, amount })
      .eq("id", editingOrderId));
  } else {
    ({ error } = await supabase
      .from("orders")
      .insert([{ customer_id: customerId, product, amount }]));
  }

  if (error) {
    console.error(error);
    alert("Error saving order");
    return;
  }

  resetOrderForm();
  await loadOrders();
  await loadDashboardStats();
}

// ===== Init =====
function setupEvents() {
  $("#customer-form").addEventListener("submit", handleCustomerSubmit);
  $("#customer-form-cancel").addEventListener("click", (e) => {
    e.preventDefault();
    resetCustomerForm();
  });
  $("#customer-refresh-btn").addEventListener("click", () => loadCustomers());

  $("#order-form").addEventListener("submit", handleOrderSubmit);
  $("#order-form-cancel").addEventListener("click", (e) => {
    e.preventDefault();
    resetOrderForm();
  });
  $("#order-refresh-btn").addEventListener("click", () => {
    loadOrders();
    loadOrderCustomerOptions();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupEvents();

  // Mặc định mở Dashboard
  showView("dashboard-view");
});
