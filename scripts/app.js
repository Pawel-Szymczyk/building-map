const tooltip = document.getElementById("tooltip");
const svg = document.querySelector(".building-map");
const popup = document.getElementById("popup");
const popupBody = popup.querySelector(".popup-body");
const popupClose = popup.querySelector(".popup-close");
const popupBack = document.getElementById("popup-back");

// const apartmentColors = {
//   "m-24": "green",
//   "m-23": "red",
// };

const floorData = {
  1: {
    svgPath: "assets/images/buildings/building-a/floors/floor-1/floor-map.svg",
    apartmets: [
      {
        id: "m-24",
        status: "wolne",
        highlight: "green",
        svgPath: "",
      },
      {
        id: "m-19",
        status: "wolne",
        highlight: "green",
        svgPath: "",
      },
      {
        id: "m-23",
        status: "sprzedane",
        highlight: "red",
        imgSrc: "assets/images/buildings/building-a/floors/floor-1/aparments/apartment-23/M23.jpg",
      },
      {
        id: "m-22",
        status: "wolne",
        highlight: "green",
        svgPath: "",
      },
      {
        id: "m-21",
        status: "wolne",
        highlight: "green",
        svgPath: "",
      },
      {
        id: "m-20",
        status: "rezerwacja",
        highlight: "yellow",
        svgPath: "",
      },
    ],
    total: 6,
    free: 4,
  },
  2: {
    total: 12,
    free: 3,
  },
  3: { total: 8, free: 2 },
  4: { total: 14, free: 6 },
  5: { total: 9, free: 0 },
};

document.querySelectorAll(".floor").forEach((floor) => {
  // Hover
  floor.addEventListener("mouseenter", (e) => {
    // tooltip.innerText = `Piętro ${floor.dataset.floor}`;
    tooltip.style.display = "block";

    // Pobieramy bounding box elementu w przestrzeni SVG
    const bbox = floor.getBBox();
    const floorNumber = floor.dataset.floor;
    const data = floorData[floorNumber];

    // Pobieramy skalowanie SVG względem jego wyświetlonego rozmiaru
    const rect = svg.getBoundingClientRect();
    const scaleX = rect.width / svg.viewBox.baseVal.width;
    const scaleY = rect.height / svg.viewBox.baseVal.height;

    const padding = 40; // px nad piętrem
    // Przeliczamy środek piętra na pozycję w oknie przeglądarki
    const tooltipX = rect.left + (bbox.x + bbox.width - 250) * scaleX;
    const tooltipY = rect.top + (bbox.y - padding) * scaleY;

    // Ustawiamy tooltip
    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;
    tooltip.style.transform = "translateX(-50%)"; // centruje tooltip względem środka piętra

    tooltip.innerHTML = `
        Number pietra: ${floorNumber}<br>
        Ilosc mieszkan: ${data.total}<br>
        Wolnych mieszkan: ${data.free}
    `;
    tooltip.style.display = "block";
  });

  floor.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });

  // Kliknięcie
  floor.addEventListener("click", () => {
    const floorNumber = floor.dataset.floor;
    const data = floorData[floorNumber];
    // alert(`Kliknięto piętro ${floorNumber}, ${data.appartmets[0].id}`);
    // Tu możesz podłączyć popup z layoutem piętra
    openFloorPopup(floorNumber);
  });
});

let currentFloor = null;

function openFloorPopup(floorNumber) {
  currentFloor = floorNumber;
  const data = floorData[floorNumber];

  // fetch plik svg
  fetch(data.svgPath)
    .then((response) => response.text())
    .then((svgText) => {
      popupBody.innerHTML = svgText;
      popupBack.style.display = "none";
      popup.style.display = "flex";

      // dodaj status highlight do kazdego mieszkania
      document.querySelectorAll(".apartment").forEach((path) => {
        const id = path.dataset.id;
        path.setAttribute("fill", data.apartmets.find((a) => a.id === id).highlight || "gray");
        path.setAttribute("fill-opacity", 0.5);
      });

      // Dodaj interakcje do mieszkań
      popupBody.querySelectorAll(".apartment").forEach((path) => {
        const apartmentId = path.dataset.id;
        const apartmentData = data.apartmets.find((a) => a.id === apartmentId);

        path.addEventListener("mouseenter", () => {
          path.setAttribute("fill-opacity", 0.8);
        });
        path.addEventListener("mouseleave", () => {
          path.setAttribute("fill-opacity", 0.5);
        });

        path.addEventListener("click", () => openApartment(apartmentId, apartmentData));
      });
    })
    .catch((err) => console.error("Nie udało się wczytać SVG", err));
}

function openApartment(apartmentId, apartmentData) {
  popupBody.innerHTML = `
    <h3>Mieszkanie ${apartmentId}</h3>
    <p>Status: ${apartmentData.status}</p>
    <p>Tu można wstawić metraż, zdjęcia itd.</p>

    <img src="${apartmentData.imgSrc}" alt="apartment ${apartmentId}" />
  `;
  popupBack.style.display = "block";
}

// Powrót do poprzedniego widoku piętra
popupBack.addEventListener("click", () => {
  if (currentFloor) openFloorPopup(currentFloor);
});

// Zamknięcie popup
popupClose.addEventListener("click", () => {
  popup.style.display = "none";
});
