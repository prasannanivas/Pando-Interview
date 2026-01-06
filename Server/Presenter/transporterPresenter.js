class TransporterPresenter {
  // Success response with data
  success(res, data, message = null, statusCode = 200) {
    const response = {
      success: true,
      ...(message && { message }),
      data
    };
    return res.status(statusCode).json(response);
  }

  // Success response with pagination
  successWithPagination(res, result, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      ...result
    });
  }

  // Created response (201)
  created(res, data, message = 'Transporter created successfully') {
    return this.success(res, data, message, 201);
  }

  // Error response
  error(res, message, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message
    });
  }

  // Not found response (404)
  notFound(res, message = 'Transporter not found') {
    return this.error(res, message, 404);
  }

  // Bad request response (400)
  badRequest(res, message) {
    return this.error(res, message, 400);
  }

  // Deleted response
  deleted(res, result) {
    return res.status(200).json({
      success: true,
      ...result
    });
  }
}

module.exports = new TransporterPresenter();
