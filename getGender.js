import https from "https";
const API_KEY =
  "24c13a584d287f222388be5fcfbb4a4978df9cb084646e180009ac5347f3bd4c";
// "c14711d2ce1793547c92f9e2cab3d3e79b77611b040a86ca0e7d2282d517250a";
// "995ba3caf3b86a038e8c0a4549f05c0e568912b27231701285a57621a9ea2024";
export async function getGenderFromGenderizeAPI(nameToCheck) {
  return new Promise((resolve, reject) => {
    const API_KEY_GENDERIZE = `https://api.genderize.io?name=${nameToCheck}`;
    const apiUrl = `https://gender-api.com/get?name=${nameToCheck}&key=${API_KEY}`;
    const req = https.get(apiUrl, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.error) {
            reject(new Error(`Genderize.io error: ${parsedData.error}`));
          } else {
            resolve(parsedData.gender);
          }
        } catch (error) {
          reject(new Error(`Error parsing JSON response: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(new Error(`Error making HTTP request: ${error.message}`));
    });
  });
}
