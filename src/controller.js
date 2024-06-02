import path from 'node:path'
import fs from 'node:fs/promises'
import { nuevoNombreImagen, nuevoNombrePdf } from './multer.js'
import { pool } from './db.js'

export const getImagenes = async (req, res) => {
  const [imagenes] = await pool.query('SELECT * FROM imagenes')
  res.json(imagenes)
}

export const getImagen = async (req, res) => {
  try {
    const { nombre } = req.params

    const ruta = path.resolve('./uploads/img')
    const rutaImagen = path.join(ruta, nombre)

    await fs.access(rutaImagen, fs.constants.F_OK)
    res.sendFile(rutaImagen)
  } catch (error) {
    if (error?.errno === -4058) {
      return res.status(404).json({ message: 'No se encontró la imagen' })
    }

    return res.status(500).json({ message: 'Error interno' })
  }
}

export const getPdf = async (req, res) => {
  // A tomar en cuenta: se debe obtener el archivo pdf por su nombre y enviarlo como respuesta. Además, se debe validar que el nombre que se recibe es con la extensión ".pdf", caso contrario se deberá enviar un mensaje al cliente indicando que no se ha proporcionado el nombre de una imagen.
  // Coloca tu código para obtener el archivo PDF aquí
  try {
    const { nombre } = req.params

    const ruta = path.resolve('./uploads/pdf')
    const rutaPdf = path.join(ruta, nombre)

    await fs.access(rutaPdf, fs.constants.F_OK)
    res.sendFile(rutaPdf)
  } catch (error) {
    if (error?.errno === -4058) {
      return res.status(404).json({ message: 'No se encontró el pdf' })
    }

    return res.status(500).json({ message: 'Error interno' })
  }
}

export const subirImagen = async (req, res) => {
  if (nuevoNombreImagen === null) {
    return res.status(500).json({ message: 'No se pudo subir la imagen' })
  }

  const [resultado] = await pool.execute('INSERT INTO imagenes(imagen, usuario) VALUES (?, "Juan")', [nuevoNombreImagen])

  if (resultado.affectedRows === 1) {
    return res.status(201).json({ message: 'Se guardó la imagen correctamente' })
  }

  res.status(500).json({ message: 'Error interno' })
}

export const subirPdf = async (req, res) => {
  // Implementar el guardado del nuevo nombre del archivo pdf en una tabla llamada "pdfs" de la base de datos.
  if (nuevoNombrePdf === null) {
    return res.status(500).json({ message: 'No se pudo subir la documento pdf' })
  }

  const [resultadopdf] = await pool.execute('INSERT INTO documentos(nombre_pdf, usuario) VALUES (?, "Sebastian")', [nuevoNombrePdf])
  // const [resultadopdf] = await pool.execute('INSERT INTO imagenes(imagen, usuario) VALUES (?, "Juan")', [nuevoNombrePdf])
  if (resultadopdf.affectedRows === 1) {
    return res.status(201).json({ message: 'Se guardó la documento pdf correctamente' })
  }

  res.status(500).json({ message: 'Error interno' })
}

export const deleteArhivo = async (req, res) => {
  try {
    const { tipo, nombre } = req.params

    if (tipo !== 'pdf' && tipo !== 'imagen') return res.status(400).json({ message: 'Tipo de archivo desconocido' })

    const carpetaNombre = tipo === 'imagen' ? 'img' : 'pdf'
    const nombreTabla = tipo === 'imagen' ? 'imagenes' : 'documentos'
    const nombreColumna = tipo === 'imagen' ? 'imagen' : 'nombre_pdf'

    const rutaArchivo = path.resolve(`./uploads/${carpetaNombre}/${nombre}`)
    await fs.unlink(rutaArchivo)

    const [resultado] = await pool.execute(`DELETE FROM ${nombreTabla} WHERE ${nombreColumna} = ?`, [nombre])

    if (resultado.affectedRows === 1) {
      return res.json({ message: 'Archivo eleminado' })
    }

    return res.status(500).json({ message: 'Error interno' })
  } catch (error) {
    if (error?.errno === -4058) {
      return res.status(404).json({ message: 'No se encontró el archivo' })
    }

    return res.status(500).json({ message: 'Error interno' })
  }
}
