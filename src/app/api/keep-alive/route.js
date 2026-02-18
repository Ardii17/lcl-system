import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const threeDaysMs = 1000 * 60 * 60 * 24 * 3;
  const now = new Date();

  // ambil waktu terakhir
  const { data, error } = await supabase
    .from("keep_alive")
    .select("last_run")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ status: "error", error: error.message });
  }

  const lastRun = new Date(data.last_run).getTime();

  if (Date.now() - lastRun < threeDaysMs) {
    return NextResponse.json({ status: "skipped" });
  }

  // update timestamp + query ringan
  await supabase
    .from("keep_alive")
    .update({ last_run: now.toISOString() })
    .eq("id", 1);

  await supabase.from("keep_alive").select("id").limit(1);

  return NextResponse.json({ status: "alive" });
}
