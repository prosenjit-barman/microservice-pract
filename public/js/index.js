import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

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
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        // const name = document.getElementById('name').value; //Value capturing from a field
        // const email = document.getElementById('email').value; //Value capturing from a field

        updateSettings(form, 'data');
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
        
    });

    if(bookBtn)
        bookBtn.addEventListener('click', e=> {

            e.target.textContent = 'Processing...';
            const {tourId} = e.target.dataset;
            bookTour(tourId);
        });