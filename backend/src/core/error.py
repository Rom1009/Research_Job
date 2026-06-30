class TransientError(Exception):
    """A transient error that may be retried."""

class PermanentError(Exception):
    """A permanent error that should not be retried."""