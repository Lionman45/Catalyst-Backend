import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

/* ----------------------------
   CONFIG
---------------------------- */

const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
    "https://catalyst.ai-nation.co.uk",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

/* ----------------------------
   MIDDLEWARE
---------------------------- */

app.use(express.json());

app.use(cors({
    origin: function(origin, callback) {

        if(!origin) return callback(null, true);

        if(ALLOWED_ORIGINS.includes(origin)){
            return callback(null, true);
        }

        return callback(new Error("CORS not allowed"), false);
    }
}));

/* ----------------------------
   ROUTES
---------------------------- */

app.get("/", (req,res)=>{
    res.json({
        status:"Catalyst AI API running"
    });
});

app.post("/ask", async (req,res)=>{

    try{

        const { messages, model } = req.body;

        if(!messages){
            return res.status(400).json({
                error:"No messages provided"
            });
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method:"POST",
                headers:{
                    "Authorization":`Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    model: model || "openrouter/auto",
                    messages: messages
                })
            }
        );

        const data = await response.json();

        if(!data.choices){
            return res.status(500).json({
                error:"Invalid AI response",
                raw:data
            });
        }

        res.json({
            message: data.choices[0].message.content
        });

    }catch(err){

        console.error(err);

        res.status(500).json({
            error:"AI request failed"
        });

    }

});

/* ----------------------------
   START SERVER
---------------------------- */

app.listen(PORT, ()=>{
    console.log("Catalyst AI API running on port", PORT);
});
