var script = document.createElement('script');
script.type = 'text/javascript';
script.src = '//js.tosspayments.com/v1';
script.onload = () => console.log('tossPayments postcode loaded');

/**
 * 스크립트 삽입
 */
var before = document.getElementsByTagName('script')[0];
before.parentNode.insertBefore(script, before);

/**
 *
 * @param {@angular/core/Renderer2} renderer
 * @param {@angular/core/ElementRef.nativeElement} elem
 * @param {주소선택완료시 콜백} callback
 */
export function setBill() {
    var clientKey = 'test_ck_XjExPeJWYVQ20nbeAkpr49R5gvNL'
    var tossPayments = TossPayments(clientKey)

    tossPayments.requestPayment('카드', {
        amount: 15000,
        orderId: 'D4iaFDjGflaGjMvc37t-x',
        orderName: '토스 티셔츠 외 2건',
        customerName: '박토스',
        successUrl: window.location.origin + '/success',
        failUrl: window.location.origin + '/fail',
    })
}
