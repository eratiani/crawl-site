import PDFDocument from "pdfkit";
import fs from "fs/promises";
import path from "path";
export async function createPDF(dataArr) {
  try {
    const doc = new PDFDocument();
    function cleanText(text) {
      return text.replace(/\t/g, "").trim();
    }
    const fontPath = path.join(path.dirname("sylfaen.ttf"), "sylfaen.ttf"); // Adjust the file name if necessary
    doc.font(fontPath).fontSize(9);
    let y = 50;
    doc.text("title", 10, y);
    doc.text("price", 190, y);
    doc.text("priceOfMSqr", 220, y);
    doc.text("link", 290, y);

    y += 25;
    dataArr.forEach((data) => {
      data.forEach((row) => {
        doc.text(cleanText(row.title), 10, y, { wordSpacing: 0 });

        doc.text(cleanText(row.price), 190, y, { wordSpacing: 0 });
        doc.text(cleanText(row.priceOfMSqr), 220, y, { wordSpacing: 0 });
        doc.text(row.hrefValue, 290, y);
        y += 25;
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
