const PAGE_SIZE = 10;


const newsList = document.getElementById("newsList");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const statusText = document.getElementById("statusText");

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuToggle = document.getElementById("menuToggle");
const closeSidebarBtn = document.getElementById("closeSidebar");
const categoryList = document.getElementById("categoryList");


let currentCategory = "general";
let currentPage = 1;


function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
}

menuToggle.addEventListener("click", openSidebar);
closeSidebarBtn.addEventListener("click", closeSidebar);
overlay.addEventListener("click", closeSidebar);


categoryList.addEventListener("click", function (event) {
    const item = event.target;
    if (item.tagName !== "LI") return;

    const selectedCategory = item.getAttribute("data-cat");
    if (!selectedCategory || selectedCategory === currentCategory) {
        closeSidebar();
        return;
    }

    document
        .querySelectorAll("#categoryList li")
        .forEach(li => li.classList.remove("active"));
    item.classList.add("active");


    currentCategory = selectedCategory;
    currentPage = 1;
    newsList.innerHTML = "";
    fetchNews(true);

    closeSidebar();
});



async function fetchNews(isFirstPage) {
    statusText.textContent = "Loading news...";
    statusText.classList.add("loading");
    loadMoreBtn.disabled = true;

    const url = `/api/news?category=${currentCategory}&lang=en&page=${currentPage}`;



    try {
        const response = await fetch(url);
        const data = await response.json();

        // If first page and nothing came back
        if (isFirstPage && (!data.articles || data.articles.length === 0)) {
            newsList.innerHTML = "<p>No stories found for this category.</p>";
            loadMoreBtn.style.display = "none";
            statusText.textContent = "";
            statusText.classList.remove("loading");
            return;
        }

        if (data.articles && data.articles.length > 0) {
            data.articles.forEach(article => addNewsCard(article));
        }


        if (!data.articles || data.articles.length < PAGE_SIZE) {
            loadMoreBtn.style.display = "none";
            statusText.textContent = "You are all caught up!";
        } else {
            loadMoreBtn.style.display = "inline-block";
            statusText.textContent =
                "Showing page " + currentPage + " (" + data.articles.length + " new stories)";
            loadMoreBtn.disabled = false;
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        statusText.textContent = "Could not load news. Please try again.";
        loadMoreBtn.disabled = false;
    } finally {
        statusText.classList.remove("loading");
    }
}


function addNewsCard(article) {
    const card = document.createElement("article");
    card.className = "news-card";

    // Left: image
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "news-image-wrapper";

    const img = document.createElement("img");
    img.src = article.image || "https://via.placeholder.com/300x200?text=No+Image";
    img.alt = article.title || "News image";

    imgWrapper.appendChild(img);


    const content = document.createElement("div");
    content.className = "news-content";

    const title = document.createElement("h3");
    title.className = "news-title";
    title.textContent = article.title || "Untitled";

    const meta = document.createElement("div");
    meta.className = "news-meta";

    const sourceName = article.source && article.source.name
        ? article.source.name
        : "Unknown source";

    const publishedDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        })
        : "";

    meta.textContent = sourceName + (publishedDate ? " • " + publishedDate : "");

    const desc = document.createElement("p");
    desc.className = "news-desc";
    desc.textContent =
        article.description ||
        (article.content ? article.content.slice(0, 150) + "..." : "No description available.");

    const readMore = document.createElement("a");
    readMore.className = "read-more";
    readMore.href = article.url;
    readMore.target = "_blank";
    readMore.rel = "noopener";
    readMore.textContent = "read more at " + sourceName;

    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(desc);
    content.appendChild(readMore);

    card.appendChild(imgWrapper);
    card.appendChild(content);

    newsList.appendChild(card);
}


loadMoreBtn.addEventListener("click", function () {
    currentPage += 1;
    fetchNews(false);
});


fetchNews(true);
