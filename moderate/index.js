const express=require("express");
const axios=require("axios");

const app=express();
const PORT = "8083";

app.use(express.json());

app.post("/events",async(req,res)=>{
    const{type,data}=req.body;
    console.log("moderate ",data)
    if(type==="CommentCreated"){
        const moderateStatus=data.content.includes("orange")?"rejected":"approved";
        try {
            await axios.post("http://event-bus-clusterip-srv:8085/events",{
                type:"CommentUpdated",
                data:{
                    id:data.id,
                    content:data.content,
                    postId:data.postId,
                    status:moderateStatus
                }
            });
        } catch (error) {
            console.log("error at event emitting time to the event-bus in moderate service ",error?.message);
        }
    }
    res.send({});
});

app.listen(PORT, () => {
    console.log(`Server is listening on the ${PORT} port`);
  });