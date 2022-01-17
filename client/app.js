const App = {

	init: async () => {
		const subscribeBtn = document.getElementById('subscribeBtn');

		subscribeBtn.addEventListener('click', () => {
			App.triggerPushNotification().catch((error) => console.error(error));
		});

		App.getPublicKey();

		const broadcast = new BroadcastChannel('app');

		// Listen push notifcation response from service worker
		broadcast.onmessage = (event) => App.addNotification(event.data);
	},

	getPublicKey: async () => {
		const response = await fetch('/public_key', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});

		const data = await response.json();

		if (data.vapidPublicKey === '') {
			App.add('step1Text1', 'show');
		} else {
			App.vapidPublicKey = data.vapidPublicKey;

			App.add('step1', 'active');
			App.remove('step1Text1', 'show');
			App.add('step1Text2', 'show');
		}

		if (data.isSubscribed) {
			App.add('metroLine', 'fill');
			App.add('step2', 'active');
			App.add('step2Text1', 'show');
		}
	},

	triggerPushNotification: async () => {
		if ('serviceWorker' in navigator) {
			const register = await navigator.serviceWorker.register('/sw.js', {
				scope: '/'
			});

			await navigator.serviceWorker.ready;

			// unsubscribe exiting subscription if it exist
			// if you reseting the VAPID keys and you get an error in the console uncomment this and run it again
			// const pushSubscription = await register.pushManager.getSubscription();
			// console.log('pushSubscription', pushSubscription);
			// if (pushSubscription) {
			// 	pushSubscription.unsubscribe();
			// }

			if (!App.vapidPublicKey) {
				return console.warn('Missing VAPID public key');
			}

			const subscription = await register.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: App.vapidPublicKey
			});

			const response = await fetch('/subscribe', {
				method: 'POST',
				body: JSON.stringify(subscription),
				headers: {
					'Content-Type': 'application/json',
				}
			});

			const data = await response.json();

			if (data.isSubscribed) {
				App.add('metroLine', 'fill');
				App.add('step2', 'active');
				App.add('step2Text1', 'show');
			}
		} else {
			console.error('Service workers are not supported in this browser');
		}
	},

	add (targetId, className) {
		const element = document.getElementById(targetId);

		return element ? (className ? element.classList.add(className) : element.classList.add('show')) : null;
	},

	remove (targetId, className) {
		const element = document.getElementById(targetId);

		return element ? (className ? element.classList.remove(className) : element.classList.remove('show')) : null;
	},

	addZeroBefore (number) {
		return (number < 10 ? '0' : '') + number;
	},

	addNotification (data) {
		const notifications = document.getElementById('notifications');
		const date = new Date(data.created);
		const formattedDate = App.addZeroBefore(date.getHours()) + ':' + App.addZeroBefore(date.getMinutes());

		const notification = `
			<div class="notification shadow">
				<div class="line"></div>

				<div class="notificationContent">
					<h2 class="title">${data.title}</h2>
					<p class="body">${data.body}</p>
					<small class="time grey">${formattedDate}</small>
				</div>
			</div>
		`;

		const node = document.createElement('div');

		node.classList.add('notifcationWrapper');
		node.innerHTML = notification;

		notifications.appendChild(node);

		void node.offsetWidth;

		node.classList.add('show');
	}

}

App.init();
