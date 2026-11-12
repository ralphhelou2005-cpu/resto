/*
  ÂTRE site settings. The only file the owner needs to touch to go live.

  Reservations are a REQUEST workflow (no booking system is connected).
  Pick ONE of the two options below once the details are confirmed:

  1) reservationEndpoint: a form service URL (for example a Formspree form URL).
     Requests are POSTed as JSON and arrive in the restaurant's inbox.
  2) reservationEmail: the confirmed reservations email address.
     The visitor's own email app opens with the request ready to send.

  Leave both empty and the form runs in honest preview mode: it validates,
  then clearly tells the visitor that nothing was sent.
*/
window.ATRE_CONFIG = {
  reservationEndpoint: '',
  reservationEmail: ''
};
