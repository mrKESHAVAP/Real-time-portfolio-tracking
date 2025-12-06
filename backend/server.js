import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// ============================================
// CORS CONFIGURATION
// ============================================

// Read allowed frontend URLs from environment variable
// For local development: defaults to localhost
// For production (Render): set CORS_ORIGIN in environment variables
// Example: CORS_ORIGIN=https://your-app.vercel.app,https://your-app-preview.vercel.app
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

console.log("🌍 Allowed CORS Origins:", allowedOrigins);

// Configure CORS for Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"]
}));

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ============================================
// IN-MEMORY DATA STORAGE
// ============================================

// Stock tickers we support
const SUPPORTED_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

// Current stock prices - initialized with random starting values
const stockPrices = {
  GOOG: 140.50,
  TSLA: 242.30,
  AMZN: 151.20,
  META: 330.80,
  NVDA: 495.60
};

// Track user data per EMAIL (for persistence)
// Format: { email: { userType, subscriptions, portfolio, transactions } }
const userDataByEmail = {};

// Track socket to email mapping (for real-time updates)
// Format: { socketId: email }
const socketToEmail = {};

// ============================================
// STOCK PRICE SIMULATION
// ============================================

/**
 * Generate a random price delta between -2 and +2
 */
function getRandomDelta() {
  return (Math.random() * 4) - 2; // Random value between -2 and +2
}

/**
 * Update all stock prices with random deltas
 * This simulates market fluctuations
 */
function updateStockPrices() {
  SUPPORTED_STOCKS.forEach(ticker => {
    const delta = getRandomDelta();
    stockPrices[ticker] = Math.max(1, stockPrices[ticker] + delta); // Keep price above $1
    stockPrices[ticker] = Math.round(stockPrices[ticker] * 100) / 100; // Round to 2 decimals
  });
}

/**
 * Broadcast price updates to all connected users
 * Each user receives ONLY the stocks they subscribed to
 */
function broadcastPriceUpdates() {
  // Iterate through each connected socket
  Object.keys(socketToEmail).forEach(socketId => {
    const email = socketToEmail[socketId];
    const user = userDataByEmail[email];

    if (!user) return;

    const subscribedTickers = user.subscriptions || [];

    if (subscribedTickers.length === 0) {
      // User has no subscriptions, skip
      return;
    }

    // Build price update object with only subscribed stocks
    const priceUpdate = {};
    subscribedTickers.forEach(ticker => {
      priceUpdate[ticker] = stockPrices[ticker];
    });

    // Send to this specific socket
    io.to(socketId).emit('priceUpdate', priceUpdate);
  });
}

// Start the price update interval (every 1 second)
setInterval(() => {
  updateStockPrices();
  broadcastPriceUpdates();
}, 1000);

// ============================================
// PORTFOLIO MANAGEMENT HELPERS
// ============================================

/**
 * Calculate average price after buying more stock
 */
function calculateNewAvgPrice(currentQty, currentAvg, newQty, newPrice) {
  if (currentQty === 0) return newPrice;
  const totalCost = (currentQty * currentAvg) + (newQty * newPrice);
  const totalQty = currentQty + newQty;
  return totalCost / totalQty;
}

/**
 * Process buy transaction
 */
function processBuy(email, { ticker, quantity, price }) {
  const user = userDataByEmail[email];

  if (!user) return { success: false, message: 'User not found' };

  if (!user.portfolio) {
    user.portfolio = {};
  }

  // Get current holding
  const currentHolding = user.portfolio[ticker] || { qty: 0, avgPrice: 0 };

  // Calculate new average price
  const newAvgPrice = calculateNewAvgPrice(
    currentHolding.qty,
    currentHolding.avgPrice,
    quantity,
    price
  );

  // Update portfolio
  user.portfolio[ticker] = {
    qty: currentHolding.qty + quantity,
    avgPrice: newAvgPrice
  };

  // Record transaction
  if (!user.transactions) {
    user.transactions = [];
  }
  user.transactions.push({
    type: 'buy',
    ticker,
    quantity,
    price,
    timestamp: Date.now()
  });

  return {
    success: true,
    message: `Bought ${quantity} shares of ${ticker} at $${price.toFixed(2)}`,
    transaction: { type: 'buy', ticker, quantity, price }
  };
}

/**
 * Process sell transaction
 */
function processSell(email, { ticker, quantity, price }) {
  const user = userDataByEmail[email];

  if (!user) return { success: false, message: 'User not found' };

  if (!user.portfolio || !user.portfolio[ticker]) {
    return {
      success: false,
      message: `You don't own any ${ticker} shares`
    };
  }

  const currentHolding = user.portfolio[ticker];

  if (currentHolding.qty < quantity) {
    return {
      success: false,
      message: `Insufficient shares. You only have ${currentHolding.qty} shares of ${ticker}`
    };
  }

  // Update portfolio
  if (currentHolding.qty === quantity) {
    // Selling all shares - remove from portfolio
    delete user.portfolio[ticker];
  } else {
    // Selling some shares - decrease quantity (avgPrice stays same)
    user.portfolio[ticker].qty -= quantity;
  }

  // Record transaction
  if (!user.transactions) {
    user.transactions = [];
  }
  user.transactions.push({
    type: 'sell',
    ticker,
    quantity,
    price,
    timestamp: Date.now()
  });

  return {
    success: true,
    message: `Sold ${quantity} shares of ${ticker} at $${price.toFixed(2)}`,
    transaction: { type: 'sell', ticker, quantity, price }
  };
}

// ============================================
// SOCKET.IO EVENT HANDLERS
// ============================================

io.on('connection', (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  let userEmail = null;

  /**
   * User login - associates socket with email and loads previous data
   */
  socket.on('userLogin', ({ email, userType }) => {
    console.log(`👤 User logged in: ${email} (${userType})`);

    userEmail = email;
    socketToEmail[socket.id] = email;

    // Initialize or retrieve user data by email
    if (!userDataByEmail[email]) {
      // New user - create fresh data
      userDataByEmail[email] = {
        userType: userType || 'basic',
        subscriptions: [],
        portfolio: {},
        transactions: []
      };
      console.log(`📝 Created new user data for: ${email}`);
    } else {
      // Existing user - may update user type if changed
      if (userType && userDataByEmail[email].userType !== userType) {
        userDataByEmail[email].userType = userType;
      }
      console.log(`📂 Loaded existing user data for: ${email}`);
    }

    const user = userDataByEmail[email];

    // Join room based on user type
    const room = user.userType === 'premium' ? 'premium-users' : 'basic-users';
    socket.join(room);
    console.log(`🚪 Socket ${socket.id} joined room: ${room}`);

    // Send previous subscriptions and portfolio to client
    socket.emit('userDataLoaded', {
      subscriptions: user.subscriptions || [],
      portfolio: user.portfolio || {},
      userType: user.userType
    });
  });

  /**
   * Set user type and join appropriate room
   */
  socket.on('setUserType', ({ userType }) => {
    if (!userEmail) {
      console.warn(`⚠️ setUserType called without userEmail for socket ${socket.id}`);
      return;
    }

    console.log(`👤 Socket ${socket.id} set as ${userType} user`);

    const user = userDataByEmail[userEmail];
    if (user) {
      user.userType = userType;

      // Join room based on user type
      const room = userType === 'premium' ? 'premium-users' : 'basic-users';
      socket.join(room);

      console.log(`🚪 Socket ${socket.id} joined room: ${room}`);
    }
  });

  /**
   * Handle subscription updates from client
   */
  socket.on('subscribe', (tickers) => {
    if (!userEmail) {
      console.warn(`⚠️ Subscribe called without userEmail for socket ${socket.id}`);
      return;
    }

    const user = userDataByEmail[userEmail];
    if (!user) return;

    // Check subscription limits
    const limit = user.userType === 'basic' ? 3 : Infinity;

    if (tickers.length > limit) {
      socket.emit('subscriptionLimitReached', {
        limit,
        message: `${user.userType === 'basic' ? 'Basic' : 'Premium'} users can subscribe to ${limit === Infinity ? 'unlimited' : limit} stocks`
      });
      return;
    }

    console.log(`📊 User ${userEmail} (${user.userType}) subscribed to:`, tickers);

    // Validate that all tickers are supported
    const validTickers = tickers.filter(ticker => SUPPORTED_STOCKS.includes(ticker));

    // Update subscriptions for this user (persisted by email)
    user.subscriptions = validTickers;

    // Immediately send current prices for subscribed stocks
    const currentPrices = {};
    validTickers.forEach(ticker => {
      currentPrices[ticker] = stockPrices[ticker];
    });
    socket.emit('priceUpdate', currentPrices);
  });

  /**
   * Handle buy stock request
   */
  socket.on('buyStock', (transaction) => {
    if (!userEmail) {
      console.warn(`⚠️ buyStock called without userEmail for socket ${socket.id}`);
      return;
    }

    console.log(`💰 Buy request from ${userEmail}:`, transaction);

    const result = processBuy(userEmail, transaction);

    // Send transaction result
    socket.emit('transactionComplete', result);

    // Send updated portfolio
    const user = userDataByEmail[userEmail];
    if (user) {
      socket.emit('portfolioUpdate', {
        portfolio: user.portfolio
      });
    }
  });

  /**
   * Handle sell stock request
   */
  socket.on('sellStock', (transaction) => {
    if (!userEmail) {
      console.warn(`⚠️ sellStock called without userEmail for socket ${socket.id}`);
      return;
    }

    console.log(`💸 Sell request from ${userEmail}:`, transaction);

    const result = processSell(userEmail, transaction);

    // Send transaction result
    socket.emit('transactionComplete', result);

    // Send updated portfolio
    const user = userDataByEmail[userEmail];
    if (user) {
      socket.emit('portfolioUpdate', {
        portfolio: user.portfolio
      });
    }
  });

  /**
   * Handle client disconnect
   */
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);

    // Remove socket to email mapping (but keep user data!)
    if (socketToEmail[socket.id]) {
      const email = socketToEmail[socket.id];
      console.log(`📌 User ${email} disconnected, data preserved`);
      delete socketToEmail[socket.id];
    }
  });
});

// Optional: Broadcast special messages to specific rooms
// Example: Send market alerts to premium users only
setInterval(() => {
  // This is just an example - you can use this pattern for special features
  // io.to('premium-users').emit('premiumAlert', { message: 'Special market insight!' });
}, 60000); // Every minute

// ============================================
// EXPRESS ROUTES
// ============================================

app.get('/', (req, res) => {
  res.json({
    message: 'Stock Broker Dashboard API - Enhanced Edition',
    supportedStocks: SUPPORTED_STOCKS,
    currentPrices: stockPrices,
    features: ['Real-time prices', 'Portfolio management', 'User tiers', 'Buy/Sell transactions']
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connectedUsers: Object.keys(userData).length,
    basicUsers: Object.values(userData).filter(u => u.userType === 'basic').length,
    premiumUsers: Object.values(userData).filter(u => u.userType === 'premium').length
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready for connections`);
  console.log(`📈 Supported stocks: ${SUPPORTED_STOCKS.join(', ')}`);
  console.log(`💼 Portfolio management enabled`);
  console.log(`👥 User tiers: Basic (3 stocks max) | Premium (unlimited)`);
});
