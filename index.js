/* eslint-disable */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fs = require('fs');
const fetch = require('node-fetch');
const tf = require('@tensorflow/tfjs-node');

// Import required libraries from face-api.js
const faceapi=require('face-api.js');
// Use specific backend (e.g., 'tfjs-backend-webgl', 'tfjs-backend-cpu')
const { createCanvas, Image } = require('canvas');

// Initialize Firebase Admin SDK
admin.initializeApp();

exports.performFacialRecognitionOnCreate = functions.firestore.document('Access/{docId}').onCreate(async (snapshot, context) => {
  try {
    // Get the URL of the image file from 'picUrl' field in newly created document
    const picUrl = snapshot.data().picUrl;

    // Load models and weights for face detection and recognition using face-api.js
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk('./assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromDisk('./assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromDisk('./assets/models')
    ]);

    // Fetch image data from provided URL using node-fetch package
    const response = await fetch(picUrl);

	  // Convert downloaded image data into a Buffer using Buffer.from()
	  const imgBuffer = await response.buffer();


	  
    // Create an HTMLImageElement instance with canvas package's Image class 
    const imgElm = new Image();
	
	  // Set the source of the image to the saved JPEG file
	  imgElm.src = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
      
    const decodedImage = tf.node.decodeImage(new Uint8Array(fs.readFileSync('/tmp/image.jpg')));

    const resizedImage = tf.image.resizeBilinear(decodedImage, [imgElm.width, imgElm.height]);
    
    fs.unlinkSync('/tmp/image.jpg');
    
    // Perform facial detection on input image using face-api.js methods
  	const detectedFaces =
  	  await faceapi.detectAllFaces(resizedImage).withFaceLandmarks().withFaceDescriptors();

    if (detectedFaces.length === 0) {
      console.log('No faces detected in the input image.');
      await snapshot.ref.update({ CNIC: '1' ,status: "notFound" });
      // Update 'status' field of the newly created document to 'notFound'
      
      
      // Update 'status' field of the newly created document to 'notFound'
      
      
      return null;
    }

    console.log(`Found ${detectedFaces.length} face(s) in the input image.`);

    const dbCollectionRef = admin.firestore().collection('DB').where('type', '==', 'user');

    // Process each detected face and compare it with all documents in 'DB' collection
    for (const detectedFace of detectedFaces) {
      const querySnapshot = await dbCollectionRef.get();
      for (const docSnapshot of querySnapshot.docs) {
        const docData = docSnapshot.data();
        
        // Skip documents that don't have an 'imageLink' field or already matched.
        if (!docData.imageLink || docData.status === "found") continue;

        // Fetch stored image data from Firebase Storage URL specified by 'imageLink'
      	const response2 = await fetch(docData.imageLink);
    	
    	  // Convert downloaded existing image data into a Buffer using Buffer.from()
  	    const existingImgBuffer = await response2.buffer();
		  
    	  // Save downloaded existing image as JPEG file with fs.writeFile()
	      fs.writeFileSync('/tmp/existingImage.jpg', existingImgBuffer);

        const decodedExistingImage = tf.node.decodeImage(new Uint8Array(fs.readFileSync('/tmp/existingImage.jpg')));

        const resizedExistingImage = tf.image.resizeBilinear(decodedExistingImage, [imgElm.width, imgElm.height]);
        fs.unlinkSync('/tmp/existingImage.jpg');

        console.log('downloaded a photo!');
		    // Perform facial recognition on current detected face and existing image
		    const queryFaceDescriptor =
		      await faceapi.computeFaceDescriptor(resizedImage);
    		const results =
    		  await faceapi.detectSingleFace(resizedExistingImage).withFaceLandmarks().withFaceDescriptor();

  		  if (!results) continue;

		    // Compare the computed descriptor with the descriptors of each detected face in 'DB' collection
    		const distance = faceapi.euclideanDistance(queryFaceDescriptor, results.descriptor);

		    // If match found, update 'status' field of the newly created document to 'found'
    	  if (distance < 0.6) {
          console.log('Match found!');
          
          // Get the corresponding Uid from matched document in 'DB' collection
          const cnic = docData.CNIC;
          
          // Update 'status' field and store matched Uid in the newly created document.
          console.log(cnic);
          
    	    await snapshot.ref.update({ status: "found" ,CNIC: cnic});

          
    		  
    		  return null; // Stop further processing as a match is found.
    	  }
  	  }
  	}

    console.log('No matching faces found.');
    
    // Update 'status' field of the newly created document to 'notFound'
    await snapshot.ref.update({ status: "notFound" , CNIC: '1' });

	  return null;

  } catch (error) {
    console.error('Error during facial recognition:', error);

	  throw error;
  }
});