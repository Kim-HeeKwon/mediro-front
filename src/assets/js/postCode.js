var script = document.createElement('script');
script.type = 'text/javascript';
script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
script.onload = () => console.log('daum postcode loaded');

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
export function postcode(renderer, elem, callback) {
    new daum.Postcode({
        oncomplete: data => {
            callback(data);
            elem.style.display = 'none';
        },
        width: '100%',
        height: '100%',
        maxSuggestItems: 5
    }).embed(elem);

    /**
     * 창크기 조정, 팝업창 센터로
     */
    var width = 380;
    var height = 480;
    var borderWidth = 1;

    renderer.setStyle(elem, 'display', 'block');
    renderer.setStyle(elem, 'width', width + 'px');
    renderer.setStyle(elem, 'height', height + 'px');
    renderer.setStyle(elem, 'border', borderWidth + 'px solid');
    renderer.setStyle(elem, 'left', ((window.innerWidth || document.documentElement.clientWidth) - width) / 2 - borderWidth + 'px');
    renderer.setStyle(elem, 'top', ((window.innerHeight || document.documentElement.clientHeight) - height) / 2 - borderWidth + 'px');
}

export function geodata(param, callback) {
    // 주소-좌표 변환 객체를 생성
    var geocoder = new kakao.maps.services.Geocoder();
    
    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(param, function (result, status) {

        // 정상적으로 검색이 완료됐으면 
        if (status === kakao.maps.services.Status.OK) {
          //경기 구리시 산마루로 46
          console.log(result[0]);
          callback(result[0]);
          //this.generalForm.patchValue({ 'x': result[0].x });
          //this.generalForm.patchValue({ 'x': result[0].y });
        }
    });
}

