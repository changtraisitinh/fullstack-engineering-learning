import { Crumb } from '../../components';
import { Feature } from './parts';

/** Reasons mirror the frontend's own coming-soon screen copy (shell ComingSoon.tsx), not new claims. */
const OTHERS: [string, string][] = [
  ['Nạp tiền điện thoại / Data 4G/5G', 'Cần tích hợp trực tiếp với nhà mạng — chưa có mô phỏng nhà mạng.'],
  ['Chuyển khoản từ ngân hàng bất kỳ (không cần liên kết)', 'Cần số tài khoản ảo/QR động riêng cho từng giao dịch.'],
  ['Chuyển tiền liên ngân hàng (NAPAS)', 'Cần một rail thanh toán thật giữa các ngân hàng.'],
  ['Thanh toán tại quầy', 'Cần tích hợp máy POS/merchant thật.'],
  ['Mua vé xem phim, du lịch, giao thông', 'Cần tích hợp hệ thống đặt chỗ/đối tác thật.'],
  ['Ưu đãi & voucher', 'Cần hợp tác với merchant thật — không có đối tác nào trong lab.'],
  ['Thương mại điện tử, game, mini-app', 'Là cả một nền tảng riêng — ngoài phạm vi lab.'],
  ['Ví Nhân Ái', 'Cần đối tác tổ chức từ thiện đã xác minh.'],
  ['Gửi thiệp', 'Tính năng xã hội — ngoài trọng tâm giao dịch tài chính cốt lõi.'],
  ['Tài chính – bảo hiểm, vay nhanh', 'Sản phẩm của bên thứ 3 — ngoài phạm vi lab học tập.'],
  ['Ví tiện ích', 'Chưa có backend tương ứng.'],
];

export default function BizComingSoon() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Sắp có']} />
      <h1>Chưa làm &amp; lý do</h1>
      <p className="lede">
        Ba mục đầu đã có yêu cầu và quy tắc được viết, nhưng mã nguồn chưa có trên nhánh chính, nên chưa được tính là
        "Đã có". Các mục còn lại cần đối tác hoặc hạ tầng thật mà một lab học tập không có.
      </p>

      <Feature
        name="Ví Gia Đình"
        live={false}
        what="Chủ ví đặt hạn mức chi tiêu hằng tháng cho từng thành viên gia đình."
        rules={[
          'Theo yêu cầu: hạn mức gia đình là một "trần" riêng, cộng thêm vào (không thay thế) hạn mức pháp luật.',
          'Theo yêu cầu: nếu dịch vụ kiểm tra hạn mức gia đình tạm lỗi, giao dịch vẫn được cho qua (ưu tiên không chặn người dùng).',
        ]}
        source="issue #12 (chưa có trong mã nguồn/tài liệu thiết kế của nhánh chính)."
      />
      <Feature
        name="Túi Thần Tài"
        live={false}
        what="Túi tiết kiệm có lãi mô phỏng, tách khỏi số dư ví chính."
        source="issue #13 (chưa có trong mã nguồn/tài liệu thiết kế của nhánh chính)."
      />
      <Feature
        name="Xác thực bổ sung cho giao dịch lớn"
        live={false}
        what="Bước xác nhận thêm cho giao dịch trên 10 triệu hoặc tổng trong ngày từ 20 triệu."
        source="issue #15, Quyết định 2345/QĐ-NHNN — xem thêm trang Giới hạn & an toàn giao dịch."
      />

      <h2>Cần đối tác hoặc hạ tầng thật</h2>
      <table className="biz-table">
        <thead>
          <tr>
            <th>Tính năng</th>
            <th>Lý do chưa làm</th>
          </tr>
        </thead>
        <tbody>
          {OTHERS.map(([name, why]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
