import express from "express";
import twilio from "twilio";
import fs from "fs";

const app = express();
const port = 3100;
const VoiceResponse = twilio.twiml.VoiceResponse;

// Read config from config.json
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

app.use(express.urlencoded({ extended: true }));

app.post("/ivr", (req, res) => {
  const twiml = new VoiceResponse();

  const digits = req.body.Digits;

  if (digits) {
    const selectedOption = config.options.find(
      (option) => option.digit === digits
    );
    if (selectedOption) {
      twiml.say(selectedOption.message);
      twiml.play(
        `${config.audioBaseUrl}${selectedOption.audioId}${config.audioFilePath}`
      );
    } else {
      twiml.say(config.invalidInputMessage);
    }
  } else {
    twiml.say(config.welcomeMessage);
    twiml.gather({
      numDigits: 1,
      action: "/ivr",
      method: "POST",
    });
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
