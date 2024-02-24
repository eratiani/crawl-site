import https from "https";
import cheerio from "cheerio";
import { getGenderFromGenderizeAPI } from "./getGender.js";

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
    const data = [];
    htmlContainer.find("tbody tr").each((_, row) => {
      const columns = $(row).find("td");
      const link = columns.eq(5).find("a").attr("href");
      data.push(link);
    });
    data.shift();
    return data;
  } catch (error) {
    console.error(`Error extracting details links: ${error.message}`);
    throw error;
  }
}

export async function getUserDetailsByPage(
  url,
  detailsLinkSelector,
  detailsSelector
) {
  try {
    const html = await getHtml(url);
    const detailsLink = await getDetailsLink(html, detailsLinkSelector);
    const userDetails = await Promise.all(
      detailsLink.map(async (link) => {
        try {
          const html = await getHtml(link);
          const userData = await getUserDetails(html, detailsSelector);
          return userData;
        } catch (error) {
          console.error(
            `Error fetching user details from ${link}: ${error.message}`
          );
          throw error;
        }
      })
    );

    return userDetails;
  } catch (error) {
    console.error(`Error processing user details page: ${error.message}`);
    throw error;
  }
}

async function getUserDetails(html, container) {
  try {
    const $ = cheerio.load(html);
    const detailsContainer = $(container);
    const [name, surname] = detailsContainer
      .find("b")
      .first()
      .text()
      .trim()
      .replace(/\s+/g, " ")
      .split(" ");
    const addressLines = detailsContainer
      .contents()
      .filter((_, element) => element.nodeType === 3)
      .map((_, element) => $(element).text().trim())
      .get();
    const city = addressLines[2].match(/\s(.+)/)[0].trim();
    const zip = addressLines[2].match(/\d+/)[0];
    const email = detailsContainer.find('a[href^="mailto:"]').text().trim();
    const gender = await getGenderFromGenderizeAPI(name);
    return { name, surname, city, gender, zip, email };
  } catch (error) {
    console.error(`Error extracting user details: ${error.message}`);
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
