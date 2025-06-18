import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Parser from 'rss-parser'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

async function callOllama(title: string, summary: string): Promise<number> {
  // console.log(`Calling Ollama with title: ${title} and summary: ${summary}`);
  return Math.random();
}

async function fetchAndRank() {
  console.log('Fetching and ranking news articles...');
  const parser = new Parser({
    customFields: {
      item: [
        ['media:content', 'enclosure'],
      ],
    },
  });
  const feed = await parser.parseURL('https://www.theguardian.com/europe/rss');
  const withScores = await Promise.all(
    feed.items.map(async (item) => ({
      title: item.title ?? '',
      image: item['media:content']?.$?.url ?? '',
      summary: item.contentSnippet ?? '',
      link: item.link ?? '',
      variant: ['left', 'middle', 'right'][Math.floor(Math.random() * 3)],
      score: await callOllama(item.title ?? '', item.contentSnippet ?? ''),
    }))
  );
  withScores.sort((a, b) => b.score - a.score);
  // console.log('Fetched and ranked articles:', withScores.slice(0, 20));
  win?.webContents.send('news:update', withScores.slice(0, 20));
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  fetchAndRank()
  setInterval(fetchAndRank, 1000 * 60 * 5);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.setName("Breaking News")
app.whenReady().then(createWindow)
