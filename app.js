// app.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Kết nối tới Supabase (lấy từ file .env)
const SUPABASE_URL = 'https://avqvpdtivztddmwfkfj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cXZwZHRpdnp0ZGRkbXdma2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzA0NTQsImV4cCI6MjA3ODQ0NjQ1NH0.V-HLSySnyg_IftI2gQQtDm1bqh5ArkrLiyAqt6gWQOY'

// Tạo client kết nối
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Hàm test kết nối DB
async function testConnection() {
  const { data, error } = await supabase.from('crm_customers').select('*')
  if (error) {
    document.body.innerHTML = `<h2 style="color:red">❌ Database connection failed:</h2><pre>${error.message}</pre>`
  } else {
    document.body.innerHTML = `<h2 style="color:green">✅ Connected to Supabase!</h2><pre>${JSON.stringify(data, null, 2)}</pre>`
  }
}

testConnection()
