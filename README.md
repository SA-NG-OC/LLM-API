# BÁO CÁO NGHIÊN CỨU & THỰC HÀNH: TÍCH HỢP CUSTOM LLM VÀ XÂY DỰNG RAG QUA API KEY

Báo cáo này trình bày kết quả tìm hiểu và triển khai thực tế việc sử dụng **AI API Key** (thay vì các dịch vụ model đóng gói sẵn như GPT-4, GPT-5.5...) nhằm tối ưu hóa chi phí, tăng tính bảo mật dữ liệu doanh nghiệp và khả năng tùy biến sâu. 

Model sử dụng: **google/diffusiongemma-26b-a4b-it**

Nội dung báo cáo tập trung vào 2 phần hành động cụ thể đã được triển khai thành công:
1. **Tích hợp Custom Model** vào công cụ trợ lý lập trình **Continue** sử dụng API Key riêng.
2. **Xây dựng ứng dụng RAG (Retrieval-Augmented Generation)** cơ bản để cung cấp ngữ cảnh nội bộ của doanh nghiệp cho AI.

---

## I. Tổng quan: Tại sao nên dùng AI API Key thay cho các Model có sẵn?

*   **Tối ưu hóa chi phí:** Thay vì trả phí thuê bao cố định hàng tháng cho từng user (như ChatGPT Plus, Claude Pro), việc sử dụng API giúp doanh nghiệp chỉ trả tiền cho số lượng token thực tế sử dụng (Pay-as-you-go).
*   **Tính linh hoạt cao:** Dễ dàng thay đổi giữa các mô hình khác nhau (Closed-source vs Open-source) tùy theo bài toán cụ thể mà không bị phụ thuộc vào một nhà cung cấp duy nhất (Vendor lock-in).
*   **An toàn và Bảo mật dữ liệu:** Dữ liệu gửi qua API thương mại thường đi kèm cam kết không sử dụng để huấn luyện lại mô hình (Zero Data Retention), đảm bảo an toàn thông tin nội bộ.
*   **Khả năng tùy biến và mở rộng:** Cho phép tích hợp trực tiếp vào quy trình làm việc tự động (CI/CD, Extension phát triển phần mềm) và xây dựng hệ thống RAG riêng cho dữ liệu của doanh nghiệp.

---

## II. Phần 1: Tích hợp & Thay thế Model trong Extension "Continue"

### 1. Giới thiệu về Continue
**Continue** là một extension mã nguồn mở dành cho VS Code và JetBrains, cho phép lập trình viên tạo lập một trợ lý AI cá nhân hóa ngay trong môi trường code. 

### 2. Triển khai cấu hình Custom Model
Thay vì sử dụng các model mặc định có sẵn (thường yêu cầu tài khoản trả phí hoặc giới hạn lượt dùng), chúng ta tiến hành cấu hình lại file `config.json` của Continue để gọi custom model thông qua API Key:
*   Cấu hình thông tin API Endpoint và API Key tương ứng.
*   Thay thế model gợi ý (autocomplete) và model chat bằng các dòng model phù hợp với nhu cầu lập trình (ví dụ: Codellama, Qwen, Gemma, Llama 3...).

### 3. Kết quả triển khai
Dưới đây là hình ảnh minh chứng việc tích hợp thành công custom model trong giao diện làm việc của Continue:

![Cấu hình và sử dụng Custom Model với Continue](image/continue.png)

---

## III. Phần 2: Xây dựng RAG (Retrieval-Augmented Generation) cung cấp ngữ cảnh cho AI

### 1. Khái niệm RAG đơn giản
RAG (Retrieval-Augmented Generation) giúp khắc phục nhược điểm "ảo tưởng" (hallucination) và thiếu thông tin thời gian thực của LLM. Bằng cách trích xuất dữ liệu từ cơ sở tri thức nội bộ (Knowledge Base) và ghép trực tiếp vào Prompt đầu vào làm ngữ cảnh (Context), LLM sẽ chỉ trả lời dựa trên thông tin được cung cấp.

### 2. Cấu trúc mã nguồn ứng dụng RAG
Trong dự án này, hệ thống RAG được triển khai bằng Node.js với cấu trúc:
*   **Cơ sở tri thức nội bộ (`company_kb.md`):** Tài liệu lưu trữ các quy định, chính sách hoàn tiền, phân quyền người dùng và đặc tả API của hệ thống Beverage Ordering System (BOS).
*   **File xử lý RAG (`rag.js`):** 
    *   Đọc nội dung từ file tri thức `company_kb.md`.
    *   Khởi tạo OpenAI Client kết nối với API Endpoint của NVIDIA (`https://integrate.api.nvidia.com/v1`) sử dụng `NVIDIA_API_KEY`.
    *   Sử dụng model `google/diffusiongemma-26b-a4b-it` để suy luận.
    *   Ghép ngữ cảnh tri thức vào Prompt theo cấu trúc nghiêm ngặt nhằm bắt buộc AI chỉ trả lời từ tài liệu.
*   **Giao diện tương tác (`index.js`):** Tạo CLI tương tác trong terminal cho phép người dùng hỏi đáp thời gian thực với trợ lý BOS Corporate Assistant.

#### Mã nguồn lõi RAG (`rag.js`):
```javascript
// Đọc context từ file company_kb.md
const contextPath = path.join(__dirname, "company_kb.md");
const context = fs.readFileSync(contextPath, "utf-8");

export async function runRAG(question) {
    const prompt = `
You are an AI assistant.
Answer ONLY using the context below.
If the answer is not in the context, say: "I don't know based on the provided context."

Context:
${context}

Question:
${question}
`;

    // Gọi API của NVIDIA NIM với custom model và API Key
    const response = await client.chat.completions.create({
        model: "google/diffusiongemma-26b-a4b-it",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
    });
    return response.choices[0].message.content;
}
```


### 3. Thông tin về Model đang sử dụng (`google/diffusiongemma-26b-a4b-it`)

Ứng dụng đang gọi API của NVIDIA NIM để sử dụng mô hình **DiffusionGemma** (`google/diffusiongemma-26b-a4b-it`). Đây là một dòng model tiên tiến của Google DeepMind với các đặc điểm nổi bật sau:

*   **Cơ chế Text-Diffusion (Không tự hồi quy):** Khác với các LLM truyền thống sinh từng token một cách tuần tự (autoregressive), DiffusionGemma tạo ra cả một khối văn bản song song cùng lúc bằng cách khử nhiễu lặp đi lặp lại. Điều này giúp giảm độ trễ (latency) và tăng tốc độ sinh văn bản lên tới 4 lần.
*   **Kiến trúc Mixture of Experts (MoE):** Được phát triển dựa trên Gemma 4 MoE với quy mô 26 tỷ tham số tổng (26B), nhưng chỉ có 3.8 tỷ tham số kích hoạt khi suy luận (active parameters), giúp tối ưu hiệu năng tính toán cực tốt.
*   **Tối ưu hóa bởi NVIDIA NIM:** Được cấu hình chạy trên nền tảng suy luận của NVIDIA (NVIDIA NIM) giúp xử lý tốc độ cao (có thể đạt trên 1100 tokens/giây trên các GPU H100) và tối ưu hóa bộ nhớ tốt qua chuẩn FP8.
*   **Hỗ trợ cơ chế Tư duy (Thinking Mode):** Mô hình hỗ trợ cấu hình `"chat_template_kwargs": {"enable_thinking": true}` giúp nó có thể "suy nghĩ" và lập luận logic trước khi đưa ra câu trả lời cuối cùng, tương tự cơ chế của các mô hình lý luận (Reasoning Models) hiện đại.
*   **Context Window cực lớn:** Hỗ trợ xử lý ngữ cảnh lên đến 256K token và có khả năng đa phương tiện (multimodal).

---

### 4. Kết quả chạy thử nghiệm ứng dụng RAG
Khi người dùng đặt câu hỏi liên quan đến chính sách kinh doanh hoặc thông số kỹ thuật của BOS (ví dụ: các quyền hạn của role Staff, chính sách hoàn tiền khi hủy đơn, bảng giá đồ uống...), hệ thống RAG truy xuất chính xác ngữ cảnh từ `company_kb.md` và trả lời ngắn gọn, chuẩn xác.

Dưới đây là hình ảnh kết quả chạy thực tế ứng dụng RAG trong terminal:

![Kết quả chạy ứng dụng RAG](image/rag.png)

---

## IV. Hướng dẫn chạy thử nghiệm mã nguồn RAG tại local

### 1. Chuẩn bị môi trường
*   Cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).
*   Đăng ký và lấy API Key từ NVIDIA NIM hoặc các dịch vụ cung cấp API LLM tương tự.

### 2. Cài đặt các bước
1.  **Cài đặt các gói phụ thuộc (dependencies):**
    ```bash
    npm install
    ```
2.  **Thiết lập file cấu hình môi trường:**
    Tạo file `.env` tại thư mục gốc từ file `.env.example` và điền API key của bạn:
    ```env
    NVIDIA_API_KEY=your_actual_nvidia_api_key_here
    ```
3.  **Khởi động ứng dụng CLI:**
    ```bash
    node index.js
    ```
4.  **Đặt câu hỏi tương tác:**
    Nhập các câu hỏi liên quan đến hệ thống BOS (ví dụ: *"What can a Staff role do?"* hoặc *"What is the refund rate for cancelling after 5 minutes?"*) để kiểm chứng tính hiệu quả của RAG.

---

## V. Kết luận & Hướng phát triển

*   **Kết luận:** Phương pháp sử dụng API Key kết hợp tự xây dựng RAG giúp doanh nghiệp hoàn toàn làm chủ công nghệ, bảo mật thông tin tối đa và linh hoạt tùy biến giao diện cũng như mô hình sử dụng với chi phí cực kỳ tối ưu.
*   **Hướng phát triển:** 
    *   Nâng cấp cơ chế RAG đơn giản (nhồi toàn bộ file text) sang **Vector Search RAG** (sử dụng Embedding Model & Vector Database như Pinecone/Milvus/ChromaDB) để có thể xử lý lượng tài liệu lớn hơn.
    *   Tối ưu hóa tốc độ phản hồi (latency) bằng cách tinh chỉnh temperature và cấu hình stream câu trả lời.

---

## Video demo
<video src="Demo.mp4" controls width="100%"></video>
