/*
  Reservations are a REQUEST workflow (no booking system is connected).
  Set ONE of these once the details are confirmed:

  - reservationEndpoint: a form-service URL (for example a Formspree form URL).
    Requests are POSTed as JSON and arrive in the restaurant's inbox.
  - reservationEmail: the confirmed reservations email address.
    The visitor's own email app opens with the request ready to send.

  Leave both empty and the form runs in honest preview mode: it validates,
  then clearly tells the visitor that nothing was sent.
*/
export const CONFIG = {
  reservationEndpoint: '',
  reservationEmail: ''
};
