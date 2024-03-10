const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const posts = {};


app.get("/posts", (req, res) => {
  res.status(200).send(posts);
});

app.post("/posts/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");

  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  try {
    await axios.post("http://event-bus-clusterip-srv:8085/events", {
      type: "PostCreated",
      data: {
        id,
        title,
      },
    });
  } catch (error) {
    console.log("error at event emitting time to the event-bus in post service ",error?.message);
  }

  res.status(200).send(posts[id]);
});

app.post("/events",(req,res)=>{
  
  console.log("Event is received : ",req.body.type);
  res.send({});
});

const PORT = 8080;


app.listen(PORT, () => {
  console.log("This v2 application")
  console.log(`Server is listening on the ${PORT} port.`);
});
