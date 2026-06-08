class AppError(Exception):
    """Base app exception."""


class NotFoundError(AppError):
    pass


class ConflictError(AppError):
    pass


class ForbiddenError(AppError):
    pass


class AuthenticationError(AppError):
    pass


class ValidationError(AppError):
    pass

