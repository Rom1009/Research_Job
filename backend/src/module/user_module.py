from backend.src.controller.user_controller import UserController
from fastapi import APIRouter
from backend.src.core.base_module import BaseModule




class UserModule(BaseModule):




    prefix = "/user"
    tags = ["user"]




    def __init__(self):
        super().__init__()
        self.user_controller = UserController()




    def setup_router(self):
        self.router = APIRouter()
        self.router.post("/")(self.user_controller.process_user_data)
        self.router.get("/")(self.user_controller.get_all_user_info)
        self.router.post("/upload-cv")(self.user_controller.upload_cv) 