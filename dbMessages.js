import mongoose from "mongoose";

const WhatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timeStamp: String,
    received: Boolean,
})

export default mongoose.model('messagecontents', WhatsappSchema)