# in-stock-checker
A node cron script to check your favorite shopping sites if your desired items are back in stock.

![in_stock_checker](https://user-images.githubusercontent.com/3426543/151706408-8856644c-a435-4df8-a70b-d02e4dcf4d13.jpg)

It was about time for me to get a PlayStation 5 and it was nowhere in stock at reasonable prices at the more normal stores, or it was in stock at completely unreasonable prices at other sites. So heavily inspired by https://github.com/jaydlawrence/stock-checker, I decided to make a more simple approach in-stock-checker with an easy setup for both Windows and MacOS to search the sites for when the PS5 was back in stock at normal pricing. -I got it shortly after.


## Setup

The jaydlawrence repo was imo a bit complicated to setup with a lot of cron, external push and docker configuration. This approach should be a little easier to complete and only require Node.js and a Chrome browser (works in Edge and Firefox as well). You dont have to setup and configure Docker nor having any knowledge about cron services for this to work.

### Sites
Copy the `sites.example.json` and rename it to `sites.json`. Examples are provided by default, you can just change those and add more objects for the sites you need to check up on.

An object have the following properties:  
`url`: The url for the product page to check  
`xPath`: The xPath for the node to check up on (more on this below)  
`expected`: The expected text content value eg. "Out of stock" if this changes to something else you will be notified  
`description`: A text for you to recognize the product look up, and is used in the notifcation message  
`wait` [optional] Amount of seconds to wait when loading up a site. Used to wait for dynamic content loading sites


Example:

```json
[
    {
        "url": "",
        "xPath": "",
        "expected": "",
        "description": "",
        "wait": 5
    },
    {
        "url": "",
        "xPath": "",
        "expected": "",
        "description": ""
    }
]
```


#### xPath

In order to find the xPath value you right click the node element you want to check on eg. the "Temporarily out of stock." and select 'inspect'. Then in the developer console you right click once more on the node -> Copy -> Copy XPath like shown below:

![copy_xpath](https://user-images.githubusercontent.com/3426543/151709202-33298c39-f973-48e5-99a4-d57f5e145243.jpg)

Make sure when you paste the xPath into the `config.json` file to escape any extra `"` characters with an `\`.


### Config
Copy the `config.exmaple.json` and rename it to `config.json` and fill out the fields.

The config file consist of the following properties:
```json
{
    "NOTIFY_ON_MISSING_NODE": false,
    "CRON_MINUTE": "5",
    "EMAIL_HOST": "smtp.examplesite.com",
    "EMAIL_USER": "",
    "EMAIL_PASSWORD": "",
    "PUBLIC_VAPID_KEY": "",
    "PRIVATE_VAPID_KEY": ""
}
```

There are two methods of notifying you when an item changes status. Through an email or web push notifacations on your local browser.
First, start by installing the packages:

```
npm install
```
#### Email
This package uses nodemailer and it's optional. If you have access to an email service that can send emails through a smtp server, then you can add the smtp address as `EMAIL_HOST` and the email as `EMAIL_USER` and the password as `EMAIL_PASSWORD` into the `config.json` file.

#### Notifications
This does not require any external setup at all and only uses the local installed packages. Run the attached package.json command to get the VAPID keys needed:

```
npm run keys
```

This will give you a public and private VAPID key needed for the local push. Copy them into the properties `PUBLIC_VAPID_KEY` and `PRIVATE_VAPID_KEY` in the `config.json` file.

Next up there are two configurations left, `NOTIFY_ON_MISSING_NODE` and `CRON_MINUTE`. 

The `NOTIFY_ON_MISSING_NODE` will alert you through an email if the selected xPath node was not found by the underlying puppeteer module (the package the looks up the sites for you). This can happen if the site changes something in the future or weird dynamically changing sites.

The `CRON_MINUTE` is set by default to `5`. This is the configuration how often the checker will run. When setting it to `5` it will run every 5th minute of the hour (10:00, 10:05, 10:10 etc.). Right now for simplistic reasons you can only change the minute of the hour in the `config.json` file, however, if you want to dive deep into the cron setup you can easily do so in the `backend/Cron.js` file.

## Initalizing and testing web push

Now you are all set to run the program. Run the following command:
```
npm start
```
This will start the program and init the cron service and fire up a local server running at `http://localhost:4000`.

Open the site in a Chrome, Edge or Firefox browser (works best in Chrome), and press the subscribe button. This will create a local `subscription.json` file which is used for saving your local push credentials (instead of saving it to an eg. database). Make sure to allow the local push notifcation in the browser popup and if you received the push its working as expected.  
As long as you keep Chrome open you will receive a push notifcation if one of your sites `expected` properties changes and if you keep the localhost:4000 tab open it will show up in there as well in case you are away from the computer when it arived.

The web push technology in this program make use of the BroadcastChannel API which is not yet supported by Safari and therefor wont work just yet. According to [caniuse.com](https://caniuse.com/?search=BroadcastChannel) it seems to be coming to Safari soon.


## Supporting me
This program is completely free to use, however if you do want to donate some in appreciation, you can do so below through PayPal.

[<img src="https://user-images.githubusercontent.com/3426543/151721764-c0f6e217-cf2d-4b0a-bc41-5f3a4d290150.png" width="150">](https://www.paypal.com/donate/?business=HWEME2M45TR48&no_recurring=0&item_name=Thank+you+for+considering+supporting+me+and+my+endeavours.+This+help+me+keep+my+projects+alive+and+up+to+date.&currency_code=EUR)
