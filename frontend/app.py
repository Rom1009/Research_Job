import streamlit as st
import requests
import time

# Cấu hình URL của Backend FastAPI (Sửa lại port nếu bạn dùng port khác)
BASE_URL = "http://127.0.0.1:8000/api" 

# Cấu hình giao diện Streamlit
st.set_page_config(
    page_title="Job Research Assistant", 
    page_icon="💼", 
    layout="centered"
)

# Khởi tạo trạng thái ứng dụng (Session State)
if "step" not in st.session_state:
    st.session_state.step = 1
if "scraping_done" not in st.session_state:
    st.session_state.scraping_done = False
if "final_score" not in st.session_state:
    st.session_state.final_score = None
if "user_id" not in st.session_state:
    st.session_state.user_id = None
if "profile_id" not in st.session_state:
    st.session_state.profile_id = None
if "job_id" not in st.session_state:
    st.session_state.job_id = None

st.title("💼 AI Job Research Assistant")
st.write("Hệ thống hỗ trợ nghiên cứu công việc và đánh giá mức độ phù hợp hồ sơ.")
st.write("---")

# ==========================================
# BƯỚC 1: LƯU PROFILE USER (API 1)
# ==========================================
if st.session_state.step == 1:
    st.header("📝 Bước 1: Khởi tạo hồ sơ ứng viên")
    st.write("Vui lòng tải lên CV và cung cấp link GitHub của bạn để bắt đầu.")
    
    uploaded_file = st.file_uploader("Tải lên CV (Định dạng PDF)", type=["pdf"])
    github_link = st.text_input("Đường dẫn GitHub", placeholder="https://github.com/username")
    
    if st.button("Submit Hồ Sơ", type="primary"):
        if not uploaded_file or not github_link:
            st.error("⚠️ Vui lòng tải lên đầy đủ file CV và điền link GitHub!")
        else:
            with st.spinner("Dữ liệu đang được gửi lên hệ thống xử lý..."):
                try:
                    # Chuẩn bị dữ liệu gửi đi (Multipart Form-Data)
                    files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "application/pdf")}
                    data = {
                        "github_url": github_link,
                        "cv_url": None
                    }
                    
                    # Gọi API 1 (Lưu profile)
                    # Giả định endpoint backend là /api/profile/save
                    response = requests.post(f"{BASE_URL}/user", json=data)
                    
                    if response.status_code == 200 or response.status_code == 201:
                        res_data = response.json()
                        # Lưu lại user_id (nếu backend trả về) để dùng cho các API sau
                        st.session_state.user_id = res_data.get("user_id", "default_user")
                        st.session_state.profile_id = res_data.get("profile_id") or None
                        st.session_state.job_id = res_data.get("job_id") or None
                        
                        st.success("🎉 Hồ sơ của bạn đã được lưu thành công!")
                        time.sleep(1) # Đợi 1 chút để user kịp nhìn thông báo thành công
                        
                        # Chuyển sang Bước 2
                        st.session_state.step = 2
                        st.rerun()
                    else:
                        st.error(f"❌ Lỗi từ Backend (API 1): {response.status_code} - {response.text}")
                except Exception as e:
                    st.error(f"💥 Không thể kết nối tới Backend: {str(e)}")

# ==========================================
# BƯỚC 2: CÀO DỮ LIỆU & TÍNH ĐIỂM (API 2 & API 3)
# ==========================================
elif st.session_state.step == 2:
    st.header("📊 Bước 2: Phân tích & Đánh giá mức độ phù hợp")
    st.info("Hệ thống sẽ tiến hành thu thập dữ liệu từ LinkedIn và đối chiếu với hồ sơ của bạn.")
    
    # Nút bấm 1: Tiến hành thu thập dữ liệu (API 2)
    if not st.session_state.scraping_done:
        if st.button("Bắt đầu tính điểm (Scraping LinkedIn)", type="primary"):
            # Hiện vòng xoay đợi (Loading Spinner)
            with st.spinner("🕵️‍♂️ Đang tiến hành thu thập dữ liệu từ LinkedIn... Vui lòng đợi trong giây lát!"):
                try:
                    # Gọi API 2 (Scraping)
                    # Giả định endpoint: /api/scrape/linkedin
                    payload = {"user_id": st.session_state.user_id}
                    response = requests.post(f"{BASE_URL}/job/scrape", json=payload)
                    
                    if response.status_code == 200:
                        st.session_state.scraping_done = True
                        st.rerun()
                    else:
                        st.error(f"❌ Lỗi khi thực hiện Scraping (API 2): {response.text}")
                except Exception as e:
                    st.error(f"💥 Lỗi kết nối API 2: {str(e)}")
                    
    # Nút bấm 2: Sau khi thu thập xong, hiện nút MATCH để xử lý API tính toán (API 3)
    else:
        st.success("✅ Thu thập dữ liệu LinkedIn thành công! Dữ liệu đã sẵn sàng để đối chiếu.")
        
        if st.button("🔥 Nhấn để MATCH ngay!", type="primary", use_container_width=True):
            with st.spinner("🤖 Trí tuệ nhân tạo đang tính toán điểm số Match Score..."):
                try:
                    # Gọi API 3 (Tính Score - Khớp với endpoint POST /api/score/calculate ở log của bạn)
                    payload = {"user_id": st.session_state.user_id}
                    response = requests.post(f"{BASE_URL}/score/calculate", json=payload)
                    
                    if response.status_code == 200:
                        res_data = response.json()
                        # Giả sử API trả về json có dạng: {"score": 85} hoặc object tương tự
                        st.session_state.final_score = res_data
                        
                        # Chuyển sang Bước cuối cùng hiển thị điểm
                        st.session_state.step = 3
                        st.rerun()
                    else:
                        st.error(f"❌ Lỗi khi tính điểm (API 3): {response.text}")
                except Exception as e:
                    st.error(f"💥 Lỗi kết nối API 3: {str(e)}")

# ==========================================
# BƯỚC 3: HIỂN THỊ KẾT QUẢ ĐIỂM SỐ
# ==========================================
elif st.session_state.step == 3:
    st.header("🏆 Bước 3: Kết quả Đánh giá từ AI")
    
    # Hiển thị điểm số đẹp mắt bằng st.metric hoặc st.success
    score_data = st.session_state.final_score
    
    # Đoạn này tùy biến theo cấu trúc dữ liệu JSON thực tế từ API 3 của bạn trả về
    # Ví dụ nếu trả về đơn giản là dictionary {"score": 90}
    score_value = score_data.get("score", "N/A") if isinstance(score_data, dict) else score_data
    
    st.balloons() # Hiệu ứng bóng bay chúc mừng
    
    st.markdown("### Điểm số độ tương thích công việc của bạn:")
    st.metric(label="MATCHING SCORE", value=f"{score_value} / 100")
    
    # Hiển thị chi tiết (nếu có thêm các thông tin giải thích từ model ScoreCV)
    with st.expander("🔍 Xem chi tiết phản hồi từ hệ thống"):
        st.json(score_data)
        
    # Nút để reset làm lại từ đầu
    if st.button("Làm lại với hồ sơ mới"):
        st.session_state.clear()
        st.rerun()