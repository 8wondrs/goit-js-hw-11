import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './js/fetchImages';
import { icons } from './js/icons';
import { spinnerPlay, spinnerStop } from './js/spinner';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

let query = '';
let page = 1;
const perPage = 40;

const optionsSL = {
  overlayOpacity: 0.5,
  captionsData: 'alt',
  captionDelay: 250,
};
let simpleLightBox;

searchForm.addEventListener('submit', onSearchForm);

function renderGallery(images) {
  if (!gallery) {
    return;
  }
  const markup = images
    .map(image => {
      const {
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
        <div class="gallery-item">
          <a
            href="${largeImageURL}">
            <img src="${webformatURL}"
            alt="${tags}"
            class="gallery-image"
            loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item">${likes}
              <b>${icons.likes}</b>
            </p>
            <p class="info-item">${views}
              <b>${icons.views}</b>
            </p>
            <p class="info-item">${comments}
              <b>${icons.comments}</b>
            </p>
            <p class="info-item">${downloads}
              <b>${icons.downloads}</b>
            </p>
          </div>
        </div>
      `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  const { height: cardHeight } = document
    .querySelector('.gallery-item')
    .firstElementChild.getBoundingClientRect();

  if (page === 1) {
    return;
  }
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
  query = e.currentTarget.elements.searchQuery.value.trim();
  gallery.innerHTML = '';

  spinnerPlay();

  if (query === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
  }
  fetchImages(query, page, perPage)
    .then(data => {
      if (data.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        renderGallery(data.hits);
        simpleLightBox = new SimpleLightbox('.gallery a', optionsSL).refresh();
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      spinnerStop();
      searchForm.reset();
    });
}

let loadingMore = false;

function onloadMore() {
  if (loadingMore) {
    return;
  }

  loadingMore = true;

  page += 1;
  simpleLightBox.destroy();

  spinnerPlay();

  fetchImages(query, page, perPage)
    .then(data => {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a', optionsSL).refresh();

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page > totalPages) {
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      spinnerStop();
      loadingMore = false;
    });
}

function checkIfEndOfPage() {
  return (
    window.innerHeight + window.pageYOffset >=
    document.documentElement.scrollHeight - 50
  );
}

function showLoadMorePage() {
  if (checkIfEndOfPage()) {
    onloadMore();
  }
}

let timeoutId = null;

function throttle(func, delay) {
  return function () {
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        func();
        timeoutId = null;
      }, delay);
    }
  };
}

window.addEventListener('scroll', throttle(showLoadMorePage, 500));

arrowTop.onclick = function () {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.addEventListener('scroll', function () {
  arrowTop.hidden = scrollY < document.documentElement.clientHeight;
});
