import https from "https";
import cheerio from "cheerio";
import PDFDocument from "pdfkit";
import fs from "fs/promises";
async function scrapeWebsite() {
  try {
    const url1 = "https://www.bdh-online.de/patienten/therapeutensuche/";
    const url2 =
      "https://www.bdh-online.de/patienten/therapeutensuche/?seite=2";

    const table = ".table.table-striped.table-hover";
    const detailsCont = "#therapeuten .col-md-8";
    const page1 = await getUserDetailsByPage(url1, table, detailsCont);
    const page2 = await getUserDetailsByPage(url2, table, detailsCont);

    await createPDF([page1, page2]);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
async function getHtml(url) {
  return await httpRequest(url);
}
async function getDetailsLink(html, container) {
  const $ = cheerio.load(html);
  const htmlContainer = $(container);
  const data = [];
  htmlContainer.find("tbody tr").each((index, row) => {
    const columns = $(row).find("td");
    const link = columns.eq(5).find("a").attr("href");
    data.push(link);
  });
  data.shift();
  return data;
}
async function getUserDetailsByPage(url, detailsLinkSelector, detailsSelector) {
  const html = await getHtml(url);
  const detailsLink = await getDetailsLink(html, detailsLinkSelector);
  const userDetails = await Promise.all(
    detailsLink.map(async (link) => {
      const html = await getHtml(link);
      const userData = await getUserDetails(html, detailsSelector);
      return userData;
    })
  );

  return userDetails;
}

async function getUserDetails(html, container) {
  const $ = cheerio.load(html);
  const detailsContainer = $(container);
  const [name, surname] = detailsContainer
    .find("b")
    .first()
    .text()
    .trim()
    .split(" ");
  const addressLines = detailsContainer
    .contents()
    .filter((_, element) => element.nodeType === 3)
    .map((_, element) => $(element).text().trim())
    .get();
  const city = addressLines[2].match(/\s(.+)/)[0].trim();
  const zip = addressLines[2].match(/\d+/)[0];
  const email = detailsContainer.find('a[href^="mailto:"]').text().trim();
  return { name, surname, city, zip, email };
}
function httpRequest(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
async function createPDF(dataArr) {
  const doc = new PDFDocument();
  function cleanText(text) {
    return text.replace(/\t/g, "").trim();
  }

  doc.font("Helvetica").fontSize(9);
  let y = 50;

  doc.text("Name", 10, y);
  doc.text("Surname", 60, y);
  doc.text("Zip", 150, y);
  doc.text("City", 190, y);
  doc.text("Email", 350, y);

  y += 15;
  dataArr.forEach((data) => {
    data.forEach((row) => {
      if (row.surname === "" || !row.surname) {
        row.surname = "random";
      }

      doc.text(cleanText(row.name), 10, y, { wordSpacing: 0 });
      doc.text(cleanText(row.surname), 60, y, { wordSpacing: 0 });
      doc.text(cleanText(row.zip), 150, y, { wordSpacing: 0 });
      doc.text(cleanText(row.city), 190, y, { wordSpacing: 0 });
      doc.text(row.email, 350, y);

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
}
scrapeWebsite();
