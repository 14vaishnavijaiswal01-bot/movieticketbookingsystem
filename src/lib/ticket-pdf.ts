// Client-side e-ticket PDF export (jsPDF). Imported dynamically from a click
// handler so the library never enters the SSR graph.

import type { Booking, Movie, Showtime } from "@/lib/cinebook";
import { formatDate, formatDuration, formatTime } from "@/lib/cinebook";

// jsPDF's built-in fonts have no ₹ glyph, so amounts use the INR prefix.
function money(n: number): string {
  return `INR ${n.toLocaleString("en-IN")}`;
}

// Deterministic pseudo-barcode bars derived from the booking reference,
// matching the on-screen e-ticket.
function drawBarcode(
  doc: import("jspdf").jsPDF,
  ref: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  doc.setFillColor(30, 30, 30);
  const bars = 40;
  const barWidth = width / bars;
  for (let i = 0; i < bars; i++) {
    const code = ref.charCodeAt(i % ref.length) + i * 13;
    const thick = code % 3 === 0;
    const h = height * (0.6 + ((code >> 2) % 5) / 10);
    doc.rect(x + i * barWidth, y + (height - h), thick ? barWidth * 0.7 : barWidth * 0.3, h, "F");
  }
}

export async function downloadTicketPdf(
  booking: Booking,
  movie: Pick<Movie, "title" | "duration"> | undefined,
  showtime: Showtime | undefined,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: [460, 700], orientation: "portrait" });

  const W = 460;

  // Header band
  doc.setFillColor(226, 122, 40); // CineBook orange
  doc.rect(0, 0, W, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("CINEBOOK", 32, 44);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("E-TICKET · CINEMA ADMISSION", 32, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(W - 130, 36, 100, 22, 11, 11, "F");
  doc.setTextColor(226, 122, 40);
  doc.text("PAID (DEMO)", W - 122, 50);

  // Movie + showtime
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text((movie?.title ?? "Movie").slice(0, 34), 32, 140);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const meta: [string, string][] = [
    ["Date", showtime ? formatDate(showtime.date) : "—"],
    ["Time", showtime ? formatTime(showtime.time) : "—"],
    ["Cinema", showtime ? showtime.location : "—"],
    ["Screen", showtime ? showtime.screen : "—"],
    ["Runtime", movie?.duration ? formatDuration(movie.duration) : "—"],
  ];
  let y = 172;
  for (const [label, value] of meta) {
    doc.setTextColor(120, 120, 120);
    doc.text(label, 32, y);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.text(value, 140, y);
    doc.setFont("helvetica", "normal");
    y += 24;
  }

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([4, 4], 0);
  doc.line(32, y + 6, W - 32, y + 6);
  doc.setLineDashPattern([], 0);
  y += 38;

  // Details grid
  const rows: [string, string][] = [
    ["Booking Ref", booking.ref],
    ["Seats", booking.seats.join(", ")],
    ["Amount Paid", money(booking.total)],
    ["Name", booking.name],
    ["Email", booking.email],
  ];
  for (const [label, value] of rows) {
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.setFont("helvetica", "normal");
    doc.text(label.toUpperCase(), 32, y);
    doc.setFontSize(13);
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    const wrapped = doc.splitTextToSize(value, W - 172);
    doc.text(wrapped, 140, y + 1);
    y += 18 + wrapped.length * 14;
    doc.setFont("helvetica", "normal");
  }

  // Barcode
  y += 16;
  drawBarcode(doc, booking.ref, 32, y, W - 64, 56);
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.setFont("courier", "bold");
  doc.text(booking.ref, W / 2, y + 74, { align: "center" });

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(160, 160, 160);
  doc.text("Demo ticket generated in your browser — CineBook does not send real emails.", 32, 678);

  doc.save(`cinebook-ticket-${booking.ref}.pdf`);
}
