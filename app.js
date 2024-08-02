const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check, Result } = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Contact = require('./model/contact');

const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Mongo Contact App | Listening at http://localhost:${port}`);
});

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Flash
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// Halaman Home
app.get('/', (req, res) => {
  const mahasiswa = [];
  res.render('index', { nama: 'Gustin Rheza', title: 'Halaman Home', mahasiswa, layout: 'layouts/main-layout' });
});

// Halaman About
app.get('/about', (req, res) => {
  res.render('about', { layout: 'layouts/main-layout', title: 'Halaman About' });
});

// Halaman contact
app.get('/contact', async (req, res) => {
  //   const contacts = Contact.find().then((result) => {
  //     res.send(result);
  //   });

  const contacts = await Contact.find();
  res.render('contact', { layout: 'layouts/main-layout', title: 'Halaman Contact', contacts, msg: req.flash('msg') });
});

// Halaman Form Tambah Data Kontak
app.get('/contact/add', (req, res) => {
  res.render('add-contact', {
    layout: 'layouts/main-layout',
    title: 'Form Tambah Data Contact',
  });
});

// Proses Tambah Data Contact
app.post(
  '/contact',
  [
    // check('email').isEmail().withMessage('Emailnya kaga bener njir')
    check('email', 'Emailnya kaga bener njir').isEmail(),
    check('nohp', 'Bukan nomor Indonesia inimah').isMobilePhone('id-ID'),
    body('nama').custom(async (value) => {
      const duplicate = await Contact.findOne({ nama: value });
      if (duplicate) {
        throw new Error('Nama contact sudah digunakan');
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body).then((result) => {
        // Kirimkan pesan flash
        req.flash('msg', 'Data kontak berhasil ditambahkan');
        res.redirect('/contact');
      });
    }
  }
);

// Process Delete Contact
app.get('/contact/delete/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  // Jika contact tidak ada
  if (!contact) {
    res.status(404);
    res.send('<h1>404</h1>');
  } else {
    Contact.deleteOne({ _id: contact._id }).then((result) => {
      req.flash('msg', 'Data kontak berhasil dihapus');
      res.redirect('/contact');
    });
  }
});

// Halaman Detail Kontak
app.get('/contact/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render('detail', { layout: 'layouts/main-layout', title: 'Halaman Detail Contact', contact });
});

app.delete('/contact', (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash('msg', 'Data contact berhasil dihapus');
    res.redirect('/contact');
  });
});

// Halaman form ubah data
app.get('/contact/edit/:nama', async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render('edit-contact', {
    title: 'Form Ubah Data Contact',
    layout: 'layouts/main-layout',
    contact,
  });
});

// Proses ubah data
app.put(
  '/contact',
  [
    // check('email').isEmail().withMessage('Emailnya kaga bener njir')
    check('email', 'Emailnya kaga bener njir').isEmail(),
    check('nohp', 'Bukan nomor Indonesia inimah').isMobilePhone('id-ID'),
    body('nama').custom(async (value, { req }) => {
      const duplicate = await Contact.findOne({ nama: value });
      if (value !== req.body.oldName && duplicate) {
        throw new Error('Nama Contact Sudah Digunakan');
      }
      return true;
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render('edit-contact', {
        title: 'Form Ubah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        // Kirimkan pesan flash
        req.flash('msg', 'Data kontak berhasil diedit');
        res.redirect('/contact');
      });
    }
  }
);
