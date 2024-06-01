/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotificationOnBookingCreate = functions.firestore
  .document('Bookings/{bookingId}')
  .onCreate(async (snapshot, context) => {
    const bookingData = snapshot.data();
    const userId = bookingData.Uid;
    const doctorId = bookingData.DoctorUid;
    const now = new Date();
    const timestamp = admin.firestore.Timestamp.fromDate(now);

    // Retrieve the user document using the userId
    const userDoc = await admin.firestore().collection('DB').doc(userId).get();
    const userData = userDoc.data();


    const doctorUserDoc = await admin.firestore().collection('DB').doc(doctorId).get();
    const doctorUserData = doctorUserDoc.data();


    // Construct the notification message
    const message = {
      notification: {
        title: 'New Booking Created',
        body: `Booking ${snapshot.id} was created with ${bookingData.name}.`
      },
      token: userData.deviceToken
    };

    const doctorMessage = {
      notification: {
        title: 'New Booking Created',
        body: `Booking ${snapshot.id} was created with ${bookingData.PateintName}.`
      },
      token: doctorUserData.deviceToken
    };





    if(userData.deviceToken !=''){
      try{
     await admin.messaging().send(message);}catch(e){console.log(e);}
    }

    if(doctorUserData.deviceToken !=''){

      try{
     await admin.messaging().send(doctorMessage);}catch(e){console.log(e);}
    }








    const alertsRef = admin.firestore().collection('Alerts').doc();
                alertsRef.set({
                    alertType:'Booking-Create',
                    Uid:bookingData.Uid,
                    DoctorUid:bookingData.DoctorUid,
                    createTime:timestamp,

                    
                    PatientName:bookingData.PatientName,
                    date:bookingData.Date,
                    time:bookingData.Time,
                    DoctorName:bookingData.name
                });




  });
