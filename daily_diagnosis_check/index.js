/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment-timezone');
admin.initializeApp();

exports.dailyDiagnosisCheck = functions.pubsub.schedule('59 23 * * *').onRun(async (context) => {
  const topic = 'PandemicAlerts';
  const currentTimestamp = admin.firestore.Timestamp.now();
  const dateFormatted = moment(currentTimestamp.toDate()).tz('Asia/Karachi').format('DD/MM/YYYY');
  functions.logger.info("info level in web console and gcp");
  console.log(dateFormatted);
  
  const now = new Date();
  const timestamp = admin.firestore.Timestamp.fromDate(now);

  try {
    // Get all documents in the 'PatientHistory' collection
    const querySnapshot = await admin.firestore().collection('Bookings').where('Date', '==', dateFormatted).get();
    if (querySnapshot.empty) {
      console.log('No bookings found for the current date.');
      return null;
    }
  
    const symptomCounts = new Map();
    let totalDocuments = 0;
  
    querySnapshot.forEach((doc) => {
      const symptoms = doc.get('Syptoms');
  
      if (symptoms && Array.isArray(symptoms)) {
        symptoms.forEach((symptom) => {
          const count = symptomCounts.get(symptom) || 0;
          symptomCounts.set(symptom, count + 1);
        });
      }
  
      totalDocuments++;
    });
  
    const notifications = [];
  
    symptomCounts.forEach((count, symptom) => {
      if (count > totalDocuments / 2) {
        notifications.push(symptom);
      }
    });
  
    if (notifications.length > 0) {
      const notificationMessage = `The following symptoms occurred the most in your area: ${notifications.join(', ')}.`;
      

const notification = {
  notification: {
    title: 'Pandemic Alert',
    body:notificationMessage ,
  },
  topic: topic,
};
await admin.messaging().send(notification);
      console.log(notificationMessage);
      // Send the notification using your preferred notification service (e.g., Firebase Cloud Messaging, email, etc.)
    } else {
      console.log('No symptoms occurred more than 50% of the time in your area.');
    }
  
    return null;
  
  } catch (error) {
    console.error('Error checking symptoms:', error);
  }
});

  
  