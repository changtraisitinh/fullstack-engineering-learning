import { Crumb } from '../../components';
import { Feature } from './parts';

export default function BizRequests() {
  return (
    <section className="page">
      <Crumb parts={['Business', 'Theo nhóm tính năng']} />
      <h1>Nhận tiền, nhắc trả &amp; lì xì</h1>
      <p className="lede">
        Ba tính năng "một người khởi tạo, người khác hoàn tất". Khác nhau ở chỗ: ai được phép trả/nhận, tiền được trừ lúc
        nào, và bao lâu thì hết hạn.
      </p>

      <Feature
        name="Link nhận tiền"
        what="Tạo một đường link xin tiền (kèm số tiền, lời nhắn) và gửi cho bất kỳ ai."
        rules={[
          <>
            <strong>Bất kỳ ai</strong> có tài khoản Ewallet Lab và mở được link đều trả được. Đây là đơn giản hoá có chủ
            đích của lab, không phải lỗ hổng cần vá.
          </>,
          <>Link <strong>hết hạn sau 24 giờ</strong>.</>,
          <>
            Chưa ai trả thì chưa có tiền nào di chuyển. Khi trả, tiền đi qua đúng luồng chuyển tiền thông thường nên chịu
            đủ hạn mức.
          </>,
          'Mỗi link chỉ được trả đúng một lần, kể cả khi nhiều người bấm trả cùng lúc.',
        ]}
        source="cấu trúc phỏng theo Collection Link của MoMo (dành cho merchant), không phải spec chuyển tiền cá nhân đã xác nhận."
      />

      <Feature
        name="Nhắc trả tiền"
        what="Gửi lời nhắc trả tiền tới một người cụ thể (theo số điện thoại)."
        rules={[
          <>
            Chỉ <strong>đúng người được nhắc</strong> mới trả được; người khác bị từ chối.
          </>,
          'Lời nhắc không có thời hạn.',
          'Tiền chỉ di chuyển khi người được nhắc bấm trả, qua đúng luồng chuyển tiền thông thường.',
        ]}
        source="luồng 4 bước xác minh trực tiếp từ momo.vn."
      />

      <Feature
        name="Giật lì xì (1 người nhận)"
        what="Gửi lì xì kèm lời chúc cho một người dùng khác."
        rules={[
          <>
            Tiền bị <strong>trừ khỏi ví người gửi ngay lúc gửi</strong> (giữ hộ), không đợi người nhận bấm nhận. Nếu không,
            người gửi có thể tiêu số tiền đó vào việc khác trong lúc chờ.
          </>,
          <>
            Sau <strong>48 giờ</strong> mà người nhận chưa nhận, tiền <strong>tự động hoàn lại</strong> cho người gửi.
          </>,
          <>Mỗi lần: tối thiểu <strong>1.000đ</strong>, tối đa <strong>20.000.000đ</strong>.</>,
          'Chỉ đúng người được gửi mới nhận được; không gửi được cho chính mình.',
          'Chưa có: lì xì nhóm, chia ngẫu nhiên, mời qua SMS cho số chưa có tài khoản.',
        ]}
        source="hạn mức và cơ chế 48 giờ xác minh trực tiếp từ hướng dẫn công khai của MoMo."
      />

      <Feature
        name="Chia tiền"
        live={false}
        what="Chia một hoá đơn chung cho nhiều người."
        rules={['Chưa làm: cần mô hình theo dõi nhóm và hoá đơn chung riêng.']}
      />
    </section>
  );
}
