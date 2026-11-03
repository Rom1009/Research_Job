from pathlib import Path
from cvs.cv_pipeline import ParsingData, ChunkingData
from dotenv import load_dotenv
import os 
import json

load_dotenv()

def read_texts(ids: list) -> dict:
    out = {}
    for i in ids:
        raw = (data_cv / f"{i}").read_text(encoding = "utf-8")
        clean = ParsingData.clean_markdown_noise(raw)
        norm = ParsingData.normalize_headers_to_canonical(clean)

        new_i = i.split("/")[-1].split(".")[0]
        out[new_i] = norm
    return out

def chunking(out: dict) -> dict:

    chunk_out = {}

    # for k, v in out.items():
    #     chunk = ChunkingData(v)
    #     val_chunk = chunk(k)
    #     chunk_out[k] = val_chunk
    chunk = ChunkingData(out["cv_001"])
    val_chunk = chunk("cv_001")
    chunk_out["cv_001"] = val_chunk
    return chunk_out

def save_txt(output_path: str, content: dict):
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(content, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    ROOT = Path(__file__).parent.parent.parent

    data_cv = ROOT / "data" / "cv" / "raw"

    cv_ids = os.listdir(data_cv)

    out = read_texts(cv_ids)

    chunk_out = chunking(out)
    save_txt("content.json", chunk_out)