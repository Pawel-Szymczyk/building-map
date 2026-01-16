const tooltip = document.getElementById("tooltip");
const buildingBox = document.getElementById("building-map-box");
const pricesTable = document.getElementById("apartments-prices-table");

const popup = document.getElementById("popup");
const popupBody = popup.querySelector(".popup-body");
const popupClose = popup.querySelector(".popup-close");
const popupBack = document.getElementById("popup-back");

let currentFloor = null;

const buildingData = {
  buildingName: "Budynek A",
  address: {
    street: "ulica Testowa",
    number: 10,
    postCode: "00-001",
  },
  svgPath: "assets/images/buildings/building-a/building-2-map.svg",
  totalFloorsNumber: 4,

  floorData: [
    {
      floorNumber: 0,
      svgPath: "assets/images/buildings/building-a/floors/floor-1/floor-map.svg",
      total: 6,
      free: 4,
      apartments: [
        {
          id: "m-24",
          number: "24",
          rooms: 3,
          area: 62.4,
          price: 624000,
          status: "wolne",
          highlight: "green",
          planImg: "",
        },
        {
          id: "m-19",
          number: "19",
          rooms: 2,
          area: 48.1,
          price: 481000,
          status: "wolne",
          highlight: "green",
          planImg: "",
        },
        {
          id: "m-23",
          number: "23",
          rooms: 4,
          area: 78.0,
          price: 780000,
          status: "sprzedane",
          highlight: "red",
          planImg: "assets/images/buildings/building-a/floors/floor-1/aparments/apartment-23/M23.jpg",
        },
        {
          id: "m-22",
          number: "22",
          rooms: 3,
          area: 65.2,
          price: 652000,
          status: "wolne",
          highlight: "green",
          planImg: "",
        },
        {
          id: "m-21",
          number: "21",
          rooms: 2,
          area: 50.0,
          price: 500000,
          status: "wolne",
          highlight: "green",
          planImg: "",
        },
        {
          id: "m-20",
          number: "20",
          rooms: 1,
          area: 36.5,
          price: 365000,
          status: "rezerwacja",
          highlight: "yellow",
          planImg: "",
        },
      ],
    },

    {
      floorNumber: 1,
      svgPath: "assets/images/buildings/building-a/floors/floor-1/floor-map.svg",
      total: 6,
      free: 2,
      apartments: [],
    },
    {
      floorNumber: 2,
      svgPath: "assets/images/buildings/building-a/floors/floor-1/floor-map.svg",
      total: 6,
      free: 6,
      apartments: [],
    },
    {
      floorNumber: 3,
      svgPath: "assets/images/buildings/building-a/floors/floor-1/floor-map.svg",
      total: 6,
      free: 1,
      apartments: [],
    },
  ],
};

async function loadBuildingAsync(svgPath) {
  const res = await fetch(svgPath);
  const svgText = await res.text();

  const container = buildingBox;
  container.innerHTML = svgText;

  const svg = container.querySelector("svg");
  return svg;
}

function bindFloors(svg) {
  const floors = svg.querySelectorAll(".floor");

  floors.forEach((floor) => {
    floor.addEventListener("mouseenter", (e) => {
      renderTooltip(floor, svg);
    });

    floor.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });

    // Kliknięcie
    floor.addEventListener("click", () => {
      openFloorLayoutPopup(floor);
    });
  });
}

function renderTooltip(floor, svg) {
  // Pobieramy bounding box elementu w przestrzeni SVG
  const bbox = floor.getBBox();
  const floorNumber = floor.dataset.floor;
  const data = buildingData.floorData[floorNumber];

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
}

function renderApartmentsTable(buildingData) {
  const tbody = document.querySelector("#apartments-prices-table tbody");

  const rows = buildingData.floorData
    .flatMap((floor) =>
      floor.apartments.map(
        (ap) =>
          `
            <tr data-apartment-id="${ap.id}">
                <td>${ap.number}</td>
                <td>${floor.floorNumber}</td>
                <td>${ap.rooms}</td>
                <td>${ap.area} m²</td>
                <td>${ap.status}</td>
                <td>${ap.price.toLocaleString()} PLN</td>
                <td><button class="contact-btn">Kontakt</button></td>
                <td>
                ${ap.planImg ? `<button class="plan-btn" data-img="${ap.planImg}">Plan</button>` : "-"}
                </td>
            </tr>
            `
      )
    )
    .join("");

  tbody.innerHTML = rows;
}

(async function init() {
  const svg = await loadBuildingAsync(buildingData.svgPath);
  bindFloors(svg);
  renderApartmentsTable(buildingData);
})();

function openFloorLayoutPopup(floor) {
  const floorNumber = Number(floor.dataset.floor);
  currentFloor = floor;

  const data = buildingData.floorData[floorNumber];

  // fetch plik svg
  fetch(data.svgPath)
    .then((response) => response.text())
    .then((svgText) => {
      popupBody.innerHTML = svgText;
      popupBack.style.display = "none";
      popup.style.display = "flex";

      // add floor info below svg
      floorInfo(floorNumber);

      // dodaj status highlight do kazdego mieszkania
      document.querySelectorAll(".apartment").forEach((path) => {
        const id = path.dataset.id;
        path.setAttribute("fill", data.apartments.find((a) => a.id === id).highlight || "gray");
        path.setAttribute("fill-opacity", 0.5);
      });

      // Dodaj interakcje do mieszkań
      popupBody.querySelectorAll(".apartment").forEach((path) => {
        const apartmentId = path.dataset.id;
        const apartmentData = data.apartments.find((a) => a.id === apartmentId);

        path.addEventListener("mouseenter", () => {
          path.setAttribute("fill-opacity", 0.8);
        });
        path.addEventListener("mouseleave", () => {
          path.setAttribute("fill-opacity", 0.5);
        });

        path.addEventListener("click", () => openApartmentLayout(apartmentId, apartmentData));
      });
    })
    .catch((err) => console.error("Nie udało się wczytać SVG", err));
}

function floorInfo(floorNumber) {
  const div = document.createElement("div");
  div.className = "floor-info";
  div.innerHTML = `
        <div class="floor-info-container">
             <div class="floor-legend">
                <div class="legend-item">
                    <span class="legend-circle wolne"></span>
                    <span>Wolne</span>
                </div>
                <div class="legend-item">
                    <span class="legend-circle sprzedane"></span>
                    <span>Sprzedane</span>
                </div>
                <div class="legend-item">
                    <span class="legend-circle rezerwacja"></span>
                    <span>Rezerwacja</span>
                </div>
                </div>
            <div class="floor-info-number-box">
                <span>Pietro</span>
                <span class="floor-info-number-text">${floorNumber}</span>
            </div>
        </div>
    `;

  popupBody.appendChild(div);
}

function openApartmentLayout(apartmentId, apartmentData) {
  popupBody.innerHTML = `
    ${apartmentData.planImg ? `<img src="${apartmentData.planImg}" alt="apartment ${apartmentId}" />` : ""}

    <h3>Mieszkanie ${apartmentId}</h3>
    <p>Status: ${apartmentData.status}</p>
    <p>Tu można wstawić metraż, zdjęcia itd.</p>

    
  `;
  popupBack.style.display = "flex";
  popupClose.style.display = "none";
}

// Powrót do poprzedniego widoku piętra
popupBack.addEventListener("click", () => {
  if (currentFloor) openFloorLayoutPopup(currentFloor);
  popupClose.style.display = "flex";
});

// Zamknięcie popup
popupClose.addEventListener("click", () => {
  popup.style.display = "none";
});
