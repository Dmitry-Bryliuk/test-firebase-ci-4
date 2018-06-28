// test online firestore calls

const admin = require('firebase-admin');

// initialize to allow local firestore calls
var serviceAccount = require('../service-account-key-firebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "test-ci-b56e8",
  databaseURL: "https://test-ci-b56e8.firebaseio.com",
  storageBucket: "test-ci-b56e8.appspot.com"
});

function listSnapshot(snapshot, title) {
  !title || console.log(title);
  !snapshot || snapshot.forEach(doc => console.log(doc.id, '=>', doc.data()));
  console.log("<");
}

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

describe('Cloud Functions', () => {
  describe('test simple add message', () => {
    it('should add some message to online firestore', (done) => {
      admin.firestore().collection('messages').add({ original: "qqq" }).then((writeResult) => {
        console.log(`Message with ID: ${writeResult.id} added.`);
        done();
      });
    });
  });

  describe('test firestore operations', () => {
    it('should add and list firestore documents online', (done) => {
      const firestore = admin.firestore();
      const collection_name = "docs";
      firestore.collection(collection_name).doc("doc1").set({ name: "document 1" }).then(r => {
        console.log("set:", r);
        firestore.collection(collection_name).add({ name: "document 2" }).then(r => {
          console.log("add:", r.id, '=>', r.data);
          firestore.collection(collection_name).get().then(r => {
            //console.log(r);
            listSnapshot(r, "documents added via firestore mock:");
            // is there correct way to tell assertion failed without relying on timeout?
            // should remove "docs" from firestore manually or via api call before running this test
            assert.equal(r.size, 2);
            done();
          });
        });
      });
    })
  });
})
