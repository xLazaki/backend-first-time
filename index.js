const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const MongoClient = require("mongodb").MongoClient;
const port = process.env.PORT || 4000;
const moment = require("moment");

// Import the appropriate class
const { WebhookClient } = require("dialogflow-fulfillment");
// let collection = {};
// app.listen(3000, () => {

// });

app.use(morgan("dev"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({
    success: true
  });
});

app.post("/webhook", (req, res) => {
  console.log("POST: /");
  console.log("Body: ", req.body);

  //Create an instance
  const agent = new WebhookClient({
    request: req,
    response: res
  });

  //Test get value of WebhookClient
  console.log("agentVersion: " + agent.agentVersion);
  console.log("intent: " + agent.intent);
  console.log("locale: " + agent.locale);
  console.log("query: ", agent.query);
  console.log("session: ", agent.session);

  //Function Location
  function checkAvailibily(agent) {
    console.log("checkAvalibility");
    const now = moment()
      .startOf("day")
      .toDate();
    const uri =
      "mongodb+srv://new:fuckingpassword@cluster0-xsqvw.gcp.mongodb.net/test?retryWrites=true&w=majority";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    return new Promise((resolve, reject) => () => {
      client.connect(err => {
        collection = client.db("reservation").collection("library");
        // perform actions on the collection object
        console.log("connected");
        collection
          .find({ startDate: now })
          .toArray()
          .then(e => {
            console.log("resolve");
            let timeSlot = "";
            for (let booking of e) {
              date = moment(booking.startTime).format("MMM Do YY");
              startHour = booking.startHour;
              finishHour = startHour + booking.duration;
              timeSlot += `${date} ${startHour}:00-${finishHour}:00 | user: ${booking.user}`;
            }
            agent.add(`วันนี้มีคนจองห้องไปแล้ว ณ เวลา ${timeSlot}`);
            resolve();
          })
          .catch(error => {
            console.log("reject");
            agent.add("เกิดปัญหาขึ้น โปรดลองใหม่อีกครัง");
            reject();
          });
        console.log("pre finish");
      });
    });
    console.log("finish");
  }

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set("อยากได้ห้องว่าง", checkAvailibily);
  agent.handleRequest(intentMap);
});

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
