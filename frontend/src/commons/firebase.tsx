/* eslint-disable @typescript-eslint/no-unused-vars */

import { initializeApp } from 'firebase/app';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
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

const provider = new GoogleAuthProvider();
// const provider = new GithubAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;

  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};
