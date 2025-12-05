import { useState, useEffect } from 'react'
import socket from '../socket'
import ThemeToggle from '../components/ThemeToggle'
import StockChart from '../components/StockChart'
import Portfolio from '../components/Portfolio'
import ActivityLog from '../components/ActivityLog'
import BuySellModal from '../components/BuySellModal'

// Available stock tickers
const AVAILABLE_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

// Stock names for display
const STOCK_NAMES = {
    GOOG: 'Google',
    TSLA: 'Tesla',
    AMZN: 'Amazon',
    META: 'Meta',
    NVDA: 'NVIDIA'
};

/**
 * Dashboard Component
 * Main interface for stock subscription, price tracking, and portfolio management
 */
function Dashboard({ userEmail, userType, onLogout }) {
    // Track which stocks the user has subscribed to
    const [subscribedStocks, setSubscribedStocks] = useState([]);

    // Track current prices for subscribed stocks
    const [prices, setPrices] = useState({});

    // Track price history for charts (ticker => array of {price, timestamp})
    const [priceHistory, setPriceHistory] = useState({});

    // Track connection status
    const [isConnected, setIsConnected] = useState(socket.connected);

    // Portfolio state {ticker => {qty, avgPrice}}
    const [portfolio, setPortfolio] = useState({});

    // Activity log state
    const [activities, setActivities] = useState([]);

    // Buy/Sell modal state
    const [modalState, setModalState] = useState(null); // {ticker, mode: 'buy'|'sell'}

    // Subscription limit for basic users
    const subscriptionLimit = userType === 'basic' ? 3 : Infinity;

    /**
     * Add activity to log
     */
    const addActivity = (type, message) => {
        const newActivity = {
            id: Date.now() + Math.random(),
            type,
            message,
            timestamp: Date.now()
        };
        setActivities(prev => [...prev.slice(-49), newActivity]); // Keep last 50
    };

    /**
     * Set up Socket.IO event listeners
     */
    useEffect(() => {
        // Connection status handlers
        function onConnect() {
            setIsConnected(true);
            console.log('Connected to server');

            // Send user login to associate socket with email
            socket.emit('userLogin', { email: userEmail, userType });
        }

        function onDisconnect() {
            setIsConnected(false);
            console.log('Disconnected from server');
        }

        /**
         * Handle user data loaded from server (previous subscriptions & portfolio)
         */
        function onUserDataLoaded(data) {
            console.log('User data loaded:', data);

            // Restore previous subscriptions
            if (data.subscriptions && data.subscriptions.length > 0) {
                setSubscribedStocks(data.subscriptions);
                addActivity('info', `Restored ${data.subscriptions.length} previous subscriptions`);
            }

            // Restore previous portfolio
            if (data.portfolio && Object.keys(data.portfolio).length > 0) {
                setPortfolio(data.portfolio);
                addActivity('info', 'Portfolio data restored');
            }
        }

        /**
         * Handle incoming price updates from server
         */
        function onPriceUpdate(priceData) {
            console.log('Received price update:', priceData);
            setPrices(priceData);

            // Update price history for charts
            const timestamp = Date.now();
            setPriceHistory(prev => {
                const updated = { ...prev };
                Object.entries(priceData).forEach(([ticker, price]) => {
                    if (!updated[ticker]) {
                        updated[ticker] = [];
                    }
                    updated[ticker] = [...updated[ticker], { price, timestamp }];
                });
                return updated;
            });
        }

        /**
         * Handle portfolio updates from backend
         */
        function onPortfolioUpdate(data) {
            console.log('Portfolio update:', data);
            setPortfolio(data.portfolio || {});
        }

        /**
         * Handle transaction confirmation
         */
        function onTransactionComplete(data) {
            console.log('Transaction complete:', data);
            if (data.success) {
                addActivity(data.transaction.type, data.message);
            } else {
                alert(data.message);
            }
        }

        /**
         * Handle subscription limit reached
         */
        function onSubscriptionLimitReached(data) {
            alert(data.message);
        }

        // Register event listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('priceUpdate', onPriceUpdate);
        socket.on('userDataLoaded', onUserDataLoaded);
        socket.on('portfolioUpdate', onPortfolioUpdate);
        socket.on('transactionComplete', onTransactionComplete);
        socket.on('subscriptionLimitReached', onSubscriptionLimitReached);

        // Send user login if already connected
        if (socket.connected) {
            socket.emit('userLogin', { email: userEmail, userType });
        }

        // Cleanup on component unmount
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('priceUpdate', onPriceUpdate);
            socket.off('userDataLoaded', onUserDataLoaded);
            socket.off('portfolioUpdate', onPortfolioUpdate);
            socket.off('transactionComplete', onTransactionComplete);
            socket.off('subscriptionLimitReached', onSubscriptionLimitReached);
        };
    }, [userEmail, userType]);

    /**
     * Whenever subscriptions change, notify the server
     */
    useEffect(() => {
        console.log('Updating subscriptions:', subscribedStocks);
        socket.emit('subscribe', subscribedStocks);
    }, [subscribedStocks]);

    /**
     * Toggle stock subscription
     */
    const toggleStock = (ticker) => {
        setSubscribedStocks(prev => {
            if (prev.includes(ticker)) {
                // Unsubscribe
                addActivity('unsubscribe', `Unsubscribed from ${ticker}`);
                return prev.filter(t => t !== ticker);
            } else {
                // Check subscription limit
                if (prev.length >= subscriptionLimit) {
                    alert(`${userType === 'basic' ? 'Basic' : 'Premium'} users can track up to ${subscriptionLimit} stocks. Please unsubscribe from a stock first.`);
                    return prev;
                }
                // Subscribe
                addActivity('subscribe', `Subscribed to ${ticker}`);
                return [...prev, ticker];
            }
        });
    };

    /**
     * Open buy/sell modal
     */
    const openTransactionModal = (ticker, mode) => {
        setModalState({ ticker, mode });
    };

    /**
     * Handle transaction
     */
    const handleTransaction = (transaction) => {
        socket.emit(transaction.type === 'buy' ? 'buyStock' : 'sellStock', transaction);
        setModalState(null);
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <img src="/logo.png" alt="Logo" className="header-logo" />
                    <div>
                        <h1>📊 Stock Dashboard</h1>
                        <p className="user-email">
                            👤 {userEmail}
                            <span className="user-type-badge">{userType === 'premium' ? '⭐ Premium' : '📊 Basic'}</span>
                        </p>
                    </div>
                </div>
                <div className="header-actions">
                    <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                    </span>
                    <ThemeToggle />
                    <button onClick={onLogout} className="btn-secondary">
                        Logout
                    </button>
                </div>
            </header>

            {/* Stock Selection */}
            <section className="stock-selection">
                <h2>Select Stocks to Track</h2>
                <p className="selection-info">
                    {userType === 'basic' ? `📊 Basic: ${subscribedStocks.length}/3 stocks selected` : '⭐ Premium: Unlimited stocks'}
                </p>
                <div className="stock-toggles">
                    {AVAILABLE_STOCKS.map(ticker => (
                        <button
                            key={ticker}
                            className={`stock-toggle ${subscribedStocks.includes(ticker) ? 'active' : ''}`}
                            onClick={() => toggleStock(ticker)}
                        >
                            <span className="ticker">{ticker}</span>
                            <span className="stock-name">{STOCK_NAMES[ticker]}</span>
                            {subscribedStocks.includes(ticker) && <span className="check">✓</span>}
                        </button>
                    ))}
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="dashboard-main-grid">
                {/* Left Column: Charts and Prices */}
                <div className="dashboard-left">
                    {/*Real-Time Charts */}
                    {subscribedStocks.length > 0 && (
                        <section className="charts-section">
                            <h2>📈 Live Charts</h2>
                            <div className="charts-grid">
                                {subscribedStocks.map(ticker => (
                                    <StockChart
                                        key={ticker}
                                        ticker={ticker}
                                        priceHistory={priceHistory[ticker] || []}
                                        currentPrice={prices[ticker]}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Price Display with Buy/Sell */}
                    <section className="price-display">
                        <h2>💰 Live Prices & Trading</h2>
                        {subscribedStocks.length === 0 ? (
                            <p className="empty-state">
                                👆 Select stocks above to start tracking prices
                            </p>
                        ) : (
                            <div className="price-grid">
                                {subscribedStocks.map(ticker => (
                                    <div key={ticker} className="price-card">
                                        <div className="price-card-header">
                                            <span className="ticker-large">{ticker}</span>
                                            <span className="stock-name-small">{STOCK_NAMES[ticker]}</span>
                                        </div>
                                        <div className="price-value">
                                            {prices[ticker] !== undefined ? (
                                                <>
                                                    <span className="currency">$</span>
                                                    <span className="amount">{prices[ticker].toFixed(2)}</span>
                                                </>
                                            ) : (
                                                <span className="loading">Loading...</span>
                                            )}
                                        </div>
                                        <div className="price-actions">
                                            <button
                                                className="btn-buy"
                                                onClick={() => openTransactionModal(ticker, 'buy')}
                                                disabled={!prices[ticker]}
                                            >
                                                📈 Buy
                                            </button>
                                            <button
                                                className="btn-sell"
                                                onClick={() => openTransactionModal(ticker, 'sell')}
                                                disabled={!prices[ticker] || !portfolio[ticker] || portfolio[ticker].qty === 0}
                                            >
                                                📉 Sell
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Portfolio and Activity Log */}
                <div className="dashboard-right">
                    <Portfolio portfolio={portfolio} currentPrices={prices} />
                    <ActivityLog activities={activities} />
                </div>
            </div>

            {/* Buy/Sell Modal */}
            {modalState && (
                <BuySellModal
                    ticker={modalState.ticker}
                    currentPrice={prices[modalState.ticker]}
                    mode={modalState.mode}
                    currentHolding={portfolio[modalState.ticker]?.qty || 0}
                    onClose={() => setModalState(null)}
                    onTransaction={handleTransaction}
                />
            )}

            {/* Info Footer */}
            <footer className="dashboard-footer">
                <p>💡 Prices update every second • Real-time portfolio tracking • Open multiple tabs to test multi-user functionality</p>
            </footer>
        </div>
    );
}

export default Dashboard
