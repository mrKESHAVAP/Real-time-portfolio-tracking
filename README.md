# 📈 Stock Broker Client Web Dashboard

A professional, production-ready real-time stock trading dashboard built with **Node.js**, **Express**, **Socket.IO**, and **React**. This portfolio project demonstrates advanced WebSocket communication, portfolio management, real-time data visualization, and multi-user support.

## ✨ Features

### Core Features
- **Real-Time Price Updates**: Stock prices update every second using WebSocket (Socket.IO)
- **Live Price Charts**: Interactive line charts with 60-point price history using Recharts
- **Multi-User Support**: Multiple users with independent subscriptions and portfolios
- **User Tiers**: Basic users (3 stocks max) and Premium users (unlimited stocks)

### Portfolio Management
- **Buy/Sell Trading**: Simulated stock trading with order confirmation
- **Portfolio Tracking**: Real-time holdings with quantity and average price
- **P&L Calculations**: Live profit/loss tracking with percentage returns
- **Transaction History**: Complete audit trail of all trades

### User Experience
- **Light/Dark Theme**: Toggle between themes with localStorage persistence
- **Activity Log**: Real-time activity feed with color-coded events
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern UI**: Gradient effects, smooth animations, and glassmorphism

## 🛠️ Tech Stack

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **Socket.IO**: Real-time bidirectional event-based communication
- **CORS**: Cross-origin resource sharing
- **WebSocket Rooms**: User tier-based room management

### Frontend
- **React 18**: UI library with functional components and hooks
- **Vite**: Fast build tool and dev server
- **Socket.IO Client**: WebSocket client library
- **Recharts**: Composable charting library for React
- **CSS Variables**: Dynamic theming system

## 📁 Project Structure

```
Escrowstocks/
├── backend/
│   ├── server.js              # Express + Socket.IO server with portfolio logic
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ThemeToggle.jsx      # Light/dark mode toggle
│   │   │   ├── StockChart.jsx       # Real-time line chart
│   │   │   ├── Portfolio.jsx        # Holdings and P&L display
│   │   │   ├── ActivityLog.jsx      # Activity feed
│   │   │   └── BuySellModal.jsx     # Transaction modal
│   │   ├── context/
│   │   │   └── ThemeContext.jsx     # Theme state management
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Email login + user type
│   │   │   └── Dashboard.jsx        # Main trading interface
│   │   ├── App.jsx                  # Root component
│   │   ├── main.jsx                 # React entry point
│   │   ├── socket.js                # Socket.IO client
│   │   └── index.css                # Global styles + themes
│   ├── index.html             # HTML entry point
│   ├── vite.config.js         # Vite configuration
│   ├── package.json           # Frontend dependencies
│   └── .env.example           # Environment variables template
├── README.md                  # This file
└── DEPLOYMENT.md              # Deployment guide
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

### Installation & Setup

#### 1️⃣ Clone the Repository

```powershell
git clone <your-repo-url>
cd Escrowstocks
```

#### 2️⃣ Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the backend server
npm start
```

The backend server will start on **http://localhost:3001**

You should see:
```
🚀 Server running on http://localhost:3001
📡 WebSocket ready for connections
📈 Supported stocks: GOOG, TSLA, AMZN, META, NVDA
💼 Portfolio management enabled
👥 User tiers: Basic (3 stocks max) | Premium (unlimited)
```

#### 3️⃣ Frontend Setup

Open a **new terminal window** and run:

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm run dev
```

The frontend will start on **http://localhost:5173**

You should see:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 4️⃣ Access the Application

Open your browser and navigate to **http://localhost:5173**

## 🧪 Testing the Features

### 1. User Types & Subscription Limits

**Test Basic User (3 stocks max)**:
1. Login with any email, select "Basic" account type
2. Try to subscribe to 4 stocks - you'll be limited to 3
3. Unsubscribe from one, then you can add another

**Test Premium User (unlimited)**:
1. Login as "Premium" user
2. Subscribe to all 5 stocks - all should work

### 2. Real-Time Charts

1. Subscribe to 2-3 stocks
2. Watch the live charts update every second
3. Charts maintain last 60 data points
4. Hover over chart to see exact price and timestamp

### 3. Portfolio & Trading

**Buy Stocks**:
1. Subscribe to a stock (e.g., GOOG)
2. Click "Buy" button on price card
3. Enter quantity (e.g., 10 shares)
4. Confirm transaction
5. See your holding appear in Portfolio section

**Sell Stocks**:
1. Click "Sell" button on a stock you own
2. Enter quantity to sell (max: what you own)
3. Confirm transaction
4. Portfolio updates automatically

**Watch P&L**:
1. After buying stocks, watch the P&L update in real-time as prices change
2. Green = profit, Red = loss
3. Both dollar amount and percentage shown

### 4. Activity Log

- Subscribe/unsubscribe to stocks
- Buy and sell transactions
- All activities logged with timestamps
- Color-coded by event type

### 5. Theme Toggle

1. Click the sun/moon icon in header
2. Theme switches between light and dark
3. Refresh page - theme persists (localStorage)

### 6. Multi-User Testing

1. **Open Tab 1**: Login as Basic user, subscribe to 3 stocks, buy some shares
2. **Open Tab 2**: Login as Premium user, subscribe to 5 stocks, different portfolio
3. **Observe**: Each user has independent:
   - Subscriptions
   - Portfolios
   - Activity logs
   - Real-time price updates

## 🎯 Key Features for Recruiters

### Advanced WebSocket Patterns
- **Room-Based Broadcasting**: User tiers with subscription limits
- **Targeted Updates**: Each user receives only their subscribed stocks
- **Connection Management**: Proper cleanup on disconnect

### State Management
- **React Context**: Theme management with provider pattern
- **useState/useEffect**: Portfolio, activities, price history
- **LocalStorage**: Theme persistence across sessions

### Data Visualization
- **Recharts Integration**: Real-time line charts with tooltips
- **Rolling Window**: Efficient price history (last 60 points)
- **Responsive Charts**: Adapts to container size

### Business Logic
- **Portfolio Calculations**: Average price, P&L, total value
- **Transaction Validation**: Prevent selling more than owned
- **Real-Time Updates**: Portfolio value recalculated every second

### UI/UX Excellence
- **Theme System**: CSS variables for easy theming
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Transitions and hover effects
- **Modal Patterns**: Transaction confirmation dialogs

## 📊 Architecture Highlights

### WebSocket Event Flow

```
Client → Server Events:
├── setUserType: { userType: 'basic' | 'premium' }
├── subscribe: [array of tickers]
├── buyStock: { ticker, quantity, price }
└── sellStock: { ticker, quantity, price }

Server → Client Events:
├── priceUpdate: { GOOG: 140.5, TSLA: 242.3 }
├── portfolioUpdate: { portfolio: {...} }
├── transactionComplete: { success, message, transaction }
└── subscriptionLimitReached: { limit, message }
```

### Data Models

**Portfolio Structure**:
```javascript
portfolio = {
  GOOG: { qty: 10, avgPrice: 140.50 },
  TSLA: { qty: 5, avgPrice: 242.30 }
}
```

**Activity Log Entry**:
```javascript
{
  id: unique_id,
  timestamp: 1234567890,
  type: 'buy' | 'sell' | 'subscribe' | 'alert',
  message: 'Bought 10 shares of GOOG at $140.50'
}
```

## 🚦 API Endpoints

### REST Endpoints

```
GET /
Response: API info, supported stocks, current prices

GET /health
Response: Server status, connected users, user tier breakdown
```

### WebSocket Events

See Architecture section above for complete event documentation.

## 📝 Notes

- **No Database**: All data (prices, portfolios, transactions) stored in backend memory
- **No Real Auth**: Email-only login for demo purposes
- **Simulated Prices**: Random price generation (no real API calls)
- **Development Only**: Uses dev servers (not production builds)

## 📦 Deployment

For complete deployment instructions including:
- Backend deployment to Render/Railway
- Frontend deployment to Vercel/Netlify
- Environment variable configuration
- SSL/WSS setup
- Custom domain configuration

**See**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔧 Configuration

### Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_SOCKET_URL=http://localhost:3001
```

For production, update URLs to your deployed services.

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Ensure Node.js is installed: `node --version`
- Verify all dependencies installed: `npm install`

### Frontend won't connect
- Verify backend is running on port 3001
- Check browser console for WebSocket errors
- Ensure CORS is properly configured

### Prices not updating
- Check browser console for Socket.IO errors
- Verify backend console shows subscription logs
- Ensure WebSocket connection shows "Connected"

### Theme not persisting
- Check browser localStorage is enabled
- Verify no browser extensions blocking localStorage
- Clear cache and reload

### Charts not rendering
- Ensure Recharts is installed: `npm list recharts`
- Check console for React errors
- Verify price history has data

## 🎨 Customization

### Adding More Stocks

1. **Backend** (`backend/server.js`):
```javascript
const SUPPORTED_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 'AAPL'];
const stockPrices = { ...existing, AAPL: 175.50 };
```

2. **Frontend** (`frontend/src/pages/Dashboard.jsx`):
```javascript
const AVAILABLE_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 'AAPL'];
const STOCK_NAMES = { ...existing, AAPL: 'Apple' };
```

### Changing Price Update Frequency

**Backend** (`server.js`):
```javascript
setInterval(() => {
  updateStockPrices();
  broadcastPriceUpdates();
}, 2000); // Change from 1000ms to 2000ms (2 seconds)
```

### Customizing Subscription Limits

**Backend** (`server.js`):
```javascript
const limit = user.userType === 'basic' ? 5 : Infinity; // Change 3 to 5
```

## 📄 License

MIT

## 👨‍💻 Author

Built as a portfolio project demonstrating:
- Full-stack development
- Real-time communication
- Modern React patterns
- Professional UI/UX design
- Production deployment readiness

---

**Perfect for demonstrating to recruiters:**
- ✅ Enterprise-level architecture
- ✅ Real-time WebSocket expertise
- ✅ Modern React development
- ✅ State management patterns
- ✅ Responsive UI/UX design
- ✅ Portfolio-ready code quality

**Built with ❤️ for placement portfolio | Real-time WebSocket Trading Dashboard**
