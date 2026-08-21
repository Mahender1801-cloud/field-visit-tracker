import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { formatDate, formatTime, formatDuration } from "@/lib/utils";

export async function GET(request: NextRequest) {
  await requireAdmin();

  const date = request.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 });

  const supabase = await createClient();
  const [{ data: visits }, { data: salesmen }] = await Promise.all([
    supabase.from("visits").select("*").eq("visit_date", date).order("created_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name"),
  ]);

  if (!visits?.length) {
    return NextResponse.json({ error: "No visits on that date" }, { status: 404 });
  }

  const nameMap = new Map((salesmen ?? []).map((s) => [s.id, s.full_name]));

  const sheetRows = visits.map((v) => ({
    Salesman: nameMap.get(v.salesman_id) ?? "—",
    Shop: v.shopkeeper_name,
    Phone: v.phone ?? "",
    Type: v.type,
    State: v.state ?? "",
    City: v.city ?? "",
    Area: v.area ?? "",
    Status: v.punch_out_at ? v.status : "In Progress",
    "Punch In": formatTime(v.created_at),
    "Punch Out": v.punch_out_at ? formatTime(v.punch_out_at) : "",
    "Time at Shop": formatDuration(v.created_at, v.punch_out_at),
    Feedback: v.feedback ?? "",
    Latitude: v.latitude ?? "",
    Longitude: v.longitude ?? "",
    "Has Selfie": v.selfie_path ? "Yes" : "No",
    "Has Visiting Card": v.visiting_card_path ? "Yes" : "No",
  }));

  const worksheet = XLSX.utils.json_to_sheet(sheetRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Visits");
  const xlsxBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  const zip = new JSZip();
  zip.file(`visits-${date}.xlsx`, xlsxBuffer);

  const imageFolder = zip.folder("photos");
  for (const v of visits) {
    const shopFolder = `${v.shopkeeper_name.replace(/[^a-z0-9]+/gi, "-")}-${v.id.slice(0, 8)}`;
    for (const [path, name] of [
      [v.selfie_path, "selfie"],
      [v.visiting_card_path, "visiting-card"],
    ] as const) {
      if (!path) continue;
      const { data, error } = await supabase.storage.from("visit-photos").download(path);
      if (error || !data) continue;
      const ext = path.split(".").pop() || "jpg";
      const bytes = await data.arrayBuffer();
      imageFolder?.file(`${shopFolder}/${name}.${ext}`, bytes);
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="visits-${date}.zip"`,
    },
  });
}
