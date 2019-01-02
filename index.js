const { google } = require('googleapis');

const sheets = google.sheets({
  version: 'v4',
  auth: ''
});

sheets.spreadsheets.values.get(
  {
    spreadsheetId: '',
    range: 'data'
  },
  (err, result) => {
    if (err) {
      // Handle error
      console.log(err);
    } else {
      console.log(result.data.values);
    }
  }
);
