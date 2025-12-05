import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/**
 * Stock Chart Component  
 * Displays real-time price history for a single stock
 * Maintains a rolling window of recent price data
 */
function StockChart({ ticker, priceHistory, currentPrice }) {
    // Format data for Recharts (last 60 data points)
    const chartData = priceHistory.slice(-60).map((entry, index) => ({
        index,
        price: entry.price,
        time: new Date(entry.timestamp).toLocaleTimeString()
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="chart-tooltip">
                    <p className="tooltip-price">${payload[0].value.toFixed(2)}</p>
                    <p className="tooltip-time">{payload[0].payload.time}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="stock-chart-container">
            <div className="chart-header">
                <h3 className="chart-ticker">{ticker}</h3>
                <div className="chart-current-price">
                    ${currentPrice ? currentPrice.toFixed(2) : '---'}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        dataKey="index"
                        stroke="var(--text-secondary)"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        stroke="var(--text-secondary)"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="price"
                        stroke="url(#colorGradient)"
                        strokeWidth={2}
                        dot={false}
                        animationDuration={300}
                    />
                    <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#7c3aed" />
                        </linearGradient>
                    </defs>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default StockChart;
