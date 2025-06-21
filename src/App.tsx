import LeftSidebar from './LeftSidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import './App.css'
import { useNewsStore, useIpcNewsListener } from './useNewsStore'

function App() {
    useIpcNewsListener();
    const articles = useNewsStore((state) => state.articles);
    const progress = useNewsStore((state) => state.progress);
    
    return (
        <>
        <h1 id="mainTitle">Breaking News</h1>
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
        </>
    )
}

export default App
