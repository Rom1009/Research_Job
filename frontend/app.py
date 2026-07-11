import streamlit as st
import requests
import time
import pandas as pd 

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
    st.header("🏆 Kết Quả Phân Tích & Đối Chiếu Hồ Sơ")
    st.balloons()

    score_data = st.session_state.final_score

    try:
        # 1. Chuyển đổi dữ liệu JSON về dạng List các công việc
        if isinstance(score_data, dict):
            data_list = score_data.get("jobs", score_data.get("results", [score_data]))
        elif isinstance(score_data, list):
            data_list = score_data
        else:
            data_list = []

        if data_list:
            df = pd.DataFrame(data_list)

            # Giả định nếu chưa có cột total_score/job_title để test, ta chuẩn hóa tên cột
            if 'total_score' not in df.columns and 'score' in df.columns:
                df = df.rename(columns={'score': 'total_score'})
            if 'job_title' not in df.columns and 'title' in df.columns:
                df = df.rename(columns={'title': 'job_title'})

            # Ép kiểu điểm số về dạng số
            df['total_score'] = pd.to_numeric(df.get('total_score', 0), errors='coerce').fillna(0)

            # --- BỘ LỌC VÀ XÓA CỘT KHÔNG CẦN THIẾT ---
            # Chỉ lấy công việc có điểm số > 70
            df_filtered = df[df['total_score'] > 70].reset_index(drop=True)

            # ❌ Bỏ cột match_id và cột chứa cục JSON thô ra khỏi bảng hiển thị chính
            columns_to_show = [col for col in df_filtered.columns if col not in ['match_id', 'ai_analysis', 'ai_analysis_details']]

            if not df_filtered.empty:
                # --- THỂ HIỆN BẢNG TỔNG QUAN ---
                st.subheader("📋 Các vị trí phù hợp nhất với bạn (Match Score > 70)")
                
                # Hiển thị bảng đã ẩn match_id và json
                st.dataframe(
                    df_filtered[columns_to_show],
                    use_container_width=True,
                    column_config={
                        "total_score": st.column_config.ProgressColumn(
                            "Điểm Phù Hợp",
                            format="%d điểm",
                            min_value=0,
                            max_value=100,
                        ),
                        "job_title": "Vị trí ứng tuyển"
                    }
                )

                # --- BIỂU ĐỒ CHART ---
                st.write("---")
                st.subheader("📊 Đồ thị so sánh mức độ tương thích")
                x_col = 'job_title' if 'job_title' in df_filtered.columns else columns_to_show[0]
                st.bar_chart(data=df_filtered, x=x_col, y='total_score', color="#00f5d4")

                # --- 💎 ĐỔI KIỂU JSON THÀNH UI ĐẸP (AI ANALYSIS DETAILS) ---
                st.write("---")
                st.subheader("🔍 Báo cáo chi tiết từ Trí Tuệ Nhân Tạo")
                st.caption("Chọn một công việc trong danh sách dưới đây để xem phân tích chi tiết hồ sơ:")

                # Cho người dùng chọn công việc muốn xem phân tích sâu
                job_options = df_filtered['job_title'].tolist()
                selected_job = st.selectbox("Xem phân tích cho vị trí:", job_options)
                
                # Lấy dòng dữ liệu của công việc được chọn
                job_row = df_filtered[df_filtered['job_title'] == selected_job].iloc[0]
                
                # Lấy dữ liệu phân tích (hỗ trợ cả 2 key đặt tên phổ biến)
                ai_details = job_row.get('ai_analysis_details', job_row.get('ai_analysis', {}))

                if isinstance(ai_details, dict) and ai_details:
                    # A. Đánh giá tổng quan (Evaluation Summary)
                    if "evaluation_summary" in ai_details:
                        st.markdown("#### 📝 Tóm tắt đánh giá từ hệ thống")
                        st.info(ai_details["evaluation_summary"])

                    # B. Điểm thiếu sót & Lời khuyên (Gap Analysis vs Actionable Advice)
                    st.markdown("#### 📊 Phân tích kỹ năng & Định hướng")
                    col1, col2 = st.columns(2)

                    with col1:
                        st.markdown("<div style='background-color:#ffe5ec; padding:15px; border-radius:10px; border-left:5px solid #ff4d6d;'><strong>⚠️ Điểm còn thiếu (Gap Analysis)</strong></div>", unsafe_allow_html=True)
                        gaps = ai_details.get("gap_analysis", [])
                        if isinstance(gaps, list) and gaps:
                            for gap in gaps:
                                st.markdown(f"- {gap}")
                        else:
                            st.write("*Không có thiếu sót lớn nào được ghi nhận.*")

                    with col2:
                        st.markdown("<div style='background-color:#e8f5e9; padding:15px; border-radius:10px; border-left:5px solid #2e7d32;'><strong>💡 Lời khuyên hành động (Actionable Advice)</strong></div>", unsafe_allow_html=True)
                        advices = ai_details.get("actionable_advice", [])
                        if isinstance(advices, list) and advices:
                            for advice in advices:
                                st.markdown(f"- {advice}")
                        else:
                            st.write("*Hồ sơ đã rất tối ưu cho vị trí này.*")

                    # C. Tác động dự án & Độ phức tạp kỹ thuật (Project Impact & Technical Complexity)
                    st.write("")
                    with st.expander("🚀 Xem đánh giá về Dự án & Độ phức tạp Kỹ thuật"):
                        tab1, tab2 = st.tabs(["💥 Tác động dự án (Project Impact)", "⚙️ Độ phức tạp kỹ thuật"])
                        
                        with tab1:
                            impacts = ai_details.get("project_impact", [])
                            for imp in impacts:
                                st.markdown(f"🎯 {imp}")
                                
                        with tab2:
                            complexities = ai_details.get("technical_complexity", [])
                            for comp in complexities:
                                st.markdown(f"🛠️ {comp}")
                else:
                    st.warning("⚠️ Vị trí này không chứa dữ liệu `ai_analysis` chi tiết.")
            else:
                st.warning("☹️ Không có công việc nào có điểm số Match Score vượt quá 70.")
        else:
            st.error("❌ Không nhận được dữ liệu phản hồi hợp lệ từ API.")

    except Exception as e:
        st.error(f"💥 Lỗi hiển thị dữ liệu: {str(e)}")
        with st.expander("Xem JSON lỗi gốc"):
            st.json(score_data)

    # Nút bấm Reset
    st.write("---")
    if st.button("🔄 Thực hiện đợt Research mới", use_container_width=True):
        st.session_state.clear()
        st.rerun()