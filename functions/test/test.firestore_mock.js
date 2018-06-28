// offline testing using firestore mock: https://github.com/soumak77/firebase-mock
// also possible to use https://github.com/balaji-b-v/firebase-mock-v3
// how to use proxyquire to override firestore in functions: https://github.com/balaji-b-v/firebase-mock-v3/blob/3ad3191bb55e42e2a198d95dcbf16a16e0cf3e9d/tutorials/proxyquire.md

var firebase_mock = require('firebase-mock');
var firestore = new firebase_mock.MockFirestore();
var functions = require('firebase-functions');

const chai = require('chai');
const assert = chai.assert;

// use firestore.autoFlush() option or call manually firestore.flush() to execute firestore operations
firestore.autoFlush();

function listSnapshot(snapshot, title) {
    !title || console.log(title);
    !snapshot || snapshot.forEach(doc => console.log(doc.id, '=>', doc.data()));
    console.log("<");
}

// override firestore for our functions
var proxyquire = require('proxyquire');
var myFunctions = proxyquire('../index', {
    "firebase-admin": {
        credential: { cert() { } },
        initializeApp() { },
        firestore: () => firestore
    }
});

describe('Cloud Functions', () => {
    //let myFunctions;

    before(() => {
        //myFunctions = require('../index');
    });

    after(() => {
    });

    describe('test mock firestore operations', () => {
        it('should add and list firestore documents via mock', (done) => {
            const collection_name = "docs";
            firestore.collection(collection_name).doc("doc1").set({ name: "document 1" }).then(r => {
                console.log("set:", r);
                firestore.collection(collection_name).add({ name: "document 2" }).then(r => {
                    console.log("add:", r.id, '=>', r.data);
                    firestore.collection(collection_name).get().then(r => {
                        //console.log(r);
                        listSnapshot(r, "documents added via firestore mock:");
                        // is there correct way to tell assertion failed without relying on timeout?
                        assert.equal(r.size, 2);
                        done();
                    });
                });
            });
        })
    });

    describe('test addData function with mock', () => {
        it('should add users via function call into firestore mock', (done) => {
            // how to chain it with promises?
            myFunctions.addData();

            const collection_name = "users";

            // check data is really placed into mock
            firestore.collection(collection_name).get().then(r => {
                listSnapshot(r, "users added via function call:");
                assert.equal(r.size, 2);
                done();
            });
        });
    });
})
