from sqlmodel import Session
from fake_useragent import UserAgent
from bs4 import BeautifulSoup
import re
import httpx
import asyncio
import random
from uuid import UUID

from backend.src.repositories.job_repositories import JobRepository, LinkedInJobs
from backend.src.repositories.score_repositories import ScoreRepository
from backend.utils.logger import setup_logger
from backend.utils.config import settings
from backend.src.schema.model import JobResponse
from backend.src.services.notification_service import NotificationService
from backend.src.repositories.job_action_repositories import JobActionRepository

logger = setup_logger("Job Service")

class JobService:
    def __init__(self, session: Session):
        self.job_repository = JobRepository(session = session)
        self.base_search_url = settings.BASE_SEARCH_URL
        self.ua = UserAgent()
        self.notification_service = NotificationService(session=session)
        self.score_repository = ScoreRepository(session=session)
        self.action_repository = JobActionRepository(session=session)

    async def scrape_linkedin_job(self, job_data, owner_id: UUID) -> list[LinkedInJobs]:
        logger.info(f"Processing job data: {job_data}")
        logger.info(f"Owner ID: {owner_id}")

        headers = {
            "User-Agent": self.ua.random,
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.linkedin.com/"
        }

        all_jobs = []
        async with httpx.AsyncClient(headers = headers, timeout = 20.0) as client:
            for page in range(job_data["page_to_scrape"]):
                start_idx = page * 25
                params = {
                    "keywords": job_data.get("keywords"),
                    "location": job_data.get("location_search"),
                    "start": start_idx,
                    "f_E": job_data.get("filter_level")
                }

                print(f"Scraping page {page + 1} with params: {params}")
                logger.info(f"Scraping page {page + 1} with params: {params}")

                try:
                    response = await client.get(self.base_search_url, params = params)

                    if response.status_code != 200:
                        print(f"Failed to fetch jobs for page {page + 1}. Status code: {response.status_code}")
                        logger.error(f"Failed to fetch jobs for page {page + 1}. Status code: {response.status_code}")
                        break
                   
                    soup = BeautifulSoup(response.text, "html.parser")
                    job_cards = soup.find_all("li")
                   
                    if not job_cards:
                        print(f"No job cards found on page {page + 1}. Ending scraping.")
                        logger.warning(f"No job cards found on page {page + 1}. Ending scraping.")
                        break
                       
                    print(f"Found {len(job_cards)} job cards on page {page + 1}.")
                    logger.info(f"Found {len(job_cards)} job cards on page {page + 1}.")

                    for card in job_cards:
                        title_tag = card.find("h3", class_ = "base-search-card__title")
                        company_tag = card.find("h4", class_ = "base-search-card__subtitle")
                        location_tag = card.find("span", class_ = "job-search-card__location")
                        link_tag = card.find("a", class_ = "base-card__full-link")    

                        if title_tag and company_tag and link_tag:
                            job_url = link_tag["href"]            
                            print(f"Scraping job description for URL: {job_url}")
                            logger.info(f"Scraping job description for URL: {job_url}")

                            if self.job_repository.get_by_url_and_owner(job_url, owner_id):
                                logger.info(f"Skip duplicate {job_url}")
                                continue

                            job_description = await self.get_job_description(client, job_url)
                            job_info = {
                                "owner_id": owner_id,
                                "title": title_tag.get_text(strip = True),
                                "company": company_tag.get_text(strip = True),
                                "location": location_tag.get_text(strip = True) if location_tag else "No clear",
                                "job_url": job_url,
                                "description": job_description
                            }
                            linkedin_job = self.job_repository.create_job_profile(job_info)
                            all_jobs.append(linkedin_job)
                            await asyncio.sleep(random.uniform(1.5, 3.5))
                    await asyncio.sleep(2)
                   
                except Exception as e:
                    print(f"Error occurred while scraping page {page + 1}: {e}")
                    logger.error(f"Error occurred while scraping page {page + 1}: {e}")
                    break


            self.notification_service.create(
                user_id=owner_id,
                title=f"Scraped {len(all_jobs)} jobs",
                description=f"New jobs from {job_data.get('keywords', 'search')}",
                link="/dashboard/jobs",
            )
            return all_jobs
   
    @staticmethod
    async def get_job_description(client, job_url: str) -> str:
        try:
            match = re.search(r'-(\d+)(?:/|\?|$)', job_url) or re.search(r'/view/{\d+}', job_url)
            if not match:
                return "Can not find the job_id"

            job_id = match.group(1)

            path_job = settings.DETAIL_SEARCH_URL
            detail_api_url = f"{path_job}/{job_id}"

            response = await client.get(detail_api_url)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")

                jd_tag = soup.find("div", class_= "description__text")
                if jd_tag:
                    return jd_tag.get_text(separator = "\n", strip = False)


            return f"Can not download {response.status_code}"

        except Exception as e:
            print(f"Wrong: {e}")
   
    def list_job(
        self,
        owner_id: UUID
    ) -> list[LinkedInJobs]:
        logger.info(f"Listing jobs for owner ID: {owner_id}")
        return self.job_repository.get_all_jobs_by_owner(owner_id)


    def clear_all_jobs(self, owner_id: UUID) -> dict:
        jobs = self.job_repository.get_all_jobs_by_owner(owner_id)
        job_ids = [j.job_id for j in jobs]
        count = len(jobs)


        if job_ids:
            scores_deleted = self.score_repository.delete_by_job_ids(job_ids)
            actions_deleted = self.action_repository.delete_by_job_ids(job_ids)
        else:
            scores_deleted = actions_deleted = 0


        self.job_repository.delete(jobs)


        logger.info(
            f"Cleared owner={owner_id}: jobs={count}, "
            f"scores={scores_deleted}, actions={actions_deleted}"
        )
        return {
            "deleted": count,
            "scores_deleted": scores_deleted,
            "actions_deleted": actions_deleted,
        }