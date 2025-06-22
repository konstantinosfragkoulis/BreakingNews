import { useState, useEffect } from "react";
import { AppSettings, TOPIC_KEYWORDS } from "../electron/types";
import './Settings.css';

interface SettingsProps {
    onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
    const [settings, setSettings] = useState<AppSettings>({
        theme: 'system',
        feeds: [],
        userInterests: [],
        userNotInterests: []
    });
    const [newFeedUrl, setNewFeedUrl] = useState('');

    useEffect(() => {
        window.ipcRenderer.invoke('settings:load').then((loadedSettings: AppSettings) => {
            setSettings(loadedSettings);
        });
    }, []);

    const handleSave = () => {
        window.ipcRenderer.invoke('settings:save', settings).then(() => {
            onClose();
        });
    };

    const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
        setSettings(prev => ({ ...prev, theme }));
    };

    const handleFeedToggle = (index: number) => {
        setSettings(prev => ({
            ...prev,
            feeds: prev.feeds.map((feed, i) => 
                i === index ? { ...feed, enabled: !feed.enabled } : feed
            )
        }));
    };

    const handleAddFeed = () => {
        if(newFeedUrl.trim()) {
            setSettings(prev => ({
                ...prev,
                feeds: [...prev.feeds, { url: newFeedUrl.trim(), enabled: true }]
            }));
            setNewFeedUrl('');
        }
    };

    const handleRemoveFeed = (index: number) => {
        setSettings(prev => ({
            ...prev,
            feeds: prev.feeds.filter((_, i) => i !== index)
        }));
    };

    const handleTopicToggle = (topic: string, isInterested: boolean) => {
        if(isInterested) {
            setSettings(prev => ({
                ...prev,
                userInterests: prev.userInterests.includes(topic)
                    ? prev.userInterests.filter(t => t !== topic)
                    : [...prev.userInterests, topic],
                userNotInterests: prev.userNotInterests.filter(t => t !== topic)
            }));
        } else {
            setSettings(prev => ({
                ...prev,
                userNotInterests: prev.userNotInterests.includes(topic)
                    ? prev.userNotInterests.filter(t => t !== topic)
                    : [...prev.userNotInterests, topic],
                userInterests: prev.userInterests.filter(t => t !== topic)
            }));
        }
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal">
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="settings-content">
                    <section className="settings-section">
                        <h3>Theme</h3>
                        <div className="theme-options">
                            {['system', 'light', 'dark'].map(theme => (
                                <label key={theme} className="radio-option">
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={theme}
                                        checked={settings.theme === theme}
                                        onChange={() => handleThemeChange(theme as any)}
                                    />
                                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>RSS Feeds</h3>
                        <div className="add-feed">
                            <input
                                type="url"
                                placeholder="Enter RSS feed URL"
                                value={newFeedUrl}
                                onChange={(e) => setNewFeedUrl(e.target.value)}
                                onKeyUp={(e) => e.key === 'Enter' && handleAddFeed()}
                            />
                            <button onClick={handleAddFeed}>Add Feed</button>
                        </div>
                        <div className="feeds-list">
                            {settings.feeds.map((feed, i) => (
                                <div key={i} className="feed-item">
                                    <label className="feed-toggle">
                                        <input
                                            type="checkbox"
                                            checked={feed.enabled}
                                            onChange={() => handleFeedToggle(i)}
                                        />
                                        <span className="feed-url">{feed.url}</span>
                                    </label>
                                    <button onClick={() => handleRemoveFeed(i)} className="remove-btn">Remove</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="settings-section">
                        <h3>Topic Preferences</h3>
                        <div className="topics-grid">
                            {Object.keys(TOPIC_KEYWORDS).map(topic => {
                                const isInterested = settings.userInterests.includes(topic);
                                const isNotInterested = settings.userNotInterests.includes(topic);
                                return (
                                    <div key={topic} className="topic-item">
                                        <span className="topic-name">
                                            {topic.replace(/_/g, ' ').toUpperCase()}
                                        </span>                                
                                        <div className="topic-controls">
                                            <button
                                                className={`topic-btn ${isInterested ? `active interested` : ''}`}
                                                onClick={() => handleTopicToggle(topic, true)}
                                            >
                                                Interested
                                            </button>
                                            <button
                                                className={`topic-btn ${isNotInterested ? `active not-interested` : ''}`}
                                                onClick={() => handleTopicToggle(topic, false)}
                                            >
                                                Not Interested
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <div className="settings-footer">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleSave} className="save-btn">Save</button>
                </div>
            </div>
        </div>
    )
}