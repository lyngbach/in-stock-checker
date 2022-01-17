import cron from 'node-cron';
import App from './index.js';

const Cron = {
	
	async init () {
		console.log('cron job started runing site checker every 5th minute 10:05, 10:10, 10:15 etc.');

		// Run the check site functionality every 5th minute of the hour (10:05, 10:10, 10:15 etc)
		cron.schedule('*/5 * * * *', () => App.runSiteChecker());
	},

	async checkSite () {
		console.log('checkSite');
	}

};

export default Cron;