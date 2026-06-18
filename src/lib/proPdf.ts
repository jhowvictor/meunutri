import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

export interface ProPdfOptions {
  title: string;
  content: string;
  patientName?: string;
  subtitle?: string;
}

export async function generateProfessionalPdf(
  professionalId: string,
  opts: ProPdfOptions
): Promise<jsPDF> {
  const { data: pro } = await (supabase as any)
    .from("professional_profiles")
    .select("*")
    .eq("id", professionalId)
    .maybeSingle();

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const brandColor = pro?.brand_color || "#10b981";

  // Header bar
  doc.setFillColor(brandColor);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor("#ffffff");
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(pro?.display_name || "Profissional de Saúde", 14, 13);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subline = [pro?.specialty, pro?.registration_number].filter(Boolean).join(" • ");
  if (subline) doc.text(subline, 14, 20);

  // Contact line
  const contact = [pro?.whatsapp, pro?.email_contact].filter(Boolean).join(" | ");
  if (contact) doc.text(contact, 14, 25);

  // Title block
  doc.setTextColor("#000000");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(opts.title, 14, 42);

  if (opts.patientName) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Paciente: ${opts.patientName}`, 14, 50);
  }
  if (opts.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor("#666666");
    doc.text(opts.subtitle, 14, 56);
    doc.setTextColor("#000000");
  }

  // Body
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(opts.content, pageWidth - 28);
  let y = 66;
  for (const line of lines) {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 14, y);
    y += 6;
  }

  // Footer
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor("#888888");
    doc.text(
      `${pro?.display_name || ""} — Gerado em ${new Date().toLocaleDateString("pt-BR")}  •  Página ${i}/${total}`,
      14,
      pageHeight - 8
    );
  }

  return doc;
}
