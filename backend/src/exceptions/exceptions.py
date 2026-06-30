class AppError(Exception):

    status_code: int = 500
    error_code: str = "app_error"

    def __init__(self, message: str | None = None, *, details: dict | None = None):
        super().__init__(message)
        self.message = message or "An unexpected error occurred"
        self.details = details or {}



        