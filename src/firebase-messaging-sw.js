importScripts('https://www.gstatic.com/firebasejs/8.2.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.2/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyB9I-DhvMIkbMWAFmUR8-OU0V-5RAcDP9k",
  authDomain: "ponto-de-encontro-dev.firebaseapp.com",
  projectId: "ponto-de-encontro-dev",
  storageBucket: "ponto-de-encontro-dev.appspot.com",
  messagingSenderId: "685923780055",
  appId: "1:685923780055:web:af5051ffad09bb4b07f792",
  measurementId: "G-X160CVGKM7",
  databaseURL: "",
});

const messaging = firebase.messaging();