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

  const handleInput = (message = null, audioUrl = null) => {
    const gather = twiml.gather({
      input: "dtmf speech",
      action: "/ivr",
      method: "POST",
      speechTimeout: "auto",
      speechModel: "numbers_and_commands",
      timeout: 3,
      finishOnKey: "",
    });

    if (message) {
      gather.say(
        {
          voice: "alice",
          language: "en-US",
          input: "speech dtmf",
          interruptible: true,
        },
        message
      );
    }

    if (audioUrl) {
      gather.play(
        {
          loop: 1,
        },
        audioUrl
      );
    }

    // Add a final gather to catch any input after the audio finishes
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
      const audioUrl = `${config.audioBaseUrl}${selectedOption.audioId}${config.audioFilePath}`;
      handleInput(selectedOption.message, audioUrl);
    } else {
      handleInput(config.invalidInputMessage);
    }
  };

  if (digits) {
    processInput(digits);
  } else {
    handleInput(config.welcomeMessage);
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
