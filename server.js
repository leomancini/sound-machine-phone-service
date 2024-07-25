import express from "express";
import twilio from "twilio";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3100;
const VoiceResponse = twilio.twiml.VoiceResponse;

let config;
try {
  const configFile = await fs.readFile(
    path.join(__dirname, "config.json"),
    "utf8"
  );
  config = JSON.parse(configFile);
} catch (error) {
  console.error("Error loading configuration:", error);
  process.exit(1);
}

app.use(express.urlencoded({ extended: true }));

app.get("/config", (req, res) => {
  res.json(config);
});

app.post("/ivr", (req, res) => {
  const twiml = new VoiceResponse();

  const digits = req.body.Digits;

  if (digits) {
    const option = config.options.find((opt) => opt.digit === digits);
    if (option) {
      twiml.play(option.message);
      twiml.play(`${config.audioBaseUrl}${option.id}${config.audioFilePath}`);
    } else {
      twiml.say("Invalid input. Please try again.");
    }
  } else {
    // Initial greeting and menu options
    twiml.say("Welcome to the IVR system.");
    twiml
      .gather({
        numDigits: 1,
        action: "/ivr",
        method: "POST",
      })
      .say(
        "Press 1 for the first audio, 2 for the second audio, or 3 for the third audio."
      );
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
