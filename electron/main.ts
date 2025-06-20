import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parse } from 'rss-to-json'
import { Article } from '../src/ArticleCard'
import Parser from 'rss-parser'
import { callOllama } from './ollama'
import { saveScore, getScore, hashArticle, hashPreferences, getPreferencesHash } from './cache'
import { setUserInterest, setUserNotInterests, getUserInterests, getUserNotInterests } from './UserPreferences'

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

async function fetchAndRank() {
  console.log('Fetching and ranking news articles...');
  var fromCache = 0;
  const currentPreferencesHash = hashPreferences(getUserInterests(), getUserNotInterests());

  try {
    var rss = await parse('https://www.theguardian.com/europe/rss');
    const parser = new Parser();
    var _rss = await parser.parseURL('https://www.theguardian.com/europe/rss');
    var articles: Article[] = [];
    const totalArticles = rss.items.length;
    win?.webContents.send('news:progress', { current: 0, total: totalArticles });

    for(let i = 0; i < totalArticles; ++i) {
        const articleTitle = _rss.items[i]?.title ?? '';
        const articleSummary = _rss.items[i]?.contentSnippet?.replace(/Continue reading\.\.\..*$/, '').trim() ?? '';
        const articleLink = _rss.items[i]?.link ?? '';
        const articleDate = _rss.items[i]?.pubDate ?? '';
        const articleHash = hashArticle(articleTitle);

        var imageUrl = '';
        var imageWidth = 0;
        // console.log(rss.items[i].enclosures);
        if(Array.isArray(rss.items[i].enclosures?.[0])) {
            for(const enc of rss.items[i].enclosures[0]) {
                const width = parseInt(enc.width, 10);
                if(width > imageWidth) {
                    imageWidth = width;
                    imageUrl = enc.url;
                }
            }
        }

        let score = await getScore(articleHash);
        const cachedPreferencesHash = getPreferencesHash(articleHash);
        if(score === null || cachedPreferencesHash !== currentPreferencesHash) {
            score = await callOllama(articleTitle, articleSummary, articleDate);
            await saveScore(articleHash, score, articleDate);
        } else {
            fromCache++;
        }

        var article: Article = {
            title: articleTitle,
            summary: articleSummary,
            link: articleLink,
            image: imageUrl,
            variant: ['left', 'middle', 'right'][Math.floor(Math.random() * 3)],
            score: score,
        };

        articles.push(article);
        win?.webContents.send('news:progress', { current: i + 1, total: totalArticles });
        // console.log(article);
    }

    console.log("Parsed", articles.length, "articles");
    console.log(fromCache, "were from cache")
    articles.sort((a, b) => b.score - a.score);
    win?.webContents.send('news:update', articles.slice(0, 20));
    // console.log(articles.slice(0, 20));
  } catch(e) {
    console.error("Error fetching and ranking aticles: ", e);
    win?.webContents.send('news:update', []);
  }
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

    // TODO: UI to select interests
    // TODO: Save user interests to config file
    setUserInterest(['war', 'politics', 'europe', 'us', 'russia', 'ukraine', 'middle_east', 'violence', 'disasters']);
    setUserNotInterests(['science', 'technology', 'business_finance', 'health_medical', 'environment_climate', 'sports', 'entertainment_culture', 'education', 'crime_justice', 'lifestyle_fashion']);

    // fetchAndRank()
    setInterval(fetchAndRank, 1000 * 60 * 5);

    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
        fetchAndRank()
    });
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
