function updateDiv() {
  $('#updateDiv').load(window.location.href + ' #updateDiv', () => {
    console.log('updated');
  });
}

const socket = io.connect('http://localhost:3000');
socket.on('RefreshPage', function (data) {
  // location.reload();
  updateDiv();
});

const submitBtn = document.getElementById('submit-btn');
submitBtn.addEventListener('click', (e) => {
  let emptyText = document.forms['text-form']['message'].value;
  let emptyImg = document.forms['img-form']['image'].value;

  if (emptyText == '' || emptyText == null) {
    console.log('no Text');
  } else {
    document.forms['text-form'].submit();
  }
  if (emptyImg == '' || emptyText == null) {
    console.log('no img');
  } else {
    document.forms['img-form'].submit();
  }
});
