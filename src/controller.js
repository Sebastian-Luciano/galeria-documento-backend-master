import path from 'node:path'
import fs from 'node:fs/promises'
import { nuevoNombreArchivo, nuevoNombreImagen } from './multer.js'
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
    console.log(error)
    if (error?.errno === -4058) {
      return res.status(404).json({ message: 'No se encontró la imagen' })
    }

    return res.status(500).json({ message: 'Error interno' })
  }
}

export const getPdf = async (req, res) => {
  try {
    const { nombre } = req.params
    const extension = path.extname(nombre)

    if (extension !== '.pdf') {
      return res.status(400).json({ message: 'Debes proporcionar un nombre válido (ej: archivo.pdf)' })
    }

    const rutaCarpeta = path.resolve('./uploads/pdf')
    const rutaArchivo = path.join(rutaCarpeta, nombre)
    await fs.access(rutaArchivo, fs.constants.F_OK)
    res.sendFile(rutaArchivo)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

export const subirImagen = async (req, res) => {
  try {
    const { user } = req.body

    if (nuevoNombreImagen === null) {
      return res.status(500).json({ message: 'No se pudo subir la imagen' })
    }

    const [resultado] = await pool.execute('INSERT INTO imagenes(imagen, usuario) VALUES (?, ?)', [nuevoNombreImagen, user])

    if (resultado.affectedRows === 1) {
      return res.status(201).json({ message: 'Se guardó la imagen correctamente' })
    }

    res.status(500).json({ message: 'Error interno' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

export const subirPdf = async (req, res) => {
  try {
    if (nuevoNombreArchivo === null) {
      return res.status(500).json({ message: 'No se pudo subir el pdf' })
    }

    const [resultado] = await pool.execute('INSERT INTO documentos(nombre_pdf, usuario) VALUES (?, "Juan")', [nuevoNombreArchivo])

    if (resultado.affectedRows === 1) {
      return res.status(201).json({ message: 'Se guardó el pdf correctamente' })
    }

    res.status(500).json({ message: 'Error interno' })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Error interno' })
  }
}

export const deleteArchivo = async (req, res) => {
  try {
    const { tipo, nombre } = req.params

    if (tipo !== 'pdf' && tipo !== 'imagen') return res.status(400).json({ message: 'Tipo de archivo desconocido' })

    const carpetaNombre = tipo === 'imagen' ? 'img' : 'pdf'
    const nombreTabla = tipo === 'imagen' ? 'imagenes' : 'pdfs'
    const nombreColumna = tipo === 'imagen' ? 'imagen' : 'pdf'

    const rutaArchivo = path.resolve(`./uploads/${carpetaNombre}/${nombre}`)
    await fs.unlink(rutaArchivo)

    const [resultado] = await pool.execute(`DELETE FROM ${nombreTabla} WHERE ${nombreColumna} = ?`, [nombre])

    if (resultado.affectedRows === 1) {
      return res.json({ message: 'Archivo eliminado' })
    }

    return res.status(500).json({ message: 'Error interno' })
  } catch (error) {
    console.log(error)
    if (error?.errno === -4058) {
      return res.status(404).json({ message: 'No se encontró el archivo' })
    }

    return res.status(500).json({ message: 'Error interno' })
  }
}
