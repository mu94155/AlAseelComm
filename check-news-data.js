// Commands to check your news data in browser console

// 1. Check localStorage data
console.log('=== NEWS DATABASE ===');
const newsDB = localStorage.getItem('newsDatabase');
if (newsDB) {
    const parsed = JSON.parse(newsDB);
    console.log('Total news:', parsed.news.length);
    console.log('All news:', parsed.news);
    console.log('Latest news:', parsed.news[parsed.news.length - 1]);
} else {
    console.log('No news database found in localStorage');
}

// 2. Check backup data
console.log('\n=== BACKUP DATA ===');
const backup = localStorage.getItem('newsBackup');
if (backup) {
    console.log('Backup exists with', JSON.parse(backup).news.length, 'news items');
} else {
    console.log('No backup found');
}

// 3. Check todayNews array
console.log('\n=== TODAY NEWS ARRAY ===');
const todayArray = localStorage.getItem('todayNewsArray');
if (todayArray) {
    const parsed = JSON.parse(todayArray);
    console.log('TodayNews array has', parsed.length, 'items');
    console.log('Array:', parsed);
} else {
    console.log('No todayNews array found');
}

// 4. Show all localStorage keys related to news
console.log('\n=== ALL STORAGE KEYS ===');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('news') || key.includes('News')) {
        console.log(`Key: ${key}, Size: ${localStorage.getItem(key).length} characters`);
    }
}
