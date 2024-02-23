import https from "https";
import cheerio from "cheerio";

async function scrapeWebsite() {
  try {
    const url1 = "https://www.bdh-online.de/patienten/therapeutensuche/";
    const url2 =
      "https://www.bdh-online.de/patienten/therapeutensuche/?seite=2";

    const table = ".table.table-striped.table-hover";
    const detailsCont = "#therapeuten .col-md-8";
    const page1 = await getUserDetailsByPage(url1, table, detailsCont);
    const page2 = await getUserDetailsByPage(url2, table, detailsCont);
    console.log({ page1, page2 });
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
    .filter((index, element) => element.nodeType === 3)
    .map((index, element) => $(element).text().trim())
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

scrapeWebsite();
