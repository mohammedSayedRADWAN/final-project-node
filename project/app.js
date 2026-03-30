// // import express from 'express';
// // import { connectDB } from './MongoDB/DBConnection.js';
// import productRoutes from './routes/ProductRoute.js';
// // import orderRoutes from './routes/order.routes.js';
// import { errorHandler } from './middleware/ErrorMiddleware.js';
// import paymentRoute from "./routes/paymentRoute.js";
//   const app = express();


// app.use(express.json());

// connectDB();
// app.use("/api/payment", paymentRoute);
// app.use('/products', productRoutes);
// // app.use('/orders', orderRoutes);

// // Error handler
// app.use(errorHandler);

// app.listen(3000, () => {
//     console.log('Server running on port 3000');
// });
import express from 'express';
// import { connectDB } from './MongoDB/DBConnection.js';
import productRoutes from './routes/ProductRoute.js';
// import orderRoutes from './routes/order.routes.js';
 import usereRoutes from './routes/user.routes.js';

import { errorHandler } from './middleware/ErrorMiddleware.js';
import paymentRoute from "./routes/paymentRoute.js";

const app = express();

// Middleware
app.use(express.json());

// Database
// connectDB();

// Routes
app.use("/api/payment", paymentRoute);
app.use('/products', productRoutes);
// app.use('/orders', orderRoutes);
app.use('/users', usereRoutes);

// Error handler
app.use(errorHandler);


// Export app
export { app };