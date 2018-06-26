// use proxyquire to override firestore: https://github.com/balaji-b-v/firebase-mock-v3/blob/3ad3191bb55e42e2a198d95dcbf16a16e0cf3e9d/tutorials/proxyquire.md
// or make some switch in code to get firestore mock

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// way to use firestore locally?
/*var serviceAccount = require('./service-account-key-firebase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-ci-b56e8.firebaseio.com"
});*/

// Initialize on Cloud Functions
admin.initializeApp(functions.config().firebase);

// original realtime db functions from sample: https://github.com/Firebase/functions-samples/tree/master/quickstarts/uppercase/functions/test/
// comments stripped

// use: https://us-central1-test-ci-b56e8.cloudfunctions.net/addMessage?text=zzz

exports.addMessage = functions.https.onRequest((req, res) => {
    const original = req.query.text;
    return admin.database().ref('/messages').push({ original: original }).then((snapshot) => {
        return res.redirect(303, snapshot.ref.toString());
    });
});

exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {
        const original = snapshot.val();
        console.log('Uppercasing', context.params.pushId, original);
        const uppercase = original.toUpperCase();
        return snapshot.ref.parent.child('uppercase').set(uppercase);
    });

// firestore functions

// https://us-central1-test-ci-b56e8.cloudfunctions.net/addMessageFirestore?text=zzz

exports.addMessageFirestore = functions.https.onRequest((req, res) => {
    const original = req.query.text;
    return admin.firestore().collection('messages').add({ original: original }).then((writeResult) => {
        return res.json({ result: `Message with ID: ${writeResult.id} added.` });
    });
});

// https://us-central1-test-ci-b56e8.cloudfunctions.net/addMessageFirestoreCall
// how to pass params?

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

    // it have to return something correct
    //return res.redirect(303, "OK");
});
