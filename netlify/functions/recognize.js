// Netlify function: receives a camera frame from the page and forwards it to Roboflow.
// The API key stays here on the server (Netlify environment variable ROBOFLOW_API_KEY).

const WORKSPACE = "kashs-workspace";
const WORKFLOW_ID = "lab-equipment-recognition";

const reply = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

exports.handler = async (event) => {
  // Opening the function address in a browser lands here: a quick "is it deployed?" test.
  if (event.httpMethod !== "POST") {
    return reply(200, { ok: true, message: "The recognize function is deployed. Send a POST request with an image to use it." });
  }

  const key = process.env.ROBOFLOW_API_KEY;
  if (!key) {
    return reply(500, { error: "ROBOFLOW_API_KEY is not set. Add it in Netlify under Project configuration, Environment variables, then redeploy." });
  }

  let image;
  try {
    image = JSON.parse(event.body || "{}").image;
  } catch (e) {
    return reply(400, { error: "The request body was not valid JSON." });
  }
  if (!image) return reply(400, { error: "No image was sent." });

  try {
    const url = `https://serverless.roboflow.com/${WORKSPACE}/workflows/${WORKFLOW_ID}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        inputs: { image: { type: "base64", value: image } },
      }),
    });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return reply(502, { error: "Roboflow did not return JSON (status " + r.status + ").", detail: text.slice(0, 300) });
    }
    return reply(r.ok ? 200 : r.status, data);
  } catch (e) {
    return reply(500, { error: "The function could not reach Roboflow.", detail: String(e) });
  }
};
