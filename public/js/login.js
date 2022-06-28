/* eslint-disable */

const login = async (email, password) => {
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
            alert("Logged In Succesfully✌!");
            window.setTimeout(() => {
                location.assign('/');
            }, 1500
        ); //After logging in, A success message will appear and after 1.5 s, logged in user will be redirected to Hompage. 
    }
    } 
    catch(err) {
        alert(err.response.data.message);
    }
};

//Getting the username and password through event
document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value; //Value capturing from a field
    const password = document.getElementById('password').value; //Value capturing from a field
    login(email, password);
})