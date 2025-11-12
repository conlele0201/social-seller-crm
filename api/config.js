export default function handler(req, res) {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || "";
  if (!url || !key)
    return res
      .status(500)
      .json({ error: "Missing SUPABASE_URL or SUPABASE_ANON_KEY" });
  res.status(200).json({ url, key });
}
