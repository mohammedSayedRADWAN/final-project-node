import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`\n⚙️  Server is running at port : ${PORT}`);
        });

        app.on("error", (error) => {
            console.log("SERVER ERROR: ", error);
            throw error;
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    });
