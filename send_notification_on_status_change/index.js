/* eslint-disable */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.sendNotificationOnStatusChange = functions.firestore
    .document('Bookings/{docId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();
        const now = new Date();
        const timestamp = admin.firestore.Timestamp.fromDate(now);
        
       
        const statusChanged = newValue.Status !== previousValue.Status;

        if (statusChanged) {
            const userId = newValue.Uid; // Assuming the document has a "UId" field
            const doctorUserId = newValue.DoctorUid;
            const userDoc = await admin.firestore().collection('DB').doc(userId).get();
            const doctorUserDoc = await admin.firestore().collection('DB').doc(doctorUserId).get(); 

            // Assuming the users are stored in a "users" collection
            const doctorTokenId = doctorUserDoc.data().deviceToken;  
            const tokenId = userDoc.data().deviceToken;  
           
                const message = `Dear ${newValue.name}, Your Booking at ${newValue.Date} | ${newValue.Time} with ${newValue.PatientName} has been ${newValue.Status}. Kindly contact phcs.com for querries.`;
                const doctorMessage = `Dear ${newValue.PatientName}, Your Booking at ${newValue.Date} | ${newValue.Time} with ${newValue.name} has been ${newValue.Status}. Kindly contact phcs.com for querries.`;
                const payload = {
                    notification: {
                        title: 'Booking Status '+newValue.Status,
                        body: message,
                       
                    },
                    token: tokenId
                };

                const dotorPayload = {
                    notification: {
                        title: 'Booking Status'+newValue.Status,
                        body: doctorMessage,
                       
                    },
                    token: doctorTokenId

                };




                if(doctorTokenId!=''){await admin.messaging().send( dotorPayload);}
                 
                 await admin.messaging().send( payload);
                
                const alertsRef = admin.firestore().collection('Alerts').doc();
                alertsRef.set({
                    alertType:'Booking-Canceled',
                    Uid:newValue.Uid,
                    DoctorUid:newValue.DoctorUid,
                    createTime:timestamp,

                    
                    PatientName:newValue.PatientName,
                    date:newValue.Date,
                    time:newValue.Time,
                    DoctorName:newValue.name,
                    
                });
               

        } else {
            return null;
        }
    });
