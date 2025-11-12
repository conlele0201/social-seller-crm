const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const el = (t, a = {}, txt = "") => { const e=document.createElement(t); Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v)); if(txt) e.textContent=txt; return e; };

const state = { mode:"demo", sb:null, userId:null, config:null };
function setMode(m){ state.mode=m; $("#modeLabel")?.textContent = m==="cloud"?"Cloud":"Demo (Local)"; }
function showApp(b){ $("#appSection")?.classList.toggle("hidden",!b); }

async function loadConfig(){
  try{ const r=await fetch("/api/config"); if(!r.ok) throw new Error("Config not available");
    state.config=await r.json(); const c=$("#cloudConfig"); if(c) c.textContent=`Project URL: ${state.config.url}`;
  }catch(e){ const c=$("#cloudConfig"); if(c) c.textContent="Config error. Check Vercel env vars."; }
}
function connectSupabase(){ if(!state.config) throw new Error("Missing config"); state.sb = supabase.createClient(state.config.url, state.config.key); }

// Tabs
$$(".tabs button").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $$(".tabs button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab=btn.dataset.tab; $$(".tab").forEach(t=>t.classList.remove("active"));
    if(tab==="customers") $("#customersTab").classList.add("active");
    if(tab==="orders") $("#ordersTab").classList.add("active");
  });
});

// Demo storage
const demo = {
  customers: JSON.parse(localStorage.getItem("demo_customers")||"[]"),
  orders: JSON.parse(localStorage.getItem("demo_orders")||"[]"),
  save(){ localStorage.setItem("demo_customers",JSON.stringify(this.customers));
          localStorage.setItem("demo_orders",JSON.stringify(this.orders)); }
};

// Auth buttons (chỉ chạy nếu phần login có mặt)
$("#btnSignup")?.addEventListener("click", async ()=>{
  try{ await loadConfig(); connectSupabase();
    const email=$("#email").value.trim(), password=$("#password").value.trim();
    if(!email||!password) return alert("Enter email & password");
    const { error } = await state.sb.auth.signUp({ email, password });
    if(error) return alert("Sign up error: "+error.message);
    alert("User created. Confirm email if required, then Login.");
  }catch(e){ alert(e.message||e); }
});
$("#btnLogin")?.addEventListener("click", async ()=>{
  try{ await loadConfig(); connectSupabase();
    const email=$("#email").value.trim(), password=$("#password").value.trim();
    if(!email||!password) return alert("Enter email & password");
    const { data, error } = await state.sb.auth.signInWithPassword({ email, password });
    if(error) return alert("Login error: "+error.message);
    state.userId=data.user.id; setMode("cloud"); showApp(true); await loadCustomers(); await loadOrders();
  }catch(e){ alert(e.message||e); }
});
$("#btnLogout")?.addEventListener("click", async ()=>{ if(state.sb) await state.sb.auth.signOut(); state.userId=null; setMode("demo"); showApp(false); });
$("#btnDemo")?.addEventListener("click", async ()=>{ setMode("demo"); showApp(true); await loadCustomers(); await loadOrders(); });

// Customers
async function loadCustomers(){
  const tb=$("#customersTable tbody"); if(!tb) return; tb.innerHTML="";
  let rows=[];
  if(state.mode==="demo"){ rows=demo.customers; }
  else{ const { data, error } = await state.sb.from("customers").select().order("created_at",{ascending:false});
        if(error){ alert("Load customers error: "+error.message); return; } rows=data; }
  rows.forEach(c=>{
    const tr=el("tr");
    tr.append(el("td",{},c.name||""), el("td",{},c.phone||""), el("td",{},(c.platform||"other").toUpperCase()));
    const act=el("td"); const del=el("button",{class:"danger"},"Delete");
    del.addEventListener("click",()=>removeCustomer(c.id)); act.appendChild(del); tr.appendChild(act); tb.appendChild(tr);
  });
}
async function addCustomer(){
  const name=$("#custName").value.trim(); if(!name) return alert("Enter customer name");
  const phone=$("#custPhone").value.trim(); const platform=$("#custPlatform").value;
  if(state.mode==="demo"){
    demo.customers.unshift({ id: crypto.randomUUID(), name, phone, platform }); demo.save(); await loadCustomers();
    $("#custName").value=""; $("#custPhone").value=""; return;
  }
  const { error } = await state.sb.from("customers").insert({ id: crypto.randomUUID(), name, phone, platform });
  if(error) return alert("Add customer error: "+error.message);
  await loadCustomers(); $("#custName").value=""; $("#custPhone").value="";
}
async function removeCustomer(id){
  if(state.mode==="demo"){ demo.customers = demo.customers.filter(x=>x.id!==id); demo.save(); await loadCustomers(); return; }
  const { error } = await state.sb.from("customers").delete().eq("id", id);
  if(error) return alert("Delete error: "+error.message);
  await loadCustomers();
}
$("#btnAddCustomer")?.addEventListener("click", addCustomer);

// Orders
async function loadOrders(){
  const tb=$("#ordersTable tbody"); if(!tb) return; tb.innerHTML="";
  let rows=[];
  if(state.mode==="demo"){ rows=demo.orders; }
  else{ const { data, error } = await state.sb.from("orders").select().order("created_at",{ascending:false});
        if(error){ alert("Load orders error: "+error.message); return; } rows=data; }
  rows.forEach(o=>{
    const tr=el("tr");
    tr.append(el("td",{},o.order_code||"(no code)"), el("td",{},(o.platform||"other").toUpperCase()),
              el("td",{},o.status||"new"), el("td",{}, String(o.total_amount ?? 0)));
    const act=el("td"); const del=el("button",{class:"danger"},"Delete");
    del.addEventListener("click",()=>removeOrder(o.id)); act.appendChild(del); tr.appendChild(act); tb.appendChild(tr);
  });
}
async function addOrder(){
  const code=$("#orderCode").value.trim()||null; const platform=$("#orderPlatform").value;
  const status=$("#orderStatus").value; const total=parseFloat($("#orderAmount").value||"0")||0;
  if(state.mode==="demo"){
    demo.orders.unshift({ id: crypto.randomUUID(), order_code: code, platform, status, total_amount: total }); demo.save(); await loadOrders();
    $("#orderCode").value=""; $("#orderAmount").value=""; return;
  }
  const { error } = await state.sb.from("orders").insert({ id: crypto.randomUUID(), order_code: code, platform, status, total_amount: total });
  if(error) return alert("Add order error: "+error.message);
  await loadOrders(); $("#orderCode").value=""; $("#orderAmount").value="";
}
async function removeOrder(id){
  if(state.mode==="demo"){ demo.orders = demo.orders.filter(x=>x.id!==id); demo.save(); await loadOrders(); return; }
  const { error } = await state.sb.from("orders").delete().eq("id", id);
  if(error) return alert("Delete error: "+error.message);
  await loadOrders();
}
$("#btnAddOrder")?.addEventListener("click", addOrder);

// Auto show demo UI
document.addEventListener("DOMContentLoaded", ()=>{ $("#btnDemo")?.click(); });
