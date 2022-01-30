import Notify from './Notify.js';
import config from '../config.json';

const sleep = (wait) => {
	return new Promise((resolve) => setTimeout(resolve, wait * 1000));
}

const isMatch = (actual, expected) => {
	if (Array.isArray(expected)) {
		return expected.includes(actual);
	}
	
	return actual === expected;f
};

const checkSite = async (site, page) => {
	const { url, xPath, expected, wait = 1, description } = site;

	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36');
	await page.goto(url, { waitUntil: 'load' });
	await sleep(wait);

	try {
		
		const elHandle = await page.$x(xPath);
		const text = await page.evaluate((el) => el.textContent, elHandle[0]);
		const value = String(text).replace(/^\s+|\s+$/g, '');

		if (!isMatch(value, expected)) {
			console.log(`${description} was expecting "${expected}" but got "${value}" - Sending out an email notification!` );
			await Notify.sendEmail({ title: description, body: `Stock status changed from <b>${expected}</b> to <b>${value}</b>`, site: site, value: value });
			await Notify.sendWebPush({ title: description, body: `Stock status changed from <b>${expected}</b> to <b>${value}</b>`, site: site, value: value });
		} else {
			console.log(`no changes from: ${description} =>`, value);

			// Testing purpose
			// Comment these out if you want to test the notifcation out even though the expected xPath value hasent changed, in order to 
			// double check you're receiving the notifications - just dont forget to comment these out again :)

			// await Notify.sendEmail({ title: description, body: `Stock status changed from <b>${expected}</b> to <b>${value}</b>`, site: site, value: value });
			// await Notify.sendWebPush({ title: description, body: `Stock status changed from <b>${expected}</b> to <b>${value}</b>`, site: site, value: value });
		}

	} catch (error) {
		
		console.log(`${description} could not reach the specified xPath node`, error);

		if (config && config.NOTIFY_ON_MISSING_NODE) {
			await Notify.sendEmail({ site, message: `${description} could not reach the specified xPath node` });
		}

	}

	console.log('---------------------------------------------------------------------------------');
};

export { checkSite };
