const express = require("express");
const cors = require("cors");
const axios=require("axios");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = "8082";

const posts = {};

const eventHandler=(type,data)=>{
  if (type === "PostCreated") {
      const { id, title } = data;
      posts[id] = {
        id,
        title,
        comments: [],
      };
    }
    if (type === "CommentCreated") {
      const { id, content, postId ,status} =data;
      console.log(data);
      console.log(posts[postId])
      posts[postId].comments.push({id,content,status});
    }
  
    if(type==="CommentModerated"){
      const{id,postId,content,status}=data;
      const comment=posts[postId].comments.find((comment)=>{
        return comment.id===id
      });
      comment.status=status;
      comment.content=content;
    }
}

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  eventHandler(type, data);
  console.log(posts);
  res.send({});
});

app.listen(PORT, async() => {
  console.log(`Server is listening on the ${PORT} port`);
  try {
    const response=await axios.get("http://event-bus-clusterip-srv:8085/events");
    for(let event of response.data){
        console.log("Processing event ",event.type);
        eventHandler(event.type,event.data);  
    }
  } catch (error) {
      console.log("error at recieving all events from event-bus in query service ",error);
  } 
});
