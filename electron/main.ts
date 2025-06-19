import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parse } from 'rss-to-json'
import { Article } from '../src/ArticleCard'

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
  if(!title || !summary) {
    return -1;
  }
  return Math.random();
}

// function extractAllImages(item: any): string[] {
//   const images: { url: string; width: number }[] = [];

//   function addImage(obj: any) {
//     const url = obj?.url || obj?.$?.url;
//     const widthStr = obj?.width || obj?.$?.width;
//     if (url) {
//       const width = widthStr ? parseInt(widthStr, 10) : 0;
//       images.push({ url, width });
//     }
//   }

//   const mediaContent = item['media:content'] || item.image;
//   if(Array.isArray(mediaContent)) {
//     mediaContent.forEach(addImage);
//   } else if(mediaContent && typeof mediaContent === 'object') {
//     addImage(mediaContent);
//   }

//   if(item.enclosure) {
//     if(Array.isArray(item.enclosure)) {
//       item.enclosure.forEach(addImage);
//     } else if(typeof item.enclosure === 'object') {
//       addImage(item.enclosure);
//     }
//   }

//   const sortedImages = Array.from(new Map(images.map(img => [img.url, img])).values()).sort((a, b) => b.width - a.width);
//   return sortedImages.map(img => img.url);
// }

async function fetchAndRank() {
  console.log('Fetching and ranking news articles...');
  // const parser = new Parser({
  //   customFields: {
  //     item: [
  //       ['media:content', 'enclosure'],
  //       ['media:thumbnail', 'enclosure'],
  //     ],
  //   },
  // });
  // const feed = await parser.parseURL('https://www.theguardian.com/europe/rss');
  // const withScores = await Promise.all(
  //   feed.items.map(async (item) => ({
  //     title: item.title ?? '',
  //     image: extractAllImages(item) ?? '',
  //     summary: item.contentSnippet ?? '',
  //     link: item.link ?? '',
  //     variant: ['left', 'middle', 'right'][Math.floor(Math.random() * 3)],
  //     score: await callOllama(item.title ?? '', item.contentSnippet ?? ''),
  //   }))
  // );
  // withScores.sort((a, b) => b.score - a.score);
  // win?.webContents.send('news:update', withScores.slice(0, 20));
  
  var rss = await parse('https://www.theguardian.com/europe/rss');
  var articles: Article[] = [];
  for(let i = 0; i < rss.items.length; ++i) {
    var article: Article = {
      title: rss.items[i].title ?? '',
      summary: rss.items[i].description ?? '',
      link: rss.items[i].link ?? '',
      image: rss.items[i].enclosures[1] ?? '',
      variant: ['left', 'middle', 'right'][Math.floor(Math.random() * 3)],
      score: await callOllama(rss.items[i].title ?? '', rss.items[i].description ?? ''),
    }
    articles.push(article);
  }
  console.log(JSON.stringify(rss, null, 3));
  articles.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  win?.webContents.send('news:update', articles.slice(0, 20));
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
