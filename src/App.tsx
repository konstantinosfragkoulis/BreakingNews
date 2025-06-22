import LeftSidebar from './LeftSidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import Settings from './Settings'
import './App.css'
import { useNewsStore, useIpcNewsListener } from './useNewsStore'
import { useEffect, useState } from 'react'

function App() {
    useIpcNewsListener();
    const articles = useNewsStore((state) => state.articles);
    const progress = useNewsStore((state) => state.progress);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const handleOpenSettings = () => {
            setShowSettings(true);
        };

        window.ipcRenderer?.on('menu:open-settings', handleOpenSettings);

        return () => {
            window.ipcRenderer?.removeAllListeners('menu:open-settings');
        };
    }, []);
    
    return (
        <>
        <div className="app-header">
            <h1 id="mainTitle">Breaking News</h1>
        </div>

        {progress && progress.total > 0 ? (
            <div className="loading-container">
                <progress value={progress.current} max={progress.total} style={{ width: '50%' }}></progress>
                <p>Parsing articles... {Math.round((progress.current / progress.total) * 100)}%</p>
            </div>
        ) : (
            <div className='layout'>
                <LeftSidebar articles={articles}/>
                <MainContent articles={articles}/>
                <RightSidebar articles={articles}/>
            </div>
        )}

        {showSettings && (
            <Settings onClose={() => setShowSettings(false)} />
        )}
        </>
    )
}

export default App
