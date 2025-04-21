// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCx9_7QArO1OX17PxrBTyzL8-PkX7N5qow',
  authDomain: 'web3-cc9c0.firebaseapp.com',
  projectId: 'web3-cc9c0',
  storageBucket: 'web3-cc9c0.appspot.com',
  messagingSenderId: '196692321880',
  appId: '1:196692321880:web:67860ddbeae062b43a4c2d'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
