const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
console.log('getApps:', typeof getApps);
console.log('getFirestore:', typeof getFirestore);
