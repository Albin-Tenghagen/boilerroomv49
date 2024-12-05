const itemsPerPage = 15;
let currentPage = 1;
let articleArray = [];
let policeArticleArray = [];
let intervalId = setInterval(()=>{
    fetchApiResults();
}, 300000);
//*-------------------------------------------------------------------------
//-----------------Header Creation------------------------------------------
let headerContainer = document.createElement("header");
headerContainer.setAttribute("class", "headerContainer");
document.body.appendChild(headerContainer);
let headingHeader = document.createElement("h1");
headingHeader.setAttribute("class", "headingHeader");
headingHeader.innerText = "Welcome to the latest news";
headerContainer.appendChild(headingHeader);
let homeButton = document.createElement("button");
homeButton.setAttribute("class", "homeButton");
homeButton.innerText = "Home";
headerContainer.appendChild(homeButton);
let techButton = document.createElement("button");
techButton.setAttribute("class", "techButton");
techButton.innerText = "Tech";
headerContainer.appendChild(techButton);
let appleButton = document.createElement("button");
appleButton.setAttribute("class", "appleButton");
appleButton.innerText = "Apple";
headerContainer.appendChild(appleButton);
let teslaButton = document.createElement("button");
teslaButton.setAttribute("class", "teslaButton");
teslaButton.innerText = "Tesla";
headerContainer.appendChild(teslaButton);
let economyButton = document.createElement("button");
economyButton.setAttribute("class", "economyButton");
economyButton.innerText = "Economy";
headerContainer.appendChild(economyButton);
let topHeadlinesButton = document.createElement("button");
topHeadlinesButton.setAttribute("class", "topHeadlinesButton");
topHeadlinesButton.innerText = "TopHeadlines";
headerContainer.appendChild(topHeadlinesButton);
//--------------------------------------------------------------------------
//------------Main Creation ------------------------------------------------
let newsContainer = document.createElement("main");
newsContainer.setAttribute("class", "newsContainer");
document.body.appendChild(newsContainer);
let searchForm = document.createElement("form");
searchForm.setAttribute("class", "searchForm");
newsContainer.appendChild(searchForm);
let searchNewsInput = document.createElement("input");
searchNewsInput.setAttribute("class", "searchNewsInput");
searchNewsInput.setAttribute("placeholder", "Search articles");
searchForm.appendChild(searchNewsInput);
let searchNewsButton = document.createElement("button");
searchNewsButton.setAttribute("class", "searchNewsButton");
searchNewsButton.innerText = "Search";
searchForm.appendChild(searchNewsButton);
let errorContainer = document.createElement("div");
errorContainer.setAttribute("id", "errorContainer");
newsContainer.appendChild(errorContainer);
let articleSection = document.createElement("section");
articleSection.setAttribute("class", "articleSection");
newsContainer.appendChild(articleSection);
const section2Header = document.createElement("h1");
section2Header.setAttribute("class", "section2Header");
section2Header.innerText = "news from swedish police, Time to train your swedish!";
newsContainer.appendChild(section2Header);
const articleSection2 = document.createElement("section");
articleSection2.setAttribute("class", "articleSection2");
newsContainer.appendChild(articleSection2);
//-----------------------------FETCH----------------------------------------
// assigns the function with (type = "all") so that we can change this value for different results later.
const fetchApiResults = async (type = "all")=>{
    try {
        console.log(type, " is responsive");
        // empties the article section everytime the function runs.
        articleSection.replaceChildren();
        articleSection2.replaceChildren();
        let requests = [];
        let url;
        //switch case to check which "type" runs.
        switch(type){
            case "topHeadlines":
                url = "https://newsasdaspi.org/v2/top-headlines?country=us&language=en&apiKey=1006e9f332db40bd8553b27720785488";
                break;
            case "all":
                requests = [
                    fetch("https://newsapi.org/v2/top-headlines?country=us&language=en&apiKey=1006e9f332db40bd8553b27720785488"),
                    fetch("https://newsapi.org/v2/top-headlines?language=en&category=business&apiKey=1006e9f332db40bd8553b27720785488")
                ];
                break;
            case "economyCategory":
                url = "https://newsapi.org/v2/top-headlines?language=en&category=business&apiKey=1006e9f332db40bd8553b27720785488";
                break;
            default:
                url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(type)}&language=en&from=2024-11-15&sortBy=publishedAt&apiKey=1006e9f332db40bd8553b27720785488`;
                break;
        }
        // if we run the "all" type, then this will push a fetch api into the requests array.
        if (type === "all") requests.push(fetch("https://polisen.se/api/events"));
        // once code is executed, Promise.all runs them at the same time and awaits so that they are all resolved. if any of them rejects, all of them rejects.
        if (requests.length > 0) {
            const [economyResponse, headlinesResponse, policeResponse] = await Promise.all(requests);
            // if a response is NOT ok, then it will call the responseMessage function.
            if (!headlinesResponse.ok) responseMessage(headlinesResponse);
            if (!economyResponse.ok) responseMessage(economyResponse);
            if (!policeResponse.ok) responseMessage(policeResponse);
            //If the responses was recieved succesfully, they will then be parsed to javascript objects and stored in the respective variable
            // with Promise.all() the code parses everything at the same time (which is faster than one by one.) before moving on with the code.
            const [headlinesData, economyData, policeData] = await Promise.all([
                headlinesResponse.json(),
                economyResponse.json(),
                policeResponse.json()
            ]);
            // combines headlinesData.articles with economyData.articles into one array.
            articleArray = [
                ...headlinesData.articles,
                ...economyData.articles
            ];
            // separates the news from the police API into another array
            policeArticleArray = policeData;
            if (policeArticleArray.length === 0) articleSection2.innerHTML = "<p>No articles were found<p>";
            else {
                console.log("policeArray", policeArticleArray);
                // limits the amount of articles visible on the site to 20 starting from 0. it still fetches 500 articles though..
                const limitedPoliceArticles = policeArticleArray.slice(0, 20);
                limitedPoliceArticles.forEach((article2)=>createArticles2(article2));
            }
        } else {
            // paused execution until fetch promise resolved.
            const response = await fetch(url);
            if (!response.ok) responseMessage(response);
            const data = await response.json();
            articleArray = data.articles;
        }
        if (articleArray.length === 0) articleSection.innerHTML = "<p>No articles were found<p>";
        else {
            console.log("articleArray", articleArray);
            //   // filters the array so that every "article.content ["Removed"] is filtered away.
            // articleArray = articleArray.filter(
            //   // optional chaining operator with ? it returns undefined instead of an error. It checks if the value before it is null or undefined.
            //   (article) => article?.content?.toLowerCase() !== "[removed]"
            // );
            updatePagination();
        }
    } catch (error) {
        if (error instanceof Error) showError("An error occured: ", error.message);
        else console.error("An error occured: ", error);
    }
};
//------------------------Default News--------------------------------------
window.addEventListener("DOMContentLoaded", async function() {
    await fetchApiResults("all");
    document.querySelector(".searchNewsInput").value = "";
});
//--------------------------------------------------------------------------
//------------------Category Selection--------------------------------------
homeButton.addEventListener("click", async function() {
    currentPage = 1;
    await fetchApiResults("all");
    document.querySelector(".searchNewsInput").value = "";
});
techButton.addEventListener("click", async function() {
    currentPage = 1;
    document.querySelector(".section2Header").style.display = "none";
    await fetchApiResults("tech");
    document.querySelector(".searchNewsInput").value = "";
});
appleButton.addEventListener("click", async function() {
    currentPage = 1;
    document.querySelector(".section2Header").style.display = "none";
    await fetchApiResults("apple");
    document.querySelector(".searchNewsInput").value = "";
});
teslaButton.addEventListener("click", async function() {
    currentPage = 1;
    document.querySelector(".section2Header").style.display = "none";
    await fetchApiResults("tesla");
    document.querySelector(".searchNewsInput").value = "";
});
economyButton.addEventListener("click", async function() {
    currentPage = 1;
    document.querySelector(".section2Header").style.display = "none";
    await fetchApiResults("economyCategory");
    document.querySelector(".searchNewsInput").value = "";
});
topHeadlinesButton.addEventListener("click", async function() {
    currentPage = 1, document.querySelector(".section2Header").style.display = "none";
    await fetchApiResults("topHeadlines");
    document.querySelector(".searchNewsInput").value = "";
});
//---------------------------------------------------------
//----------------------Search function-------------------------------------
searchForm.addEventListener("submit", function(event) {
    event.preventDefault();
    let searchTerm = searchNewsInput.value;
    if (searchTerm.trim() === "") {
        console.log("Error, input is empty");
        searchNewsInput.setAttribute("placeholder", "Input field can not be empty. Please try again.");
    } else {
        console.log("input is not empty, yay!");
        searchForArticles(searchTerm);
        document.querySelector(".searchNewsInput").value = "";
        document.querySelector(".section2Header").style.display = "none";
    }
});
async function searchForArticles(query) {
    currentPage = 1;
    await fetchApiResults(query);
}
//--------------------------------------------------------------------------
//-------------------Paging Setup--------------------------
function displayData(page) {
    console.log(`Show data for page ${page}`);
    articleSection.innerHTML = "";
    const startingPage = (page - 1) * itemsPerPage;
    console.log("starting page:", startingPage);
    const endingPage = startingPage + itemsPerPage;
    console.log("ending page:", endingPage);
    const paginatedData = articleArray.slice(startingPage, endingPage);
    console.log("paginated data: ", paginatedData);
    paginatedData.forEach((article)=>createArticles(article));
}
function paginationSetup() {
    //* Takes the array of data and divides it with how many itmesPerPage we wanted
    const amountOfPages = Math.ceil(articleArray.length / itemsPerPage);
    console.log("pages count: ", amountOfPages);
    const pageControls = document.createElement("article");
    pageControls.setAttribute("class", "pageControls");
    articleSection.appendChild(pageControls);
    //* when a prevButton or Next button is clicked. it checks if it is on the last or  the first page, in that case the respective buttons wont work. so the display wont crack.
    const prevButton = document.createElement("button");
    prevButton.textContent = "Previous Page";
    prevButton.setAttribute("class", "prevButton");
    pageControls.appendChild(prevButton);
    prevButton.addEventListener("click", ()=>{
        if (currentPage > 1) {
            currentPage--;
            console.log("current page: ", currentPage);
            updatePagination();
        } else console.log("Could not go back");
    });
    //*Shows what page the user is on currently viewing
    const pageButton = document.createElement("button");
    pageButton.setAttribute("class", "pageButton");
    pageButton.textContent = `${currentPage} / ${amountOfPages}`;
    pageControls.appendChild(pageButton);
    const nextButton = document.createElement("button");
    nextButton.setAttribute("class", "nextButton");
    nextButton.textContent = "Next page";
    pageControls.appendChild(nextButton);
    nextButton.addEventListener("click", ()=>{
        if (currentPage < amountOfPages) {
            currentPage++;
            console.log("current page: ", currentPage);
            updatePagination();
        }
    });
}
//------------------Page Refresh function------------------
function updatePagination() {
    //Calls the function to display what different parts of the article array in slices
    displayData(currentPage);
    //Sets up the pagination system every time it gets called to avoid double controls and/or other errors
    paginationSetup();
}
function createArticles(article) {
    let articleContainer = document.createElement("article");
    articleContainer.setAttribute("class", "articleContainer");
    articleSection.appendChild(articleContainer);
    let articleTitle = document.createElement("h3");
    articleTitle.textContent = article.title;
    articleTitle.setAttribute("class", "articleTitle");
    articleContainer.appendChild(articleTitle);
    let articleSummary = document.createElement("p");
    articleSummary.setAttribute("class", "articleSummary");
    articleSummary.textContent = article.description;
    articleContainer.appendChild(articleSummary);
    let timeStamp = document.createElement("p");
    timeStamp.setAttribute("class", "timeStamp");
    // Format timestamp
    let publishedAt = article.publishedAt; // Exampel: "2024-11-22T15:30:00Z"
    let dateAndTime = publishedAt.replace("Z", "").split("T"); // Divides "T" to seperate date and time
    let formattedTimeStamp = `${dateAndTime[0]} ${dateAndTime[1]}`; // Places a blank space between date and time
    timeStamp.textContent = formattedTimeStamp;
    articleContainer.appendChild(timeStamp);
    let articleAuthor = document.createElement("p");
    articleAuthor.setAttribute("class", "articleAuthor");
    articleAuthor.textContent = article.author;
    articleContainer.appendChild(articleAuthor);
    let articleImage = document.createElement("img");
    articleImage.setAttribute("class", "articleImage");
    article.urlToImage = article.urlToImage === null ? "https://placehold.co/600x400" : article.urlToImage;
    articleImage.src = article.urlToImage;
    articleContainer.append(articleImage);
    //
    //
    let readMoreButton = document.createElement("a");
    readMoreButton.textContent = "Read more";
    readMoreButton.setAttribute("class", "readMoreButton");
    readMoreButton.setAttribute("target", "_blank");
    readMoreButton.href = article.url;
    articleContainer.appendChild(readMoreButton);
}
function createArticles2(article2) {
    let articleContainer2 = document.createElement("article");
    articleContainer2.setAttribute("class", "articleContainer");
    articleSection2.appendChild(articleContainer2);
    let articleTitle2 = document.createElement("h3");
    articleTitle2.textContent = article2.name;
    articleTitle2.setAttribute("class", "articleTitle");
    articleContainer2.appendChild(articleTitle2);
    let articleSummary2 = document.createElement("p");
    articleSummary2.setAttribute("class", "articleSummary");
    articleSummary2.textContent = article2.summary;
    articleContainer2.appendChild(articleSummary2);
    let timeStamp2 = document.createElement("p");
    timeStamp2.setAttribute("class", "timeStamp");
    timeStamp2.textContent = article2.datetime;
    articleContainer2.appendChild(timeStamp2);
    let articleAuthor2 = document.createElement("p");
    articleAuthor2.setAttribute("class", "articleAuthor");
    articleAuthor2.textContent = article2.id;
    articleContainer2.appendChild(articleAuthor2);
}
//------------------------------------------------------------
function responseMessage(response) {
    const errorMessages = {
        404: "test123"
    };
    const message = errorMessages[response.status] || `Http error${response.status}`;
    throw new Error(message);
// switch (response.status) {
//   case 400:
//     throw new Error(
//       "400: Bad Request: Your request could not be processed. Please check that all information is correct and try again."
//     );
//   case 401:
//     throw new Error(
//       "401: Unauthorized: You do not have the proper authorization to access this content."
//     );
//   case 403:
//     throw new Error(
//       "403: Forbidden access: You are not authorized to view this page. Contact the administrator if you believe this is a mistake."
//     );
//   case 404:
//     throw new Error(
//       "404: Resource not found: The page you were looking for could not be found. Check the address or use the search function."
//     );
//   case 429:
//     throw new Error(
//       "429: Too Many Requests: You have made too many requests in a short period. Please wait a moment and try again."
//     );
//   case 500:
//     throw new Error(
//       "500: Internal Server Error: Oops! An error occurred on the server. We're working to resolve the issue. Please try again later."
//     );
//   default:
//     throw new Error(`"HTTP error! Status: ${response.status}`);
//  }
}
//------------------------------------------------------------
// spread operator which makes it possible to accept any number of arguments and collects them into an array.
function showError(...messages) {
    console.log('The function was called');
    // responseMessage(Response?)
    // Get the error container
    const errorContainer = document.getElementById("errorContainer");
    // concatenates all elements of the array into a single string.
    const fullMessage = messages.join("");
    // Set the error message
    errorContainer.textContent = fullMessage;
    // Show the container
    errorContainer.style.display = "block";
    // hides the error after a few seconds
    setTimeout(()=>{
        errorContainer.style.display = "none";
        errorContainer.textContent = ""; // Clears the error message
    }, 5000); // 5 seconds
}

//# sourceMappingURL=index.a3c29b30.js.map
