from fastapi import APIRouter


from backend.src.controller.score_controller import ScoreController
from backend.src.core.base_module import BaseModule


class ScoreModule(BaseModule):
    prefix = "/score"
    tags = ["score"]


    def __init__(self):
        super().__init__()
        self.score_controller = ScoreController()
   
    def setup_router(self):
        self.router = APIRouter()
        self.router.post("/calculate")(self.score_controller.calculate_score)
        self.router.get("/")(self.score_controller.list_scores)                  # ← thêm
        self.router.get("/{profile_id}")(self.score_controller.get_scores_by_profile)  # ← thêm

