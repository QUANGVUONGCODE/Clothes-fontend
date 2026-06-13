import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkAndRefreshToken } from '../../utils/TokenManager';
import { useShop } from '../../context/ShopContext';

const toast = {
  success: (msg) => console.log(msg),
  error: (msg) => console.error(msg),
};

const PaymentCallback = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // SHOP CONTEXT
  const { clearCart } = useShop();

  // STATES
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);

  /* =========================
     QUERY PARAMS
  ========================= */
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const txnRef = queryParams.get('vnp_TxnRef');
  const amount = queryParams.get('vnp_Amount');
  const responseCode = queryParams.get('vnp_ResponseCode');
  const transactionNo = queryParams.get('vnp_TransactionNo');
  const bankCode = queryParams.get('vnp_BankCode');
  const payDate = queryParams.get('vnp_PayDate');
  const orderInfoParam = queryParams.get('vnp_OrderInfo');

  /* =========================
     FORMAT MONEY
  ========================= */
  const formatMoney = (money) => {

    if (!money) return '0';

    return Number(money / 100).toLocaleString('vi-VN') + ' đ';
  };

  /* =========================
     FORMAT DATE
  ========================= */
  const formatPayDate = (dateString) => {

    if (!dateString || dateString.length !== 14) {
      return '';
    }

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(8, 10);
    const minute = dateString.substring(10, 12);
    const second = dateString.substring(12, 14);

    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  /* =========================
     CALL PAYMENT RESULT API
  ========================= */
  const callPaymentResultAPI = async (txnRefValue) => {

    const token = await checkAndRefreshToken();

    if (!token) {

      toast.error('❌ Không có token hợp lệ');

      return false;
    }

    try {

      const res = await fetch(
        `/shopclothes/api/v1/payments/result/${txnRefValue}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log('PAYMENT RESULT:', data);

      // SUCCESS
      if (data?.code === 0) {

        toast.success('✅ Thanh toán thành công');

        // CLEAR CART
        clearCart();

        return true;

      } else {

        toast.error(data?.message || '❌ Xử lý thanh toán thất bại');

        return false;
      }

    } catch (error) {

      console.error(error);

      toast.error('❌ Có lỗi xảy ra khi xử lý thanh toán');

      return false;
    }
  };

  /* =========================
     HANDLE PAYMENT CALLBACK
  ========================= */
  const handlePaymentCallback = async () => {

    try {

      setLoading(true);

      // CHECK PARAMS
      if (!txnRef || !amount || !responseCode) {

        setPaymentStatus('Thiếu thông tin thanh toán');

        toast.error('❌ Thiếu thông tin thanh toán');

        return;
      }

      console.log('VNPAY CALLBACK:', {
        txnRef,
        amount,
        responseCode,
        transactionNo,
        bankCode,
        payDate,
      });

      // =========================
      // PAYMENT SUCCESS
      // =========================
      if (responseCode === '00') {

        setPaymentStatus('Thanh toán thành công');

        setOrderInfo({
          txnRef,
          amount: formatMoney(amount),
          bankCode,
          transactionNo,
          payDate: formatPayDate(payDate),
          orderInfo: orderInfoParam,
        });

        // CALL BACKEND PROCESS PAYMENT
        const success = await callPaymentResultAPI(txnRef);

        if (success) {

          setTimeout(() => {

            navigate('/');

          }, 3000);
        }

      } else {

        // =========================
        // PAYMENT FAILED
        // =========================
        setPaymentStatus('Thanh toán thất bại');

        toast.error('❌ Thanh toán thất bại');

        setOrderInfo({
          txnRef,
          amount: formatMoney(amount),
          responseCode,
        });
      }

    } catch (error) {

      console.error(error);

      setPaymentStatus('Có lỗi xảy ra');

      toast.error('❌ Có lỗi xảy ra khi xử lý callback');

    } finally {

      setLoading(false);
    }
  };

  /* =========================
     INIT
  ========================= */
  useEffect(() => {

    handlePaymentCallback();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
     UI
  ========================= */
  return (

    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6">

      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="mb-6 text-center text-3xl font-bold">
          Kết quả thanh toán
        </h1>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-stone-500">
            Đang xử lý thanh toán...
          </div>
        )}

        {/* STATUS */}
        {!loading && (
          <div
            className={`mb-6 rounded-xl p-4 text-center text-lg font-semibold
              ${responseCode === '00'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
              }`}
          >
            {paymentStatus}
          </div>
        )}

        {/* ORDER INFO */}
        {orderInfo && (

          <div className="space-y-4 rounded-xl border border-stone-200 p-5">

            <div className="flex justify-between">
              <span className="font-medium">Mã giao dịch:</span>
              <span>{orderInfo.txnRef}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Số tiền:</span>
              <span>{orderInfo.amount}</span>
            </div>

            {orderInfo.bankCode && (
              <div className="flex justify-between">
                <span className="font-medium">Ngân hàng:</span>
                <span>{orderInfo.bankCode}</span>
              </div>
            )}

            {orderInfo.transactionNo && (
              <div className="flex justify-between">
                <span className="font-medium">Mã VNPay:</span>
                <span>{orderInfo.transactionNo}</span>
              </div>
            )}

            {orderInfo.payDate && (
              <div className="flex justify-between">
                <span className="font-medium">Thời gian:</span>
                <span>{orderInfo.payDate}</span>
              </div>
            )}

          </div>
        )}

        {/* BUTTON */}
        {!loading && (
          <button
            onClick={() => navigate('/')}
            className="mt-8 w-full rounded-xl bg-black py-3 text-white transition hover:opacity-90"
          >
            Quay về trang chủ
          </button>
        )}

      </div>

    </div>
  );
};

export default PaymentCallback;