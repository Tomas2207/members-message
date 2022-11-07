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
  let imgDiv = document.getElementById('clicked-img');
  let insideimg = document.getElementById('inside-img');

  imgDiv.addEventListener('click', function () {
    imgDiv.classList.remove('clicked-img');
    insideimg.src = '';
  });
  for (let image of images) {
    observer.observe(image);

    image.addEventListener('click', function (e) {
      insideimg.src = e.target.src;
      imgDiv.classList.add('clicked-img');
    });
  }
}
