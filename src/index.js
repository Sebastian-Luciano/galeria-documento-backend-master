import express from 'express'
import { uploadImage, uploadPdf } from './multer.js'
import { deleteArhivo, getImagen, getImagenes, getPdf, subirImagen, subirPdf } from './controller.js'
import { manejarErrorArchivo } from './helpers.js'

const app = express()

app.use((req, res, next) => {
  const { origin } = req.headers

  if (origin === 'http://127.0.0.1:5500' || origin === undefined) {
    res.setHeader('Access-Control-Allow-Origin', origin ?? '*')
    next()
  }
})

app.get('/imagenes', getImagenes)
app.get('/imagenes/:nombre', getImagen)
app.get('/pdf/:nombre', getPdf)

app.post(
  '/imagenes',
  uploadImage.single('archivo'),
  subirImagen,
  manejarErrorArchivo
)

app.post(
  '/pdf',
  uploadPdf.single('curriculum'),
  subirPdf,
  manejarErrorArchivo
)

app.delete('/archivo/:tipo/:nombre', deleteArhivo)

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
