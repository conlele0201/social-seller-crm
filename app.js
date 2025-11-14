// app.js — PRO VERSION
import { supabase } from "./supabase/config.js";

console.log("CRM PRO: app.js loaded OK");

// VIEW MAPPING
const views = {
  dashboard: document.getElementById("view-dashboard"),
  customers: document.getElementById("view-customers"),
  orders: document.getElementById("view-orders"),
  settings: document.getElementById("view-settings"),
};

// SHOW VIEW FUNCTION
function showView(name) {
  Object.entries(views).forEach(([key, v]) => {
    v.style.display = key === name ? "block" : "none";
  });

  document.querySelectorAll(".menu-link").forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.view === name)
  );
}

// ATTACH EVENTS
document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
  });
});

// DEFAULT VIEW
showView("dashboard");
