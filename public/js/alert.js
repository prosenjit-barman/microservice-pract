
export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if(el) el.parentElement.removeChild(el);
}
//Type is either success or error
export const showAlert = (type, msg) => {
    hideAlert();

    const marKup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', marKup);

    window.setTimeout(hideAlert, 5000);
}