'use-strict'

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.firestore.document("Users/{user_id}/Notifications/{notification_id}").onWrite((change, context)=> {
	const user_id = context.params.user_id;
	const notification_id = context.params.notification_id;

	console.log("User ID: "+ user_id +"| Notification ID: " + notification_id);

	return admin.firestore().collection("Users").doc(user_id).collection("Notifications").doc(notification_id).get().then(queryResult => {
	const from_user_id = queryResult.data().from;
	const timeStamp = queryResult.data().timeStamp;
	const error = queryResult.data().error;

	const from_data = admin.firestore().collection("Users").doc(from_user_id).get();

	const to_data = admin.firestore().collection("Users").doc(user_id).get();

		return Promise.all([from_data, to_data]).then(result => {

			const from_name = result[0].data().name;
			const to_name = result[1].data().name;
			const token_id = result[1].data().token_id;
			console.log("From: "+ from_name +"| To: " + to_name + "|Error: " + error + "| TimeStamp: " + timeStamp);

			const payload = {
			notification :{
			    title: "Notification From " + from_name,
			    body: error,
			    icon: "default",
			    click_action: "com.example.devappforerrors.TARGETNOTIFICATION"
			  },

			data:  {
			      message : error,
			      from_name : from_name,
			      time_stamp : timeStamp
			 }
			};
			return admin.messaging().sendToDevice(token_id, payload).then(result => {
			  console.log("Notification Sent."); 
			  return true;
			});

		});
	});
});

