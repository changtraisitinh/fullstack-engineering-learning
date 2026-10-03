import { Crumb, PageLink } from '../../components';
import { Feature } from './parts';

export default function BizPayments() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Theo nhóm tính năng']} />
      <h1>Nạp/rút, chuyển tiền &amp; thanh toán</h1>
      <p className="lede">
        Các giao dịch tiền ra khỏi ví ở trang này đều chịu thêm{' '}
        <PageLink to="biz-limits">hạn mức mỗi lần và hạn mức tháng</PageLink>.
      </p>

      <Feature
        name="Nạp tiền & rút tiền (ngân hàng liên kết)"
        what="Người dùng liên kết một tài khoản ngân hàng, sau đó nạp tiền từ đó vào ví hoặc rút tiền từ ví về đó."
        rules={[
          'Phải liên kết ngân hàng trước khi rút; chưa liên kết thì bị từ chối.',
          <>
            Nạp tiền: ví <strong>chỉ được cộng sau khi ngân hàng xác nhận</strong> (ngân hàng báo kết quả sau, bất đồng
            bộ). Nếu ngân hàng báo thất bại thì không có gì phải hoàn.
          </>,
          'Tối đa 50.000.000đ/lần cho cả nạp và rút; rút tiền tính vào hạn mức tháng.',
        ]}
        source="mô phỏng theo cơ chế Collection Link + thông báo kết quả (IPN) mà MoMo công bố cho đối tác; chiều 'ngân hàng thu tiền để nạp vào ví' là bản thích nghi, chưa được MoMo xác nhận là cách họ làm nội bộ."
      />

      <Feature
        name="Chuyển tiền cho người dùng khác"
        what="Chuyển tiền tức thời cho một người dùng Ewallet Lab khác, tìm theo số điện thoại."
        rules={[
          'Không thể chuyển cho chính mình; số điện thoại phải có tài khoản.',
          <>
            Trừ tiền người gửi rồi cộng tiền người nhận; nếu bước cộng thất bại thì <strong>tự động hoàn tiền</strong> cho
            người gửi.
          </>,
          'Tối đa 100.000.000đ/lần; tính vào hạn mức tháng.',
        ]}
        source="không có quy trình P2P nội bộ công khai của MoMo — thiết kế theo logic ví điện tử phổ quát."
      />

      <Feature
        name="Chuyển khoản ra ngân hàng"
        what="Chuyển tiền từ ví tới một tài khoản ngân hàng bất kỳ."
        rules={[
          <>
            Ví bị <strong>trừ ngay</strong>, trước khi ngân hàng xác nhận. Nếu ngân hàng báo thất bại sau đó, tiền được{' '}
            <strong>hoàn lại</strong>. Ngược với nạp tiền, nơi ví chỉ được cộng sau khi ngân hàng xác nhận.
          </>,
          'Tối đa 50.000.000đ/lần; tính vào hạn mức tháng.',
        ]}
        source="suy diễn kỹ thuật từ cơ chế Collection Link đã xác minh — MoMo không công bố API chiều tiền ra ngân hàng."
      />

      <Feature
        name="Nhận tiền bằng mã QR / quét QR để chuyển"
        what="Mỗi người có một mã QR cá nhân; người khác quét mã để mở sẵn màn hình chuyển tiền cho người đó."
        rules={[
          'Mã QR chỉ chứa số điện thoại người nhận — số tiền do người quét nhập, giống màn QR cá nhân của MoMo thật.',
          'Định dạng QR là của riêng lab, không phải chuẩn VietQR/ngân hàng; mã QR ngân hàng thật không được hỗ trợ.',
          'Sau khi quét, mọi quy tắc của "Chuyển tiền cho người dùng khác" áp dụng như bình thường.',
        ]}
        source="bố cục màn QR cá nhân theo hướng dẫn công khai của MoMo; định dạng mã tự thiết kế."
      />

      <Feature
        name="Thanh toán hoá đơn"
        what="Tra cứu hoá đơn theo loại dịch vụ + mã khách hàng, rồi thanh toán bằng tiền trong ví."
        rules={[
          <>
            Nhà cung cấp hoá đơn là <strong>giả lập hoàn toàn</strong> (không dùng tên điện lực/nhà mạng thật). Số tiền được
            sinh cố định từ loại dịch vụ + mã khách hàng, trong khoảng 50.000đ – 2.000.000đ.
          </>,
          <>
            Khi thanh toán, người dùng <strong>không tự nhập số tiền</strong>: hệ thống tự tính lại đúng số đã báo lúc tra
            cứu, nên không thể trả khác số tiền hoá đơn.
          </>,
          'Thành công trọn vẹn hoặc thất bại ngay (ví dụ không đủ số dư), không có trạng thái "đang chờ".',
          'Tính vào hạn mức tháng. Là giao dịch duy nhất được tích Điểm thưởng.',
        ]}
        source="không có spec công khai về tổng hợp hoá đơn của MoMo — toàn bộ là mô phỏng có chủ đích."
      />
    </section>
  );
}
