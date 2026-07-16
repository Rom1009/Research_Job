from sqlmodel import Session
from groq import Groq
from uuid import UUID
import json


from backend.src.schema.model import ScoreCV, ScoreResponse
from backend.src.repositories.score_repositories import ScoreRepository
from backend.src.repositories.user_repositories import UserRepository
from backend.src.repositories.job_repositories import JobRepository
from backend.utils.logger import setup_logger
from backend.utils.config import settings


logger = setup_logger("Score Service")


class ScoreService:
    def __init__(self, session: Session):
        self.score_repository = ScoreRepository(session = session)
        self.user_repository = UserRepository(session = session)
        self.job_repository = JobRepository(session = session)
        self.client = Groq(
            api_key = settings.GROQ_API_KEY.get_secret_value(),
        )
   
    def calculate_score(self, profile_id: UUID) -> ScoreResponse:
        logger.info("Get information")
        all_users = self.user_repository.get_all_users()
        all_jobs = self.job_repository.get_all_jobs()


        all_match = []


        for job in all_jobs:
            response = self.client.chat.completions.create(
                model = settings.MODEL_NAME,
                temperature = 0.0,
                messages = [
                    {
                        "role": "system",
                        "content":
                        '''
                        You are a strict and objective Technical Recruiter expert. Your task is to match a candidate's CV (provided as JSON) against a Job Description (JD).
                        CRITICAL RULES:
                        1. You must ONLY return a valid JSON object. Do not include any markdown formatting wrappers like ```json, no introductory text, and no concluding remarks.
                        2. Every judgment in 'gap_analysis' and 'matched_skills' must be based strictly on the provided text. Do not assume or hallucinate skills.
                        3. In 'evaluation_summary', provide a professional, holistic critique from a human recruiter's perspective. Balance the strict technical scores with an assessment of the candidate's potential, career progression, and how well their overall background fits the company's context.
                        4. In 'technical_complexity', assess whether the projects demonstrate advanced software engineering (such as system design, optimization, security, or data handling) or are just basic tutorial-level apps.
                        5. In 'project_impact', look for concrete problem-solving evidence, architectural decisions (why a technology was chosen), or any metrics and results mentioned in the README.
                        6. In 'skill_score': Evaluate on a scale from 0 to 100 based on the percentage of mandatory technical keywords in the JD that are present in the CV.
                        7. In 'education_score': Evaluate on a scale from 0 to 100 based on the relevance of the candidate's degree, major, and professional certifications to the role.
                        8. In 'work_experience_score': Evaluate on a scale from 0 to 100 based on the years of relevant experience, job titles, and career progression matching the JD requirements.
                        9. In 'project_score', score on a scale from 0 to 100 based on the repository's README complexity, architectural decisions, and evidence of practical problem-solving.
                        '''
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Please evaluate how well the candidate's CV with work experience, skills, education and their practical projects matches the Job Description (JD) provided below.


                        📝 [CANDIDATE CV with work experience (JSON)]
                        {all_users[0].cv_structured["work_experience"]}
                        📝 [CANDIDATE CV with skill (JSON)]
                        {all_users[0].cv_structured["skills"]}
                        📝 [CANDIDATE CV with education (JSON)]
                        {all_users[0].cv_structured["education"]}


                        💻 [PRACTICAL PROJECT EVIDENCE (README)]
                        {all_users[0].github_summary}


                        🎯 [JOB DESCRIPTION (JD)]
                        {job.description}


                        ⚙️ [REQUIRED OUTPUT FORMAT]
                        You must output a single JSON object with this exact structure:
                        {{
                            "skill_score": <integer between 0 and 100 based on CANDIDATE CV with skill>,
                            "education_score": <integer between 0 and 100 CANDIDATE CV with education>,
                            "work_experience_score": <integer between 0 and 100 CANDIDATE CV with work experience>,
                            "project_score": <integer between 0 and 100 based on PRACTICAL PROJECT>
                            "matched_skills": [<list of skills from CV that match the JD>],
                            "gap_analysis": [<list of critical requirements or skills in JD missing from CV>],
                            "actionable_advice": [<list of specific recommendations to improve the CV for this job>]
                            "evaluation_summary": <a professional, holistic critique from a human recruiter's perspective>
                            "project_impact": [<list of project impact assessment>]
                            "technical_complexity": [<list of technical complexity assessment>]
                        }}
                        """
                    }
                ],


                response_format = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "ScoreCV",
                        "schema": ScoreCV.model_json_schema()
                    }
                }
            )


            content_score = ScoreCV.model_validate(json.loads(response.choices[0].message.content))


            match_content = {
                "profile_id": all_users[0].user_id,
                "job_id": job.job_id,
                "skill_score": content_score.skill_score,
                "education_score": content_score.education_score,
                "work_experience_score": content_score.work_experience_score,
                "project_score": content_score.project_score,
                "total_score": content_score.skill_score * 0.4 + content_score.education_score * 0.15 + \
                              content_score.work_experience_score * 0.05 + content_score.project_score * 0.4,
                "ai_analysis_details": {
                    "gap_analysis": content_score.gap_analysis,
                    "actionable_advice": content_score.actionable_advice,
                    "evaluation_summary": content_score.evaluation_summary,
                    "project_impact": content_score.project_impact,
                    "technical_complexity": content_score.technical_complexity
                },
            }


            match_results = self.score_repository.create_match_result(match_content)


            all_match.append({
                "match_id": match_results.match_id,
                "job_id": match_results.job_id,          # ← thêm
                "profile_id": match_results.profile_id,  # ← thêm
                "total_score": match_results.total_score,
                "ai_analysis_details": match_results.ai_analysis_details,
            })




        return all_match

