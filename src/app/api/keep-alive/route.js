import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  const supabase = createClient(
    supabaseUrl,
    supabaseKey
  )

  // Query ringan — cukup cek 1 baris tabel kecil
  const { error } = await supabase
    .from("keep_alive")
    .select("id")
    .limit(1)

  if (error) {
    return NextResponse.json({ status: "error", error: error.message })
  }

  return NextResponse.json({ status: "alive" })
}
