// supabase/config.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// TODO: THAY 2 DÒNG NÀY BẰNG GIÁ TRỊ THẬT CỦA ANH
const SUPABASE_URL = "https://avqvpdtivztdddmwfkfj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cXZwZHRpdnp0ZGRkbXdma2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzA0NTQsImV4cCI6MjA3ODQ0NjQ1NH0.V-HLSySnyg_IftI2gQQtDm1bqh5ArkrLiyAqt6gWQOY"; // rút gọn

// KHÔNG SỬA GÌ PHÍA DƯỚI
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
