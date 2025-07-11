const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("./src/routes/userRoutes");
const businessRoutes = require('./src/routes/businessRoutes');
const itemRoutes=require('./src/routes/itemRoutes');
const b2bCustomer=require('./src/routes/customerRoutes');
const connectDB = require("./src/config/db");
const transactionRoutes = require('./src/routes/transactionRoutes');
const cors = require("cors");
const totalSalesRoutes = require('./routes/totalSalesRoutes');
const invoiceLogRoutes = require('./routes/invoiceLogRoutes');


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true, // if using cookies or auth headers
}));

app.use("/api/users", userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/item',itemRoutes);
app.use("/api/b2bCustomer",b2bCustomer);
app.use('/api/transactions', transactionRoutes);
app.use('/api', totalSalesRoutes);
app.use('/api', invoiceLogRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


