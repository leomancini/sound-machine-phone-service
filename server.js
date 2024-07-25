import express from "express";
import twilio from "twilio";
import fs from "fs";

const app = express();
const port = 3100;
const VoiceResponse = twilio.twiml.VoiceResponse;

// Read config from config.json
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

app.use(express.urlencoded({ extended: true }));

function gatherDigits(twiml) {
  return twiml.gather({
    input: "dtmf speech",
    numDigits: 1,
    timeout: 3,
    action: "/ivr",
    method: "POST",
    speechTimeout: "auto",
    speechModel: "numbers_and_commands",
  });
}

app.post("/ivr", (req, res) => {
  const twiml = new VoiceResponse();

  const digits = req.body.Digits || req.body.SpeechResult;

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
      gatherDigits(twiml);
    }
  } else {
    twiml.say(config.welcomeMessage);
    gatherDigits(twiml);
  }

  gatherDigits(twiml);

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
