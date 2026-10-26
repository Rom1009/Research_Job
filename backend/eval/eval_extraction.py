import pandas as pd 
import random
from pathlib import Path
import json
from datetime import date
from dateutil import parser

def random_sample(quota: dict, group: dict) -> dict:
    cv_ids = [f"cv_{i:03d}" for i in range(1, 15)]
    sample = []
    for g, jd_list in group.items():
        pool = [(cv, jd) for cv in cv_ids for jd in jd_list]
        sample += random.sample(pool, min(quota[g], len(pool)))

    random.shuffle(sample)
    return sample

def load_json(dir: json) -> dict:
    with open(dir, "r", encoding = "utf-8") as f:
        data = json.load(f)

    return data 

def load_dir(dir_path: str, id_key: str) -> dict[str, dict]:
    out = {}
    for p in sorted(Path(dir_path).glob("*.json")):
        data = load_json(p)
        out[data[id_key]] = data
    return out

def months(period: str) -> float:
    start, _, end = [s.strip() for s in period.partition("-")]
    s = parser.parse(start).date()
    e = TODAY if end.lower() in ("present", "now", "") else parser.parse(end).date()
    return max((e.year - s.year) * 12 + (e.month - s.month), 0)

def summarize(cv: dict) -> str:
    L = cv["labels"]
    jobs = L.get("work_experience", [])
    years = round(sum(months(j["period"]) for j in jobs) / 12, 1)
    title = jobs[0]["title"] if jobs else "No experience"
    skills = list(dict.fromkeys(
        L["skills"] + [t for p in L.get("project", []) for t in p.get("technologies", [])]
    ))
    edu = "; ".join(e["degree"] + f"({e["period"]})" for e in L.get("education", []))
    projects = ", ".join(p["name"] for p in L.get("project", []))
    return (f"{title} | {years} | {edu}\n"
            f"Skills: {", ".join(skills)}\n"
            f"Projects: {projects}")

def export_to_csv(sample: list[tuple[str, str]], cv_dir: str, jd_dir: str, meta_path: str, out_path: str) -> pd.DataFrame:
    cvs = load_dir(cv_dir, "cv_id")
    jds = load_dir(jd_dir, "jd_id")
    meta = pd.read_csv(meta_path).set_index("jd_id")

    rows = []
    for cv_id, jd_id in sample:
        rows.append({
            "cv_id": cv_id,
            "jd_id": jd_id,
            "summarize": summarize(cvs[cv_id]),
            "jd_title": meta.loc[jd_id, "jd_title"],
            "jd_min_years": jds[jd_id]["label"]["min_exp_years"],
            "human_relevance": "",
            "human_reason": "",
            "ambiguous": "",
        })
    df = pd.DataFrame(rows)
    df.to_csv(out_path, index = False, encoding="utf-8-sig")
    return df


if __name__ == "__main__":
    # Date
    TODAY = date(2026, 10, 26)
    # Dir
    root = Path(__file__).resolve().parent.parent.parent
    jd_dir = root / "data" / "jd" / "labels"
    cv_dir = root / "data" / "cv" / "labels"
    

    # Sample 
    random.seed(45)
    group = {
        "expect_2": ["jd_015"],
        "expect_1": ["jd_006", "jd_008", "jd_009", "jd_010",
                     "jd_011", "jd_012", "jd_013", "jd_007"],
        "expect_0": ["jd_014", "jd_001", "jd_003", "jd_004", "jd_005"],
    }

    quota = {"expect_2": 8, "expect_1": 12, "expect_0": 10}

    sample = random_sample(quota, group)
    export_to_csv(sample, cv_dir, jd_dir, root / "data" / "jd" / "meta.csv", "parse.csv")
