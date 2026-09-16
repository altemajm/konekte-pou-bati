// Lecture et parsing du corps des requetes POST (formulaires HTML classiques
// application/x-www-form-urlencoded). Pas besoin de body-parser/express.

const querystring = require("querystring");

const MAX_BODY_SIZE = 1 * 1024 * 1024; // 1 Mo, largement suffisant pour un formulaire

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        reject(new Error("Corps de requete trop volumineux"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

async function parseFormBody(req) {
  const raw = await readBody(req);
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw || "{}");
    } catch (e) {
      return {};
    }
  }
  return querystring.parse(raw);
}

module.exports = { parseFormBody };
