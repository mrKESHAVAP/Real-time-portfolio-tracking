/**
 * Portfolio Component
 * Displays user's stock holdings with real-time P&L calculations
 */
function Portfolio({ portfolio, currentPrices }) {
    /**
     * Calculate total portfolio value and P&L
     */
    const calculatePortfolioSummary = () => {
        let totalValue = 0;
        let totalCost = 0;

        Object.entries(portfolio).forEach(([ticker, holding]) => {
            const currentPrice = currentPrices[ticker] || holding.avgPrice;
            const currentValue = holding.qty * currentPrice;
            const cost = holding.qty * holding.avgPrice;

            totalValue += currentValue;
            totalCost += cost;
        });

        const totalPL = totalValue - totalCost;
        const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;

        return { totalValue, totalCost, totalPL, totalPLPercent };
    };

    /**
     * Calculate P&L for individual holding
     */
    const calculateHoldingPL = (ticker, holding) => {
        const currentPrice = currentPrices[ticker] || holding.avgPrice;
        const currentValue = holding.qty * currentPrice;
        const cost = holding.qty * holding.avgPrice;
        const pl = currentValue - cost;
        const plPercent = cost > 0 ? (pl / cost) * 100 : 0;

        return { currentPrice, currentValue, pl, plPercent };
    };

    const summary = calculatePortfolioSummary();
    const holdings = Object.entries(portfolio);

    return (
        <div className="portfolio-container">
            <h3 className="portfolio-title">💼 My Portfolio</h3>

            {/* Portfolio Summary */}
            <div className="portfolio-summary">
                <div className="summary-item">
                    <span className="summary-label">Total Value</span>
                    <span className="summary-value">${summary.totalValue.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total P&L</span>
                    <span className={`summary-value ${summary.totalPL >= 0 ? 'positive' : 'negative'}`}>
                        {summary.totalPL >= 0 ? '+' : ''}${summary.totalPL.toFixed(2)}
                        {' '}({summary.totalPL >= 0 ? '+' : ''}{summary.totalPLPercent.toFixed(2)}%)
                    </span>
                </div>
            </div>

            {/* Holdings List */}
            {holdings.length === 0 ? (
                <p className="portfolio-empty">No holdings yet. Buy some stocks to get started!</p>
            ) : (
                <div className="holdings-list">
                    {holdings.map(([ticker, holding]) => {
                        const { currentPrice, currentValue, pl, plPercent } = calculateHoldingPL(ticker, holding);

                        return (
                            <div key={ticker} className="holding-card">
                                <div className="holding-header">
                                    <span className="holding-ticker">{ticker}</span>
                                    <span className={`holding-pl ${pl >= 0 ? 'positive' : 'negative'}`}>
                                        {pl >= 0 ? '+' : ''}${pl.toFixed(2)}
                                    </span>
                                </div>
                                <div className="holding-details">
                                    <div className="holding-detail-row">
                                        <span className="detail-label">Quantity:</span>
                                        <span className="detail-value">{holding.qty} shares</span>
                                    </div>
                                    <div className="holding-detail-row">
                                        <span className="detail-label">Avg Price:</span>
                                        <span className="detail-value">${holding.avgPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="holding-detail-row">
                                        <span className="detail-label">Current:</span>
                                        <span className="detail-value">${currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="holding-detail-row">
                                        <span className="detail-label">Value:</span>
                                        <span className="detail-value">${currentValue.toFixed(2)}</span>
                                    </div>
                                    <div className="holding-detail-row">
                                        <span className="detail-label">Return:</span>
                                        <span className={`detail-value ${pl >= 0 ? 'positive' : 'negative'}`}>
                                            {plPercent >= 0 ? '+' : ''}{plPercent.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Portfolio;
