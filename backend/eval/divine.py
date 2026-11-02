import pandas as pd 
from itertools import combinations
import json
from pathlib import Path
from llm_evaluation import cv_years

CV_FAMILY = {"cv_001": "backend", "cv_002": "backend",  "cv_003": "backend",
             "cv_004": "data_eng", "cv_005": "data_eng", "cv_006": "ml_ai", 
             "cv_007": "ml_ai", "cv_008": "frontend", "cv_009": "fullstack", 
             "cv_010": "devops", "cv_011": "qa", "cv_012": "data_analyst", 
             "cv_013": "manager", "cv_014": "backend", "cv_015": "data_analyst"}   # ... đủ 15
JD_FAMILY = {"jd_001": "ml_ai", "jd_002": "ml_ai", "jd_003": "ml_ai", 
             "jd_004": "ml_ai", "jd_005": "ml_ai","jd_006": "backend",
             "jd_007": "backend", "jd_008": "backend", "jd_009": "backend",
             "jd_010": "backend", "jd_011": "backend", "jd_012": "backend",
             "jd_013": "frontend", "jd_014": "frontend", "jd_015": "backend"}

ADJACENT = {frozenset(p) for p in [
    ("backend", "ml_ai"),
    ("backend", "data_eng"),
    ("backend", "qa"),
    ("backend", "devops"),
    ("backend", "fullstack"),
    ("frontend", "fullstack"),
    ("ml_ai", "data_eng"),
    ("ml_ai", "data_analyst"),
    ("data_eng", "data_analyst"),
]}


def role_rel(cv_fam, jd_fam):
    if cv_fam == jd_fam:
        return "same"
    if cv_fam == "fullstack" and jd_fam in ("backend", "frontend"):
        return "same"
    return "adjacent" if frozenset((cv_fam, jd_fam)) in ADJACENT else "different"

def rubric_cap(role, jd_min, cv_yrs):
    gap = jd_min - cv_yrs                      # dương = CV thiếu năm
    over = -gap                                # dương = CV dư năm
    if role == "different":                    return 0
    if gap >= 4:                               return 0
    if role == "adjacent" and over >= 5:       return 0
    if role == "adjacent" or gap >= 1 or over >= 5:   return 1
    return 2

def load_json(dir: json) -> dict:
    with open(dir, "r", encoding = "utf-8") as f:
        data = json.load(f)

    return data 

def set_human(df, pid, rel, amb=False):
    idx = df.index[df.pair_id == pid]
    assert len(idx) == 1, f"{pid}: khớp {len(idx)} dòng"
    df.loc[idx, "human_relevance"] = rel
    df.loc[idx, "final_relevance"] = rel
    df.loc[idx, "final_source"] = "human_adjudicated"
    df.loc[idx, "ambiguous"] = amb

def overlap(c, j):
    cs = {s.lower() for s in cv_lab[c]["skills"]}
    js = {s.lower() for s in jd_lab[j]["must_have_skills"]}
    return len(cs & js) / max(len(js), 1)


if __name__ == "__main__":
    pd.set_option("display.max_colwidth", 220)
    pd.set_option("display.width", 250)
 
    def section(title: str) -> None:
        print(f"\n{'=' * 8} {title} {'=' * 8}")
 
    def set_human(df, pid, rel, amb=False):
        idx = df.index[df.pair_id == pid]
        assert len(idx) == 1, f"{pid}: khớp {len(idx)} dòng (phải đúng 1)"
        df.loc[idx, "human_relevance"] = rel
        df.loc[idx, "final_relevance"] = rel
        df.loc[idx, "final_source"] = "human_adjudicated"
        df.loc[idx, "ambiguous"] = amb
 
    root = Path(__file__).parent.parent.parent
    data_cv = root / "data" / "cv"
    data_jd = root / "data" / "jd"
    out_path = root / "data" / "pairs.csv"
 
    jd_lab = {j: load_json(data_jd / "labels" / f"{j}.json")["label"] for j in JD_FAMILY}
    cv_lab = {c: load_json(data_cv / "labels" / f"{c}.json")["labels"] for c in CV_FAMILY}
    jd_min = {j: jd_lab[j]["min_exp_years"] for j in JD_FAMILY}
    cv_yrs = {c: cv_years(load_json(data_cv / "labels" / f"{c}.json")) for c in CV_FAMILY}
 
    # ------------------------------------------------------------------ 1
    section("1. DÒNG TRÙNG")
    df = pd.read_csv(root / "pairs_llm.csv")
    print("Số dòng trước khi dedupe:", len(df))
    dup = df[df.pair_id.duplicated(keep=False)].sort_values("pair_id")
    print(dup[["pair_id", "human_relevance", "llm_relevance", "llm_model"]].to_string()
          if len(dup) else "Không có dòng trùng")
 
    df = (df.sort_values("human_relevance")
            .drop_duplicates("pair_id", keep="first")
            .sort_values("pair_id").reset_index(drop=True))
    assert len(df) == len(CV_FAMILY) * len(JD_FAMILY), len(df)
    df["ambiguous"] = df["ambiguous"].map(lambda x: str(x).strip().upper() == "TRUE")
 
    # ------------------------------------------------------------------ 2
    section("2. KIỂM TRA RUBRIC / MAPPING VỚI NHÃN NGƯỜI")
    df["role"] = [role_rel(CV_FAMILY[c], JD_FAMILY[j]) for c, j in zip(df.cv_id, df.jd_id)]
    df["cap"] = [rubric_cap(r, jd_min[j], cv_yrs[c]) for r, c, j in zip(df.role, df.cv_id, df.jd_id)]
 
    h = df[df.human_relevance.notna()]
    print("Số cặp có nhãn người:", len(h))
    print("người > cap:", (h.human_relevance > h.cap).sum(), "(kỳ vọng 0)")
    print("LLM > cap  :", (h.llm_relevance > h.cap).sum())
    print("cap vs người (hàng = cap, cột = nhãn người):")
    print(pd.crosstab(h.cap, h.human_relevance))
    bad = h[h.human_relevance > h.cap]
    if len(bad):
        print(bad[["pair_id", "role", "cap", "human_relevance", "human_reason"]].to_string())
    assert len(bad) == 0, "Rubric/mapping mâu thuẫn với nhãn người, kiểm tra role_rel / ADJACENT"
 
    # ------------------------------------------------------------------ 3
    df["llm_over"] = df.llm_relevance > df.cap
    df["auto_relevance"] = df[["llm_relevance", "cap"]].min(axis=1)
 
    need = df.human_relevance.isna()
    over = df[need & df.llm_over]
    maybe = df[need & ~df.llm_over & (df.llm_relevance == 1) & (df.cap == 2)]
 
    df["final_relevance"] = df["human_relevance"].fillna(df["auto_relevance"])
    df["final_source"] = "llm_rule_agreed"
    df.loc[df.human_relevance.notna(), "final_source"] = "human_adjudicated"
    df.loc[over.index, "final_source"] = "rule_capped"
    df.loc[maybe.index, "final_source"] = "needs_review"
 
    # Nhãn người sau khi rà
    A = ["cv_001__jd_006", "cv_001__jd_009", "cv_002__jd_006", "cv_002__jd_009",
         "cv_014__jd_006", "cv_014__jd_009", "cv_014__jd_010", "cv_007__jd_004"]
    B = {"cv_002__jd_012": (2, False),
         "cv_014__jd_011": (1, True),
         "cv_001__jd_007": (1, True),
         "cv_014__jd_007": (1, True)}

    B.update({
        "cv_009__jd_006": (1, False), "cv_009__jd_009": (1, False),
        "cv_009__jd_010": (1, False), "cv_009__jd_012": (1, False),
        "cv_009__jd_011": (1, True),  "cv_009__jd_014": (1, True),
    })

    B.update({
        "cv_010__jd_009": (0, False), "cv_004__jd_009": (0, False),
        "cv_006__jd_009": (0, False), "cv_014__jd_001": (0, False),
        "cv_014__jd_002": (0, False), "cv_014__jd_005": (1, True),
    })
    for pid in A:
        set_human(df, pid, 1)
    for pid, (rel, amb) in B.items():
        set_human(df, pid, rel, amb)
 
    # ------------------------------------------------------------------ 4
    section("3. CÁC DÒNG CÒN needs_review (cần bạn quyết định)")
    nr = df[df.final_source == "needs_review"]
    print(len(nr), "dòng còn lại sau khi áp A và B")
    for _, r in nr.iterrows():
        print(f"\n{r.pair_id} | role={r.role} cap={r.cap} | LLM={int(r.llm_relevance)}")
        print(f"  CV  ({CV_FAMILY[r.cv_id]}, {cv_yrs[r.cv_id]} năm): {', '.join(cv_lab[r.cv_id]['skills'])}")
        print(f"  JD  ({JD_FAMILY[r.jd_id]}, min {jd_min[r.jd_id]} năm): {', '.join(jd_lab[r.jd_id]['must_have_skills'])}")
        print(f"  LLM nói: {r.llm_reason}")
 
    # ------------------------------------------------------------------ 5
    df["use_in_main"] = (df.final_source != "needs_review") & ~df["ambiguous"]
 
    assert df.pair_id.is_unique and len(df) == 225
    assert df.final_relevance.notna().all()
    h = df[df.human_relevance.notna()]
    assert (h.human_relevance <= h.cap).all(), "Nhãn người vượt trần sau khi áp A/B"
 
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
 
    section("4. TỔNG KẾT")
    print("final_relevance bị thiếu:", df.final_relevance.isna().sum(), "(phải là 0)")
    print("\nNguồn nhãn:")
    print(df.final_source.value_counts().to_string())
    print("\nPhân bố nhãn cuối:")
    print(df.final_relevance.value_counts().sort_index().to_string())
    print(f"\nDùng cho metric chính: {int(df.use_in_main.sum())} / {len(df)}")
    print("\nNhãn theo CV (cột = nhãn cuối):")
    print(pd.crosstab(df.cv_id, df.final_relevance).to_string())
 
    # ------------------------------------------------------------------ 6
    section("5. 15 DÒNG llm_rule_agreed (nhãn 1) ĐỂ ĐỐI CHIẾU VỚI SKILLS")
    pool = df[(df.final_source == "llm_rule_agreed") & (df.llm_relevance == 1)]
    for _, r in pool.sample(min(15, len(pool)), random_state=42).iterrows():
        print(f"\n{r.pair_id} | role={r.role} cap={r.cap} | CV {cv_yrs[r.cv_id]} năm, JD min {jd_min[r.jd_id]} năm")
        print(f"  CV skills : {', '.join(cv_lab[r.cv_id]['skills'])}")
        print(f"  JD must   : {', '.join(jd_lab[r.jd_id]['must_have_skills'])}")
        print(f"  LLM nói   : {r.llm_reason}")
 
    def overlap(c, j):
        cs = {s.lower() for s in cv_lab[c]["skills"]}
        js = {s.lower() for s in jd_lab[j]["must_have_skills"]}
        return len(cs & js) / max(len(js), 1)

    df["overlap"] = [overlap(c, j) for c, j in zip(df.cv_id, df.jd_id)]
    low = df[(df.role == "adjacent") & (df.final_relevance == 1) & (df.overlap < 0.1)]
    print(len(low), "cặp adjacent nhãn 1 mà skill trùng dưới 10%")
    print(low[["pair_id", "final_source", "overlap"]].to_string())

    print("\nĐã lưu:", out_path)