from __future__ import annotations

import argparse
import json 
import random
from pathlib import Path

from .dump_data import (
    DEV_TEST_TEST_IDS,
    MONTHS,
    NOW,
    PERSONAS,
    PROJECTS,
    BULLETS,
    FIRST,
    LAST,
    CITIES,
    COMP_A,
    COMP_B,
    UNIS
)


def fmt(m: int) -> str:
    return f"{MONTHS[m % 12]} {m//12}"

def split_months(total: int, n: int, min_len: int  = 6) -> list[int]:
    assert total >= n * min_len, f"{total} can not divide for {n} job"
    base = [min_len] * n
    rest = total - n * min_len
    cuts = sorted(random.randint(0, rest) for _ in range(n - 1))

    parts = [b + x for b, x in zip(base, [cuts[0]] + [cuts[i] - cuts[i - 1] 
            for i in range (1 , len(cuts))]+[rest - (cuts[-1] if cuts else 0)])] if n > 1 else [total]

    assert sum(parts) == total
    return parts

def make_bullets(kind: str, skills: list[str], domain: str, k: int) -> list[str]:
    pool = random.sample(BULLETS[kind], min(k, len(BULLETS[kind])))
    out = []

    for t in pool:
        a, b = (random.sample(skills, 2) if len(skills) >= 2 else (skills[0], skills[0]))

        out.append(t.format(
            a = a,
            b = b, 
            d = domain,
            p = random.choice([18, 22, 27, 31, 35, 40]),
            c = random.choice([75, 80, 85, 90]),
            h = random.choice([4, 6, 8, 10]),
            t = random.randint(5, 10)
        ))

    return out

def build_cv(p: dict) -> dict:
    n = len(p["jobs"])
    home = "Ho Chi Minh City" if p.get("vi_lang") else random.choice(CITIES)
    start = NOW - p["months"]
    parts = split_months(p["months"], n)
    cursor = start
    jobs = []

    for (title, kind, domain), length in zip(p["jobs"], parts):
        s, e = cursor, cursor + length
        cursor = e
        is_last = (e == NOW)
        period = f"{fmt(s)} - {'Present' if is_last else fmt(e)}"   
        jobs.append(dict(
            company=f"{random.choice(COMP_A)} {random.choice(COMP_B)}",
            title=title, location=home, period=period,
            achievements=make_bullets(kind, p["skills"], domain, random.randint(3, 5)),
            _start=s, _end=e,
        ))

    for a, b in zip(jobs, jobs[1:]):
        assert a["_end"] <= b["_start"], "job chong cheo"
    jobs_display = list(reversed(jobs))  # mới nhất trước

    grad_year = start // 12 if start % 12 >= 5 else start // 12  # tốt nghiệp trước/đầu khi đi làm
    education = [dict(institution=random.choice(UNIS), degree=p["degree"],
                      location=home, period=str(grad_year))]
 
    # dự án: dùng kind của job cuối
    last_kind = p["jobs"][-1][1]
    projects = []
    pool = PROJECTS.get(last_kind, [])
    for name, desc in random.sample(pool, min(p["n_projects"], len(pool))):
        py = random.randint(max(grad_year - 1, 2015), grad_year)
        projects.append(dict(name=name, period=str(py),
                             technologies=random.sample(p["skills"], min(3, len(p["skills"]))),
                             description=[desc]))
 
    first, last = random.choice(FIRST), random.choice(LAST)
    years = p["months"] / 12
    if years < 1:
        yrs_txt = "Entry-level"
    else:
        yrs_txt = f"{int(years)}+ years of experience"
    top = p["skills"][:3]
    summary = (f"{p['jobs'][-1][0]} with {yrs_txt} in {', '.join(top)}. "
               f"Experience in {p['jobs'][-1][2]}. Comfortable working in cross-functional teams.")
    if p.get("vi_lang"):
        summary = (f"Sinh vien moi ra truong, {yrs_txt}, quan tam phan tich du lieu "
                   f"({', '.join(top)}). Hoc nhanh, co trach nhiem.")
 
    extra = []
    extra.append("English: Professional working proficiency")
    if p.get("vi_lang"):
        extra = ["Tieng Anh: giao tiep co ban (IELTS 6.0)", "Vietnamese: Native"]
 
    location = home

    return dict(
        resume_id=p["id"],
        full_name=f"{first} {last}",
        email=f"{first}.{last}{random.randint(1, 99)}@example.com".lower(),
        phone=(f"+84 9{random.randint(10000000, 99999999)}" if home in ("Ho Chi Minh City", "Ha Noi", "Da Nang") else f"+1 555-{random.randint(1000, 9999)}"),
        location=location,
        headline=p["jobs"][-1][0],
        summary=summary,
        label=dict(
            skills=[] if p.get("omit_skills_section") else p["skills"],
            education=education,
            work_experience=[{k: v for k, v in j.items() if not k.startswith("_")}
                             for j in jobs_display],
            project=projects,
            additional_info=extra,
        ),
    )

def to_text(cv: dict) -> str:
    L = cv["label"]
    out = [cv["full_name"], cv["headline"],
           f"{cv['email']} | {cv['phone']} | {cv['location']}", "",
           "Professional Summary", cv["summary"], ""]
    if L["skills"]:
        out += ["Skills", ", ".join(L["skills"]), ""]
    out.append("Work Experience")
    for j in L["work_experience"]:
        out += [f"{j['title']} - {j['company']}", f"{j['location']} | {j['period']}"]
        out += [f"• {a}" for a in j["achievements"]] + [""]
    out.append("Education")
    for e in L["education"]:
        out += [f"{e['degree']} - {e['institution']}", f"{e['location']} | {e['period']}", ""]
    if L["project"]:
        out.append("Projects")
        for pr in L["project"]:
            out += [pr["name"], f"{pr['period']} | {', '.join(pr['technologies'])}"]
            out += [f"• {d}" for d in pr["description"]] + [""]
    out.append("Additional Information")
    out += [f"• {a}" for a in L["additional_info"]]
    return "\n".join(out) + "\n"


def render_pdf(text: str, path: Path) -> bool:
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
        from xml.sax.saxutils import escape
    except ImportError:
        return False
    styles = getSampleStyleSheet()
    story = []
    for line in text.split("\n"):
        if not line.strip():
            story.append(Spacer(1, 4))
            continue
        story.append(Paragraph(escape(line), styles["BodyText"]))
    SimpleDocTemplate(str(path), pagesize=A4).build(story)
    return True

def validate(cv: dict) -> None:
    jobs = cv["label"]["work_experience"]
    assert jobs, "khong co job"
    assert sum("Present" in j["period"] for j in jobs) <= 1, "nhieu hon 1 Present"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="./data")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--pdf", action="store_true", help="xuat them PDF (can reportlab)")
    args = ap.parse_args()
    random.seed(args.seed)
 
    root = Path(args.out)
    (root / "raw/cv").mkdir(parents=True, exist_ok=True)
    (root / "parsed_truth").mkdir(parents=True, exist_ok=True)
    (root / "golden").mkdir(parents=True, exist_ok=True)
 
    meta, labels_tpl = {}, {}
    for p in PERSONAS:
        cv = build_cv(p)
        validate(cv)
        text = to_text(cv)
        (root / "raw/cv" / f"{p['id']}.txt").write_text(text, encoding="utf-8")
        if args.pdf and not render_pdf(text, root / "raw/cv" / f"{p['id']}.pdf"):
            print("Khong co reportlab, bo qua PDF")
            args.pdf = False
        (root / "parsed_truth" / f"{p['id']}.json").write_text(
            json.dumps(cv, ensure_ascii=False, indent=2), encoding="utf-8")
        meta[p["id"]] = dict(persona=p["tag"], seniority=p["seniority"],
                             years_exp=round(p["months"] / 12, 1),
                             source="synthetic", hard_case=p["hard_case"],
                             skills=p["skills"],
                             split="test" if p["id"] in DEV_TEST_TEST_IDS else "dev")
        labels_tpl[p["id"]] = dict(persona=p["tag"], labels={})
 
    (root / "cv_meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    (root / "golden/labels_template.json").write_text(
        json.dumps(labels_tpl, ensure_ascii=False, indent=2), encoding="utf-8")
    split = {"dev": [k for k, v in meta.items() if v["split"] == "dev"],
             "test": [k for k, v in meta.items() if v["split"] == "test"]}
    (root / "golden/split.json").write_text(json.dumps(split, indent=2), encoding="utf-8")
    print(f"Da tao {len(PERSONAS)} CV trong {root.resolve()}")
    print(f"dev={len(split['dev'])} test={len(split['test'])}")
 
 
if __name__ == "__main__":
    main()