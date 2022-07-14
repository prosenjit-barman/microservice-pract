/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe('pk_test_51LKxi5CslBonPL9AizoK4rS0LnChhjnMsFVShbI4YxeF10A0P3OoZ1p7TjX4gEompobN8ADJceyQLdcx6fCjgxFa00nGq1cmer');

export const bookTour = async tourId => {

    try{
        // Get the Session from the Server
        const session = await axios(`http://localhost:3000/api/v1/booking/checkout-session/${tourId}`);

        // create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });

        console.log(session)

    } catch(err) {
        console.log(err);
        showAlert('error', err);
    }

};