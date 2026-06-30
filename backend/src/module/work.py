from backend.src.controller.work_controller import WorkController
from fastapi import APIRouter
from backend.src.core.base_module import BaseModule

class WorkModule(BaseModule):

    prefix = "/work"
    tags = ["work"]

    def __init__(self):
        super().__init__()
        self.work_controller = WorkController()

    def setup_router(self):
        self.router = APIRouter()
        self.router.post("/")(self.work_controller.hello)