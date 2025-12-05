import { useEffect, useRef } from 'react';

/**
 * Activity Log Component
 * Displays a scrollable list of user activities with timestamps
 */
function ActivityLog({ activities }) {
    const logEndRef = useRef(null);

    // Auto-scroll to bottom when new activities are added
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activities]);

    /**
     * Get icon based on activity type
     */
    const getActivityIcon = (type) => {
        switch (type) {
            case 'buy':
                return '📈';
            case 'sell':
                return '📉';
            case 'subscribe':
                return '👁️';
            case 'unsubscribe':
                return '🚫';
            case 'alert':
                return '🔔';
            default:
                return '•';
        }
    };

    /**
     * Get CSS class based on activity type
     */
    const getActivityClass = (type) => {
        switch (type) {
            case 'buy':
                return 'activity-buy';
            case 'sell':
                return 'activity-sell';
            case 'subscribe':
            case 'unsubscribe':
                return 'activity-info';
            case 'alert':
                return 'activity-alert';
            default:
                return 'activity-default';
        }
    };

    return (
        <div className="activity-log">
            <h3 className="activity-log-title">Activity Log</h3>
            <div className="activity-log-content">
                {activities.length === 0 ? (
                    <p className="activity-empty">No activities yet</p>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className={`activity-item ${getActivityClass(activity.type)}`}
                        >
                            <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                            <div className="activity-details">
                                <p className="activity-message">{activity.message}</p>
                                <span className="activity-time">
                                    {new Date(activity.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
                <div ref={logEndRef} />
            </div>
        </div>
    );
}

export default ActivityLog;
