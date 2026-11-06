import dspy

from dotenv import load_dotenv
import os
from dspy.teleprompt import BootstrapFewShot

# Mẫu train (dùng để bootstrap few-shot demos)
train_examples = [
    dspy.Example(
        user_question="Chính sách đổi trả hàng trong bao lâu?",
        answer="Trong vòng 7 ngày kể từ ngày nhận hàng."
    ).with_inputs("user_question"),

    dspy.Example(
        user_question="Phí vận chuyển đơn hàng trên 500k là bao nhiêu?",
        answer="Miễn phí vận chuyển."
    ).with_inputs("user_question"),

    dspy.Example(
        user_question="Tôi có thể thanh toán bằng những cách nào?",
        answer="Thẻ ngân hàng, ví MoMo, ZaloPay và COD."
    ).with_inputs("user_question"),

    dspy.Example(
        user_question="Làm sao để theo dõi đơn hàng của tôi?",
        answer="Vào mục Đơn hàng của tôi và nhập mã vận đơn."
    ).with_inputs("user_question"),

    dspy.Example(
        user_question="Bảo hành sản phẩm điện tử kéo dài bao lâu?",
        answer="12 tháng kể từ ngày mua."
    ).with_inputs("user_question"),
]

# Mẫu val (tập riêng, KHÔNG trùng với train, dùng để đánh giá)
val_examples = [
    dspy.Example(
        user_question="Đổi trả sản phẩm lỗi có mất phí không?",
        answer="Không, cửa hàng chịu phí vận chuyển với sản phẩm lỗi."
    ).with_inputs("user_question"),

    dspy.Example(
        user_question="Đơn hàng giao trong bao nhiêu ngày?",
        answer="2-4 ngày làm việc với nội thành, 4-7 ngày với tỉnh."
    ).with_inputs("user_question"),

    dspy.Example(
        user_question="Có hỗ trợ trả góp không?",
        answer="Có, trả góp 0% qua thẻ tín dụng của các ngân hàng liên kết."
    ).with_inputs("user_question"),
]

class GenerateSearchQuery(dspy.Signature):
    """Chuyển câu hỏi của người dùng thành từ khóa tìm kiếm tối ưu cho database."""
    user_question: str = dspy.InputField()
    search_query: str = dspy.OutputField()

class RAGPipeline(dspy.Module):
    def __init__(self, k=3):
        super().__init__()
        self.query_generator = dspy.Predict(GenerateSearchQuery)
        
        self.answer_generator = dspy.ChainOfThought("context, question -> answer")

    def forward(self, user_question):
        query = self.query_generator(user_question=user_question).search_query
        context = retriever(query).passages
        return self.answer_generator(context=context, question=user_question)

def my_accuracy_metric(example, pred, trace=None):
    return example.answer.lower() in pred.answer.lower()

if __name__ == "__main__":
    load_dotenv()
    lm = dspy.LM(
        "gemini/gemini-3.1-flash-lite",
        api_key = os.getenv("GEMINI_API_KEY"),
        timeout = 60, 
        num_retries = 2
    )

    dspy.configure(lm=lm)
    docs = [
        "Chính sách đổi trả: trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm lỗi được đổi trả miễn phí vận chuyển.",
        "Miễn phí vận chuyển cho đơn hàng trên 500.000đ.",
        "Thanh toán: thẻ ngân hàng, ví MoMo, ZaloPay và COD. Hỗ trợ trả góp 0% qua thẻ tín dụng.",
        "Theo dõi đơn hàng: vào mục Đơn hàng của tôi và nhập mã vận đơn.",
        "Bảo hành sản phẩm điện tử: 12 tháng kể từ ngày mua.",
        "Thời gian giao hàng: 2-4 ngày làm việc nội thành, 4-7 ngày với tỉnh.",
    ]

    embedder = dspy.Embedder("gemini/gemini-embedding-2")
    retriever = dspy.retrievers.Embeddings(embedder=embedder, corpus=docs, k=3)


    optimizer = BootstrapFewShot(metric=my_accuracy_metric, max_bootstrapped_demos=4)
    optimized_rag = optimizer.compile(RAGPipeline(), trainset=train_examples)

    for name, predictor in optimized_rag.named_predictors():
        print(f"=== {name} ===")
        print("Instruction:", predictor.signature.instructions)
        print(f"Số demos: {len(predictor.demos)}")
        for i, demo in enumerate(predictor.demos, 1):
            print(f"--- Demo {i} ---")
            print(demo)

    print("*" * 50)
    evaluate = dspy.Evaluate(devset=val_examples, metric=my_accuracy_metric, display_progress=True)
    result = evaluate(optimized_rag)
    print("Điểm trung bình:", result.score) 

