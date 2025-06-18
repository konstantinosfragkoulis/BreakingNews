import LeftSidebar from './LeftSidebar'
import MainContent from './MainContent'
import RightSidebar from './RightSidebar'
import './App.css'
import { useNewsStore, useIpcNewsListener } from './useNewsStore'

function App() {
  useIpcNewsListener();
  const articles = useNewsStore((state) => state.articles);
  
  return (
    <>
      <h1 id="mainTitle">Breaking News</h1>
      <div className='layout'>
        <LeftSidebar articles={articles}/>
        <MainContent articles={articles}/>
        <RightSidebar articles={articles}/>
      </div>
    </>
  )
}

export default App
