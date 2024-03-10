const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = 8081;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const commentsByPostId = {};

const eventHandler=async (type,data)=>{
  if (type === "CommentUpdated") {
    const { id, postId, content, status } = data;
    console.log("CommentUpdated in comment ",data);
    const comment = commentsByPostId[postId].find((comment) => {
      return comment.id === id;
    });
    comment.status = status;

    await axios.post("http://event-bus-clusterip-srv:8085/events", {
      type: "CommentModerated",
      data: {
        id,
        content,
        postId,
        status,
      },
    });
  }
}

app.get("/posts/:id/comments", (req, res) => {
  const postId = req.params.id;
  res.status(200).send(commentsByPostId[postId] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const postId = req.params.id;

  const comments = commentsByPostId[postId] || [];
  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[postId] = comments;

  try {
    await axios.post("http://event-bus-clusterip-srv:8085/events", {
      type: "CommentCreated",
      data: {
        id: commentId,
        content,
        postId,
        status: "pending",
      },
    });
  } catch (error) {
    console.log("error at event emitting time to the event-bus ",error?.message);
  }

  res.status(200).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  console.log("Event is received ", type);
  try {
    await eventHandler(type,data);
  } catch (error) {
      console.log("error at the event recieved time in message service ",error?.message);
  }
  
  res.send({});
});

app.listen(PORT,() => {
  console.log(`Server is listen on the ${PORT} port`);
});
