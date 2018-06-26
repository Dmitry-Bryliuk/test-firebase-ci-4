// use proxyquire to override firestore: https://github.com/balaji-b-v/firebase-mock-v3/blob/3ad3191bb55e42e2a198d95dcbf16a16e0cf3e9d/tutorials/proxyquire.md
// or make some switch in code to get firestore mock

const functions = require('firebase-functions');
const admin = require('firebase-admin');

var serviceAccount = require('./service-account-key-firebase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-ci-b56e8.firebaseio.com"
});

// firestore

exports.addMessageFirestore = functions.https.onRequest((req, res) => {
    const original = req.query.text;
    return admin.firestore().collection('messages').add({ original: original }).then((writeResult) => {
        return res.json({ result: `Message with ID: ${writeResult.id} added.` });
    });
});

exports.addMessageFirestoreCall = functions.https.onCall((data, context) => {
    return admin.firestore().collection('messages').add({ original: data.text }).then((writeResult) => {
        return { result: `Message with ID: ${writeResult.id} added.` };
    });
});

exports.makeUppercaseFirestore = functions.firestore.document('/messages/{documentId}')
    .onCreate((snap, context) => {
        const original = snap.data().original;
        console.log('Uppercasing', context.params.documentId, original);
        const uppercase = original.toUpperCase();
        return snap.ref.set({ uppercase }, { merge: true });
    });

exports.f_onWrite = functions.firestore
    .document('users/alovelace2').onWrite((change, context) => {
        console.log("onWrite:", change, context);
    });

exports.createUser = functions.firestore
    .document('users/{userId}')
    .onCreate((snap, context) => {
        console.log("onCreate:", snap, context);
        //const newValue = snap.data();
    });

// https://us-central1-test-ci-b56e8.cloudfunctions.net/addData

exports.addData = functions.https.onRequest((req, res) => {
    //const original = req.query.text;

    var db = admin.firestore();

    var docRef = db.collection('users').doc('alovelace2');

    var setAda = docRef.set({
        first: 'Ada',
        last: 'Lovelace',
        born: 1815
    });
    //console.log("setAda:", setAda);
    setAda.then(r => console.log("then:", r)).catch(e => { });

    var aTuringRef = db.collection('users').doc('aturing2');

    var setAlan = aTuringRef.set({
        'first': 'Alan',
        'middle': 'Mathison',
        'last': 'Turing',
        'born': 1912
    });
    //console.log("setAlan:", setAlan);
    setAlan.then(r => console.log("then:", r)).catch(e => { });

    //return res.redirect(303, "OK");
});
