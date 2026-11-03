import json 
import random 
from pathlib import Path

import numpy as np 
import pandas as pd 

ROOT = Path(__file__).parent.parent.parent
PAIRS = ROOT / "data" / "pairs.csv"
K = 3
N_RANDOM = 500          # số lần xáo cho baseline ngẫu nhiên
SEED = 42

# ----------------------------------------------------------------------------
# Dữ liệu
# ----------------------------------------------------------------------------
def load_json(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def norm(items) -> set[str]:
    return {x.strip().lower() for x in items}

def load_skills(cv_ids: str, jd_ids: str):
    cv = {c: norm(load_json(ROOT / "data" / "cv" / "labels" / f"{c}.json")["labels"]["skills"]) for c in cv_ids}
    jd = {j: norm(load_json( ROOT / "data" / "jd" / "labels" / f"{j}.json" )["label"]["must_have_skills"]) for j in jd_ids}
    return cv, jd

# ----------------------------------------------------------------------------
# Metric
# ----------------------------------------------------------------------------

def ndcg_at_k(ranked: list[str], rel: dict[str, str], k: int = K) -> float: 
    dcg = sum((2 ** rel[j] - 1) / np.log2(i + 2) for i, j in enumerate(ranked[:k]))
    ideal = sorted(rel.values(), reverse=True)[:k]
    idcg = sum((2 ** g - 1) / np.log2(i + 2) for i, g in enumerate(ideal))
    return dcg / idcg if idcg else float("nan")

def precision_at_k(ranked, rel, k = K, thr = 1):
    top = ranked[:k]
    return sum(rel[j] >= thr for j in top) / len(top) if top else float("nan")

def recall_at_k(ranked, rel, k = K, thr = 1):
    relevant = {j for j, r in rel.items() if r >= thr}
    return len(relevant & set(ranked[:k])) / len(relevant) if relevant else float("nan")

def zero_in_topk(ranked, rel, k=K):
    return sum(rel[j] == 0 for j in ranked[:k])

# ----------------------------------------------------------------------------
# Xếp hạng
# ----------------------------------------------------------------------------
def make_skill_overlap(cv_sk, jd_sk):
    def rank(cv_id, jd_ids):
        score = {j: len(cv_sk[cv_id] & jd_sk[j]) / max(len(jd_sk[j]), 1) for j in jd_ids}
        return sorted(jd_ids, key=lambda j: (-score[j], j))
    return rank

PIPELINE = None

# ----------------------------------------------------------------------------
# Đánh giá
# ----------------------------------------------------------------------------
def evaluate(name, rank_fn, rel_by_cv):
    rows = []
    for cv_id, rel in rel_by_cv.items():
        ranked = rank_fn(cv_id, list(rel))
        ranked = [j for j in ranked if j in rel]            # chỉ giữ JD có nhãn dùng được
        rows.append({
            "cv_id": cv_id,
            "ndcg": ndcg_at_k(ranked, rel),
            "precision": precision_at_k(ranked, rel),
            "recall": recall_at_k(ranked, rel),
            "zero_in_top": zero_in_topk(ranked, rel),
        })
    return pd.DataFrame(rows).assign(method=name)

def error_report(rank_fn, rel_by_cv, k=3):
    for cv_id, rel in rel_by_cv.items():
        ranked = [j for j in rank_fn(cv_id, list(rel)) if j in rel]
        top = ranked[:k]
        print(f"\n{cv_id}")
        for j in top:
            print(f"  top  {j}  nhãn={rel[j]}", "  <-- SAI" if rel[j] == 0 else "")
        best = [j for j in sorted(rel, key=rel.get, reverse=True)[:k] if j not in top and rel[j] > 0]
        print("  bỏ sót:", [(j, rel[j]) for j in best])
 
def main() -> None:
    df = pd.read_csv(PAIRS)
    use = df[df.use_in_main.astype(bool)]
 
    # Chỉ giữ CV có ít nhất 2 mức nhãn khác nhau (toàn một nhãn thì không phân biệt được)
    rel_by_cv = {}
    for cv_id, g in use.groupby("cv_id"):
        rel = dict(zip(g.jd_id, g.final_relevance.astype(int)))
        if len(set(rel.values())) >= 2:
            rel_by_cv[cv_id] = rel
 
    print(f"Dùng {len(use)} / {len(df)} cặp, {len(rel_by_cv)} / {df.cv_id.nunique()} CV có nhãn khác nhau")
    print("CV bị loại:", sorted(set(df.cv_id) - set(rel_by_cv)))
 
    cv_sk, jd_sk = load_skills(df.cv_id.unique(), df.jd_id.unique())
 
    # Baseline ngẫu nhiên: trung bình nhiều lần xáo
    rng = random.Random(SEED)
    rand_runs = []
    for _ in range(N_RANDOM):
        def shuffled(cv_id, jd_ids):
            x = list(jd_ids)
            rng.shuffle(x)
            return x
        rand_runs.append(evaluate("random", shuffled, rel_by_cv))
    rand = pd.concat(rand_runs).groupby("cv_id", as_index=False).mean(numeric_only=True).assign(method="random")
 
    results = [rand, evaluate("skill_overlap", make_skill_overlap(cv_sk, jd_sk), rel_by_cv)]
 
    if PIPELINE is not None:
        results.append(evaluate("pipeline", lambda cv_id, jd_ids: PIPELINE(cv_id), rel_by_cv))
 
    all_res = pd.concat(results)
 
    summary = (all_res.groupby("method")[["ndcg", "precision", "recall", "zero_in_top"]]
                      .mean().round(3))
    print(f"\n===== Tổng hợp (k={K}, {len(rel_by_cv)} CV) =====")
    print(summary.to_string())
 
    print("\n===== nDCG@3 theo CV =====")
    print(all_res.pivot(index="cv_id", columns="method", values="ndcg").round(2).to_string())
 
    out = ROOT / "data" / "eval_retrieval_results.csv"
    all_res.to_csv(out, index=False)
    print("\nĐã lưu:", out)

    error_report(make_skill_overlap(cv_sk, jd_sk), {c: rel_by_cv[c] for c in ["cv_010", "cv_005", "cv_011"]})
 
if __name__ == "__main__":
    main()
 