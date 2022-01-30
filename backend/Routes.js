import fs from 'fs';
import path from 'path';
import Notify from './Notify.js';
import config from '../config.json';

const __dirname = path.resolve();

const Routes = {

	async getPublicKey (request, response) {
		let existingSubscription = null;

		try {
			const fileData = fs.readFileSync(path.join(__dirname, 'subscription.json'));

			existingSubscription = JSON.parse(fileData);
		} catch (error) {
			console.log('no exisitng subscription');
		}

		response.json({
			vapidPublicKey: config.PUBLIC_VAPID_KEY,
			isSubscribed: existingSubscription ? true : false
		});
	},

	async subscribe (request, response) {
		const subscription = request.body;

		const isSubscribed = await Notify.setSubscription(subscription);

		if (isSubscribed) {
			await Notify.sendWebPush();

			fs.writeFileSync(path.join(__dirname, 'subscription.json'), JSON.stringify(subscription));
		}

		response.json({ isSubscribed: isSubscribed });
	}

};

export default Routes;
