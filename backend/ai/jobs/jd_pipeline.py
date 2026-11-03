import re
import httpx
from bs4 import BeautifulSoup
import json
from fake_useragent import UserAgent
import asyncio
import random
from typing import Any, Dict, List, Set
from pydantic import BaseModel, Field
import unicodedata
import uuid
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_chroma import Chroma
from groq import Groq


class LLMJDSchema(BaseModel):

    required_skills: List[str] = Field(
        default_factory=list,
        description="Technical skills explicitly required for the role"
    )

    preferred_skills: List[str] = Field(
        default_factory=list,
        description="Technical skills explicitly described as preferred, bonus, nice-to-have"
    )

    min_exp_years: float = Field(
        default=0.0,
        description="Minimum required years of experience"
    )

    responsibilities: List[str] = Field(
        default_factory=list
    )

    qualifications: List[str] = Field(
        default_factory=list
    )

    text_to_embed: str = Field(
        default=""
    )

'''
  Support Parsing (Scrape JD -> process description (LLM + Pandatic) -> Embedding -> Store Chrome)
  Work with JD
'''
class ScrapeJD:
    def __init__(self, keyword_search: str, location_search: str, page_to_scrape: int = 1, filter_level: str = "1"):
        self.keyword_search = keyword_search
        self.location_search = location_search
        self.page_to_scrape = page_to_scrape
        self.filter_level = filter_level
        self.ua = UserAgent()

    def get_headers(self) -> dict:
        return {
            "User-Agent": self.ua.random,
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://www.linkedin.com/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

    async def get_job_description(self, client, job_url: str) -> str:
        try:
            match = re.search(r'-(\d+)(?:/|\?|$)', job_url) or re.search(r'/view/(\d+)', job_url)
            if not match:
                return "Can not find the job_id"

            job_id = match.group(1)
            detail_api_url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"

            response = await client.get(detail_api_url)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, "html.parser")

                jd_tag = soup.find("div", class_= "description__text") or soup.find("div", class_ = "show-more-less-html__markup")
                if not jd_tag:
                    return None

                for hidden in jd_tag.find_all(
                    ["script", "style", "button", "figcaption"]
                ):
                    hidden.decompose()

                raw_text = jd_tag.get_text(separator = "\n", strip = True)
                clean_text = re.sub(r"\n\s*\n+", "\n\n", raw_text)

                return clean_text.strip()

            return f"Can not download {response.status_code}"

        except Exception as e:
            print(f"Wrong: {e}")

    async def scrape_linkedin_job(self):
        base_search_url = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"

        all_jobs = []

        async with httpx.AsyncClient(headers = self.get_headers(), timeout = 20.0) as client:
            for page in range(self.page_to_scrape):
                start_idx = page * 25

                params = {
                    "keywords": self.keyword_search,
                    "location": self.location_search,
                    "start": start_idx,
                    "f_E":  self.filter_level
                }
                print(f"\n🔄 [Trang {page + 1}] Đang tìm kiếm việc làm...")

                try:
                    response = await client.get(base_search_url, params = params)

                    if response.status_code != 200:
                        print(f"Stop scraping: {response.status_code}")
                        break

                    soup = BeautifulSoup(response.text, "html.parser")
                    job_cards = soup.find_all("li")

                    if not job_cards:
                        print("Completed")
                        break

                    print(f"Finding {len(job_cards)}")

                    for card in job_cards:
                      title_tag = card.find("h3", class_ = "base-search-card__title")
                      company_tag = card.find("h4", class_ = "base-search-card__subtitle")
                      location_tag = card.find("span", class_ = "job-search-card__location")
                      link_tag = card.find("a", class_ = "base-card__full-link")

                      if title_tag and company_tag and link_tag:
                          job_url = link_tag["href"]
                          print(f"URL: {job_url}")
                          print(f" Reading JD: {title_tag.get_text(strip = False)} ")

                          job_description = await self.get_job_description(client, job_url)

                          job_data = {
                              "title": title_tag.get_text(strip = True),
                              "company": company_tag.get_text(strip = True),
                              "location": location_tag.get_text(strip = True) if location_tag else "No clear",
                              "url": job_url,
                              "description": job_description
                          }
                          all_jobs.append(job_data)

                          await asyncio.sleep(random.uniform(1.5, 3.5))

                    await asyncio.sleep(2)

                except Exception as e:
                    print(f"Error: {e}")
                    break

        return all_jobs

    def __str__(self):
        return f"Keyword: {self.keyword_search} | Location: {self.location_search}"

    async def __call__(self):
        return await self.scrape_linkedin_job()

class ProcessingJD:

    def __init__(self, list_job: List[Dict[str, Any]], custom_skills: Set[str] = None):
        self.list_job = list_job
        self.client = Groq()
        self.system_prompt = '''
            You are an expert Technical Recruitment AI and Data Extraction Engine.
            Your task is to analyze unstructured, messy, or non-standard Job Descriptions (JDs) and extract structured technical data strictly adhering to the provided JSON Schema.

            Follow these strict extraction rules:
            1. NO FLUFF / NO NOISE: Strictly exclude all non-technical content such as company introduction, mission/vision, compensation, salary, health insurance, paid leave, company perks, office locations, or application instructions.
            2. EXPERIENCE EXTRACTION: Convert required experience into a numeric float in years (e.g., '2+ years' -> 2.0, '6 months' -> 0.5, 'Fresh Graduate' -> 0.0). If no explicit number is mentioned, default to 0.0.
            3. SKILL CANONICALIZATION: Extract explicit technical skills (languages, frameworks, algorithms, infrastructure). Standardize abbreviations (e.g., 'Golang' -> 'Go', 'k8s' -> 'Kubernetes', 'LLM' -> 'Large Language Models').
            4. EMBEDDING TEXT SYNTHESIS: `text_to_embed` must be a clean, condensed paragraph combining technical responsibilities and requirements. It must retain high-density domain keywords (e.g., 'RAG', 'vLLM', 'Inference Optimization', 'CI/CD') to maximize semantic vector search accuracy.
            5. FACTUAL INTEGRITY: Do not hallucinate or invent requirements that do not exist in the raw text.
        '''
        self.model = "openai/gpt-oss-120b"

        self.tech_keywords = custom_skills or {
            "python", "machine learning", "deep learning", "nlp", "transformers",
            "pytorch", "tensorflow", "fastapi", "docker", "ci/cd", "data drift",
            "monitoring", "spark", "hive", "big data", "feature stores", "model serving",
            "agi", "ai agents", "system design", "llm", "llms", "generative ai",
            "rag", "vector databases", "qdrant", "milvus", "pinecone", "langchain",
            "llamaindex", "lora", "qlora", "sft", "rlhf", "dpo", "vllm", "tensorrt",
            "ollama", "peft", "deepspeed", "onnx"
        }

        self.req_patterns = (
            r"(?:what we['’]re looking for|what we look for|requirements|skills & competencies|"
            r"experience & background|qualifications|yêu cầu ứng viên|who you are|yêu cầu công việc)"
        )

        self.resp_patterns = (
            r"(?:what you['’]ll do|what you will do|responsibilities|your role|"
            r"mô tả công việc|trách nhiệm|key responsibilities|nhiệm vụ chính)"
        )

        self.stop_patterns = (
            r"(?:what we offer|join our vibrant team|benefits|the benefits & perks|"
            r"quyền lợi|chế độ|perks|compensation|to apply|how to apply|$)"
        )

    def _sanitize_text(self, text: str) -> str:
        """Làm sạch ký tự thoát dòng, chuẩn hóa Unicode và dấu hai chấm rớt dòng."""
        if not text:
            return ""
        if "\\n" in text:
            text = text.replace("\\r\\n", "\n").replace("\\n", "\n")

        text = unicodedata.normalize("NFKC", text)
        text = re.sub(r"\n\s*[:\-_]\s*\n", ":\n", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text.strip()

    def _get_llm_chain(self, user_prompt: str, schema_model, schema_name: str, job_id: str, \
                       job_url: str, job_title: str, job_company: str, job_location: str):
        response = self.client.chat.completions.create(
            model = self.model,
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature = 0.0,
            seed = 42,
            response_format = {
                "type": "json_schema",
                "json_schema": {
                    "name": schema_name,
                    "schema": schema_model.model_json_schema()
                }
            }
        )

        raw_json = json.loads(response.choices[0].message.content)
        validated_model = schema_model.model_validate(raw_json).model_dump()
        validated_model["job_id"] = job_id
        validated_model["url"] = job_url
        validated_model["title"] = job_title
        validated_model["company"] = job_company
        validated_model["location"] = job_location
        validated_model["extraction_method"] = "llm_extractor"
        return validated_model

    def _job_fallback(self, clean_text: str, job_id: str, job_url: str, job_title: str, job_company: str, job_location: str):
        if not clean_text.strip():
            return LLMJDSchema()
        jd_prompt = f'''
            Analyze the following raw Job Description text and extract the structured technical schema:

            --- RAW JOB DESCRIPTION START ---
            {clean_text}
            --- RAW JOB DESCRIPTION END ---
        '''

        return self._get_llm_chain(jd_prompt, LLMJDSchema, "jd_generation", job_id, job_url, job_title, job_company, job_location)

    def _route_jd(self, heuristic_res: str, clean_text: str):
        text_to_embed = heuristic_res.get("text_to_embed", "").strip()
        skills = heuristic_res.get("must_have_skills", [])
        has_req = bool(heuristic_res.get("requirements_text"))
        has_resp = bool(heuristic_res.get("responsibilities_text"))

        if not has_req and not has_resp:
            return False

        if len(text_to_embed) < 150:
            return False
        if len(skills) == 0 and not has_req:
            return False

        return True


    def __len__(self) -> int:
        return len(self.list_job)

    def __getitem__(self, idx: int) -> Dict[str, Any]:
        raw_desc = self.list_job[idx].get("description", "")
        job_url = self.list_job[idx].get("url", "")
        job_title = self.list_job[idx].get("title", "")
        job_company = self.list_job[idx].get("company", "")
        job_location = self.list_job[idx].get("location", "")
        clean_text = self._sanitize_text(raw_desc)
        job_id = str(uuid.uuid4())

        # Layer 1
        resp_pattern = rf"(?i){self.resp_patterns}[\s\:\-\_]*\n([\s\S]*?)(?=(?:{self.req_patterns}|{self.stop_patterns}))"
        req_pattern = rf"(?i){self.req_patterns}[\s\:\-\_]*\n([\s\S]*?)(?=(?:{self.stop_patterns}))"

        resp_match = re.search(resp_pattern, clean_text)
        req_match = re.search(req_pattern, clean_text)

        responsibilities = resp_match.group(1).strip() if resp_match else ""
        requirements = req_match.group(1).strip() if req_match else ""

        exp_match = re.search(
            r"(?:minimum|tối thiểu|at least)?\s*(\d+(?:\.\d+)?)\s*(?:\+|-\s*\d+)?\s*(?:years?|năm)",
            clean_text,
            re.IGNORECASE,
        )
        min_exp_years = float(exp_match.group(1)) if exp_match else 0.0

        clean_lower = clean_text.lower()
        found_skills = [
            skill for skill in self.tech_keywords
            if re.search(rf"\b{re.escape(skill)}\b", clean_lower)
        ]

        if responsibilities or requirements:
            text_to_embed = f"{responsibilities}\n{requirements}".strip()
            extraction_method = "heuristic_regex"
        else:
            text_to_embed = clean_text[:1500].strip()
            extraction_method = "raw_fallback"
        # Layer 2
        heuristic_res = {
            "job_id": job_id,
            "min_exp_years": min_exp_years,
            "must_have_skills": sorted(list(set(found_skills))),
            "responsibilities_text": responsibilities,
            "requirements_text": requirements,
            "text_to_embed": text_to_embed,
            "extraction_method": extraction_method,
            "url": job_url,
            "title": job_title,
            "company": job_company,
            "location": job_location,
        }

        is_good = self._route_jd(heuristic_res, clean_text)

        if is_good:
            return heuristic_res

        # Layer 3
        print(f"Job index: {idx} -> Route move to LLM")
        return self._job_fallback(clean_text, job_id, job_url, job_title, job_company, job_location)

    def __str__(self) -> str:
        return f"ProcessingJD(total_jobs={len(self.list_job)})"

class EmbeddingJD:
    def __init__(self, list_jobs: list[dict], persist_directory: str = "./chroma_db"):
        self.embedding = HuggingFaceEmbeddings(
            model_name = "BAAI/bge-m3",
            encode_kwargs = {"normalize_embeddings": True}
        )
        self.list_jobs = list_jobs
        self.presist_directory = persist_directory

    def _convert_to_document(self, job: dict):

        page_content = job.get("text_to_embed", "")
        job_id = str(job.get("job_id", "unknown_job"))

        raw_exp = job.get("min_exp_years")
        try:
            min_exp_years = float(raw_exp) if raw_exp is not None else 0.0
        except (ValueError, TypeError):
            min_exp_years = 0.0

        skills = job.get("must_have_skills", [])
        skills_str = ", ".join(skills) if isinstance(skills, list) else str(skills)

        metadata = {
            "job_id": job_id,
            "title": str(job.get("title", "")),
            "company": str(job.get("company", "")),
            "min_exp_years": min_exp_years,
            "must_have_skills": skills_str,
            "location": str(job.get("location", "")),
            "url": str(job.get("url", "")),
            "extraction_method": str(job.get("extraction_method", "standard")),
        }

        return Document(
            page_content=page_content, metadata=metadata, id=f"job_{job_id}"
        )

    def __getitem__(self, idx):
        job = self.list_jobs[idx]
        return self._convert_to_document(job)

    def __str__(self):
        return f"EmbeddingJD(total_jobs={len(self.list_jobs)})"

    def __call__(self):
        docs = [self[idx] for idx in range(len(self.list_jobs))]
        vector_db = Chroma.from_documents(
            documents = docs,
            embedding = self.embedding,
            persist_directory = self.presist_directory,
            collection_name = "candidate_jobs",
        )

        return vector_db
