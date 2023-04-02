const imageContainer = document.getElementById('image-container');

async function getApodData() {
  const response = await fetch('/apod');
  const data = await response.json();

  return data;
}

async function displayApod() {
  const data = await getApodData();

  if (data.media_type === 'image') {
    const imageUrl = data.url;
    const imageTitle = data.title;
    const imageExp = data.explanation;

    const imageElement = document.createElement('img');
    imageElement.src = imageUrl;
    imageElement.alt = imageTitle;

    const title = document.createElement('h1');
    title.innerHTML = imageTitle;

    const exp = document.createElement('p');
    exp.innerHTML = imageExp;

    imageContainer.appendChild(imageElement);
    imageContainer.appendChild(title);
    imageContainer.appendChild(exp);
  } else {
    console.log('Sorry, the APOD data for today is not an image');
  }
}

displayApod();
