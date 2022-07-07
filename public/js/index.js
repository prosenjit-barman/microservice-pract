import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

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

if(userDataForm)
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value; //Value capturing from a field
        const email = document.getElementById('email').value; //Value capturing from a field

        updateSettings({name, email}, 'data');
    });
    
    if(userPasswordForm)
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...'

        const passwordCurrent = document.getElementById('password-current').value; //Value capturing from a field
        const password = document.getElementById('password').value; //Value capturing from a field
        const passwordConfirm = document.getElementById('password-confirm').value; //Value capturing from a field
        
        await updateSettings({passwordCurrent, password, passwordConfirm}, 'password');

        document.querySelector('.btn--save-password').textContent = 'Save Password'
        document.getElementById('password-current').value = ''; //Value set as null
        document.getElementById('password').value = ''; //Value set as null
        document.getElementById('password-confirm').value = ''; //Value set as null
        
    })