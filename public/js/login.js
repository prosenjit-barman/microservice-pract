/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
    try { 
        const res = await axios({
            method: 'POST',
            url: 'http://localhost:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if(res.data.status === 'Success') {
            showAlert('success', "Logged In Succesfully✌!");
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

export const logout = async () => {
    try{
        const res = await axios({
            method: 'GET',
            url: 'http://localhost:3000/api/v1/users/logout',
        });
        
        if(res.data.status === 'Success') location.reload(true);

    } catch(err) {
        showAlert('error', 'Error Logging Out! Please Try Again.');
    }
}
