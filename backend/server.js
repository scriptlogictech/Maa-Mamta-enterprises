const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ✅ CORS FIX
const allowedOrigins = [
  "http://localhost:5173",
  "https://maamamtaenterprises.com",
  "https://www.maamamtaenterprises.com" // ✅ ADD THIS
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.options("*", cors());

// ✅ MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ✅ ROUTES
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// ✅ HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});

// ✅ ROOT ROUTE
app.get('/', (req, res) => {
  res.send("API is running 🚀");
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// ✅ SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//  h