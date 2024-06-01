/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNotificationOnAccessed = functions.firestore
  .document('Access/{AccessId}')
  .onCreate(async (snapshot, context) => {
    const accessData = snapshot.data();
    const now = new Date();
    const timestamp = admin.firestore.Timestamp.fromDate(now);
    if(accessData.type == 'access'){
    const cnic = accessData.CNIC;
    const doctorId = accessData.Uid;

    // Retrieve the user document using the userId
  
   
   

    const doctorUserDoc = await admin.firestore().collection('DB').doc(doctorId).get();
    const doctorUserData = doctorUserDoc.data();


    const adminQuerySnapshot = await admin.firestore().collection('DB').where('type', '==', 'admin').get();
    const adminData=adminQuerySnapshot.docs[0].data();

   

    const querySnapshot = await admin.firestore().collection('DB').where('CNIC', '==', cnic).where('type', '==', 'user').get();
    const userData= querySnapshot.docs[0].data();

   


    // Construct the notification message
    const message = {
      notification: {
        title: 'Patient History Accesed',
        body: `Your Patient History was accessed by Dr,`+doctorUserData.Name+" for emergency purposes. Kindly Apeal if the data was accessed falsely."
      },
      token: userData.deviceToken
    };

    const doctorMessage = {
      notification: {
        title: 'Patient History Accesed',
        body: `You have accessed Patient History of ,`+userData.Name+" for emergency purposes. It will be notified to the admin and the patient!"
      },
      token: doctorUserData.deviceToken
    };


    const adminMessage = {
      notification: {
        title: 'Patient History Accessed.',
        body: ' Patient History of '+userData.Name+' | '+userData.CNIC +' was accessed by Dr,'+doctorUserData.Name+' for emergency purposes.'
      },
      token: adminData.deviceToken
    };



    // Send the notification

    if(userData.deviceToken !=''){
      try{
     await admin.messaging().send(message);}catch(e){console.log(e);}
    }

    if(adminData.deviceToken !=''){

      try{
     await admin.messaging().send(adminMessage);}catch(e){console.log(e);}
    }

    if(doctorUserData.deviceToken !=''){
      try{
      await admin.messaging().send(doctorMessage);}catch(e){console.log(e);}
     }
   
      console.log(userData.Name);

    const currentDate = new Date();
    const date = currentDate.toLocaleDateString(); // gets the current date in the format "MM/DD/YYYY"
    const time = currentDate.toLocaleTimeString();




    const alertsRef = admin.firestore().collection('Alerts').doc();
                alertsRef.set({
                    alertType:'Access',
                    Uid:userData.Uid,
                    DoctorUid:doctorUserData.Uid,
                    PatientName:userData.Name,
                    date:date,
                    time:time,
                    DoctorName:doctorUserData.Name,
                    createTime:timestamp, 
                });

                  
                const adminAlertsRef = admin.firestore().collection('AdminAlerts').doc();
                adminAlertsRef.set({
                    alertType:'Access',
                    Uid:userData.Uid,
                    DoctorUid:doctorUserData.Uid,
                    PatientName:userData.Name,
                    date:date,
                    time:time,
                    DoctorName:doctorUserData.Name,
                    createTime:timestamp, 
                });

               }
               if(accessData.type=='apeal'){





                  const doctorId = accessData.DoctorUid;
                  const Uid = accessData.Uid;
              
                  // Retrieve the user document using the userId
                 
                 
              
                  const doctorUserDoc = await admin.firestore().collection('DB').doc(doctorId).get();
                  const doctorUserData = doctorUserDoc.data();
              
              
                  const adminQuerySnapshot = await admin.firestore().collection('DB').where('type', '==', 'admin').get();
                  const adminData=adminQuerySnapshot.docs[0].data();
              
                 
              
                  const UserDoc = await admin.firestore().collection('DB').doc(Uid).get();
                  const userData = UserDoc.data();
              
                 
              
              
                  // Construct the notification message
                 
              
                  const doctorMessage = {
                    notification: {
                      title: 'Patient History Accesed',
                      body: `Your access to Patient History of ,`+userData.Name+" for emergency purposes was apealed by the Patient. You will be contacted by Admin Office Soon."
                    },
                    token: doctorUserData.deviceToken
                  };
              
              
                  const adminMessage = {
                    notification: {
                      title: 'Patient Apeal Against Patient History Access.',
                      body: ' Patient '+userData.Name+' | '+userData.CNIC +' has appealed against patient history Access that was accessed falsely by Dr,'+doctorUserData.Name+' for emergency purposes.'
                    },
                    token: adminData.deviceToken
                  };
                  const message = {
                     
                     notification: {
                       title: 'Patient History Accesed',
                       body: `Your have apealed against Patient History access by Dr,`+doctorUserData.Name+" for emergency purposes. You will be contacted by Admin Office Soon."
                     },
                     token: userData.deviceToken
                   };
              
              
              
                  // Send the notification
              
                  if(userData.deviceToken !=''){
                    try{
                   await admin.messaging().send(message);}catch(e){console.log(e);}
                  }
              
                  if(adminData.deviceToken !=''){
              
                    try{
                   await admin.messaging().send(adminMessage);}catch(e){console.log(e);}
                  }
              
                  if(doctorUserData.deviceToken !=''){
                    try{
                    await admin.messaging().send(doctorMessage);}catch(e){console.log(e);}
                   }
                 
                    console.log(userData.Name);
              
                  const currentDate = new Date();
                  const date = currentDate.toLocaleDateString(); // gets the current date in the format "MM/DD/YYYY"
                  const time = currentDate.toLocaleTimeString();
              
              
              
              
                  const alertsRef = admin.firestore().collection('Alerts').doc();
                              alertsRef.set({
                                  alertType:'Apeal',
                                  Uid:userData.Uid,
                                  DoctorUid:doctorUserData.Uid,
                                  PatientName:userData.Name,
                                  date:date,
                                  time:time,
                                  DoctorName:doctorUserData.Name,
                                  createTime:timestamp, 
                              });
              
                                
                              const adminAlertsRef = admin.firestore().collection('AdminAlerts').doc();
                              adminAlertsRef.set({
                                  alertType:'Apeal',
                                  Uid:userData.Uid,
                                  DoctorUid:doctorUserData.Uid,
                                  PatientName:userData.Name,
                                  date:date,
                                  time:time,
                                  DoctorName:doctorUserData.Name,
                                  createTime:timestamp, 
                              });












               }

  });
