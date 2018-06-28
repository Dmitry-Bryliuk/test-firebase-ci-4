// test online firestore function calls

// take look at full sample: https://github.com/Firebase/functions-samples/tree/master/quickstarts/uppercase/functions/test/
// original article: https://firebase.google.com/docs/functions/unit-testing

const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');

const myFunctions = require('../index');

const admin = require('firebase-admin');

// Require and initialize firebase-functions-test in "online mode" with your project's
// credentials and service account key.
const projectConfig = {
  projectId: "test-ci-b56e8",
  databaseURL: "https://test-ci-b56e8.firebaseio.com",
  storageBucket: "test-ci-b56e8.appspot.com"
};
const test = require('firebase-functions-test')(projectConfig, './service-account-key-firebase.json');

function listSnapshot(snapshot, title) {
  !title || console.log(title);
  !snapshot || snapshot.forEach(doc => console.log(doc.id, '=>', doc.data()));
  console.log("<");
}

describe('Cloud Functions', () => {
  before(() => {
    // reset firestore data
    // not working. why?
    /*return admin.firestore().collection('users').get()
      .then((snapshot) => {
        console.log("delete snapshot:");
        snapshot.forEach((doc) => {
          console.log(doc.id, '=>', doc.data());
          doc.ref.delete();
        });
      });*/
  });

  describe('test simple function call', () => {
    it('should add some message to online firestore via function call', (done) => {
      const req = { query: { text: 'input' } };
      const res = {};
      myFunctions.addMessageFirestore(req, res);
      done();
    });
  });

  // you should remove "users" from firestore manually or via api call before running this test
  describe('test other function call', () => {
    it('should add some data to online firestore via function call', (done) => {
      // how to chain it with promises? otherwise test is unstable because of async db operations. or call it twice.
      myFunctions.addDataFirestore();

      const firestore = admin.firestore();
      const collection_name = "users";
      firestore.collection(collection_name).get().then(r => {
        listSnapshot(r, "documents added via firestore mock:");
        // is there correct way to tell assertion failed without relying on timeout?
        // should remove "users" from firestore manually or via api call before running this test
        assert.equal(r.size, 2);
        done();
      });
    });
  });
})
