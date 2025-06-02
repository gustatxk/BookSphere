const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const favoriteList = document.getElementById('favoriteList');
const tabSearch = document.getElementById('tab-search');
const tabFavorites = document.getElementById('tab-favorites');
const bookDetails = document.getElementById('bookDetails');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function showNotification(message, isSuccess = true) {
  const notification = document.getElementById('notification');
  notification.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="${isSuccess ? 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z' : 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'}"/>
    </svg>
    ${message}
  `;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

function createBookElement(book, isFavoriteView = false) {
  const div = document.createElement('div');
  div.className = 'book';
  div.onclick = () => showBookDetails(book);

  const img = document.createElement('img');
  img.src = book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/120x160?text=Sem+Capa';
  img.alt = book.volumeInfo.title;

  const info = document.createElement('div');
  info.className = 'book-info';

  const title = document.createElement('h3');
  title.textContent = book.volumeInfo.title;

  const author = document.createElement('p');
  author.textContent = book.volumeInfo.authors?.join(', ') || 'Autor desconhecido';

  const description = document.createElement('p');
  description.textContent = book.volumeInfo.description?.substring(0, 100) + '...' || 'Sem descrição.';

  const button = document.createElement('button');
  button.textContent = isFavoriteView ? 'Remover dos favoritos' : 'Adicionar aos favoritos';

  button.onclick = (e) => {
    e.stopPropagation();
    if (isFavoriteView) {
      removeFromFavorites(book.id);
    } else {
      addToFavorites(book);
    }
  };

  info.appendChild(title);
  info.appendChild(author);
  info.appendChild(description);
  info.appendChild(button);

  div.appendChild(img);
  div.appendChild(info);
  return div;
}

function renderFavorites() {
  favoriteList.innerHTML = '';
  if (favorites.length === 0) {
    favoriteList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Nenhum livro favorito adicionado ainda.</p>';
    return;
  }

  const favoritesContainer = document.createElement('div');
  favoritesContainer.className = 'books-container';

  favorites.forEach(book => {
    const bookElement = createBookElement(book, true);
    favoritesContainer.appendChild(bookElement);
  });

  favoriteList.appendChild(favoritesContainer);
}

function addToFavorites(book) {
  if (!favorites.some(fav => fav.id === book.id)) {
    favorites.push(book);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showNotification('Livro adicionado aos favoritos');
  } else {
    showNotification('Este livro já está nos favoritos', false);
  }
}

function removeFromFavorites(bookId) {
  favorites = favorites.filter(book => book.id !== bookId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  showNotification('Livro removido dos favoritos', false);
  renderFavorites();
}

async function searchBooks(query) {
  searchResults.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    searchResults.innerHTML = '';

    if (data.items && data.items.length > 0) {
      const booksContainer = document.createElement('div');
      booksContainer.className = 'books-container';

      data.items.forEach(book => {
        const bookElement = createBookElement(book);
        booksContainer.appendChild(bookElement);
      });

      searchResults.appendChild(booksContainer);
    } else {
      searchResults.innerHTML = '<p style="text-align: center; color: var(--text-light);">Nenhum livro encontrado. Tente outra busca.</p>';
    }
  } catch (error) {
    searchResults.innerHTML = '<p style="text-align: center; color: var(--error);">Erro ao buscar livros. Tente novamente.</p>';
    console.error('Erro na busca:', error);
  }
}

function showBookDetails(book) {
  searchResults.classList.remove('active');
  favoriteList.classList.remove('active');
  bookDetails.style.display = 'flex';
  bookDetails.innerHTML = '';

  const info = book.volumeInfo;

  const img = document.createElement('img');
  img.src = info.imageLinks?.thumbnail || 'https://via.placeholder.com/180x240?text=Sem+Capa';
  img.alt = info.title;

  const title = document.createElement('h2');
  title.textContent = info.title;

  const authors = document.createElement('p');
  authors.innerHTML = `<strong>Autor(es):</strong> ${info.authors?.join(', ') || 'Desconhecido'}`;

  const publisher = document.createElement('p');
  publisher.innerHTML = `<strong>Editora:</strong> ${info.publisher || 'Não informado'}`;

  // REMOVIDO:
  // const publishedDate = document.createElement('p');
  // publishedDate.innerHTML = `<strong>Data de publicação:</strong> ${info.publishedDate || 'Não informado'}`;

  const pageCount = document.createElement('p');
  pageCount.innerHTML = `<strong>Número de páginas:</strong> ${info.pageCount || 'Não informado'}`;

  const categories = document.createElement('p');
  categories.innerHTML = `<strong>Categorias:</strong> ${info.categories?.join(', ') || 'Não informado'}`;

  const language = document.createElement('p');
  language.innerHTML = `<strong>Idioma:</strong> ${info.language?.toUpperCase() || 'Não informado'}`;

  const description = document.createElement('p');
  description.innerHTML = `<strong>Descrição:</strong><br>${info.description || 'Sem descrição.'}`;

  const previewLink = document.createElement('p');
  if (info.previewLink) {
    previewLink.innerHTML = `<strong>Visualizar online:</strong> <a href="${info.previewLink}" target="_blank" rel="noopener noreferrer">Clique aqui</a>`;
  }

  const backButton = document.createElement('button');
  backButton.textContent = 'Voltar';
  backButton.onclick = () => {
    bookDetails.style.display = 'none';
    const activeTab = document.querySelector('.tab.active').id;
    showTab(activeTab.replace('tab-', ''));
  };

  bookDetails.appendChild(img);
  bookDetails.appendChild(title);
  bookDetails.appendChild(authors);
  bookDetails.appendChild(publisher);
  // bookDetails.appendChild(publishedDate); // REMOVIDO
  bookDetails.appendChild(pageCount);
  bookDetails.appendChild(categories);
  bookDetails.appendChild(language);
  bookDetails.appendChild(description);
  if (info.previewLink) bookDetails.appendChild(previewLink);
  bookDetails.appendChild(backButton);
}

function showTab(tab) {
  bookDetails.style.display = 'none';
  if (tab === 'search') {
    searchResults.classList.add('active');
    favoriteList.classList.remove('active');
    tabSearch.classList.add('active');
    tabFavorites.classList.remove('active');
  } else {
    favoriteList.classList.add('active');
    searchResults.classList.remove('active');
    tabFavorites.classList.add('active');
    tabSearch.classList.remove('active');
    renderFavorites();
  }
}

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    searchBooks(query);
    showTab('search');
  } else {
    searchResults.innerHTML = '<p style="text-align: center; color: var(--text-light);">Digite pelo menos 3 caracteres para buscar</p>';
  }
});

tabSearch.onclick = () => showTab('search');
tabFavorites.onclick = () => showTab('favorites');

// Inicialização
showTab('search');
searchResults.innerHTML = '<p style="text-align: center; color: var(--text-light);">Busque por livros para começar</p>';
