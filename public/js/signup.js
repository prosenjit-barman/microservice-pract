import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (name, email, password, passwordConfirm) => {
    try { 
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        if(res.data.status === 'Success') {
            console.log(res);
            showAlert('success', 'Succesfully Signed up! Logging You In...');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500
        ); //After logging in, A success message will appear and after 1.5 s, logged in user will be redirected to Hompage. 
    }
    } 
    catch(err) {
        showAlert('error', err.response.data.message);
    }
};