import { Crumb, Note } from '../../components';
import { Feature } from './parts';

export default function BizPersonal() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Theo nhóm tính năng']} />
      <h1>Chi tiêu, điểm thưởng, quỹ &amp; trả sau</h1>

      <Feature
        name="Quản lý chi tiêu (báo cáo tuần/tháng)"
        what="Tự động tổng hợp số tiền đã chi trong tuần này hoặc tháng này, chia theo loại giao dịch."
        rules={[
          <>
            "Chi tiêu" chỉ gồm <strong>chuyển tiền đi, thanh toán hoá đơn, rút tiền</strong>. Không tính nạp tiền, nhận
            tiền, hoàn tiền, và cả trả nợ Ví Trả Sau (đó là trả cho khoản đã mua trước đó, không phải chi tiêu mới).
          </>,
          'Tuần tính từ thứ Hai, tháng tính từ ngày 1, đến thời điểm hiện tại; "tháng" giống hệt tháng của hạn mức tháng.',
          'Có so sánh với cả tuần/tháng trước — kỳ hiện tại chưa kết thúc nên đây không phải so sánh cùng kỳ.',
          'Chưa có: danh mục tự đặt, ngân sách, trợ lý chi tiêu, ghi chép tay.',
        ]}
        source="phạm vi tab Báo cáo của trang Quản lý chi tiêu MoMo (momo.vn); chỉ làm phần dùng được dữ liệu sẵn có."
      />

      <Feature
        name="Điểm thưởng"
        what="Tích điểm khi thanh toán hoá đơn, lên hạng theo mức chi tiêu, đổi điểm lấy hoàn tiền vào ví."
        rules={[
          <>
            <strong>Chỉ thanh toán hoá đơn được tích điểm.</strong> Chuyển tiền, nạp/rút không tích — nếu có, hai tài khoản
            chuyển qua lại cho nhau sẽ "đẻ" điểm vô hạn rồi đổi ra tiền thật.
          </>,
          <>
            Cơ bản <strong>1 điểm / 10.000đ</strong>, nhân hệ số theo hạng: Thành viên ×1, Thân thiết (từ 5 triệu) ×1,2, Ưu
            tiên (từ 20 triệu) ×1,5, Đặc biệt (từ 50 triệu) ×2. Hạng xét theo tổng tiền hoá đơn 12 tháng gần nhất.
          </>,
          <>
            Đổi điểm: <strong>1 điểm = 100đ</strong> cộng thẳng vào ví (tương đương hoàn tiền 1% ở hạng cơ bản), tối thiểu
            100 điểm/lần. Điểm không hết hạn.
          </>,
          'Chỉ giao dịch từ lúc tham gia chương trình mới được tích điểm, không cộng bù lịch sử cũ.',
          'Không có đối tác, voucher hay thương hiệu thật — phần thưởng duy nhất là hoàn tiền.',
        ]}
        source="tỷ lệ cơ bản và cấu trúc hạng/12 tháng lấy cảm hứng từ một chương trình hãng bay công khai; tên hạng, hệ số và giá trị quy đổi do lab tự thiết kế. Lưu ý: 'OneU' là chương trình của Techcombank, không phải MB Bank."
      />

      <Feature
        name="Quỹ nhóm"
        what="Nhiều người cùng góp tiền vào một quỹ chung (du lịch, sinh hoạt…) với lịch sử minh bạch theo từng người."
        rules={[
          'Người tạo quỹ mời thành viên bằng số điện thoại (phải đã có tài khoản).',
          'Mọi thành viên đều góp được từ ví của mình; mỗi người thấy rõ ai đã góp bao nhiêu, lúc nào.',
          <>
            <strong>Chỉ người tạo quỹ được rút tiền</strong> — giới hạn có chủ đích của bản đầu tiên, không có biểu quyết
            hay nhiều người cùng duyệt.
          </>,
          'Quỹ chỉ tăng khi tiền đã thật sự bị trừ khỏi ví người góp; không rút được quá số dư quỹ.',
          'Mỗi lần góp/rút từ 1.000đ đến 100.000.000đ; góp quỹ tính vào hạn mức tháng giống chuyển tiền. Chưa có lãi.',
        ]}
        source="ý tưởng tính năng từ trang Quỹ nhóm của MoMo (chỉ qua kết quả tìm kiếm, chưa đọc trực tiếp); các quy tắc quyền là tự thiết kế."
      />

      <Feature
        name="Ví Trả Sau (mô phỏng)"
        what="Mua trước bằng hạn mức, trả lại bằng tiền trong ví chính vào đầu tháng sau."
        rules={[
          <>
            Hạn mức cố định <strong>20.000.000đ</strong> cho mọi người, duyệt ngay — không có thẩm định tín dụng.
          </>,
          <>
            Các khoản mua trong một tháng gộp thành một kỳ, <strong>đến hạn ngày 1 tháng sau</strong>. Lãi 0% nếu trả đúng
            hạn.
          </>,
          <>
            Tháng có ít nhất một giao dịch: thêm phí dịch vụ <strong>33.000đ</strong> (không áp dụng ưu đãi miễn phí 5
            giao dịch đầu của bản thật).
          </>,
          <>
            Trễ hạn: phí theo bậc trên dư nợ — 1–4 ngày <strong>5,25%</strong>, 5–9 ngày <strong>10,5%</strong>, 10–14
            ngày <strong>15,75%</strong>, từ 15 ngày <strong>21%</strong>. Luôn tính theo số ngày trễ tại thời điểm xem/trả.
          </>,
          'Trả nợ: trả kỳ cũ nhất trước; trong mỗi kỳ trả phí trễ hạn trước, rồi phí dịch vụ, rồi tiền mua. Không tính vào hạn mức tháng.',
          'Phải đọc và xác nhận lời cảnh báo mô phỏng trước khi mở.',
        ]}
        source="hạn mức, lãi, phí và mốc 'đầu tháng tiếp theo' xác minh trực tiếp từ trang Ví Trả Sau của MoMo; miễn trừ hạn mức tháng theo Điều 26 Thông tư 40/2024/TT-NHNN."
      />
      <Note icon="!" kind="warn">
        <p>
          Ví Trả Sau trong lab <strong>không phải sản phẩm cho vay thật</strong> và không có ngân hàng/công ty tài chính
          nào phía sau. Các tổ chức cấp hạn mức của sản phẩm thật chỉ là nguồn số liệu tham khảo.
        </p>
      </Note>
    </section>
  );
}
