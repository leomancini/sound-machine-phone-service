import express from "express";
import twilio from "twilio";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3100;
const VoiceResponse = twilio.twiml.VoiceResponse;

// Base URL for audio files
const audioBaseUrl = "https://labs.noshado.ws/sound-machine-storage/";

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Main IVR endpoint
app.post("/ivr", (req, res) => {
  const twiml = new VoiceResponse();

  // Get the user's input
  const digits = req.body.Digits;

  if (digits) {
    switch (digits) {
      case "1":
        twiml.play(`${audioBaseUrl}1234567890.mp3`);
        break;
      case "2":
        twiml.play(`${audioBaseUrl}2349856734.mp3`);
        break;
      case "3":
        twiml.play(`${audioBaseUrl}4598673247.mp3`);
        break;
      default:
        twiml.say("Invalid input. Please try again.");
        break;
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
