import express from 'express'
import { uploadImage, uploadPdf } from './multer.js'
import { deleteArchivo, getImagen, getImagenes, getPdf, subirImagen, subirPdf } from './controller.js'
import { manejarErrorArchivo } from './helpers.js'
import { PORT, originsAllowed } from './config.js'

const app = express()

app.use((req, res, next) => {
  const { origin } = req.headers

  if (originsAllowed.includes(origin) || origin === undefined) {
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

app.delete('/archivo/:tipo/:nombre', deleteArchivo)

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
