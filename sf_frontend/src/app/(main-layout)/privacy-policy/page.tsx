"use client";

import Navbar from "@/app/layout/Navbar";
import Footer from "@/app/layout/Footer";

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 px-6 md:px-20 py-12 max-w-4xl mx-auto text-gray-800">
                <h1 className="text-3xl md:text-4xl font-bold text-[#5b8c51] mb-6">
                    Chính sách bảo mật
                </h1>

                <p className="mb-6 text-gray-600">
                    Tại <span className="font-semibold">TL Rice</span>, chúng tôi cam kết bảo vệ sự riêng tư
                    và bảo mật thông tin cá nhân của khách hàng. Chính sách này giải thích cách chúng tôi thu thập,
                    sử dụng và bảo vệ dữ liệu của bạn khi truy cập và sử dụng dịch vụ.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-[#5b8c51] mb-3">1. Thông tin chúng tôi thu thập</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Thông tin cá nhân: Họ tên, email, số điện thoại, địa chỉ.</li>
                        <li>Thông tin kỹ thuật: Địa chỉ IP, loại trình duyệt, thiết bị, cookie.</li>
                        <li>Thông tin sử dụng: Lịch sử truy cập, hành vi sử dụng dịch vụ, phản hồi từ khách hàng.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-[#5b8c51] mb-3">2. Cách chúng tôi sử dụng thông tin</h2>
                    <p className="mb-2">Dữ liệu của bạn được sử dụng cho các mục đích sau:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Cung cấp và cải thiện chất lượng dịch vụ TL Rice.</li>
                        <li>Hỗ trợ khách hàng và phản hồi yêu cầu của bạn.</li>
                        <li>Gửi thông tin cập nhật, khuyến mãi hoặc tin tức (nếu bạn đồng ý).</li>
                        <li>Bảo đảm an toàn, ngăn chặn gian lận và tuân thủ pháp luật.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-[#5b8c51] mb-3">3. Bảo mật dữ liệu</h2>
                    <p>
                        Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu cá nhân khỏi mất mát,
                        truy cập trái phép, tiết lộ hoặc thay đổi. Tuy nhiên, không có hệ thống nào đảm bảo an toàn tuyệt đối,
                        và chúng tôi không chịu trách nhiệm cho các rủi ro ngoài tầm kiểm soát hợp lý.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-[#5b8c51] mb-3">4. Chia sẻ thông tin</h2>
                    <p className="mb-2">TL Rice cam kết không bán hoặc trao đổi thông tin cá nhân của bạn. Tuy nhiên, dữ liệu có thể được chia sẻ với:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Đối tác tin cậy hỗ trợ cung cấp dịch vụ.</li>
                        <li>Cơ quan chức năng khi có yêu cầu hợp pháp.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-[#5b8c51] mb-3">5. Quyền của người dùng</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân.</li>
                        <li>Quyền từ chối nhận email quảng cáo hoặc thông tin tiếp thị.</li>
                        <li>Quyền yêu cầu chúng tôi dừng xử lý dữ liệu trong một số trường hợp.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-[#5b8c51] mb-3">6. Liên hệ</h2>
                    <p>
                        Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào liên quan đến Chính sách bảo mật, vui lòng liên hệ với chúng tôi qua email:{" "}
                        <a href="mailto:ngholinh.2263@gmail.com" className="text-[#5b8c51]  hover:underline">
                            ngholinh.2263@gmail.com
                        </a>
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    )
}