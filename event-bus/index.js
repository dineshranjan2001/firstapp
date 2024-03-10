const express = require("express");
const axios = require("axios");

const app = express();

const PORT = 8085;

app.use(express.json());

const events = [];

app.post("/events", async (req, res) => {
  const event = req.body;
  events.push(event);

  try {
    const requests = [
      axios.post("http://posts-clusterip-srv:8080/events", event),
      axios.post("http://comments-clusterip-srv:8081/events", event),
      axios.post("http://query-clusterip-srv:8082/events", event),
      axios.post("http://moderate-clusterip-srv:8083/events", event),
    ];

    await Promise.all(requests.map(promise=>promise.then(response=>response)));

    res.send({ status: "OK" });
  } catch (error) {
        console.log("error in event-bus",error?.message);
        res.status(500).send({ error: "Failed to deliver event to one or more services" });
  }
});

app.get("/events", async (req, res) => {
  res.send(events);
});

app.listen(PORT, () => {
  console.log(`Server is listening on the ${PORT} port`);
});
