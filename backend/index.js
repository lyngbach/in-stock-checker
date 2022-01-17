import path from 'path';
import express from 'express';
import puppeteer from 'puppeteer';
import sites from '../sites.json';
import { checkSite } from './checkSite.js';
import Cron from './Cron.js';
import Routes from './Routes.js';
import Notify from './Notify.js';

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

app.get('/public_key', Routes.getPublicKey);
app.post('/subscribe', Routes.subscribe);
app.post('/resubscribe', Routes.resubscribe);

const InStockChecker = {

	async init () {
		// this.runSiteChecker();
		this.startServer();

		Notify.init();
		Cron.init();

		// testing purpose
		// setTimeout(() => {
		// 	console.log('running send push test');

		// 	Notify.sendWebPush({ title: 'This is a new title', body: 'Item stock has changed!' })
		// }, 4000);

		// Notify.sendEmail({ title: "description text here", body: `Stock status changed from <b>expected</b> to <b>value</b>`, site: {
		// 	"url": "https://www.elgiganten.dk/product/gaming/spillekonsol/playstation/playstation-spillekonsol/playstation-5-2021/345097",
		// 	"xPath": "//*[@id=\"buy-box\"]/div[1]/ul/li/elk-product-presale/div/span",
		// 	"expected": "Releasedato ukendt",
		// 	"description": "Elgiganten - PlayStation 5 (2021)"
		// }});
	},

	async runSiteChecker () {
		console.log('runSiteChecker');

		let launchOptions = {
			headless: true,
			args: ['--no-sandbox'],
			defaultViewport: {
				width: 1400,
				height: 1400
			}
		};

		const browser = await puppeteer.launch(launchOptions);
		const page = await browser.newPage();

		try {
			for (let index = 0; index < sites.length; index += 1) {
				
				// making it wait for each loop on purpose to let previous chrome tab finish
				console.log('checking site:', sites[index].url);
				await checkSite(sites[index], page);
			}
		} finally {
			
			// close the browser
			await browser.close();
		}
	},

	async startServer () {
		const server = app.listen(4000, () => console.log(`Server running on port 4000. You can open http://localhost:4000`));
	}

};

InStockChecker.init();

export default InStockChecker;
