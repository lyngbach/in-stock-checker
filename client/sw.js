const broadcast = new BroadcastChannel('app');

self.addEventListener('push', (event) => {
	const data = event.data.json();
	const title = data.title.replace(/<[^>]*>?/gm, '');
	const body = data.body.replace(/<[^>]*>?/gm, '');

	// console.log('data ->', data);

	self.registration.showNotification(title , {
		body: body,

		// until the notificationclick event works as expected this is temporally out
		// actions: [
		// 	{
		// 		action: '/',
		// 		title: 'open localhost:4000'
		// 	}
		// ]
	});

	broadcast.postMessage(data);
});

self.addEventListener('notificationclick', (event) => {
	const uri = event.action;
	const notification = event.notification;

	notification.close();
	// clients.openWindow(`${self.location.origin}${uri}`);

	// currently not working properly
	event.waitUntil(clients.matchAll({
	    type: 'window'
	}).then((clientList) => {
		for (let i = 0; i < clientList.length; i++) {
			let client = clientList[i];
			
			if (client.url == '/' && 'focus' in client) {
				return client.focus();
			}
		}

		if (clients.openWindow) {
			return clients.openWindow('/');
		}
	}));
});
