export const manejarErrorArchivo = (err, req, res, next) => {
  if (err) {
    res.status(400).json({ message: err.message })
  } else {
    next()
  }
}
