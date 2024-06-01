/* eslint-disable */

const functions = require("firebase-functions");
const moment = require('moment-timezone');
const admin = require('firebase-admin');






admin.initializeApp();

exports.manageCompletionAndReminders = functions.pubsub
    .schedule("*/2 * * * *")
    .onRun( async (context) => {
      const currentTimestamp = admin.firestore.Timestamp.now();
      const dateFormatted = moment(currentTimestamp.toDate()).tz('Asia/Karachi').format('DD/MM/YYYY');
      functions.logger.info("info level in web console and gcp");
      console.log(dateFormatted);
      
      const now = new Date();
      const timestamp = admin.firestore.Timestamp.fromDate(now);
      try{

      const PatientSnapshot = await admin.firestore().collection('PatientHistory').where('VaccinationDate', '!=', '').get();
      const PatientDocs = PatientSnapshot.docs;
    
      PatientDocs.forEach((doc) => {
        const dateStr = doc.data().VaccinationDate;
        if (dateStr) {
         
          if (today === dateFormatted) {
            const message = {
              notification: {
                title: 'Pandemic Alert',
                body: 'You have a vaccination appointment today'
              },
              topic: 'PandemicAlerts'
            };
            promises.push(messaging.send(message));
          }}})

         } catch (e) {

               console.log(e.message);

         }







    admin.firestore()
    .collection("Bookings").where("Date", "==", dateFormatted)
    .where("Status","==","Upcoming")
    .get()
    .then(function(querySnapshot) {
           const promises = []; 
           

          

           querySnapshot.forEach(async doc => {
            functions.logger.info("info level in web console and gcp");

            const timestemp = doc.data().timeStamp;
            if(Date.now()>=timestemp){
              

               console.log(Date.now());
               console.log(timestemp);
               doc.ref.update({Status: "Completed"});
               
               const Name = doc.data().name;
               const PatientName = doc.data().PatientName;
               
               const userId = doc.data().Uid;
               const doctorUserId = doc.data().DoctorUid;

              
               const doctorUserDoc = await admin.firestore().collection('DB').doc(doctorUserId).get(); 
               const userDoc = await admin.firestore().collection('DB').doc(userId).get();

               const doctorTokenId = doctorUserDoc.data().deviceToken;  
               const tokenId = userDoc.data().deviceToken;  
              
                 
               const notificationContent = {
                 notification: {
                    title: "Reservation Completed.",
                    body: "Your Reservation for today with "+ Name+" has been marked as completed.",  
                    icon: "default",
                    sound : "default"
                 }
              };
              const doctorNotificationContent = {
                notification: {
                  title: "Reservation Completed.",
                  body: "Your Reservation for today with "+ PatientName+" has been marked as completed.",  
                   icon: "default",
                   sound : "default"
                }
             };

             const alertsRef = admin.firestore().collection('Alerts').doc();
             alertsRef.set({
                 alertType:'Booking-Complete',
                 Uid:doc.data().Uid,
                 DoctorUid:doc.data().DoctorUid,
                 createTime:timestamp,

                 
                 PatientName:doc.data().PatientName,
                 date:doc.data().Date,
                 time:doc.data().Time,
                 DoctorName:doc.data().name
             });
if(tokenId!=''){
              promises
              .push(admin.messaging().sendToDevice(tokenId, notificationContent)); 
}
if(doctorTokenId!=''){
              promises
              .push(admin.messaging().sendToDevice(doctorTokenId, doctorNotificationContent)); 
}
            }
            
            
            if(Date.now()<timestemp){
               console.log(Date.now());
               console.log(timestemp);
               console.log('kam hai');
            
               const Name = doc.data().name;
               const PateintName = doc.data().PatientName;
               
               const userId = doc.data().Uid;
               const doctorUserId = doc.data().DoctorUid;

              
               const doctorUserDoc = await admin.firestore().collection('DB').doc(doctorUserId).get(); 
               const userDoc = await admin.firestore().collection('DB').doc(userId).get();

               const doctorTokenId = doctorUserDoc.data().deviceToken;  
               const tokenId = userDoc.data().deviceToken;  
              
               const notificationContent = {
                 notification: {
                    title: "Booking Due",
                    body: "Your Reservation for today is due with "+ Name,  
                    icon: "default",
                    sound : "default"
                 }
              };

              const doctorNotificationContent = {
                notification: {
                   title: "Booking Due",
                   body: "Your Reservation for today is due with "+ PateintName,  
                   icon: "default",
                   sound : "default"
                }
             };

             const alertsRef = admin.firestore().collection('Alerts').doc();
             alertsRef.set({
                 alertType:'Booking-Reminder',
                 Uid:doc.data().Uid,
                 DoctorUid:doc.data().DoctorUid,
                 createTime:timestamp,

                 
                 PatientName:doc.data().PatientName,
                 date:doc.data().Date,
                 time:doc.data().Time,
                 DoctorName:doc.data().name
             });



              promises
              .push(admin.messaging().sendToDevice(tokenId, notificationContent)); 

              promises
              .push(admin.messaging().sendToDevice(doctorTokenId, doctorNotificationContent)); 
            
            
            
            
            
            }    
          });




          return Promise.all(promises);


       }).catch(error => {
        console.log(error);
        return null;
      });

      
    });