let images = document.getElementsByClassName('message-img');

let imageOptions = {};
let observer = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const image = entry.target;
    const newURL = image.getAttribute('data-src');
    image.src = newURL;
    // observer.unobserve(image);
  });
}, imageOptions);

if (images.length > 0) {
  for (let image of images) {
    // image.onload = function () {
    //   socket.emit('UpdateOnDatabase');
    // };

    // const newURL = image.getAttribute('data-src');
    // image.src = newURL;
    observer.observe(image);
    // console.log('img', image);
  }
}
