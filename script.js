const addButton = document.querySelector("#addButton");
const modal = document.querySelector("#animeModal");
const closeButton = document.querySelector("#closeButton");
const cancelButton = document.querySelector("#cancelButton");
const saveButton = document.querySelector("#saveButton");

const titleInput = document.querySelector("#animeTitle");
const yearInput = document.querySelector("#animeYear");
const posterInput = document.querySelector("#animePoster");
const seasonInput = document.querySelector("#animeSeason");
const episodesInput = document.querySelector("#animeEpisodes");

/* 극장판 / 정주행 */
const moviesInput = document.querySelector("#animeMovies");
const rewatchInput = document.querySelector("#animeRewatch");

const favoriteInput = document.querySelector("#animeFavorite");
const adultInput = document.querySelector("#animeAdult");
const statusInput = document.querySelector("#animeStatus");

const genreCheckboxes =
  document.querySelectorAll(".genre-option input");

const animeList = document.querySelector(".anime-list");
const searchInput = document.querySelector(".toolbar input");
const sortSelect = document.querySelector("#sortSelect");


/* =========================
   장르 필터
========================= */

const genreFilterButtons =
  document.querySelectorAll(".genre-filter-button");

let selectedGenre = "전체";


/* =========================
   상태 필터
========================= */

const statusFilterButtons =
  document.querySelectorAll(".status-filter-button");

let selectedStatus = "전체";


/* =========================
   즐겨찾기 필터
========================= */

const favoriteFilterButton =
  document.querySelector(".favorite-filter-button");

let favoriteOnly = false;


/* =========================
   정렬
========================= */

let selectedSort = "recent";


/* =========================
   백업 / 복원 버튼
========================= */

const backupButton =
  document.querySelector("#backupButton");

const restoreButton =
  document.querySelector("#restoreButton");

const restoreInput =
  document.querySelector("#restoreInput");


/* =========================
   애니 데이터
========================= */

let animeData =
  JSON.parse(localStorage.getItem("animeData")) || [];


/* =========================
   기존 애니 데이터 정리
========================= */

animeData = animeData.map(function (anime) {

  /* ID가 없으면 생성 */

  if (!anime.id) {
    anime.id = Date.now() + Math.random();
  }


  /* 포스터가 없으면 빈 값 */

  if (!anime.poster) {
    anime.poster = "";
  }


  /* 제작년도가 없으면 빈 값 */

  if (
    anime.year === undefined ||
    anime.year === null
  ) {
    anime.year = "";
  }


  /* 시즌이 없으면 빈 값 */

  if (
    anime.season === undefined ||
    anime.season === null
  ) {
    anime.season = "";
  }


  /* 화수가 없으면 빈 값 */

  if (
    anime.episodes === undefined ||
    anime.episodes === null
  ) {
    anime.episodes = "";
  }


  /* 극장판 개수가 없으면 0 */

  if (
    anime.movies === undefined ||
    anime.movies === null
  ) {
    anime.movies = 0;
  }


  /* 정주행 횟수가 없으면 0 */

  if (
    anime.rewatch === undefined ||
    anime.rewatch === null
  ) {
    anime.rewatch = 0;
  }


  /* 즐겨찾기가 없으면 false */

  if (anime.favorite === undefined) {
    anime.favorite = false;
  }


  /* 19세 표시가 없으면 false */

  if (anime.adult === undefined) {
    anime.adult = false;
  }


  /* 기존 장르 데이터 변환 */

  if (!anime.genre) {

    anime.genre = [];

  }

  else if (typeof anime.genre === "string") {

    anime.genre =
      anime.genre
        .split(",")
        .map(function (genre) {
          return genre.trim();
        })
        .filter(function (genre) {
          return genre !== "";
        });

  }

  else if (!Array.isArray(anime.genre)) {

    anime.genre = [];

  }


  return anime;

});


/* 데이터 저장 */

localStorage.setItem(
  "animeData",
  JSON.stringify(animeData)
);


let editingId = null;


/* =========================
   애니 목록 표시
========================= */

function renderAnime() {

  animeList.innerHTML = "";


  /* 검색어 */

  const searchText =
    searchInput.value.trim().toLowerCase();


  /* 검색 + 장르 + 상태 + 즐겨찾기 필터 */

  const filteredAnime =
    animeData.filter(function (anime) {

      /* 제목 검색 */

      const matchesSearch =
        anime.title
          .toLowerCase()
          .includes(searchText);


      /* 장르 필터 */

      const matchesGenre =
        selectedGenre === "전체" ||
        anime.genre.includes(selectedGenre);


      /* 상태 필터 */

      const matchesStatus =
        selectedStatus === "전체" ||
        anime.status === selectedStatus;


      /* 즐겨찾기 필터 */

      const matchesFavorite =
        !favoriteOnly ||
        anime.favorite === true;


      return (
        matchesSearch &&
        matchesGenre &&
        matchesStatus &&
        matchesFavorite
      );

    });


  /* =========================
     정렬
  ========================= */

  /* 최근 추가순 */

  if (selectedSort === "recent") {

    filteredAnime.sort(function (a, b) {

      return Number(b.id) - Number(a.id);

    });

  }


  /* 제목순 */

  if (selectedSort === "title") {

    filteredAnime.sort(function (a, b) {

      return a.title.localeCompare(
        b.title,
        "ko"
      );

    });

  }


  /* 제작년도순 */

  if (selectedSort === "year") {

    filteredAnime.sort(function (a, b) {

      const yearA =
        Number(a.year) || 0;

      const yearB =
        Number(b.year) || 0;

      return yearB - yearA;

    });

  }


  /* =========================
     결과가 없는 경우
  ========================= */

  if (filteredAnime.length === 0) {

    animeList.innerHTML = `
      <div class="empty">
        ${
          searchText ||
          selectedGenre !== "전체" ||
          selectedStatus !== "전체" ||
          favoriteOnly
            ? "조건에 맞는 애니가 없어요."
            : "아직 등록한 애니가 없어요."
        }
      </div>
    `;

    return;

  }


  /* =========================
     애니 카드 만들기
  ========================= */

  filteredAnime.forEach(function (anime) {

    const card =
      document.createElement("div");

    card.className = "anime-card";


    /* =========================
       포스터
    ========================= */

    const posterHTML = anime.poster

      ? `
        <img
          src="${anime.poster}"
          alt="${anime.title} 포스터"
          class="poster-image"
          onerror="
            this.style.display='none';
            this.nextElementSibling.style.display='flex';
          "
        >

        <div
          class="poster-fallback"
          style="display:none;"
        >
          🎬
        </div>
      `

      : `
        <div class="poster-fallback">
          🎬
        </div>
      `;


    /* =========================
       장르
    ========================= */

    const genreHTML =
      anime.genre.length > 0

        ? `
          <p class="anime-genre">
            🏷️ ${anime.genre.join(", ")}
          </p>
        `

        : "";


    /* =========================
       제작년도
    ========================= */

    const yearHTML =
      anime.year

        ? `
          <p class="anime-year">
            📅 제작년도: ${anime.year}
          </p>
        `

        : "";


    /* =========================
       시즌 / 화수 / 극장판 / 정주행
    ========================= */

    const episodeParts = [];

    if (anime.season) {

      episodeParts.push(
        `📺 ${anime.season}기`
      );

    }

    if (anime.episodes) {

      episodeParts.push(
        `${anime.episodes}화`
      );

    }


    /* 극장판 */

    if (anime.movies > 0) {

      episodeParts.push(
        `🎬 ${anime.movies}편`
      );

    }


    /* 정주행 */

    if (anime.rewatch > 0) {

      episodeParts.push(
        `🔁 ${anime.rewatch}회`
      );

    }


    const episodeHTML =
      episodeParts.length > 0

        ? `
          <p class="anime-episodes">
            ${episodeParts.join(" · ")}
          </p>
        `

        : "";


    /* =========================
       19세 표시
       
       제목 오른쪽의 즐겨찾기 옆에
       작게 표시
    ========================= */

    const adultHTML =
      anime.adult

        ? `
          <span
            class="adult-badge"
            style="
              font-size: 12px;
              line-height: 1;
              white-space: nowrap;
              display: inline-flex;
              align-items: center;
              margin: 0;
            "
          >
            🔞 19
          </span>
        `

        : "";


    /* =========================
       카드 내용
    ========================= */

    card.innerHTML = `

      <div class="poster">
        ${posterHTML}
      </div>

      <div class="anime-info">

        <div class="anime-title-row">

          <h3>${anime.title}</h3>

          <div
            style="
              display: flex;
              align-items: center;
              gap: 6px;
              flex-shrink: 0;
            "
          >

            ${adultHTML}

            <button
              type="button"
              class="favorite-button"
              data-id="${anime.id}"
              title="즐겨찾기"
            >
              ${anime.favorite ? "★" : "☆"}
            </button>

          </div>

        </div>

        <p>상태: ${anime.status}</p>

        ${yearHTML}

        ${episodeHTML}

        ${genreHTML}

        <div class="card-buttons">

          <button
            type="button"
            class="edit-button"
            data-id="${anime.id}"
          >
            수정
          </button>

          <button
            type="button"
            class="delete-button"
            data-id="${anime.id}"
          >
            삭제
          </button>

        </div>

      </div>

    `;


    animeList.appendChild(card);

  });

}


/* =========================
   장르 필터
========================= */

genreFilterButtons.forEach(function (button) {

  button.addEventListener("click", function () {

    /* 선택한 장르 */

    selectedGenre =
      button.dataset.genre;


    /* 모든 버튼 active 제거 */

    genreFilterButtons.forEach(function (item) {

      item.classList.remove("active");

    });


    /* 현재 버튼 active */

    button.classList.add("active");


    /* 목록 다시 표시 */

    renderAnime();

  });

});


/* =========================
   상태 필터
========================= */

statusFilterButtons.forEach(function (button) {

  button.addEventListener("click", function () {

    /* 선택한 상태 */

    selectedStatus =
      button.dataset.status;


    /* 모든 상태 버튼 active 제거 */

    statusFilterButtons.forEach(function (item) {

      item.classList.remove("active");

    });


    /* 현재 버튼 active */

    button.classList.add("active");


    /* 목록 다시 표시 */

    renderAnime();

  });

});


/* =========================
   즐겨찾기 필터
========================= */

favoriteFilterButton.addEventListener(
  "click",
  function () {

    favoriteOnly =
      !favoriteOnly;


    if (favoriteOnly) {

      favoriteFilterButton.classList.add("active");

      favoriteFilterButton.textContent =
        "★ 즐겨찾기만 보기";

    }

    else {

      favoriteFilterButton.classList.remove("active");

      favoriteFilterButton.textContent =
        "☆ 즐겨찾기만 보기";

    }


    renderAnime();

  }
);


/* =========================
   정렬
========================= */

sortSelect.addEventListener("change", function () {

  selectedSort =
    sortSelect.value;

  renderAnime();

});


/* =========================
   통계 + 장르 개수
========================= */

function updateStats() {

  const stats =
    document.querySelectorAll(".stat-card strong");


  /* 전체 */

  stats[0].textContent =
    animeData.length;


  /* 보는 중 */

  stats[1].textContent =
    animeData.filter(
      function (anime) {
        return anime.status === "보는 중";
      }
    ).length;


  /* 완주 */

  stats[2].textContent =
    animeData.filter(
      function (anime) {
        return anime.status === "완주";
      }
    ).length;


  /* 볼 예정 */

  stats[3].textContent =
    animeData.filter(
      function (anime) {
        return anime.status === "볼 예정";
      }
    ).length;


  /* =========================
     장르별 애니 개수
  ========================= */

  genreFilterButtons.forEach(function (button) {

    const genre =
      button.dataset.genre;


    const countElement =
      button.querySelector(".genre-count");


    /* 숫자 표시 부분이 없으면 종료 */

    if (!countElement) {
      return;
    }


    /* 전체 */

    if (genre === "전체") {

      countElement.textContent =
        animeData.length;

      return;

    }


    /* 해당 장르의 애니 개수 */

    const count =
      animeData.filter(function (anime) {

        return anime.genre.includes(genre);

      }).length;


    countElement.textContent =
      count;

  });

}


/* =========================
   장르 체크박스 초기화
========================= */

function clearGenreCheckboxes() {

  genreCheckboxes.forEach(function (checkbox) {

    checkbox.checked = false;

  });

}


/* =========================
   장르 체크박스 설정
========================= */

function setGenreCheckboxes(genres) {

  clearGenreCheckboxes();


  genreCheckboxes.forEach(function (checkbox) {

    if (genres.includes(checkbox.value)) {

      checkbox.checked = true;

    }

  });

}


/* =========================
   선택된 장르 가져오기
========================= */

function getSelectedGenres() {

  const selectedGenres = [];


  genreCheckboxes.forEach(function (checkbox) {

    if (checkbox.checked) {

      selectedGenres.push(
        checkbox.value
      );

    }

  });


  return selectedGenres;

}


/* =========================
   애니 추가 버튼
========================= */

addButton.addEventListener("click", function () {

  editingId = null;


  modal.style.display = "flex";


  titleInput.value = "";

  yearInput.value = "";

  posterInput.value = "";

  seasonInput.value = "";

  episodesInput.value = "";

  moviesInput.value = "";

  rewatchInput.value = "";

  clearGenreCheckboxes();

  statusInput.value = "볼 예정";

  favoriteInput.checked = false;

  adultInput.checked = false;


  titleInput.focus();

});


/* =========================
   모달 닫기
========================= */

closeButton.addEventListener("click", function () {

  modal.style.display = "none";

  editingId = null;

});


cancelButton.addEventListener("click", function () {

  modal.style.display = "none";

  editingId = null;

});


/* 모달 바깥쪽 클릭 */

modal.addEventListener("click", function (event) {

  if (event.target === modal) {

    modal.style.display = "none";

    editingId = null;

  }

});


/* =========================
   저장 버튼
========================= */

saveButton.addEventListener("click", function () {

  const title =
    titleInput.value.trim();

  const year =
    yearInput.value.trim();

  const poster =
    posterInput.value.trim();

  const season =
    seasonInput.value.trim();

  const episodes =
    episodesInput.value.trim();

  const movies =
    moviesInput.value.trim();

  const rewatch =
    rewatchInput.value.trim();

  const genre =
    getSelectedGenres();

  const favorite =
    favoriteInput.checked;

  const adult =
    adultInput.checked;

  const status =
    statusInput.value;


  /* 제목 검사 */

  if (title === "") {

    titleInput.focus();

    return;

  }


  /* 제작년도 검사 */

  if (
    year !== "" &&
    (
      Number(year) < 1900 ||
      Number(year) > 2100
    )
  ) {

    alert(
      "제작년도는 1900년부터 2100년 사이로 입력해주세요."
    );

    yearInput.focus();

    return;

  }


  /* 시즌 검사 */

  if (
    season !== "" &&
    (
      Number(season) < 1 ||
      Number(season) > 100
    )
  ) {

    alert(
      "시즌은 1기부터 100기 사이로 입력해주세요."
    );

    seasonInput.focus();

    return;

  }


  /* 화수 검사 */

  if (
    episodes !== "" &&
    (
      Number(episodes) < 1 ||
      Number(episodes) > 9999
    )
  ) {

    alert(
      "화수는 1화부터 9999화 사이로 입력해주세요."
    );

    episodesInput.focus();

    return;

  }


  /* 극장판 개수 검사 */

  if (
    movies !== "" &&
    (
      Number(movies) < 0 ||
      Number(movies) > 999
    )
  ) {

    alert(
      "극장판 개수는 0편부터 999편 사이로 입력해주세요."
    );

    moviesInput.focus();

    return;

  }


  /* 정주행 횟수 검사 */

  if (
    rewatch !== "" &&
    (
      Number(rewatch) < 0 ||
      Number(rewatch) > 999
    )
  ) {

    alert(
      "정주행 횟수는 0회부터 999회 사이로 입력해주세요."
    );

    rewatchInput.focus();

    return;

  }


  /* =========================
     수정
  ========================= */

  if (editingId !== null) {

    const anime =
      animeData.find(function (item) {

        return item.id === editingId;

      });


    if (anime) {

      anime.title =
        title;

      anime.year =
        year;

      anime.poster =
        poster;

      anime.season =
        season;

      anime.episodes =
        episodes;

      anime.movies =
        movies === "" ? 0 : Number(movies);

      anime.rewatch =
        rewatch === "" ? 0 : Number(rewatch);

      anime.genre =
        genre;

      anime.status =
        status;

      anime.favorite =
        favorite;

      anime.adult =
        adult;

    }

  }


  /* =========================
     새로 추가
  ========================= */

  else {

    const newAnime = {

      id: Date.now(),

      title: title,

      year: year,

      poster: poster,

      season: season,

      episodes: episodes,

      movies:
        movies === "" ? 0 : Number(movies),

      rewatch:
        rewatch === "" ? 0 : Number(rewatch),

      genre: genre,

      status: status,

      favorite: favorite,

      adult: adult

    };


    animeData.push(newAnime);

  }


  /* 저장 */

  localStorage.setItem(
    "animeData",
    JSON.stringify(animeData)
  );


  /* 모달 닫기 */

  modal.style.display = "none";

  editingId = null;


  /* 화면 업데이트 */

  renderAnime();

  updateStats();

});


/* =========================
   수정 / 삭제 / 즐겨찾기
========================= */

animeList.addEventListener("click", function (event) {

  const button =
    event.target.closest("button");


  if (!button) {
    return;
  }


  const id =
    Number(button.dataset.id);


  /* =========================
     즐겨찾기
  ========================= */

  if (
    button.classList.contains(
      "favorite-button"
    )
  ) {

    const anime =
      animeData.find(function (item) {

        return item.id === id;

      });


    if (!anime) {
      return;
    }


    anime.favorite =
      !anime.favorite;


    localStorage.setItem(
      "animeData",
      JSON.stringify(animeData)
    );


    renderAnime();

    return;

  }


  /* =========================
     수정
  ========================= */

  if (
    button.classList.contains(
      "edit-button"
    )
  ) {

    const anime =
      animeData.find(function (item) {

        return item.id === id;

      });


    if (!anime) {
      return;
    }


    editingId =
      id;


    titleInput.value =
      anime.title;


    yearInput.value =
      anime.year || "";


    posterInput.value =
      anime.poster || "";


    seasonInput.value =
      anime.season || "";


    episodesInput.value =
      anime.episodes || "";


    moviesInput.value =
      anime.movies || 0;


    rewatchInput.value =
      anime.rewatch || 0;


    favoriteInput.checked =
      anime.favorite === true;


    adultInput.checked =
      anime.adult === true;


    setGenreCheckboxes(
      anime.genre || []
    );


    statusInput.value =
      anime.status;


    modal.style.display =
      "flex";


    titleInput.focus();

  }


  /* =========================
     삭제
  ========================= */

  if (
    button.classList.contains(
      "delete-button"
    )
  ) {

    const confirmed =
      confirm(
        "정말 이 애니를 삭제하시겠습니까?"
      );


    if (!confirmed) {
      return;
    }


    animeData =
      animeData.filter(function (item) {

        return item.id !== id;

      });


    localStorage.setItem(
      "animeData",
      JSON.stringify(animeData)
    );


    renderAnime();

    updateStats();

  }

});


/* =========================
   검색
========================= */

searchInput.addEventListener(
  "input",
  function () {

    renderAnime();

  }
);


/* =========================
   백업
========================= */

backupButton.addEventListener(
  "click",
  function () {

    const backupData =
      JSON.stringify(
        animeData,
        null,
        2
      );


    const blob =
      new Blob(
        [backupData],
        {
          type: "application/json"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href =
      url;


    link.download =
      "anime-backup.json";


    link.click();


    URL.revokeObjectURL(url);

  }
);


/* =========================
   복원 버튼
========================= */

restoreButton.addEventListener(
  "click",
  function () {

    restoreInput.click();

  }
);


/* =========================
   복원 파일 선택
========================= */

restoreInput.addEventListener(
  "change",
  function (event) {

    const file =
      event.target.files[0];


    if (!file) {
      return;
    }


    const reader =
      new FileReader();


    reader.onload = function () {

      try {

        const restoredData =
          JSON.parse(reader.result);


        /* 배열인지 확인 */

        if (!Array.isArray(restoredData)) {

          alert(
            "올바른 Anime Log 백업 파일이 아니에요."
          );

          return;

        }


        /* 데이터 형식 확인 */

        const isValid =
          restoredData.every(
            function (anime) {

              return (
                anime &&
                typeof anime.title === "string" &&
                typeof anime.status === "string"
              );

            }
          );


        if (!isValid) {

          alert(
            "올바른 Anime Log 백업 파일이 아니에요."
          );

          return;

        }


        /* 복원 확인 */

        const confirmed =
          confirm(
            "현재 애니 목록이 백업 파일의 목록으로 교체됩니다.\n계속하시겠습니까?"
          );


        if (!confirmed) {
          return;
        }


        /* 데이터 복원 */

        animeData =
          restoredData.map(
            function (anime) {

              let genres =
                anime.genre || [];


              /* 예전 백업의 문자열 장르 처리 */

              if (
                typeof genres === "string"
              ) {

                genres =
                  genres
                    .split(",")
                    .map(function (genre) {
                      return genre.trim();
                    })
                    .filter(function (genre) {
                      return genre !== "";
                    });

              }


              /* 배열이 아니면 빈 배열 */

              if (!Array.isArray(genres)) {

                genres = [];

              }


              return {

                id:
                  anime.id ||
                  Date.now() +
                  Math.random(),

                title:
                  anime.title,

                year:
                  anime.year || "",

                poster:
                  anime.poster || "",

                season:
                  anime.season || "",

                episodes:
                  anime.episodes || "",

                movies:
                  anime.movies === undefined ||
                  anime.movies === null
                    ? 0
                    : Number(anime.movies) || 0,

                rewatch:
                  anime.rewatch === undefined ||
                  anime.rewatch === null
                    ? 0
                    : Number(anime.rewatch) || 0,

                genre:
                  genres,

                status:
                  anime.status,

                favorite:
                  anime.favorite === true,

                adult:
                  anime.adult === true

              };

            }
          );


        /* 저장 */

        localStorage.setItem(
          "animeData",
          JSON.stringify(animeData)
        );


        /* 화면 업데이트 */

        renderAnime();

        updateStats();


        alert(
          "애니 목록을 복원했어요!"
        );

      }

      catch (error) {

        alert(
          "파일을 읽을 수 없어요.\n올바른 JSON 파일인지 확인해주세요."
        );

      }

    };


    reader.readAsText(file);


    /* 같은 파일을 다시 선택할 수 있도록 초기화 */

    restoreInput.value = "";

  }
);


/* =========================
   처음 실행
========================= */

renderAnime();

updateStats();
