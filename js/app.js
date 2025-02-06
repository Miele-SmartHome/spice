/**
 * Copyright 2025 Miele Cie. KG, MIT
 */

(function () {
  var apiurl = window.eesim.data.apiurl;

  window.eesim.checkTokenState();

  renderDeviceTable();

  // Event Listeners for developer tool buttons
  document
    .getElementById("btn-entities")
    .addEventListener("click", function () {
      let deviceID = prompt("Enter deviceID");
      if (!deviceID) {
        return;
      }

      window.eesim.sendRequest(
        "GET",
        apiurl + "/entities?deviceId=" + deviceID,
        null,
        window.eesim.addFormattedDebugMessage
      );
    });

  document.getElementById("btn-devices").addEventListener("click", function () {
    window.eesim.sendRequest(
      "GET",
      apiurl + "/devices",
      null,
      window.eesim.addFormattedDebugMessage
    );
  });

  document
    .getElementById("btn-powersequence")
    .addEventListener("click", function () {
      let deviceID = prompt("Enter deviceID");
      if (!deviceID) {
        return;
      }

      window.eesim.sendRequest(
        "GET",
        apiurl + "/features/powerSequence?deviceId=" + deviceID,
        null,
        window.eesim.addFormattedDebugMessage
      );
    });

  document
    .getElementById("btn-powertimeslot")
    .addEventListener("click", function () {
      let deviceID = prompt("Enter deviceID");
      if (!deviceID) {
        return;
      }

      window.eesim.sendRequest(
        "GET",
        apiurl + "/features/powerTimeSlot?deviceId=" + deviceID,
        null,
        window.eesim.addFormattedDebugMessage
      );
    });

  document.getElementById("btn-start").addEventListener("click", function () {
    let deviceID = prompt("Enter deviceID");
    if (!deviceID) {
      return;
    }

    let startTime = luxon.DateTime.now().plus({ minutes: 1 }).toISO();

    window.eesim.sendRequest(
      "POST",
      apiurl + "/usecaseInterfaces/flexibleStartForWhiteGoods/v1",
      {
        deviceId: deviceID,
        entityId: 0,
        data: {
          shiftSelectSequence: {
            sequenceId: 0,
            startTime: startTime,
          },
        },
      },
      window.eesim.addFormattedDebugMessage
    );
  });

  document
    .getElementById("refreshDevices")
    .addEventListener("click", async function () {
      this.disabled = true;

      let foundDevices = [];

      const devices = await axios
        .get(apiurl + "/devices", {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("access_token"),
            "Content-Type": "application/json",
          },
        })
        .catch((error) => {
          window.eesim.addDebugMessage(
            "an error occured: " + error.request.responseText,
            true
          );
          this.disabled = false;
          return;
        });

      const deviceIDs = devices.data.map((device) => device.deviceId);

      const promises = deviceIDs.map(async (id) => {
        const entities = await axios.get(
          apiurl + "/entities?deviceId=" + id,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("access_token"),
              "Content-Type": "application/json",
            },
          }
        );

        const features = await axios.get(
          apiurl + "/features/powerSequence?deviceId=" + id,
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("access_token"),
              "Content-Type": "application/json",
            },
          }
        );

        let data = entities.data[0];
        let useCases = data.usecasesOverview || [];
        let featuresTypes = data.featuresOverview.featureTypes || [];
        let hasPowerSequences = false;
        let hasFSWG = false;

        featuresTypes.find((feature) => {
          if (feature === "PowerSequences") {
            hasPowerSequences = true;
          }
        });

        useCases.forEach((useCase) => {
          if (useCase.name === "flexibleStartForWhiteGoods") {
            hasFSWG = true;
          }
        });

        let featureData = features.data[0]?.data || {};
        if (!featureData) {
          featureData = {
            state: "inactive",
            isPausable: false,
            isStoppable: false,
          };
        }
        let extras = determineExtrasDeviceTable(featureData);
        let state = featureData.state;
        let isPausable = featureData.isPausable;
        let isStoppable = featureData.isStoppable;

        let EntData = {
          deviceID: data.deviceId,
          type: data.entityType,
          powerSequences: hasPowerSequences,
          fswg: hasFSWG,
          vendor: localStorage.getItem("vendor"),
          state: state,
          badge: extras.badge,
          earliestStartTime: extras.earliestStartTime,
          endTime: extras.endTime,
          isPausable: isPausable,
          isStoppable: isStoppable,
          latestEndTime: extras.latestEndTime,
          startTime: extras.startTime,
          rescheduleStartBtn: extras.playButton,
          showGraph: extras.showGraph,
        };

        foundDevices.push(EntData);
      });

      await Promise.all(promises);

      // add mock device to list
      foundDevices.push({
        deviceID: "012345678901",
        type: "Dryer",
        powerSequences: true,
        fswg: true,
        vendor: "Qenesh",
        state: "inactive",
        badge: "badge-error",
        earliestStartTime: "",
        endTime: "",
        isPausable: false,
        isStoppable: false,
        latestEndTime: "",
        startTime: "",
        rescheduleStartBtn: false,
        showGraph: false,
      });

      localStorage.setItem("foundDevices", JSON.stringify(foundDevices));

      renderDeviceTable();
      assignClickHandlersDeviceTable();

      this.disabled = false;
    });

  function assignClickHandlersDeviceTable() {
    document.querySelectorAll(".showPowerGraph").forEach((btn) => {
      btn.addEventListener("click", function () {
        let deviceID = this.dataset.deviceId;

        window.eesim.sendRequest(
          "GET",
          apiurl + "/features/powerTimeSlot?deviceId=" + deviceID,
          null,
          showGraphPopup
        );
      });
    });

    document.querySelectorAll(".rescheduleStart").forEach((btn) => {
      btn.addEventListener("click", function () {
        let deviceID = this.dataset.deviceId;
        if (!deviceID) {
          return;
        }

        let startTime = luxon.DateTime.now().plus({ minutes: 1 }).toISO();

        window.eesim.sendRequest(
          "POST",
          apiurl + "/usecaseInterfaces/flexibleStartForWhiteGoods/v1",
          {
            deviceId: deviceID,
            entityId: 0,
            data: {
              shiftSelectSequence: {
                sequenceId: 0,
                startTime: startTime,
              },
            },
          },
          window.eesim.addFormattedDebugMessage
        );
      });
    });
  }

  function renderDeviceTable() {
    const foundDevices = JSON.parse(localStorage.getItem("foundDevices"));
    const template = document.getElementById("devices-row-template").innerHTML;

    const rendered = Mustache.render(template, { devices: foundDevices });
    document.getElementById("devicelisting").innerHTML = rendered;
  }

  function determineExtrasDeviceTable(featureData) {
    let badge = "";
    let playButton = false;
    let earliestStartTime = "";
    let endTime = "";
    let latestEndTime = "";
    let startTime = "";
    let showGraph = false;

    switch (featureData.state) {
      case "scheduled":
        badge = "badge-success";
        endTime = formatDate(featureData.endTime);
        latestEndTime = formatDate(featureData.latestEndTime);
        startTime = formatDate(featureData.startTime);
        playButton = true;
        showGraph = true;
        break;
      case "running":
        badge = "badge-info";
        endTime = formatDate(featureData.endTime);
        startTime = formatDate(featureData.startTime);
        showGraph = true;
        break;
      case "completed":
        badge = "badge-primary";
        endTime = formatDate(featureData.endTime);
        break;
      case "inactive":
      case "invalid":
        badge = "badge-error";
        break;
      default:
        badge = "badge-secondary";
        break;
    }

    return {
      badge: badge,
      playButton: playButton,
      earliestStartTime: earliestStartTime,
      endTime: endTime,
      latestEndTime: latestEndTime,
      startTime: startTime,
      showGraph: showGraph,
    };
  }

  function showGraphPopup(periods) {
    var graphData = {
      steps: [],
      powerConsumption: [],
    };
    var AxisData = luxon.Duration.fromISO("PT0M");

    for (let i = 0; i < periods.length; i++) {
      let defaultDuration = periods[i].data.defaultDuration;
      let period = luxon.Duration.fromISO(defaultDuration);
      if (!period.isValid) {
        window.eesim.addDebugMessage("Invalid duration format", true);
        return;
      }

      let steps = Math.round(period.toMillis() / 1000 / 60 / 2);

      for (let j = 0; j < steps; j++) {
        graphData.steps.push(AxisData.toFormat("hh:mm 'h'"));
        AxisData = AxisData.plus({ minutes: 2 });
        graphData.powerConsumption.push(periods[i].data.power.number);
      }
    }

    var options = {
      series: [
        {
          name: "Energy Consumption",
          data: graphData.powerConsumption,
        },
      ],
      chart: {
        type: "bar",
        height: 450,
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: graphData.steps,
      },
      yaxis: {
        title: {
          text: "Watts",
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " Watts";
          },
        },
      },
    };

    var chart = new ApexCharts(document.querySelector("#powerchart"), options);
    chart.render();
    HSOverlay.open("#graph-modal");
  }

  function formatDate(date) {
    let dateObj = new Date(date);
    return dateObj.toLocaleString("de-DE", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  assignClickHandlersDeviceTable();
})();
