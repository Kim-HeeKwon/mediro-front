var script = document.createElement('script');
script.type = 'text/javascript';
script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=8bfbf44e041d3971b5e1c8a94ca77f3d&libraries=services';
script.onload = () => console.log('daum postcode loaded');

/**
 * 스크립트 삽입
 */
var before = document.getElementsByTagName('script')[0];
before.parentNode.insertBefore(script, before);

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

