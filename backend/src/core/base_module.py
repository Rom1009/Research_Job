from fastapi import FastAPI, APIRouter
import pathlib

class BaseModule:

    prefix: str = ""
    tags: list[str] = []
    task_module = None

    def __init__(self):
        self.router = APIRouter(prefix = self.prefix, tags = self.tags)