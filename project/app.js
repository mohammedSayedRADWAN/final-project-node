import express from 'express';
import { connectDB } from './MongoDB/DBConnection.js';
import productRoutes from './routes/ProductRoute.js';
// import orderRoutes from './routes/OrderRoutes.js';
import { errorHandler } from './middleware/ErrorMiddleware.js';
import paymentRoute from "./routes/paymentRoute.js";
const app = express();


app.use(express.json());

connectDB();
app.use("/api/payment", paymentRoute);
app.use('/products', productRoutes);
// app.use('/orders', orderRoutes);

// Error handler
app.use(errorHandler);

app.listen(3000, () => {
    console.log('Server running on port 3000');
});