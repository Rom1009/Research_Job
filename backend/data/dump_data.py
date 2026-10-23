# Months
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
# Current day 
NOW = 2026 * 12 + 9

# ----------------------------------------------------------------------------
# Dữ liệu nền (tên, công ty, địa điểm)
# ----------------------------------------------------------------------------
# First name
FIRST =  ["Minh", "Anh", "Linh", "Huy", "Trang", "Khoa", "Emily", "Daniel",
          "Sofia", "Marcus", "Priya", "Lucas", "Hana", "Omar", "Chloe"]

# Last name
LAST = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Smith", "Garcia", "Kim",
        "Patel", "Johnson", "Brown", "Tanaka", "Martin", "Cohen", "Silva"]

# Company A
COMP_A = ["Nimbus", "Blue Harbor", "Quanta", "Lotus", "Redwood", "Apex",
          "Orbit", "Vertex", "Sunrise", "Northwind", "Kite", "Helix"]

# Company B
COMP_B = ["Labs", "Systems", "Software", "Digital", "Technologies",
          "Analytics", "Solutions", "Cloud"]

# Cities 
CITIES = ["Ho Chi Minh City", "Ha Noi", "Da Nang", "Austin, TX",
          "Seattle, WA", "Toronto, ON", "Singapore", "Berlin"]

# Universities
UNIS = ["Bach Khoa University", "National Economics University",
        "FPT University", "State Institute of Technology",
        "Northern Valley University", "Lakeside University"]

# ----------------------------------------------------------------------------
# Mẫu bullet theo "kind". {a},{b} = skill của persona, {d} = domain
# ----------------------------------------------------------------------------

BULLETS = {
    "backend": [
        "Built and maintained REST APIs in {a} serving the {d} product.",
        "Designed {b}-backed data models and optimized slow queries, cutting p95 latency by {p}%.",
        "Implemented background jobs and caching, reducing load on the primary database.",
        "Wrote unit and integration tests, raising coverage to {c}%.",
        "Containerized services and set up CI pipelines for automated deployment.",
        "Collaborated with frontend and product teams to ship features for {d}.",
    ],
    "data": [
        "Built ETL pipelines with {a} and {b} loading {d} data into the warehouse.",
        "Modeled analytics tables and wrote tested transformations used by BI dashboards.",
        "Automated daily data quality checks, cutting manual reconciliation by {h} hours per week.",
        "Optimized slow warehouse queries, reducing runtime by {p}%.",
        "Partnered with analysts to define metrics and document data lineage for {d}.",
    ],
    "analyst": [
        "Analyzed {d} data with {a} and {b} to answer business questions for stakeholders.",
        "Built weekly dashboards that replaced {h} hours per week of manual reporting.",
        "Cleaned and joined multiple sources to produce reliable KPI reports.",
        "Presented findings to non-technical teams and recommended process changes.",
    ],
    "ml": [
        "Trained and evaluated {a} models for {d}, improving F1 by {p}% over the baseline.",
        "Built feature pipelines with {b} and tracked experiments for reproducibility.",
        "Deployed model inference as an API and monitored drift in production.",
        "Ran error analysis and labeling reviews to improve data quality.",
        "Wrote evaluation scripts and compared candidate models on held-out data.",
    ],
    "frontend": [
        "Built responsive interfaces with {a} and {b} for the {d} platform.",
        "Improved page load time by {p}% through code splitting and asset optimization.",
        "Implemented reusable component library and accessibility fixes.",
        "Wrote component and end-to-end tests, raising coverage to {c}%.",
        "Worked with designers and backend engineers to deliver features on schedule.",
    ],
    "fullstack": [
        "Delivered end-to-end features using {a} on the frontend and {b} on the backend for {d}.",
        "Designed REST endpoints and database schemas, and built the UI that consumes them.",
        "Set up CI/CD and monitoring, reducing deployment time by {p}%.",
        "Wrote automated tests across API and UI layers.",
    ],
    "devops": [
        "Managed infrastructure as code with {a} and {b} across staging and production.",
        "Built CI/CD pipelines that cut release time by {p}%.",
        "Set up monitoring, alerting and on-call runbooks for {d} services.",
        "Reduced cloud cost by {p}% through right-sizing and autoscaling.",
        "Hardened container images and automated secret rotation.",
    ],
    "qa": [
        "Wrote manual and automated test cases for {d} features using {a}.",
        "Built an automation suite with {b} that cut regression time by {p}%.",
        "Triaged defects with developers and tracked quality metrics per release.",
        "Integrated automated tests into CI so every pull request is verified.",
    ],
    "marketing": [
        "Planned and ran email and social campaigns for {d} customers.",
        "Tracked campaign performance in spreadsheets and reported weekly results.",
        "Coordinated with sales on lead follow-up and content calendar.",
        "Grew newsletter subscribers by {p}% over two quarters.",
    ],
    "management": [
        "Led a team of {t} engineers delivering {d} services; owned roadmap and hiring.",
        "Defined architecture standards in {a} and {b} and reviewed critical designs.",
        "Mentored engineers, ran code reviews and improved delivery predictability.",
        "Partnered with product leadership to prioritize and de-risk major releases.",
        "Reduced incident count by {p}% by introducing postmortems and SLOs.",
    ],
}

# ----------------------------------------------------------------------------
# Mẫu projects
# ----------------------------------------------------------------------------
PROJECTS = {
    "backend": [
        ("Task Manager API", "Auth, CRUD and pagination with automated tests"),
        ("URL Shortener Service", "Rate limiting and Redis caching"),
        ("Library Management System", "Role-based access and reporting endpoints")
    ],
    "data": [
        ("Sales Data Warehouse", "Star schema with scheduled loads and tests"),
        ("Public Transport Analytics", "Pipeline from open data to a dashboard")
    ],
    "analyst": [
        ("Retail Sales Dashboard", "KPI dashboard from raw CSV exports"),
        ("Customer Churn Analysis", "Cohort analysis and recommendations")
    ],
    "ml": [
        ("Sentiment Classifier", "Fine-tuned text classifier with evaluation report"),
        ("Image Defect Detection", "CNN trained on a small labeled dataset")
    ],
    "frontend": [
        ("Personal Portfolio", "Responsive site with performance budget"),
        ("Expense Tracker App", "State management and charts")
    ],
    "fullstack": [
        ("Job Board App", "Full-stack app with auth and search")
    ],
    "devops": [
        ("Home Lab Kubernetes Cluster", "Terraform-provisioned cluster with monitoring")
    ],
    "qa": [
        ("E-commerce Test Suite", "End-to-end tests with CI reporting")
    ],
}

# ----------------------------------------------------------------------------
# 15 persona. jobs: [(title, kind, domain)] theo thứ tự CŨ -> MỚI
# ----------------------------------------------------------------------------
PERSONAS = [
    dict(
        id="cv_001", 
        tag="fresher_backend_python", 
        seniority="junior", months=8,
        degree="Bachelor of Science in Computer Science",
        n_projects=2,
        jobs=[
            ("Junior Backend Developer", "backend", "e-commerce")
        ],
        skills=["Python", "Django", "PostgreSQL", "REST APIs", "Git", "Docker", "Linux"],
        hard_case=None
    ),
    dict(
        id="cv_002",
        tag="mid_backend_python", 
        seniority="mid", 
        months=40,
        degree="Bachelor of Engineering in Software Engineering", 
        n_projects=0,
        jobs=[
            ("Software Engineer", "backend", "fintech"),
            ("Backend Engineer", "backend", "fintech")
        ],
        skills=["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "AWS", "REST APIs", "CI/CD", "Git"],
        hard_case=None
    ),
    dict(
        id="cv_003", 
        tag="senior_backend_java", 
        seniority="senior", 
        months=108,
        degree="Bachelor of Science in Computer Science", 
        n_projects=0,
        jobs=[
            ("Software Engineer", "backend", "logistics"),
            ("Backend Engineer", "backend", "logistics"),
            ("Senior Backend Engineer", "backend", "payments")
        ],
        skills=["Java", "Spring Boot", "Kafka", "PostgreSQL", "Kubernetes", "Microservices",
                 "System Design", "AWS", "CI/CD"],
        hard_case=None
    ),
    dict(
        id="cv_004", 
        tag="mid_data_engineer", 
        seniority="mid", 
        months=50,
        degree="Bachelor of Information Technology", 
        n_projects=0,
        jobs=[
            ("Data Analyst", "analyst", "retail"),
            ("Data Engineer", "data", "retail")
        ],
        skills=["SQL", "Python", "Airflow", "dbt", "Apache Spark", "ETL", "Data Warehousing", "AWS"],
        hard_case=None
    ),
    dict(
        id="cv_005", 
        tag="bi_to_data_engineer", 
        seniority="senior", 
        months=84,
        degree="Bachelor of Information Technology", 
        n_projects=0,
        jobs=[
            ("BI Analyst", "analyst", "banking"),
            ("Senior BI Developer", "analyst", "banking"),
            ("Data Engineer", "data", "banking")
        ],
        skills=["SQL", "Python", "Airflow", "ETL", "Data Modeling", "Power BI", "Apache Spark"],
        hard_case="career_shift: BI -> data engineering, chua co nhieu cloud"
    ),
    dict(
        id="cv_006", 
        tag="junior_ml_engineer", 
        seniority="junior", 
        months=20,
        degree="Master of Science in Data Science", 
        n_projects=2,
        jobs=[
            ("Machine Learning Engineer", "ml", "e-commerce search")
        ],
        skills=["Python", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "SQL", "Docker", "Machine Learning"],
        hard_case=None
    ),
    dict(
        id="cv_007", 
        tag="senior_nlp_engineer", 
        seniority="senior", 
        months=90,
        degree="Master of Science in Computer Science", 
        n_projects=0,
        jobs=[
            ("Data Scientist", "ml", "customer support"),
            ("Machine Learning Engineer", "ml", "customer support"),
            ("Senior Machine Learning Engineer", "ml", "document understanding")
        ],
        skills=["Python", "PyTorch", "Natural Language Processing", "TensorFlow", "Docker",
                 "Kubernetes", "AWS", "SQL", "Machine Learning"],
        hard_case=None
    ),
    dict(
        id="cv_008", 
        tag="mid_frontend_react", 
        seniority="mid", 
        months=45,
        degree="Bachelor of Science in Computer Science", 
        n_projects=1,
        jobs=[
            ("Frontend Developer", "frontend", "SaaS"),
            ("Frontend Engineer", "frontend", "SaaS")
        ],
        skills=["JavaScript", "TypeScript", "React", "Redux", "HTML/CSS", "Jest", "Git"],
        hard_case=None
    ),
    dict(
        id="cv_009", 
        tag="mid_fullstack_ts", 
        seniority="mid", 
        months=62,
        degree="Bachelor of Engineering in Software Engineering", 
        n_projects=0,
        jobs=[
            ("Full Stack Developer", "fullstack", "education"),
            ("Full Stack Engineer", "fullstack", "education")
        ],
        skills=["TypeScript", "Node.js", "React", "PostgreSQL", "MongoDB", "Docker", "GraphQL", "Git"],
        hard_case=None
    ),
    dict(
        id="cv_010", 
        tag="mid_devops", 
        seniority="mid", 
        months=70,
        degree="Bachelor of Science in Computer Science",
        n_projects=0,
        jobs=[
            ("System Administrator", "devops", "hosting"),
            ("DevOps Engineer", "devops", "SaaS")
        ],
        skills=["Linux", "Docker", "Kubernetes", "Terraform", "AWS", "Jenkins", "CI/CD", "Python", "Prometheus"],
        hard_case=None
    ),
    dict(
        id="cv_011", 
        tag="qa_to_sdet", 
        seniority="mid", 
        months=58,
        degree="Bachelor of Information Technology", 
        n_projects=0,
        jobs=[
            ("QA Engineer", "qa", "mobile banking"),
            ("QA Automation Engineer", "qa", "mobile banking")
        ],
        skills=["Python", "Selenium", "Pytest", "API Testing", "Postman", "CI/CD", "SQL", "Git"],
        hard_case="near_fit: manh ve test automation, yeu ve backend dev"
    ),
    dict(
        id="cv_012", 
        tag="marketing_to_data_analyst", 
        seniority="junior", 
        months=30,
        degree="Bachelor of Business Administration", 
        n_projects=2,
        jobs=[
            ("Marketing Executive", "marketing", "consumer goods"),
            ("Data Analyst", "analyst", "consumer goods")
        ],
        skills=["SQL", "Excel", "Python", "Pandas", "Tableau", "Google Analytics"],
        hard_case="career_changer: marketing -> data analyst"
    ),
    dict(
        id="cv_013", 
        tag="overqualified_eng_manager", 
        seniority="lead", 
        months=168,
        degree="Master of Science in Computer Science", 
        n_projects=0,
        jobs=[
            ("Software Engineer", "backend", "telecom"),
            ("Senior Software Engineer", "backend", "telecom"),
            ("Tech Lead", "management", "telecom"),
            ("Engineering Manager", "management", "telecom")
        ],
        skills=["Python", "Java", "System Design", "Microservices", "Kafka", "AWS",
                 "PostgreSQL", "Team Leadership"],
        hard_case="overqualified: nen khop JD senior/lead, qua cao so voi JD mid/junior"
    ),
    dict(
        id="cv_014", 
        tag="mid_backend_nodejs_go", 
        seniority="mid", 
        months=48,
        degree="Bachelor of Science in Computer Science", 
        n_projects=0,
        jobs=[
            ("Backend Developer", "backend", "gaming"),
            ("Backend Engineer", "backend", "gaming")
        ],
        skills=["Node.js", "Go", "TypeScript", "MongoDB", "Redis", "Docker", "gRPC", "Git"],
        hard_case="near_fit: backend tot nhung khong dung stack Python/Java"),
    dict(
        id="cv_015", 
        tag="sparse_vn_fresher_analyst", 
        seniority="junior", 
        months=12,
        degree="Bachelor of Economics", 
        n_projects=1,
        jobs=[
            ("Data Analyst Intern", "analyst", "logistics")
        ],
        skills=["SQL", "Excel", "Power BI", "Python"],
        hard_case="sparse_cv: khong co muc Skills, dia diem VN, tieng Viet/Anh",
        omit_skills_section=True, 
        vi_lang=True
    ),
]

# Dev for testing
DEV_TEST_TEST_IDS = {"cv_003", "cv_005", "cv_008", "cv_011", "cv_013"}