import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

// DELEGATION
if(mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if(loginForm){
//Getting the username and password through event
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    // VALUES
    const email = document.getElementById('email').value; //Value capturing from a field
    const password = document.getElementById('password').value; //Value capturing from a field
    login(email, password);
});
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);
