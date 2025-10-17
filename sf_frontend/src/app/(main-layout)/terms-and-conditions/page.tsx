"use client";

import Navbar from "@/app/components/layouts/Navbar";
import Footer from "@/app/components/layouts/Footer";

export default function TermsAndConditionsPage() {
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 px-6 md:px-20 py-12 max-w-4xl mx-auto text-gray-800">
                <h1 className="text-3xl md:text-4xl font-bold text-green-700 mb-6">
                    Điều khoản & Điều kiện
                </h1>

                <p className="mb-6 text-gray-600">
                    Chào mừng bạn đến với <span className="font-semibold">SmartFarming</span>.
                    Khi truy cập và sử dụng website của chúng tôi, bạn đồng ý tuân thủ những điều khoản và điều kiện dưới đây.
                    Vui lòng đọc kỹ để hiểu rõ quyền và trách nhiệm của bạn.
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-green-700 mb-3">1. Chấp nhận điều khoản</h2>
                    <p>
                        Khi sử dụng các dịch vụ của SmartFarming, bạn mặc nhiên đồng ý với các điều khoản này.
                        Nếu bạn không đồng ý, vui lòng ngừng truy cập hoặc sử dụng dịch vụ.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-green-700 mb-3">2. Sử dụng dịch vụ</h2>
                    <p className="mb-2">Người dùng cam kết:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Không sử dụng website vào mục đích bất hợp pháp hoặc gây hại cho người khác.</li>
                        <li>Không can thiệp hoặc phá hoại hệ thống, dữ liệu của SmartFarming.</li>
                        <li>Chịu trách nhiệm về mọi thông tin cung cấp khi sử dụng dịch vụ.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-green-700 mb-3">3. Quyền và trách nhiệm của SmartFarming</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Cung cấp dịch vụ theo đúng thông tin đã công bố.</li>
                        <li>Bảo mật thông tin cá nhân của khách hàng theo chính sách bảo mật.</li>
                        <li>Có quyền từ chối hoặc chấm dứt cung cấp dịch vụ đối với người dùng vi phạm điều khoản.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-green-700 mb-3">4. Giới hạn trách nhiệm</h2>
                    <p>
                        SmartFarming không chịu trách nhiệm đối với bất kỳ thiệt hại gián tiếp hoặc phát sinh nào
                        do việc sử dụng hoặc không thể sử dụng dịch vụ, trừ khi pháp luật có quy định khác.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-green-700 mb-3">5. Thay đổi điều khoản</h2>
                    <p>
                        Chúng tôi có thể cập nhật hoặc điều chỉnh Điều khoản & Điều kiện này bất kỳ lúc nào.
                        Mọi thay đổi sẽ được thông báo trên website, và tiếp tục sử dụng dịch vụ đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold text-green-700 mb-3">6. Liên hệ</h2>
                    <p>
                        Nếu bạn có câu hỏi về Điều khoản & Điều kiện, vui lòng liên hệ với chúng tôi qua email:{" "}
                        <a href="mailto:support@smartfarming.vn" className="text-green-600 hover:underline">
                            support@smartfarming.vn
                        </a>
                    </p>
                </section>
            </main>
            <Footer />
        </div>
    )
}