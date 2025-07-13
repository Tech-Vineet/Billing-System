const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("./src/routes/userRoutes");
const businessRoutes = require('./src/routes/businessRoutes');
const itemRoutes = require('./src/routes/itemRoutes');
const b2bCustomer = require('./src/routes/customerRoutes');
const connectDB = require("./src/config/db");
const transactionRoutes = require('./src/routes/transactionRoutes');
const path = require("path");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

// ✅ Serve PDFs from /src/public/invoices
app.use('/invoices', express.static(path.join(__dirname, 'src', 'public', 'invoices')));

app.use("/api/users", userRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/item', itemRoutes);
app.use("/api/b2bCustomer", b2bCustomer);
app.use('/api/transactions', transactionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


