# Woodward Athletic Performance website

Static site (HTML/CSS/JS, no build step) hosted free on GitHub Pages.

## Editing
- **Text:** `index.html`
- **Colours / fonts:** the variables at the top of `styles.css`
- **Booking link:** the `BOOKING_URL` line at the top of `script.js`

## Switching bookings to Google Calendar
1. Open Google Calendar on a computer, then **Create → Appointment schedule**.
2. Set the session length, your available hours and the booking form, then **Save**.
3. Open the schedule, click **Share**, and copy the **booking page link**.
4. Paste it into `BOOKING_URL` in `script.js` and commit. The site embeds it automatically.

Bookings then go straight into your Google Calendar. You get an email for each one and the client gets an invite.

## Custom domain (later)
Buy a domain, add a `CNAME` file containing it, and follow
https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
