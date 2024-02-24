import PDFDocument from "pdfkit";
import fs from "fs/promises";

export async function createPDF(dataArr) {
  try {
    const doc = new PDFDocument();
    function cleanText(text) {
      return text.replace(/\t/g, "").trim();
    }

    doc.font("Helvetica").fontSize(9);
    let y = 50;

    doc.text("Name", 10, y);
    doc.text("Surname", 60, y);
    doc.text("Gender", 150, y);
    doc.text("Zip", 190, y);
    doc.text("City", 220, y);
    doc.text("Email", 360, y);

    y += 15;
    dataArr.forEach((data) => {
      data.forEach((row) => {
        doc.text(cleanText(row.name), 10, y, { wordSpacing: 0 });
        doc.text(cleanText(row.surname), 60, y, { wordSpacing: 0 });
        doc.text(cleanText(row.gender[0].toUpperCase()), 150, y, {
          wordSpacing: 0,
        });
        doc.text(cleanText(row.zip), 190, y, { wordSpacing: 0 });
        doc.text(cleanText(row.city), 220, y, { wordSpacing: 0 });
        doc.text(row.email, 360, y);
        y += 15;
      });
    });

    const buffer = await new Promise((resolve) => {
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.end();
    });

    await fs.writeFile("output.pdf", buffer, "utf-8");
    console.log("PDF created successfully.");
  } catch (error) {
    console.error(`Error creating PDF: ${error.message}`);
    throw error;
  }
}
