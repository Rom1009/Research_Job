from fastapi import APIRouter
from backend.src.core.base_module import BaseModule
from backend.src.controller.auth_controller import AuthController

class AuthModule(BaseModule):
    prefix = "/auth"
    tags = ["auth"]

    def __init__(self):
        super().__init__()
        self.auth_controller = AuthController()


    def setup_router(self):
        self.router = APIRouter()
        self.router.post("/register")(self.auth_controller.register)
        self.router.post("/login")(self.auth_controller.login)
        self.router.get("/me")(self.auth_controller.me)
        self.router.post("/change-password")(self.auth_controller.change_password)