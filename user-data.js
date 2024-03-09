import https from "https";
import cheerio from "cheerio";

async function getHtml(url) {
  try {
    return await httpRequest(url);
  } catch (error) {
    console.error(`Error fetching HTML from ${url}: ${error.message}`);
    throw error;
  }
}

async function getDetailsLink(html, container) {
  try {
    const $ = cheerio.load(html);
    const htmlContainer = $(container);
    const links = htmlContainer.find("a");
    const data = [];
    links.each((index, element) => {
      const hrefValue = "https://home.ss.ge/" + $(element).attr("href");
      const childWithClass = $(element).find(".sc-6b97eccb-1");
      const titleFull = $(childWithClass)
        .find(".listing-detailed-item-title")
        .text();
      const price = $(childWithClass)
        .find(".listing-detailed-item-price")
        .text();
      const siblingSpanValue = $(childWithClass)
        .find(".listing-detailed-item-price")
        .next("span")
        .text();
      const title = limitStringTo35Characters(titleFull);
      data.push({ hrefValue, title, price, priceOfMSqr: siblingSpanValue });
    });
    return data;
  } catch (error) {
    console.error(`Error extracting details links: ${error.message}`);
    throw error;
  }
}
function limitStringTo35Characters(inputString) {
  if (inputString.length > 35) {
    return inputString.substring(0, 35);
  }
  return inputString;
}
export async function getUserDetailsByPage(url, detailsLinkSelector) {
  try {
    const html = await getHtml(url);
    const details = await getDetailsLink(html, detailsLinkSelector);

    return details;
  } catch (error) {
    console.error(`Error processing user details page: ${error.message}`);
    throw error;
  }
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
