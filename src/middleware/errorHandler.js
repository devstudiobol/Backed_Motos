const errorHandler = (err, req, res, next) => {
    console.error("[ERROR]", err.stack); // Mejor formato para logs
    
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
        // (Opcional) Solo en desarrollo: stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
};

module.exports = errorHandler;