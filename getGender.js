import https from "https";
const API_KEY =
  "24c13a584d287f222388be5fcfbb4a4978df9cb084646e180009ac5347f3bd4c";
export async function getGenderFromGenderizeAPI(nameToCheck) {
  return new Promise((resolve, reject) => {
    const API_KEY_GENDERIZE = `https://api.genderize.io?name=${nameToCheck}`;
    const apiUrl = `https://gender-api.com/get?name=${nameToCheck}&key=${API_KEY}`;
    const req = https.get(API_KEY_GENDERIZE, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData.gender);
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
