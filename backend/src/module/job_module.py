from fastapi import APIRouter
from backend.src.controller.job_controller import JobController
from backend.src.core.base_module import BaseModule

class JobModule(BaseModule):
    prefix = "/job"
    tags = ["jobs"]

    def __init__(self):
        super().__init__()
        self.job_controller = JobController()
   
    def setup_router(self):
        self.router = APIRouter()
        self.router.post("/scrape")(self.job_controller.scraping_job_data)
        self.router.get("/")(self.job_controller.list_jobs)
        self.router.get("/{job_id}")(self.job_controller.get_job)
        self.router.delete("/clear-all")(self.job_controller.clear_all)
