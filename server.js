import express from "express";
import twilio from "twilio";

const app = express();
const port = 3100;
const VoiceResponse = twilio.twiml.VoiceResponse;

const audioBaseUrl = "https://labs.noshado.ws/sound-machine-storage/";
const audioFilePath = "/audio.mp3";

app.use(express.urlencoded({ extended: true }));

app.post("/ivr", (req, res) => {
  const twiml = new VoiceResponse();

  const digits = req.body.Digits;

  if (digits) {
    switch (digits) {
      case "1":
        twiml.play(`Message 1`);
        twiml.play(`${audioBaseUrl}1234567890${audioFilePath}`);
        break;
      case "2":
        twiml.play(`Message 2`);
        twiml.play(`${audioBaseUrl}2349856734${audioFilePath}`);
        break;
      case "3":
        twiml.play(`Message 3`);
        twiml.play(`${audioBaseUrl}4598673247${audioFilePath}`);
        break;
      default:
        twiml.say("Invalid input. Please try again.");
        break;
    }
  } else {
    twiml.say("Welcome to the IVR system.");
    twiml
      .gather({
        numDigits: 1,
        action: "/ivr",
        method: "POST",
      })
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
