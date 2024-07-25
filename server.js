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
  const digits = req.body.Digits || req.body.SpeechResult;

  const handleInput = () => {
    twiml.gather({
      input: "dtmf speech",
      action: "/ivr",
      method: "POST",
      speechTimeout: "auto",
      speechModel: "numbers_and_commands",
    });
  };

  const processInput = (input) => {
    const selectedOption = config.options.find(
      (option) =>
        option.digit === input || option.spokenWord === input.toLowerCase()
    );
    if (selectedOption) {
      twiml.say(selectedOption.message);
      twiml.play(
        {
          loop: 1,
        },
        `${config.audioBaseUrl}${selectedOption.audioId}${config.audioFilePath}`
      );
      handleInput(); // Allow input after audio message
    } else {
      twiml.say(config.invalidInputMessage);
      handleInput();
    }
  };

  if (digits) {
    processInput(digits);
  } else {
    twiml.say(
      {
        voice: "alice",
        language: "en-US",
        input: "speech dtmf",
        interruptible: true,
      },
      config.welcomeMessage
    );
    handleInput();
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
