import { createPDF } from "./createPdf.js";
import { getUserDetailsByPage } from "./user-data.js";
async function scrapeWebsite() {
  try {
    const url1 =
      "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba?cityIdList=95&currencyId=1&page=1";
    const url2 =
      "https://home.ss.ge/ka/udzravi-qoneba/l/bina/iyideba?cityIdList=95&currencyId=1&page=2";

    const table = ".sc-20a31af8-6";
    const page1 = await getUserDetailsByPage(url1, table);
    const page2 = await getUserDetailsByPage(url2, table);

    await createPDF([page1, page2]);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

scrapeWebsite();
