const dns = require('dns');
// Use Google DNS to resolve MongoDB Atlas SRV connection issues
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(() => {
  const Order = require('./src/models/Order');
  Order.find({
    status: { $in: ['Pending', 'Processing', 'Dispatched', 'Shipped', 'Out for Delivery'] }
  }).then(async (oldOrders) => {
    if (oldOrders.length > 0) {
      console.log(`Found ${oldOrders.length} orders with old status format. Migrating to new tracking terms...`);
      for (const order of oldOrders) {
        if (['Pending', 'Processing'].includes(order.status)) {
          order.status = 'Preparing';
        } else if (order.status === 'Dispatched') {
          order.status = 'Packaged';
        } else if (['Shipped', 'Out for Delivery'].includes(order.status)) {
          order.status = 'In Delivery';
        }
        await order.save();
      }
      console.log('Order status migration completed successfully.');
    }
  }).catch(err => console.error('Order status migration failed:', err.message));
});

const app = express();

app.use(cors());

// Webhook route must be parsed as raw body for Stripe signature validation
if (process.env.STRIPE_SECRET_KEY) {
  app.post(
    "/api/orders/webhook",
    express.raw({ type: "application/json" }),
    require("./src/routes/ordersWebhook")
  );
}

app.use(express.json());

app.get("/", (req, res) => {
  res.send("ShopLite API is running...");
});

// Routes
app.use("/api/config", require("./src/routes/config"));
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/categories", require("./src/routes/categories"));
app.use("/api/products", require("./src/routes/products"));
app.use("/api/orders", require("./src/routes/orders"));
app.use("/api/coupons", require("./src/routes/coupons"));
app.use("/api/reviews", require("./src/routes/reviews"));
app.use("/api/home", require("./src/routes/home"));
app.use("/api/about", require("./src/routes/about"));
app.use("/api/contact", require("./src/routes/contact"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
