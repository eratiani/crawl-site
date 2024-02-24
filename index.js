import { createPDF } from "./createPdf.js";
import { getUserDetailsByPage } from "./user-data.js";
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

scrapeWebsite();
