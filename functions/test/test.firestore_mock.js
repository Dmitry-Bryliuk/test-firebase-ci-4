// offline testing using firestore mock: https://github.com/soumak77/firebase-mock
// also possible to use https://github.com/balaji-b-v/firebase-mock-v3
// how to use proxyquire to override firestore in functions: https://github.com/balaji-b-v/firebase-mock-v3/blob/3ad3191bb55e42e2a198d95dcbf16a16e0cf3e9d/tutorials/proxyquire.md

var firebase_mock = require('firebase-mock');
var firestore = new firebase_mock.MockFirestore();
var functions = require('firebase-functions');

const chai = require('chai');
const assert = chai.assert;

// use firestore.autoFlush() option or manual firestore.flush() to execute firestore operations
firestore.autoFlush();

function listSnapshot(snapshot, title) {
    !title || console.log(title);
    !snapshot || snapshot.forEach(doc => console.log(doc.id, '=>', doc.data()));
    console.log("<");
}

describe('Cloud Functions', () => {
    let myFunctions;

    before(() => {
        myFunctions = require('../index');
    });

    after(() => {
    });

    describe('test firestore operations', () => {
        it('should add and list firestore documents', (done) => {
            firestore.collection("users").doc("aaa").set({ name: "aaa" }).then(r => {
                console.log("set:", r);
                firestore.collection("users").add({ name: "bbb" }).then(r => {
                    console.log("add:", r.id, '=>', r.data);
                    firestore.collection("users").get().then(r => {
                        //console.log(r);
                        listSnapshot(r, "after:");
                        // is there correct way to tell assertion failed without relying on timeout?
                        assert.equal(r.size, 2);
                        done();
                    });
                });
            });
        })
    });

    describe('some other test', () => {
        it('should test something', (done) => {
            done();
        });
    });
})
