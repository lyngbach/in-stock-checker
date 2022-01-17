import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import webpush from 'web-push';
import config from '../config.json';

const transporter = nodemailer.createTransport({
	host: config.EMAIL_HOST,
	port: 587,
	secure: false,
	auth: {
		user: config.EMAIL_USER,
		pass: config.EMAIL_PASSWORD
	}
});



const Notify = {

	init () {
		try {
			webpush.setVapidDetails('mailto:' + config.EMAIL_USER, config.PUBLIC_VAPID_KEY, config.PRIVATE_VAPID_KEY);
		} catch (error) {
			console.log('missing PUBLIC_VAPID_KEY and PRIVATE_VAPID_KEY');
		}
	},

	setSubscription (subscription) {
		Notify.subscription = subscription;

		const isSubscribed = Notify.subscription ? true : false;

		return isSubscribed;
	},

	async sendEmail (data) {
		let mailResult;

		if (config.EMAIL_HOST === '' || config.EMAIL_USER === '' || config.EMAIL_PASSWORD === '') {
			return console.log('Not sending out any emails - Missing email configuration');
		}

		let mailOptions = {
			from: 'In Stock Checker <' + config.EMAIL_USER + '>', // sender address
			to: config.EMAIL_USER,
			subject: 'Notification about stock change on - ' + data.site.description
		};

		mailOptions.html = `
			<div style="background-color: #eef1f4; color: #444444; padding: 72px;">
				<div style="width: 800px; max-width: 100%; border-radius: 4px; margin: auto; background-color: #ffffff; font-size: 16px; font-family: Arial, Helvetica, sans-serif; padding: 24px;">
					<h2><span style="color: #33aaea;">In Stock</span> Checker Notifcation</h2>
					<p style="margin-top: 0; margin-bottom: 16px;">
						You received this email because you subscribed to In Stock Checker and the following item have changed stock status:
					</p>
					<p style="margin-top: 0; margin-bottom: 16px;">
						The site description <b>${data.site.description}</b> with the expected status <b>${data.site.expected}</b> have now changed to <b>${data.value}</b>.
					</p>
					<p style="margin-top: 0; margin-bottom: 16px;">
						Site link: <a href="${data.site.url}" target="_blank">${data.site.url}</a>
					</p>
				</div>
			</div>
		`;

		try {
			mailResult = await transporter.sendMail(mailOptions);

			console.info('Notify email successfully sent to:', config.EMAIL_USER);
		} catch (error) {
			console.log('Error sending out to email:', error);
		}

		return mailResult;
	},

	async sendWebPush (data = {}) {
		const payload = JSON.stringify({
			title: data.title ? data.title : 'In Stock Checker push test',
			body: data.body ? data.body : 'Push notification <b>works</b>! Your notifcations will also be shown here in case you were AFK and missed it.',
			created: new Date().toISOString()
		});

		let webPushResult = null;

		if (!Notify.subscription) {
			try {
				const fileData = fs.readFileSync(path.join(path.resolve(), '/subscription.json'));
				Notify.subscription = JSON.parse(fileData);
			} catch (error) {
				console.log('error reading subscription.json file =>', error);
			}
		}

		try {
			webPushResult = await webpush.sendNotification(Notify.subscription, payload);
			console.log('webPushResult sent out');
		} catch (error) {
			console.log('error sending out web push =>', error);
		}

		return webPushResult;
	}

};

export default Notify;
