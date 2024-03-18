/* eslint-disable @typescript-eslint/no-unused-vars */

import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBwdcaud7LvntMsbt0-ch2xfeO2vkN-Mk4',
  authDomain: 'mern-blogging-ts.firebaseapp.com',
  projectId: 'mern-blogging-ts',
  storageBucket: 'mern-blogging-ts.appspot.com',
  messagingSenderId: '852424740470',
  appId: '1:852424740470:web:c32b575bf6536339059957',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: 'select_account' });

export const authWithGoogleUsingPopUp = async () => {
  let user;

  await signInWithPopup(auth, googleProvider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};

export const authWithGoogleUsingRedirect = async () => {
  await signInWithRedirect(auth, googleProvider);
};
