/**
 * Builds a custom tooltip for a chart.
 *
 * @param {Object} props - Properties of the data point.
 * @param {Object} options - Customization options for the tooltip.
 * @returns {string} - The HTML string for the custom tooltip.
 */
function buildTooltip(props, options) {
  // Destructuring options with default values
  const {
    title,
    valuePrefix = "$",
    isValueDivided = true,
    valuePostfix = "",
    hasTextLabel = false,
    invertGroup = false,
    labelDivider = "",
    wrapperClasses = "bg-base-100 min-w-28 text-base-content/80 rounded-lg !border-none",
    wrapperExtClasses = "",
    seriesClasses = "text-xs items-center",
    seriesExtClasses = "",
    titleClasses = "!text-sm !font-semibold !bg-base-100 !border-base-content/40 text-base-content/90 rounded-t-lg !px-2.5",
    titleExtClasses = "",
    markerClasses = "!w-2.5 !h-2.5 !me-1.5 rtl:!mr-0",
    markerExtClasses = "",
    valueClasses = "!font-medium text-base-content/80 !ms-auto",
    valueExtClasses = "",
    labelClasses = "text-base-content/90",
    labelExtClasses = "",
  } = options;

  const { dataPointIndex } = props;
  const { colors } = props.ctx.opts;
  const series = props.ctx.opts.series;
  let seriesGroups = "";

  // Loop through each series to build the series groups
  series.forEach((single, i) => {
    const val =
      props.series[i][dataPointIndex] ||
      (typeof series[i].data[dataPointIndex] !== "object"
        ? series[i].data[dataPointIndex]
        : props.series[i][dataPointIndex]);

    const label = series[i].name;
    const groupData = invertGroup
      ? {
          left: `${hasTextLabel ? label : ""}${labelDivider}`,
          right: `${valuePrefix}${
            val >= 1000 && isValueDivided
              ? (val / 1000).toFixed(2) + "k"
              : val.toFixed(2)
          }${valuePostfix}`,
        }
      : {
          left: `${valuePrefix}${
            val >= 1000 && isValueDivided
              ? (val / 1000).toFixed(2) + "k"
              : val.toFixed(2)
          }${valuePostfix}`,
          right: `${hasTextLabel ? label : ""}${labelDivider}`,
        };

    const labelMarkup = `<span class="apexcharts-tooltip-text-y-label ${labelClasses} ${labelExtClasses}">${groupData.left}</span>`;

    seriesGroups += `<div class="apexcharts-tooltip-series-group !flex ${
      hasTextLabel ? "!justify-between" : ""
    } order-${i + 1} ${seriesClasses} ${seriesExtClasses}">
      <span class="flex items-center">
        <span class="apexcharts-tooltip-marker ${markerClasses} ${markerExtClasses}" style="background: ${
      colors[i]
    }"></span>
        <div class="apexcharts-tooltip-text">
          <div class="apexcharts-tooltip-y-group">
            <span class="apexcharts-tooltip-text-y-value ${valueClasses} ${valueExtClasses}">${
      groupData.right
    }</span>
          </div>
        </div>
      </span>
      ${labelMarkup}
    </div>`;
  });

  // Return the final HTML for the tooltip
  return `<div class="${wrapperClasses} ${wrapperExtClasses}">
    <div class="apexcharts-tooltip-title ${titleClasses} ${titleExtClasses}">${title}</div>
    ${seriesGroups}
  </div>`;
}

/**
 * Builds a custom tooltip for comparing two series.
 *
 * @param {Object} props - Properties of the data point.
 * @param {Object} options - Customization options for the tooltip.
 * @returns {string} - The HTML string for the custom tooltip.
 */
function buildTooltipCompareTwo(props, options) {
  const { dataPointIndex } = props;
  const { categories } = props.ctx.opts.xaxis;
  const { colors } = props.ctx.opts;
  const series = props.ctx.opts.series;

  const {
    title,
    valuePrefix = "$",
    isValueDivided = true,
    valuePostfix = "",
    hasCategory = true,
    hasTextLabel = false,
    labelDivider = "",
    wrapperClasses = "bg-base-100 min-w-48 text-base-content/80 rounded-lg !border-none",
    wrapperExtClasses = "",
    seriesClasses = "text-xs items-center !justify-between",
    seriesExtClasses = "",
    titleClasses = "!text-sm !font-semibold !bg-base-100 !border-base-content/40 text-base-content/90 rounded-t-lg !px-2.5",
    titleExtClasses = "flex justify-between",
    markerClasses = "!w-2.5 !h-2.5 !me-1.5",
    markerExtClasses = "",
    valueClasses = "!font-medium text-base-content/80 !ms-auto",
    valueExtClasses = "",
    labelClasses = "text-base-content/90 !fw-medium",
    labelExtClasses = "",
  } = options;

  let seriesGroups = "";
  const s0 = series[0].data[dataPointIndex];
  const s1 = series[1].data[dataPointIndex];
  const category = categories[dataPointIndex].split(" ");
  const newCategory = hasCategory
    ? `${category[0]}${category[1] ? " " : ""}${
        category[1] ? category[1].slice(0, 3) : ""
      }`
    : "";
  const isGrowing = s0 > s1;
  const isDifferenceIsNull = s0 / s1 === 1;
  const difference = isDifferenceIsNull ? 0 : (s0 / s1) * 100;
  const icon = isGrowing
    ? `<span class="icon-[tabler--trending-up] size-5"></span>`
    : `<span class="icon-[tabler--trending-down] size-5"></span>`;

  // Loop through each series to build the series groups
  series.forEach((_, i) => {
    const val =
      props.series[i][dataPointIndex] ||
      (typeof series[i].data[dataPointIndex] !== "object"
        ? series[i].data[dataPointIndex]
        : props.series[i][dataPointIndex]);

    const label = series[i].name;
    const altValue = series[i].altValue || null;
    const labelMarkup = `<span class="apexcharts-tooltip-text-y-label ${labelClasses} ${labelExtClasses}">${newCategory} ${
      label || ""
    }</span>`;
    const valueMarkup =
      altValue ||
      `<span class="apexcharts-tooltip-text-y-value ${valueClasses} ${valueExtClasses}">${valuePrefix}${
        val >= 1000 && isValueDivided ? `${val / 1000}k` : val
      }${valuePostfix}${labelDivider}</span>`;

    seriesGroups += `<div class="apexcharts-tooltip-series-group ${seriesClasses} !flex order-${
      i + 1
    } ${seriesExtClasses}">
      <span class="flex items-center">
        <span class="apexcharts-tooltip-marker ${markerClasses} ${markerExtClasses}" style="background: ${
      colors[i]
    }"></span>
        <div class="apexcharts-tooltip-text">
          <div class="apexcharts-tooltip-y-group">
            ${valueMarkup}
          </div>
        </div>
      </span>
      ${hasTextLabel ? labelMarkup : ""}
    </div>`;
  });

  // Return the final HTML for the tooltip
  return `<div class="${wrapperClasses} ${wrapperExtClasses}">
    <div class="apexcharts-tooltip-title ${titleClasses} ${titleExtClasses}">
      <span>${title}</span>
      <span class="flex items-center gap-x-1 ${
        !isDifferenceIsNull ? (isGrowing ? "text-success" : "text-error") : ""
      } ms-2">
        ${!isDifferenceIsNull ? icon : ""}
        <span class="inline-block text-sm">${difference.toFixed(1)}%</span>
      </span>
    </div>
    ${seriesGroups}
  </div>`;
}

/**
 * Builds an alternative custom tooltip for comparing two series.
 *
 * @param {Object} props - Properties of the data point.
 * @param {Object} options - Customization options for the tooltip.
 * @returns {string} - The HTML string for the custom tooltip.
 */
function buildTooltipCompareTwoAlt(props, options) {
  const { dataPointIndex } = props;
  const { categories } = props.ctx.opts.xaxis;
  const { colors } = props.ctx.opts;
  const series = props.ctx.opts.series;

  const {
    title,
    valuePrefix = "$",
    isValueDivided = true,
    valuePostfix = "",
    hasCategory = true,
    hasTextLabel = false,
    labelDivider = "",
    wrapperClasses = "bg-base-100 min-w-48 text-base-content/80 rounded-lg !border-none",
    wrapperExtClasses = "",
    seriesClasses = "text-xs items-center !justify-between",
    seriesExtClasses = "",
    titleClasses = "!text-sm !font-semibold !bg-base-100 !border-base-content/40 text-base-content/90 rounded-t-lg flex !justify-between !px-2.5",
    titleExtClasses = "",
    markerClasses = "!w-2.5 !h-2.5 !me-1.5",
    markerExtClasses = "",
    valueClasses = "!font-medium text-base-content/80 !ms-auto",
    valueExtClasses = "",
    labelClasses = "text-base-content/90 !fw-medium",
    labelExtClasses = "",
  } = options;

  let seriesGroups = "";
  const s0 = series[0].data[dataPointIndex];
  const s1 = series[1].data[dataPointIndex];
  const category = categories[dataPointIndex].split(" ");
  const newCategory = hasCategory
    ? `${category[0]}${category[1] ? " " : ""}${
        category[1] ? category[1].slice(0, 3) : ""
      }`
    : "";
  const isGrowing = s0 > s1;
  const isDifferenceIsNull = s0 / s1 === 1;
  const difference = isDifferenceIsNull ? 0 : (s0 / s1) * 100;
  const icon = isGrowing
    ? `<span class="icon-[tabler--trending-up] size-5"></span>`
    : `<span class="icon-[tabler--trending-down] size-5"></span>`;

  // Loop through each series to build the series groups
  series.forEach((single, i) => {
    const val =
      props.series[i][dataPointIndex] ||
      (typeof series[i].data[dataPointIndex] !== "object"
        ? series[i].data[dataPointIndex]
        : props.series[i][dataPointIndex]);

    const label = series[i].name;
    const labelMarkup = `<span class="apexcharts-tooltip-text-y-label ${labelClasses} ${labelExtClasses}">${valuePrefix}${
      val >= 1000 && isValueDivided ? `${val / 1000}k` : val
    }${valuePostfix}</span>`;

    seriesGroups += `<div class="apexcharts-tooltip-series-group !flex ${seriesClasses} order-${
      i + 1
    } ${seriesExtClasses}">
      <span class="flex items-center">
        <span class="apexcharts-tooltip-marker ${markerClasses} ${markerExtClasses}" style="background: ${
      colors[i]
    }"></span>
        <div class="apexcharts-tooltip-text text-xs">
          <div class="apexcharts-tooltip-y-group">
            <span class="apexcharts-tooltip-text-y-value ${valueClasses} ${valueExtClasses}">${newCategory} ${
      label || ""
    }${labelDivider}</span>
          </div>
        </div>
      </span>
      ${hasTextLabel ? labelMarkup : ""}
    </div>`;
  });

  // Return the final HTML for the tooltip
  return `<div class="${wrapperClasses} ${wrapperExtClasses}">
    <div class="apexcharts-tooltip-title ${titleClasses} ${titleExtClasses}">
      <span>${title}</span>
      <span class="flex items-center gap-x-1 ${
        !isDifferenceIsNull ? (isGrowing ? "text-success" : "text-error") : ""
      } ms-2">
        ${!isDifferenceIsNull ? icon : ""}
        <span class="inline-block text-sm">${difference.toFixed(1)}%</span>
      </span>
    </div>
    ${seriesGroups}
  </div>`;
}

/**
 * Builds a custom tooltip for a donut chart.
 *
 * @param {Object} context - Context of the data point.
 * @param {Array} textColor - Array of text colors for each series.
 * @returns {string} - The HTML string for the custom tooltip.
 */
function buildTooltipForDonut({ series, seriesIndex, w }, textColor) {
  const { globals } = w;
  const { colors } = globals;

  // Return the final HTML for the donut tooltip
  return `<div class="apexcharts-tooltip-series-group" style="background-color: ${colors[seriesIndex]}; display: block;">
    <div class="apexcharts-tooltip-text" style="font-size: 12px;">
      <div class="apexcharts-tooltip-y-group" style="color: ${textColor[seriesIndex]}">
        <span class="apexcharts-tooltip-text-y-label">${globals.labels[seriesIndex]}: </span>
        <span class="apexcharts-tooltip-text-y-value">${series[seriesIndex]}</span>
      </div>
    </div>
  </div>`;
}

/**
 * Initializes and builds an ApexChart with the given configurations.
 *
 * @param {string} id - The DOM element ID where the chart will be rendered.
 * @param {function} shared - Shared configuration function.
 * @returns {Object|null} - The initialized chart instance or null.
 */
function buildChart(id, shared) {
  const $chart = document.querySelector(id);
  let chart = null;

  if (!$chart) return false;

  const optionsFn = () => shared();
  // Initialize and render the chart
  if ($chart) {
    chart = new ApexCharts($chart, optionsFn());
    chart.render();
  }

  return chart;
}
