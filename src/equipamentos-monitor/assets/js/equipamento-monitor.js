new Vue({
    el: "#app",
  
    data() {
      return {
        equipments: [],
        positionHistory: [],
        stateHistory: [],
        allStates: [],
        allModels: [],
  
        combinedData: [], 
  
        searchTerm: "",
  
        selectedEquipmentId: null,
        selectedEquipmentName: null,
        combinedModalData: [], 
  
        map: null,
  
        sortField: "",
        sortOrder: "asc"
      };
    },
  
    computed: {
      filteredEquipments() {
        if (!this.searchTerm) {
          return this.combinedData;
        }
        const lower = this.searchTerm.toLowerCase();
        return this.combinedData.filter(e =>
          e.equipmentName.toLowerCase().includes(lower) ||
          e.equipmentId.toLowerCase().includes(lower)
        );
      },
  
      sortedEquipments() {
        const arr = [...this.filteredEquipments];
        if (!this.sortField) return arr;
        arr.sort((a, b) => {
          if (this.sortField === "status") {
            return a.statusName.localeCompare(b.statusName);
          } else if (this.sortField === "hourlyValue") {
            return a.hourlyValue - b.hourlyValue;
          }
          return 0;
        });
        if (this.sortOrder === "desc") arr.reverse();
        return arr;
      }
    },
  
    methods: {
      async fetchJson(url) {
        const r = await fetch(url);
        if (!r.ok) {
          throw new Error(`Erro ao carregar: ${url}`);
        }
        return r.json();
      },
  
      formatDate(dateStr) {
        return new Date(dateStr).toLocaleString("pt-BR");
      },
  
      getStateName(stateId) {
        const st = this.allStates.find(s => s.id === stateId);
        return st ? st.name : "Desconhecido";
      },
  
      getStateColor(stateId) {
        const st = this.allStates.find(s => s.id === stateId);
        return st ? st.color : "gray";
      },
  
      async reverseGeocode(lat, lon) {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`;
        try {
          const resp = await fetch(url, {
            headers: { "User-Agent": "MeuApp/1.0 (email@exemplo.com)" }
          });
          if (!resp.ok) {
            throw new Error("Erro ao buscar endereço no Nominatim");
          }
          const data = await resp.json();
          if (!data.address) {
            return "Endereço não encontrado";
          }
          const localName = data.address.village ||
                            data.address.town ||
                            data.address.municipality ||
                            "";
          const state = data.address.state || "";
          let result;
          if (localName && state) {
            result = `${localName}, ${state}`;
          } else if (localName) {
            result = localName;
          } else if (state) {
            result = state;
          } else {
            result = "Endereço parcial não disponível";
          }
          return result;
        } catch (error) {
          console.error("Erro no reverseGeocode:", error);
          return "Erro ao buscar endereço";
        }
      },
  
      async fetchAddress(info) {
        if (info.address) return;
        const address = await this.reverseGeocode(info.lat, info.lon);
        this.$set(info, "address", address);
      },
  
      buildCombinedData() {
        this.positionHistory.forEach(equipPos => {
          const { equipmentId, positions } = equipPos;
          const eq = this.equipments.find(e => e.id === equipmentId);
          if (!eq) return;
          const equipmentName = eq.name;
          const histItem = this.stateHistory.find(h => h.equipmentId === equipmentId);
          if (!histItem || !histItem.states.length) return;
          histItem.states.sort((a, b) => new Date(b.date) - new Date(a.date));
          const latest = histItem.states[0];
          const st = this.allStates.find(s => s.id === latest.equipmentStateId);
          const statusName = st ? st.name : "Desconhecido";
          const color = st ? st.color : "gray";
          const modelInfo = this.allModels.find(m => m.id === eq.equipmentModelId);
          let modelName = "Modelo desconhecido";
          let hourlyValue = 0;
          if (modelInfo) {
            modelName = modelInfo.name || "Modelo sem nome";
            const earn = modelInfo.hourlyEarnings.find(
              en => en.equipmentStateId === latest.equipmentStateId
            );
            if (earn) {
              hourlyValue = earn.value;
            }
          }
          this.combinedData.push({
            equipmentId,
            equipmentName,
            modelName,
            statusName,
            color,
            hourlyValue
          });
          if (positions.length > 0) {
            const { lat, lon } = positions[0];
            L.circleMarker([lat, lon], {
              color,
              radius: 8
            })
            .addTo(this.map)
            .bindPopup(`
              <strong>
                <a 
                  href="#" 
                  data-equip-id="${equipmentId}" 
                  class="map-equip-link"
                >
                  ${equipmentName}
                </a>
              </strong><br>
              <strong>ID:</strong> ${equipmentId}<br>
              <strong>Status:</strong> ${statusName}<br>
              <strong>Valor/Hora:</strong> R$${hourlyValue},00
            `);
          }
        });
      },
  
      openHistoryModal(equipmentId) {
        this.selectedEquipmentId = equipmentId;
        const eq = this.equipments.find(e => e.id === equipmentId);
        this.selectedEquipmentName = eq ? eq.name : "(Equip. Desconhecido)";
        this.combinedModalData = [];
        const posItem = this.positionHistory.find(p => p.equipmentId === equipmentId);
        if (posItem && posItem.positions.length) {
          posItem.positions.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        const stItem = this.stateHistory.find(s => s.equipmentId === equipmentId);
        if (stItem && stItem.states.length) {
          stItem.states.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        if (posItem && posItem.positions.length) {
          posItem.positions.forEach(pos => {
            let chosenState = null;
            if (stItem && stItem.states.length) {
              const validStates = stItem.states.filter(st => new Date(st.date) <= new Date(pos.date));
              if (validStates.length) {
                chosenState = validStates[validStates.length - 1];
              } else {
                chosenState = stItem.states[0];
              }
            }
            this.combinedModalData.push({
              date: pos.date,
              lat: pos.lat, 
              lon: pos.lon, 
              address: null,
              equipmentStateId: chosenState ? chosenState.equipmentStateId : null
            });
          });
        }
        const modalEl = document.getElementById("equipmentModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    },
  
    async mounted() {
      // Inicializa o mapa
      this.map = L.map("map").setView([-19.126536, -45.947756], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(this.map);
    
      try {
        const [eq, posH, stH, st, mdls] = await Promise.all([
          this.fetchJson("assets/data/equipment.json"),
          this.fetchJson("assets/data/equipmentPositionHistory.json"),
          this.fetchJson("assets/data/equipmentStateHistory.json"),
          this.fetchJson("assets/data/equipmentState.json"),
          this.fetchJson("assets/data/equipmentModel.json")
        ]);
    
        this.equipments = eq;
        this.positionHistory = posH;
        this.stateHistory = stH;
        this.allStates = st;
        this.allModels = mdls;
    
        this.buildCombinedData();
    
        document.body.addEventListener("click", ev => {
          if (ev.target.matches(".map-equip-link")) {
            ev.preventDefault();
            const equipId = ev.target.getAttribute("data-equip-id");
            this.openHistoryModal(equipId);
          }
        });
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    }
  });
  