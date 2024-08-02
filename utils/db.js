const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/contacts');



// // Buat 1 data object
// const contact1 = new Contact({
//   nama: 'Dodi',
//   nohp: '082856712345',
//   email: 'dodot@gmail.com',
// });

// // Simpan ke collection
// contact1.save().then((contact) => console.log(contact));
