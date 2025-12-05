import { useState } from 'react';

/**
 * Buy/Sell Modal Component
 * Handles stock transaction UI
 */
function BuySellModal({ ticker, currentPrice, onClose, onTransaction, mode, currentHolding = 0 }) {
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    const isBuy = mode === 'buy';
    const totalAmount = quantity * currentPrice;

    /**
     * Handle transaction submission
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (quantity <= 0) {
            setError('Quantity must be greater than 0');
            return;
        }

        if (!isBuy && quantity > currentHolding) {
            setError(`You only have ${currentHolding} shares to sell`);
            return;
        }

        // Execute transaction
        onTransaction({
            ticker,
            quantity: parseInt(quantity),
            price: currentPrice,
            type: isBuy ? 'buy' : 'sell'
        });

        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isBuy ? '📈 Buy' : '📉 Sell'} {ticker}</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-info">
                        <div className="info-row">
                            <span className="info-label">Current Price:</span>
                            <span className="info-value">${currentPrice.toFixed(2)}</span>
                        </div>
                        {!isBuy && (
                            <div className="info-row">
                                <span className="info-label">Your Shares:</span>
                                <span className="info-value">{currentHolding}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            min="1"
                            max={!isBuy ? currentHolding : undefined}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="transaction-summary">
                        <span className="summary-label">Total {isBuy ? 'Cost' : 'Proceeds'}:</span>
                        <span className="summary-amount">${totalAmount.toFixed(2)}</span>
                    </div>

                    {error && <p className="modal-error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn-primary ${isBuy ? 'btn-buy' : 'btn-sell'}`}
                        >
                            Confirm {isBuy ? 'Buy' : 'Sell'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BuySellModal;
