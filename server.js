import express from 'express';
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from 'pusher';
import cors from 'cors';

// App configuration
const app = express();
const port = process.env.PORT || 9000;


const pusher = new Pusher({
    appId: "1861199",
    key: "7176d61e9b7596f89957",
    secret: "4b2c2cec15345410e58d",
    cluster: "us3",
    useTLS: true
  });

// Middleware
app.use(express.json());  // Middleware to parse JSON bodies
app.use(cors());

// DB configuration
const connection_url = 'mongodb+srv://MuhammadShoaib:Kingcar321@cluster1.erv7d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

// Connect to MongoDB
mongoose.connect(connection_url, {
})
.then(() => console.log('MongoDB connected successfully'))
.catch(error => console.error('MongoDB connection error:', error));

const db = mongoose.connection;

db.once("open", () => {
    console.log("Db Connected")
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {
        console.log("A change is occured:", change);

        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                name: messageDetails.name,
                message: messageDetails.message,
                
            })
            console.log("Message is updating")
        } else {
            console.log("Error triggering Pusher")

        }
    })
})

// API routes
app.get('/', (req, res) => res.status(200).send("Hello Worlds"));
app.get('/messages/sync', async (req, res) => {
    try {
        const newMessage = await Messages.find();
        res.status(200).send(newMessage);
    } catch {
        res.status(500).send(err.message)
    }
})
app.post('/messages/new', async (req, res) => {
    try {
        const dbMessage = req.body;
        const newMessage = await Messages.create(dbMessage);
        res.status(201).send(`New message created: \n ${newMessage}`);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Start the server
app.listen(port, () => console.log(`Listening on localhost:${port}`));
