const {app, BrowserWindow, protocol} = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
	protocol.registerFileProtocol('kakinpos', (req, cb) => {
		const requestPath = req.url
			.replace(/^kakinpos:\/\/kakinpos\//, '')
			.replace(/\?.*/, '').replace(/\#.*/, '');

		if(requestPath === '') {
			cb(path.resolve(__dirname, 'dist', 'index.html'));
			return;
		}

		const fullUrl = path.resolve(__dirname, requestPath);
		cb(fullUrl);
	});

	mainWindow = new BrowserWindow({
		width: 1280,
		height: 900
	});
	mainWindow.setMenu(null);
	mainWindow.loadURL(`kakinpos://kakinpos/`);
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
});

app.on('window-all-closed', () => {
	app.quit()
});
