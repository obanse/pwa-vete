const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(() => {
  //   createPostArea.style.transform = 'translateY(0)';
  // }, 1);
  createPostArea.style.transform = 'translateY(0)';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  /**
   * unregister all service workers by clicking the button to create new cards
   */
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //       .then(regList => {
  //         for (let i = 0; i < regList.length; i++) {
  //           regList[i].unregister();
  //         }
  //       })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  // createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

/**
 * use caching on demand sample
 * @param event
 */
// function onSaveButtonClicked(event) {
//   console.log('clicked');
//   if ('caches' in window) {
//     caches.open('user-requested')
//         .then(cache => {
//           cache.addAll([
//               'https://httpbin.org/get',
//               '/src/images/sf-boat.jpg'
//           ]);
//         });
//   }
// }

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardWrapper.append(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent= data.location;
  cardSupportingText.style.textAlign = 'center';
  // const cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (let i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

let url = 'https://amk-cc.firebaseio.com/posts.json';
let webDataReceived = false;

fetch(url)
  .then(res => {
    return res.json();
  })
  .then(data => {
    webDataReceived = true;
    console.log('From Web', data);
    let dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  })
  .catch(err => {
    console.log('Network failed for', url);
  })

if ('indexedDB' in window) {
  readAllData('posts')
      .then(data => {
        if (!webDataReceived) {
          console.log('From Cache', data);
          updateUI(data);
        }
      });
}

form.addEventListener('submit', event => {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!');
    return;
  }

  closeCreatePostModal();

  function sendData() {
    fetch('https://amk-cc.firebaseio.com/posts.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image: 'http://lorempixel.com/400/200/people'
      })
    })
        .then(res => {
          console.log('Send data', res);
          updateUI();
        });
  }

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
        .then(sw => {
          let post = {
            id: new Date().toISOString(),
            title: titleInput.value,
            location: locationInput.value
          };
          writeData('sync-posts', post)
              .then(() => {
                return sw.sync.register('sync-new-posts');
              })
              .then(() => {
                let snackbarContainer = document.querySelector('#confirmation-toast');
                let data = { message: 'Your Post was saved for syncing!' };
                snackbarContainer.MaterialSnackbar.showSnackbar(data);
              });
        })
  } else {
    sendData();
  }

});
