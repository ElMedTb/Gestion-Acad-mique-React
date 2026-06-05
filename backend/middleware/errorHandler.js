const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';
  let errors = null;
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Ressource introuvable — identifiant invalide : ${err.value}`;
  }
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Valeur en double détectée pour le champ : ${field}`;
  }
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = 'Erreur de validation';
    errors = messages;
  }
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token invalide';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expiré — veuillez vous reconnecter';
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'Le fichier dépasse la taille maximale autorisée (5 Mo)';
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Type de fichier inattendu';
  }
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
