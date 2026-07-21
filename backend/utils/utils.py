import hashlib


def _sha256_of(text: str) -> str:
    return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()