// Slotted Easy-RFP Widget (Vanilla JS, static data)
(function () {
  const API_BASE_URL = "https://api-develop.izba.co"; // Replace with your actual API base URL

  // reCAPTCHA Configuration
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Replace with your actual site key (this is a test key)
  let recaptchaWidgetId = null;
  let isRecaptchaLoaded = false;

  const THEME = {
    colors: { primary: "#447ecfff", background: "#ffffffff", text: "#222" },
    fonts: "Inter, Arial, sans-serif",
  };

  // Country codes data for phone number selector
  const COUNTRY_CODES = [
    { code: "+1", flag: "🇺🇸", name: "United States", shortCode: "USA" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom", shortCode: "GBR" },
    { code: "+1", flag: "🇨🇦", name: "Canada", shortCode: "CAN" },
    { code: "+61", flag: "🇦🇺", name: "Australia", shortCode: "AUS" },
    { code: "+33", flag: "🇫🇷", name: "France", shortCode: "FRA" },
    { code: "+49", flag: "🇩🇪", name: "Germany", shortCode: "DEU" },
    { code: "+91", flag: "🇮🇳", name: "India", shortCode: "IND" },
    { code: "+81", flag: "🇯🇵", name: "Japan", shortCode: "JPN" },
    { code: "+86", flag: "🇨🇳", name: "China", shortCode: "CHN" },
    { code: "+7", flag: "🇷🇺", name: "Russia", shortCode: "RUS" },
    { code: "+55", flag: "🇧🇷", name: "Brazil", shortCode: "BRA" },
    { code: "+39", flag: "🇮🇹", name: "Italy", shortCode: "ITA" },
    { code: "+34", flag: "🇪🇸", name: "Spain", shortCode: "ESP" },
    { code: "+31", flag: "🇳🇱", name: "Netherlands", shortCode: "NLD" },
    { code: "+46", flag: "🇸🇪", name: "Sweden", shortCode: "SWE" },
    { code: "+47", flag: "🇳🇴", name: "Norway", shortCode: "NOR" },
    { code: "+45", flag: "🇩🇰", name: "Denmark", shortCode: "DNK" },
    { code: "+41", flag: "🇨🇭", name: "Switzerland", shortCode: "CHE" },
    { code: "+43", flag: "🇦🇹", name: "Austria", shortCode: "AUT" },
    { code: "+32", flag: "🇧🇪", name: "Belgium", shortCode: "BEL" },
    { code: "+351", flag: "🇵🇹", name: "Portugal", shortCode: "PRT" },
    { code: "+48", flag: "🇵🇱", name: "Poland", shortCode: "POL" },
    { code: "+420", flag: "🇨🇿", name: "Czech Republic", shortCode: "CZE" },
    { code: "+36", flag: "🇭🇺", name: "Hungary", shortCode: "HUN" },
    { code: "+30", flag: "🇬🇷", name: "Greece", shortCode: "GRC" },
    { code: "+358", flag: "🇫🇮", name: "Finland", shortCode: "FIN" },
    { code: "+52", flag: "🇲🇽", name: "Mexico", shortCode: "MEX" },
    { code: "+54", flag: "🇦🇷", name: "Argentina", shortCode: "ARG" },
    { code: "+56", flag: "🇨🇱", name: "Chile", shortCode: "CHL" },
    { code: "+27", flag: "🇿🇦", name: "South Africa", shortCode: "ZAF" },
    { code: "+82", flag: "🇰🇷", name: "South Korea", shortCode: "KOR" },
    { code: "+65", flag: "🇸🇬", name: "Singapore", shortCode: "SGP" },
    { code: "+60", flag: "🇲🇾", name: "Malaysia", shortCode: "MYS" },
    { code: "+66", flag: "🇹🇭", name: "Thailand", shortCode: "THA" },
    { code: "+84", flag: "🇻🇳", name: "Vietnam", shortCode: "VNM" },
    { code: "+62", flag: "🇮🇩", name: "Indonesia", shortCode: "IDN" },
    { code: "+63", flag: "🇵🇭", name: "Philippines", shortCode: "PHL" },
    { code: "+64", flag: "🇳🇿", name: "New Zealand", shortCode: "NZL" },
    { code: "+971", flag: "🇦🇪", name: "UAE", shortCode: "ARE" },
    { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", shortCode: "SAU" },
    { code: "+972", flag: "🇮🇱", name: "Israel", shortCode: "ISR" },
    { code: "+90", flag: "🇹🇷", name: "Turkey", shortCode: "TUR" },
    { code: "+20", flag: "🇪🇬", name: "Egypt", shortCode: "EGY" },
    { code: "+234", flag: "🇳🇬", name: "Nigeria", shortCode: "NGA" },
    { code: "+254", flag: "🇰🇪", name: "Kenya", shortCode: "KEN" },
  ];

  // Months data for dynamic rendering
  const MONTHS = [
    { value: "1", name: "January" },
    { value: "2", name: "February" },
    { value: "3", name: "March" },
    { value: "4", name: "April" },
    { value: "5", name: "May" },
    { value: "6", name: "June" },
    { value: "7", name: "July" },
    { value: "8", name: "August" },
    { value: "9", name: "September" },
    { value: "10", name: "October" },
    { value: "11", name: "November" },
    { value: "12", name: "December" },
  ];

  // Years data for dynamic rendering (current year + 10 years)
  const YEARS = (() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 10; i++) {
      const year = currentYear + i;
      years.push({ value: year.toString(), name: year.toString() });
    }
    return years;
  })();

  // Storage type options for inbound profile
  const STORAGE_TYPES = [
    { value: "ambientStorage", name: "Ambient (Room Temperature)" },
    { value: "coldStorage", name: "Cold Storage" },
    { value: "frozenStorage", name: "Frozen (Below 32°F)" },
  ];

  // Step configuration - Updated for RFP flow after contact
  const STEPS_CONFIG = [
    {
      id: 1,
      title: "Outbound Profile",
      description: "Volume & business context",
      percentage: 33,
    },
    {
      id: 2,
      title: "Inbound Profile",
      description: "Product & operational details",
      percentage: 66,
    },
    {
      id: 3,
      title: "Final Review",
      description: "Submit",
      percentage: 100,
    },
  ];

  // 3PL Providers - loaded from API with pagination
  let THREE_PL_PROVIDERS = [];
  let providersLoading = false;
  let providersError = null;
  let providersHasMore = true;
  let providersCurrentPage = 1;
  let providersCurrentSearch = "";

  // Fetch 3PL providers from API with search and pagination
  async function fetchThreePLProviders(
    search = "",
    page = 1,
    limit = 20,
    append = false
  ) {
    if (providersLoading) return { providers: [], hasMore: false };

    providersLoading = true;
    if (!append) {
      providersError = null;
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/three-pl/homepage/active-providers?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data?.providerList)) {
        const newProviders = data.data.providerList.map((provider) => ({
          id: provider.id,
          name: provider.name,
        }));

        if (append) {
          THREE_PL_PROVIDERS = [...THREE_PL_PROVIDERS, ...newProviders];
        } else {
          THREE_PL_PROVIDERS = newProviders;
        }

        // Check if there are more results
        const hasMore =
          data.data?.pagination?.hasMore ||
          data.data?.providerList?.length === limit;

        providersHasMore = hasMore;
        providersCurrentPage = page;
        providersCurrentSearch = search;

        return {
          providers: newProviders,
          hasMore,
          total: data.data?.pagination?.total || THREE_PL_PROVIDERS.length,
        };
      }

      return { providers: [], hasMore: false, total: 0 };
    } catch (error) {
      console.error("3PL Providers API error:", error);
      providersError = error.message;

      // For search/pagination errors, don't fallback to static data
      if (search || page > 1) {
        return { providers: [], hasMore: false, total: 0 };
      }
      providersError = null;
      return { providers: [], hasMore: false, total: 0 };
    } finally {
      providersLoading = false;
    }
  }

  // Load more providers for infinite scroll
  async function loadMoreProviders() {
    if (!providersHasMore || providersLoading) return;

    const result = await fetchThreePLProviders(
      providersCurrentSearch,
      providersCurrentPage + 1,
      20,
      true // append to existing
    );
    // Update the provider dropdown if it's visible
    updateProviderDropdown();
    return result;
  }

  // Search providers
  async function searchProviders(searchTerm) {
    // Reset pagination for new search
    providersCurrentPage = 1;
    providersHasMore = true;

    const result = await fetchThreePLProviders(searchTerm, 1, 20, false);

    // Update the provider dropdown
    updateProviderDropdown();

    return result;
  }

  // Generate country code options dynamically
  function generateCountryOptions(selectedCode) {
    return COUNTRY_CODES.map(
      (country) =>
        `<option value="${country.code}" ${
          selectedCode === country.code ? "selected" : ""
        }>
        ${country.flag} ${country.code}
      </option>`
    ).join("");
  }

  // Generate storage type options dynamically
  function generateStorageTypeOptions(selectedType) {
    return STORAGE_TYPES.map(
      (storageType) =>
        `<option value="${storageType.value}" ${
          selectedType === storageType.value ? "selected" : ""
        }>${storageType.name}</option>`
    ).join("");
  }

  // Get storage type display name
  function getStorageTypeDisplayName(value) {
    const storageType = STORAGE_TYPES.find((type) => type.value === value);
    return storageType ? storageType.name : "Not specified";
  }

  // Render selected countries for sell location
  function renderSelectedCountries() {
    if (
      !state.outbound_profile.selected_countries ||
      state.outbound_profile.selected_countries.length === 0
    ) {
      return ""; // Return empty string instead of placeholder
    }

    return state.outbound_profile.selected_countries
      .map((countryName) => {
        const country = COUNTRY_CODES.find((c) => c.name === countryName);
        return `
        <div class="slotted-selected-country" data-country="${countryName}">
          <span class="slotted-country-flag">${
            country ? country.flag : "🌍"
          }</span>
          <span class="slotted-country-name">${countryName}</span>
          <button type="button" class="slotted-remove-country" onclick="removeSelectedCountry('${countryName}')">×</button>
        </div>
      `;
      })
      .join("");
  }

  // Render country options with checkboxes
  function renderCountryOptions() {
    // Ensure selected_countries array exists
    if (!state.outbound_profile.selected_countries) {
      state.outbound_profile.selected_countries = [];
    }

    return COUNTRY_CODES.map((country, index) => {
      const isSelected = state.outbound_profile.selected_countries.includes(
        country.name
      );
      const checkboxId = `country-all-${country.shortCode}-${index}`;

      return `
        <div class="slotted-multiselect-option" data-country="${
          country.name
        }" onclick="event.stopPropagation()">
          <input type="checkbox" id="${checkboxId}" ${
        isSelected ? "checked" : ""
      } onchange="toggleCountrySelection('${country.name}')"/>
          <label for="${checkboxId}" class="slotted-country-option">
            <span class="slotted-country-flag">${country.flag}</span>
            <span class="slotted-country-name">${country.name}</span>
          </label>
        </div>
      `;
    }).join("");
  }

  // Convert country names to short codes for API payload
  function getCountryShortCodes(countryNames) {
    if (!countryNames || !Array.isArray(countryNames)) {
      return [];
    }

    return countryNames
      .map((countryName) => {
        const country = COUNTRY_CODES.find((c) => c.name === countryName);
        return country ? country.shortCode : null;
      })
      .filter((shortCode) => shortCode !== null);
  }

  // Global functions for new multiselect dropdown
  window.removeSelectedCountry = function (countryName) {
    if (state.outbound_profile.selected_countries) {
      state.outbound_profile.selected_countries =
        state.outbound_profile.selected_countries.filter(
          (country) => country !== countryName
        );

      // Update the selected countries display
      const selectedCountriesContainer = document.getElementById(
        "slotted-selected-countries"
      );
      if (selectedCountriesContainer) {
        selectedCountriesContainer.innerHTML = renderSelectedCountries();
      }

      // Update the dropdown options to reflect new checkbox states
      const countryOptions = document.getElementById("slotted-country-options");
      if (countryOptions) {
        countryOptions.innerHTML = renderCountryOptions();
      }

      saveState();
    }
  };

  window.toggleCountryDropdown = function () {
    const dropdown = document.getElementById("slotted-country-dropdown");
    const arrow = document.getElementById("slotted-dropdown-arrow");
    const searchInput = document.getElementById("slotted-sell-location");

    if (dropdown.style.display === "none") {
      dropdown.style.display = "block";
      arrow.textContent = "▲";
    } else {
      dropdown.style.display = "none";
      arrow.textContent = "▼";
      // Clear search and reset options when closing
      if (searchInput) {
        searchInput.value = "";
        const countryOptions = document.getElementById(
          "slotted-country-options"
        );
        if (countryOptions) {
          countryOptions.innerHTML = renderCountryOptions();
        }
      }
    }
  };

  window.showCountryDropdown = function () {
    const dropdown = document.getElementById("slotted-country-dropdown");
    const arrow = document.getElementById("slotted-dropdown-arrow");
    dropdown.style.display = "block";
    arrow.textContent = "▲";
  };

  window.filterCountryDropdown = function (searchValue) {
    const options = document.getElementById("slotted-country-options");
    if (!options) return;

    if (!searchValue || searchValue.trim() === "") {
      // Show all options when search is empty
      options.innerHTML = renderCountryOptions();
      return;
    }

    const searchTerm = searchValue.toLowerCase();
    const filteredCountries = COUNTRY_CODES.filter((country) =>
      country.name.toLowerCase().includes(searchTerm)
    );

    // Ensure selected_countries array exists
    if (!state.outbound_profile.selected_countries) {
      state.outbound_profile.selected_countries = [];
    }

    // Render only filtered countries with correct checkbox states
    options.innerHTML = filteredCountries
      .map((country, index) => {
        const isSelected = state.outbound_profile.selected_countries.includes(
          country.name
        );
        // Use unique ID with search prefix to avoid conflicts
        const checkboxId = `country-search-${country.shortCode}-${index}`;

        return `
        <div class="slotted-multiselect-option" data-country="${
          country.name
        }" onclick="event.stopPropagation()">
          <input type="checkbox" id="${checkboxId}" ${
          isSelected ? "checked" : ""
        } onchange="toggleCountrySelection('${country.name}')"/>
          <label for="${checkboxId}" class="slotted-country-option">
            <span class="slotted-country-flag">${country.flag}</span>
            <span class="slotted-country-name">${country.name}</span>
          </label>
        </div>
      `;
      })
      .join("");
  };

  window.toggleCountrySelection = function (countryName) {
    if (!state.outbound_profile.selected_countries) {
      state.outbound_profile.selected_countries = [];
    }

    const index =
      state.outbound_profile.selected_countries.indexOf(countryName);
    if (index === -1) {
      // Add country
      state.outbound_profile.selected_countries.push(countryName);
    } else {
      // Remove country
      state.outbound_profile.selected_countries.splice(index, 1);
    }

    // Update the selected countries display
    const selectedCountriesContainer = document.getElementById(
      "slotted-selected-countries"
    );
    if (selectedCountriesContainer) {
      selectedCountriesContainer.innerHTML = renderSelectedCountries();
    }

    // Update the dropdown options to reflect new checkbox states
    // Check if we're currently filtering
    const searchInput = document.getElementById("slotted-sell-location");
    const searchValue = searchInput ? searchInput.value : "";

    if (searchValue && searchValue.trim() !== "") {
      // Re-apply filter to maintain search results with updated checkbox states
      filterCountryDropdown(searchValue);
    } else {
      // Update all options if not filtering
      const countryOptions = document.getElementById("slotted-country-options");
      if (countryOptions) {
        countryOptions.innerHTML = renderCountryOptions();
      }
    }

    saveState();
  };

  // Global function for provider selection (accessible from onclick)
  window.selectProvider = function (providerId, providerName) {
    // Update state
    state.outbound_profile.current_provider = providerId;
    state.outbound_profile.current_provider_name = providerName;

    // Update UI
    const searchInput = document.getElementById(
      "slotted-current-provider-search"
    );
    const dropdown = document.getElementById("slotted-provider-dropdown");

    if (searchInput) searchInput.value = providerName;
    if (dropdown) dropdown.style.display = "none";

    saveState();
  };

  // Update provider dropdown with current data
  function updateProviderDropdown() {
    const dropdown = document.getElementById("slotted-provider-dropdown");
    const resultsContainer = document.getElementById(
      "slotted-provider-results"
    );
    const loadingIndicator = document.getElementById(
      "slotted-provider-loading"
    );

    if (!dropdown || !resultsContainer) return;

    // Clear existing results except loading indicator
    resultsContainer.innerHTML = "";

    if (providersLoading && THREE_PL_PROVIDERS.length === 0) {
      if (loadingIndicator) {
        loadingIndicator.style.display = "block";
        loadingIndicator.textContent = "Loading providers...";
      }
      return;
    }

    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    if (providersError && THREE_PL_PROVIDERS.length === 0) {
      resultsContainer.innerHTML = `
        <div class="slotted-provider-error">
          <span>⚠️ ${providersError}</span>
          <button onclick="retryLoadProviders()" class="slotted-retry-btn">Retry</button>
        </div>
      `;
      return;
    }

    if (THREE_PL_PROVIDERS.length === 0) {
      resultsContainer.innerHTML = `
        <div class="slotted-provider-no-results">
          No providers found${
            providersCurrentSearch ? ` for "${providersCurrentSearch}"` : ""
          }
        </div>
      `;
      return;
    }

    // Render provider results
    const providerHTML = THREE_PL_PROVIDERS.map(
      (provider) => `
      <div class="slotted-provider-result" onclick="selectProvider('${
        provider.id
      }', '${provider.name.replace(/'/g, "\\'")}')">
        <span class="slotted-provider-name">${provider.name}</span>
      </div>
    `
    ).join("");

    resultsContainer.innerHTML = providerHTML;

    // Add loading more indicator if needed
    if (providersHasMore) {
      const loadMoreHTML = `
        <div class="slotted-provider-load-more" id="slotted-provider-load-more">
          <span class="slotted-load-more-text">Scroll for more providers...</span>
          <div class="slotted-load-more-spinner" style="display: none;">Loading...</div>
        </div>
      `;
      resultsContainer.insertAdjacentHTML("beforeend", loadMoreHTML);
    }

    // Setup infinite scroll listener if not already added
    setupInfiniteScroll();
  }

  // Setup infinite scroll listener
  function setupInfiniteScroll() {
    const dropdown = document.getElementById("slotted-provider-dropdown");

    if (!dropdown || dropdown.hasInfiniteScrollListener) return;

    dropdown.addEventListener("scroll", function () {
      const scrollTop = this.scrollTop;
      const scrollHeight = this.scrollHeight;
      const clientHeight = this.clientHeight;

      // Load more when near bottom (within 30px)
      if (scrollTop + clientHeight >= scrollHeight - 30) {
        if (providersHasMore && !providersLoading) {
          const loadMoreElement = document.getElementById(
            "slotted-provider-load-more"
          );
          if (loadMoreElement) {
            const spinner = loadMoreElement.querySelector(
              ".slotted-load-more-spinner"
            );
            const text = loadMoreElement.querySelector(
              ".slotted-load-more-text"
            );

            if (spinner && text) {
              spinner.style.display = "inline-block";
              text.style.display = "none";
            }
          }

          loadMoreProviders()
            .then(() => {
              // Hide spinner after loading
              if (loadMoreElement) {
                const spinner = loadMoreElement.querySelector(
                  ".slotted-load-more-spinner"
                );
                const text = loadMoreElement.querySelector(
                  ".slotted-load-more-text"
                );

                if (spinner && text) {
                  spinner.style.display = "none";
                  text.style.display = "inline-block";
                }
              }
            })
            .catch((error) => {
              console.error("Error loading more providers:", error);
            });
        }
      }
    });

    // Mark as having the listener to avoid duplicates
    dropdown.hasInfiniteScrollListener = true;
  }

  // Retry loading providers
  window.retryLoadProviders = function () {
    THREE_PL_PROVIDERS = [];
    providersCurrentPage = 1;
    providersHasMore = true;
    fetchThreePLProviders(providersCurrentSearch, 1, 20, false).then(() => {
      updateProviderDropdown();
    });
  };

  // Clear provider search
  window.clearProviderSearch = function () {
    const searchInput = document.getElementById(
      "slotted-current-provider-search"
    );
    const dropdown = document.getElementById("slotted-provider-dropdown");

    if (searchInput) {
      searchInput.value = "";
      state.outbound_profile.current_provider = "";
      state.outbound_profile.current_provider_name = "";
      saveState();
    }

    if (dropdown) {
      dropdown.style.display = "none";
    }

    // Reset search and reload
    searchProviders("");
  };

  // Loading spinner utility functions
  function showButtonLoading(buttonId, loadingText = "Loading...") {
    const button = document.getElementById(buttonId);
    if (!button) return false;

    // Store original content
    button.dataset.originalContent = button.innerHTML;
    button.disabled = true;

    // Show loading spinner
    button.innerHTML = `
      <div class="slotted-button-loading">
        <svg class="slotted-spinner" viewBox="0 0 24 24" fill="none">
          <circle class="slotted-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="slotted-spinner-fill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <span>${loadingText}</span>
      </div>
    `;

    return true;
  }

  function hideButtonLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (!button || !button.dataset.originalContent) return false;

    // Restore original content
    button.innerHTML = button.dataset.originalContent;
    button.disabled = false;
    delete button.dataset.originalContent;

    return true;
  }

  function showButtonSuccess(
    buttonId,
    successText = "Success!",
    duration = 2000
  ) {
    const button = document.getElementById(buttonId);
    if (!button) return false;

    // Store original content if not already storing loading state
    if (!button.dataset.originalContent) {
      button.dataset.originalContent = button.innerHTML;
    }

    // Show success state
    button.innerHTML = `
      <div class="slotted-button-success">
        <svg class="slotted-success-icon" viewBox="0 0 24 24" fill="none">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <span>${successText}</span>
      </div>
    `;
    button.disabled = true;

    // Reset after duration
    if (duration > 0) {
      setTimeout(() => {
        hideButtonLoading(buttonId);
      }, duration);
    }

    return true;
  }

  // Read widget key from data attribute on container div
  function getWidgetKey() {
    const el = document.getElementById("slotted-easyrfp");
    return el ? el.getAttribute("data-widget-key") : null;
  }

  // Extract provider ID from script URL query parameter
  function getProviderIdFromScript() {
    const scripts = document.querySelectorAll('script[src*="widget.js"]');
    for (let script of scripts) {
      const url = new URL(script.src);
      const providerId = url.searchParams.get("providerId");
      if (providerId) return providerId;
    }
    return null;
  }

  const SNIPPET_WIDGET_KEY = getWidgetKey();
  const PROVIDER_WIDGET_KEY = getProviderIdFromScript();

  // Provider state
  let PROVIDER = null;
  let isAuthenticated = false;
  let providerError = null;

  // Fetch provider data from API
  async function fetchProviderData(widgetKey) {
    if (!widgetKey) {
      return {
        success: false,
        error: "Missing widget key",
        message: "Widget key is required but not provided.",
      };
    }

    try {
      // TODO: Replace with actual API call when ready
      const response = await fetch(
        `${API_BASE_URL}/api/v1/three-pl/lead/provider-details/${widgetKey}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      return data;

      // For now, use static response
      // return await getStaticProviderResponse(widgetKey);
    } catch (error) {
      console.error("Provider API error:", error);
      return {
        success: false,
        error: "API Error",
        message: "Failed to validate provider. Please try again later.",
      };
    }
  }

  // Initialize provider authentication
  async function initializeProvider() {
    // const widgetKey = SNIPPET_WIDGET_KEY;
    const widgetKey = PROVIDER_WIDGET_KEY;

    if (!widgetKey) {
      providerError = {
        type: "missing_key",
        message:
          "Widget key not found. Please ensure the widget is properly configured.",
      };
      return false;
    }

    const result = await fetchProviderData(widgetKey);

    if (result.success) {
      PROVIDER = { ...result.data, theme: THEME };

      if (PROVIDER.isActiveSubscription) {
        isAuthenticated = true;
        return true;
      } else {
        providerError = {
          type: "inactive_subscription",
          message: `Provider subscription is ${
            PROVIDER.isActiveSubscription ? "active" : "inactive"
          }. Please contact support to reactivate your account.`,
        };
        return false;
      }
    } else {
      providerError = {
        type: "invalid_key",
        message: result.message || "Invalid widget key provided.",
      };
      return false;
    }
  }

  // Render error state
  function renderErrorState() {
    if (!providerError) return "";

    const errorMessages = {
      missing_key: "Widget Configuration Error",
      invalid_key: "Invalid Widget Key",
      inactive_subscription: "Subscription Inactive",
      api_error: "Service Unavailable",
    };

    const title = errorMessages[providerError.type] || "Widget Error";

    return `
      <div class="slotted-error-container">
        <div class="slotted-error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path stroke="#dc2626" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.756 0L4.064 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <h3 class="slotted-error-title">${title}</h3>
        <p class="slotted-error-message">${providerError.message}</p>
        <button onclick="location.reload()" class="slotted-error-button">
          Retry
        </button>
      </div>
    `;
  }
  // State
  let state = {
    step: 0, // 0 = contact form, 1+ = RFP steps
    lead_id: null,
    contact: {},
    rfp: {},
    outbound_profile: {},
    inbound_profile: {},
    status: null,
  };

  // Restore from session
  if (sessionStorage.getItem("slotted_state")) {
    state = JSON.parse(sessionStorage.getItem("slotted_state"));
  }

  function saveState() {
    sessionStorage.setItem("slotted_state", JSON.stringify(state));
  }

  // reCAPTCHA Functions
  function initializeRecaptcha() {
    // Check if grecaptcha is available
    if (typeof grecaptcha === "undefined") {
      return false;
    }

    try {
      // Wait for reCAPTCHA to be ready
      grecaptcha.ready(function () {
        isRecaptchaLoaded = true;
        renderRecaptchaWidget();
      });
      return true;
    } catch (error) {
      console.error("Error initializing reCAPTCHA:", error);
      return false;
    }
  }

  function renderRecaptchaWidget() {
    const recaptchaContainer = document.getElementById(
      "slotted-recaptcha-container"
    );

    if (!recaptchaContainer || !isRecaptchaLoaded) {
      return;
    }

    try {
      // Clear any existing widget
      recaptchaContainer.innerHTML = "";

      // Render the reCAPTCHA widget
      recaptchaWidgetId = grecaptcha.render(recaptchaContainer, {
        sitekey: RECAPTCHA_SITE_KEY,
        theme: "light",
        size: "normal",
        callback: onRecaptchaSuccess,
        "expired-callback": onRecaptchaExpired,
        "error-callback": onRecaptchaError,
      });
    } catch (error) {
      console.error("Error rendering reCAPTCHA widget:", error);
    }
  }

  function onRecaptchaSuccess(token) {
    // Clear any error message
    const errorElement = document.getElementById("slotted-recaptcha-error");
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }

  function onRecaptchaExpired() {
    // Show error message
    const errorElement = document.getElementById("slotted-recaptcha-error");
    if (errorElement) {
      errorElement.textContent = "reCAPTCHA has expired. Please verify again.";
      errorElement.style.display = "block";
    }
  }

  function onRecaptchaError() {
    // Show error message
    const errorElement = document.getElementById("slotted-recaptcha-error");
    if (errorElement) {
      errorElement.textContent =
        "reCAPTCHA verification failed. Please try again.";
      errorElement.style.display = "block";
    }
  }

  function validateRecaptcha() {
    if (!isRecaptchaLoaded || recaptchaWidgetId === null) {
      return false;
    }

    try {
      const response = grecaptcha.getResponse(recaptchaWidgetId);
      return response && response.length > 0;
    } catch (error) {
      console.error("Error validating reCAPTCHA:", error);
      return false;
    }
  }

  // Component Functions
  function renderStepProgress() {
    // Only show step progress if we're in RFP flow (step > 0)
    if (state.step === 0) {
      return "";
    }

    const currentStep = STEPS_CONFIG.find((s) => s.id === state.step);
    const progressPercentage = currentStep ? currentStep.percentage : 50;

    return `
      <div class="slotted-step-progress">
        <div class="slotted-progress-header">
          <span class="slotted-step-indicator">Step ${state.step} of ${
      STEPS_CONFIG.length
    }</span>
          <span class="slotted-progress-percent">${progressPercentage}% Complete</span>
        </div>
        <div class="slotted-progress-bar">
          <div class="slotted-progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="slotted-steps-container">
          ${STEPS_CONFIG.map(
            (step) => `
            <div class="slotted-step-item ${
              step.id === state.step ? "active" : ""
            } ${step.id < state.step ? "completed" : ""}">
              <div class="slotted-step-number">${step.id}</div>
              <div class="slotted-step-content">
                <div class="slotted-step-title">${step.title}</div>
                <div class="slotted-step-description">${step.description}</div>
              </div>
            </div>
          `
          ).join("")}
        </div>
      </div>
    `;
  }

  function renderBanner() {
    console.log("state.status", state.status);
    if (state.status === "Partially Completed") {
      return `<div class="slotted-banner">Partial lead saved. Provider notified.</div>`;
    }
    if (state.status === "Completed") {
      return `<div class="slotted-banner">Lead completed</b></div>`;
    }
    return "";
  }

  function renderContactStep() {
    return `
      <div class="slotted-step${
        state.step === 0 ? " active" : ""
      }" id="slotted-step-0">
        <p class="slotted-section-description">Please fill out the required details below</p>
        <form id="slotted-contact-form" novalidate>
          <div class="slotted-input-wrapper">
            <label class="slotted-label">Name*</label>
            <input class="slotted-input" id="slotted-name" name="name" required value="${
              state.contact.name || ""
            }"
            placeholder="Please enter your name"
            />
            <div class="slotted-field-error" id="slotted-name-error">Name is required</div>
          </div>
          
          <div class="slotted-input-wrapper">
            <label class="slotted-label">Email*</label>
            <input class="slotted-input" id="slotted-email" name="email" type="email" required value="${
              state.contact.email || ""
            }"
            placeholder="Please enter your email"
            />
            <div class="slotted-field-error" id="slotted-email-error">Please enter a valid email</div>
          </div>
          
          <div class="slotted-input-wrapper">
            <label class="slotted-label">Company*</label>
            <input class="slotted-input" id="slotted-company" name="company" required value="${
              state.contact.company || ""
            }"
            placeholder="Please enter your company name"
            />
            <div class="slotted-field-error" id="slotted-company-error">Company is required</div>
          </div>
          
          <div class="slotted-input-wrapper">
            <label class="slotted-label">Website URL*</label>
            <input class="slotted-input" id="slotted-website" name="website" type="url" required value="${
              state.contact.website_url || ""
            }"
            placeholder="Please enter a valid website URL"
            />
            <div class="slotted-field-error" id="slotted-website-error">Please enter a valid website URL</div>
          </div>
          
          <div class="slotted-input-wrapper">
            <label class="slotted-label">Phone</label>
            <div class="slotted-phone-container">
              <select class="slotted-country-code" id="slotted-country-code">
                ${generateCountryOptions(state.contact.countryCode)}
              </select>
              <input class="slotted-input slotted-phone-input" id="slotted-phone" name="phone" placeholder="123-456-7890" value="${
                state.contact.phone || ""
              }"/>
            </div>
          </div>
          
          <div class="slotted-gdpr-container">
            <input type="checkbox" id="slotted-gdpr" name="gdpr" required/>
            <label for="slotted-gdpr" class="slotted-gdpr-label">I agree to the Privacy Policy</label>
            <div class="slotted-field-error" id="slotted-gdpr-error">You must consent to data processing to continue</div>
          </div>
          
          <div class="slotted-recaptcha-wrapper">
            <div id="slotted-recaptcha-container"></div>
            <div class="slotted-field-error" id="slotted-recaptcha-error" style="display: none;">Please complete the reCAPTCHA verification</div>
          </div>
          
          <button type="submit" class="slotted-btn" id="slotted-next">Start RFP Process</button>
        </form>
      </div>
    `;
  }

  // Outbound Profile Sub-components
  function renderCriticalVolumeMetrics() {
    return `
      <div class="slotted-critical-volume-card">
        <div class="slotted-section-header">
          <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-no-axes-column-increasing w-6 h-6" data-lov-id="src/components/ShippingProfileForm.tsx:238:14" data-lov-name="BarChart" data-component-path="src/components/ShippingProfileForm.tsx" data-component-line="238" data-component-file="ShippingProfileForm.tsx" data-component-name="BarChart" data-component-content="%7B%22className%22%3A%22w-6%20h-6%22%7D"><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></svg></span>
          <div>
          <h4>Critical Volume Metrics</h4>
           </div>
           <span class="slotted-required-badge">Required</span>
        </div>
        
        <div class="slotted-grid-2 slotted-grid-spacing">
          <div class="slotted-input-wrapper">
            <label class="slotted-label">Monthly Orders *</label>
            <input class="slotted-input" id="slotted-monthly-orders" name="monthly_orders" type="number" placeholder="e.g. 1,500" required value="${
              state.outbound_profile.monthly_orders || ""
            }"/>
            <div class="slotted-field-error" id="slotted-monthly-orders-error">Monthly orders is required</div>
          </div>
          <div class="slotted-input-wrapper">
            <label class="slotted-label">Avg Items/Order *</label>
            <input class="slotted-input" id="slotted-avg-items" name="avg_items" type="number" step="0.1" placeholder="e.g. 2.5" required value="${
              state.outbound_profile.avg_items || ""
            }"/>
            <div class="slotted-field-error" id="slotted-avg-items-error">Average items per order is required</div>
          </div>
        </div>
        
        <div class="slotted-grid-2">
          <div class="slotted-input-wrapper">
            <label class="slotted-label">Avg Order Value *</label>
            <input class="slotted-input" id="slotted-avg-order-value" name="avg_order_value" type="number" step="0.01" placeholder="$78.50" required value="${
              state.outbound_profile.avg_order_value || ""
            }"/>
            <div class="slotted-field-error" id="slotted-avg-order-value-error">Average order value is required</div>
          </div>
          <div class="slotted-input-wrapper">
            <label class="slotted-label">How many SKUs *</label>
            <input class="slotted-input" id="slotted-sku-count" name="sku_count" type="number" placeholder="e.g. 250" required value="${
              state.outbound_profile.sku_count || ""
            }"/>
            <div class="slotted-field-error" id="slotted-sku-count-error">Number of SKUs is required</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderCountrySelection() {
    return `
      <div class="slotted-form-section">
        <label class="slotted-label">Where do you sell? *</label>
        <div class="slotted-selected-countries" id="slotted-selected-countries">
          ${renderSelectedCountries()}
        </div>
        <div class="slotted-multiselect-container">
          <div class="slotted-search-input">
            <span class="slotted-search-icon">🔍</span>
            <input class="slotted-input" id="slotted-sell-location" placeholder="Search countries..." value="" autocomplete="off" onclick="showCountryDropdown()" oninput="filterCountryDropdown(this.value)" onfocus="showCountryDropdown()"/>
            <span class="slotted-dropdown-arrow" id="slotted-dropdown-arrow" onclick="toggleCountryDropdown()">▼</span>
          </div>
          <div class="slotted-multiselect-dropdown" id="slotted-country-dropdown" style="display: none;" onclick="event.stopPropagation()">
            <div class="slotted-multiselect-options" id="slotted-country-options">
              ${renderCountryOptions()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderGrowthExpectations() {
    return `
      <div class="slotted-growth-section">
        <div class="slotted-growth-header">
          <span class="slotted-growth-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target w-5 h-5 text-blue-600" data-lov-id="src/components/GrowthScenarioPlanner.tsx:43:10" data-lov-name="Target" data-component-path="src/components/GrowthScenarioPlanner.tsx" data-component-line="43" data-component-file="GrowthScenarioPlanner.tsx" data-component-name="Target" data-component-content="%7B%22className%22%3A%22w-5%20h-5%20text-blue-600%22%7D"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></span>
          <h5>Growth Expectations</h5>
        </div>
        <p class="slotted-growth-description">Plan for best and worst case scenarios to help provider understand your range</p>
        
        <div class="slotted-current-orders">
          <label>Current Monthly Orders</label>
          <div class="slotted-current-value" id="slotted-current-orders-display">${
            state.outbound_profile.monthly_orders || "0"
          }</div>
        </div>
        
        <div class="slotted-growth-years">
          <div class="slotted-year-section">
            <h6>Year 1 Growth Expectations</h6>
            <div class="slotted-growth-cards">
              <div class="slotted-growth-card best-case">
                <div class="slotted-growth-card-header">
                  <span class="slotted-trend-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 text-green-600" data-lov-id="src/components/GrowthScenarioPlanner.tsx:71:16" data-lov-name="TrendingUp" data-component-path="src/components/GrowthScenarioPlanner.tsx" data-component-line="71" data-component-file="GrowthScenarioPlanner.tsx" data-component-name="TrendingUp" data-component-content="%7B%22className%22%3A%22w-4%20h-4%20text-green-600%22%7D"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg></span>
                  Best Case
                </div>
                <div class="slotted-growth-input-group">
                  <input class="slotted-growth-input" id="slotted-year1-best-growth" type="number" placeholder="50" value="${
                    state.outbound_profile.year1_best_growth || ""
                  }"/>
                  <span>% growth</span>
                </div>
                <div class="slotted-growth-error" id="slotted-year1-best-error" style="display: none;"></div>
                <div class="slotted-growth-detail" id="slotted-year1-best-detail">~0 orders/month</div>
              </div>
              <div class="slotted-growth-card worst-case">
                <div class="slotted-growth-card-header">
                  <span class="slotted-trend-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down w-4 h-4 text-red-600" data-lov-id="src/components/GrowthScenarioPlanner.tsx:94:16" data-lov-name="TrendingDown" data-component-path="src/components/GrowthScenarioPlanner.tsx" data-component-line="94" data-component-file="GrowthScenarioPlanner.tsx" data-component-name="TrendingDown" data-component-content="%7B%22className%22%3A%22w-4%20h-4%20text-red-600%22%7D"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg></span>
                  Worst Case
                </div>
                <div class="slotted-growth-input-group">
                  <input class="slotted-growth-input" id="slotted-year1-worst-growth" type="number" placeholder="-10" value="${
                    state.outbound_profile.year1_worst_growth || ""
                  }"/>
                  <span>% growth</span>
                </div>
                <div class="slotted-growth-error" id="slotted-year1-worst-error" style="display: none;"></div>
                <div class="slotted-growth-detail" id="slotted-year1-worst-detail">~0 orders/month</div>
              </div>
            </div>
          </div>
          
          <div class="slotted-year-section">
            <h6>Year 2 Growth Expectations</h6>
            <div class="slotted-growth-cards">
              <div class="slotted-growth-card best-case">
                <div class="slotted-growth-card-header">
                  <span class="slotted-trend-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-4 h-4 text-green-600" data-lov-id="src/components/GrowthScenarioPlanner.tsx:71:16" data-lov-name="TrendingUp" data-component-path="src/components/GrowthScenarioPlanner.tsx" data-component-line="71" data-component-file="GrowthScenarioPlanner.tsx" data-component-name="TrendingUp" data-component-content="%7B%22className%22%3A%22w-4%20h-4%20text-green-600%22%7D"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg></span>
                  Best Case
                </div>
                <div class="slotted-growth-input-group">
                  <input class="slotted-growth-input" id="slotted-year2-best-growth" type="number" placeholder="75" value="${
                    state.outbound_profile.year2_best_growth || ""
                  }"/>
                  <span>% growth</span>
                </div>
                <div class="slotted-growth-error" id="slotted-year2-best-error" style="display: none;"></div>
                <div class="slotted-growth-detail" id="slotted-year2-best-detail">~0 orders/month</div>
              </div>
              <div class="slotted-growth-card worst-case">
                <div class="slotted-growth-card-header">
                  <span class="slotted-trend-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-down w-4 h-4 text-red-600" data-lov-id="src/components/GrowthScenarioPlanner.tsx:94:16" data-lov-name="TrendingDown" data-component-path="src/components/GrowthScenarioPlanner.tsx" data-component-line="94" data-component-file="GrowthScenarioPlanner.tsx" data-component-name="TrendingDown" data-component-content="%7B%22className%22%3A%22w-4%20h-4%20text-red-600%22%7D"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline><polyline points="16 17 22 17 22 11"></polyline></svg></span>
                  Worst Case
                </div>
                <div class="slotted-growth-input-group">
                  <input class="slotted-growth-input" id="slotted-year2-worst-growth" type="number" placeholder="5" value="${
                    state.outbound_profile.year2_worst_growth || ""
                  }"/>
                  <span>% growth</span>
                </div>
                <div class="slotted-growth-error" id="slotted-year2-worst-error" style="display: none;"></div>
                <div class="slotted-growth-detail" id="slotted-year2-worst-detail">~0 orders/month</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="slotted-growth-note">
          <strong>Note:</strong> Negative growth is okay - it helps providers understand your realistic expectations and plan appropriate pricing structures.
        </div>
      </div>
    `;
  }

  function renderBusinessContextCard() {
    return `
      <div class="slotted-business-context-card">
        <div class="slotted-section-header">
          <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-6 h-6" data-lov-id="src/components/ShippingProfileForm.tsx:347:14" data-lov-name="TrendingUp" data-component-path="src/components/ShippingProfileForm.tsx" data-component-line="347" data-component-file="ShippingProfileForm.tsx" data-component-name="TrendingUp" data-component-content="%7B%22className%22%3A%22w-6%20h-6%22%7D"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg></span>
         <div>
         <h4>Important Business Context</h4>
         </div>
          <span class="slotted-required-badge">Required</span>
        </div>
        
        ${renderCountrySelection()}
        ${renderGrowthExpectations()}
        
        <div class="slotted-form-section">
          <label class="slotted-label">How big is your typical customer order? *</label>
          <div class="slotted-checkbox-grid">
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-fits-hand" ${
                state.outbound_profile.fits_in_hand ? "checked" : ""
              }/>
              <label for="slotted-fits-hand">Fits in your hand</label>
            </div>
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-fits-porch" ${
                state.outbound_profile.fits_on_porch ? "checked" : ""
              }/>
              <label for="slotted-fits-porch">Fits on the porch</label>
            </div>
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-fits-mailbox" ${
                state.outbound_profile.fits_in_mailbox ? "checked" : ""
              }/>
              <label for="slotted-fits-mailbox">Fits in your mailbox</label>
            </div>
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-needs-two-people" ${
                state.outbound_profile.needs_two_people ? "checked" : ""
              }/>
              <label for="slotted-needs-two-people">Needs two people to carry</label>
            </div>
          </div>
        </div>
        
        <div class="slotted-form-section">
          <label class="slotted-label">Are your SKUs serialized or batch controlled? *</label>
          <div class="slotted-radio-group">
            <div class="slotted-radio-item">
              <input type="radio" id="slotted-serialized-yes" name="serialized" value="yes" ${
                state.outbound_profile.are_serialized === "yes" ? "checked" : ""
              }/>
              <label for="slotted-serialized-yes">Yes</label>
            </div>
            <div class="slotted-radio-item">
              <input type="radio" id="slotted-serialized-no" name="serialized" value="no" ${
                state.outbound_profile.are_serialized === "no" ? "checked" : ""
              }/>
              <label for="slotted-serialized-no">No</label>
            </div>
          </div>
        </div>
        
        <div class="slotted-form-section">
          <label class="slotted-label">What types of shipments do you fulfill? *</label>
          <div class="slotted-checkbox-grid">
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-dtc-parcel" ${
                state.outbound_profile.shipment_dtc_parcel ? "checked" : ""
              }/>
              <label for="slotted-dtc-parcel">DTC (Parcel)</label>
            </div>
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-retail-cases" ${
                state.outbound_profile.shipment_retail_cases ? "checked" : ""
              }/>
              <label for="slotted-retail-cases">Retail (Cases)</label>
            </div>
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-retail-pallets" ${
                state.outbound_profile.shipment_retail_pallets ? "checked" : ""
              }/>
              <label for="slotted-retail-pallets">Retail (Pallets)</label>
            </div>
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-marketplace-cases" ${
                state.outbound_profile.shipment_marketplace_cases
                  ? "checked"
                  : ""
              }/>
              <label for="slotted-marketplace-cases">Marketplace (Cases)</label>
            </div>
            <div class="slotted-checkbox-item">
              <input type="checkbox" id="slotted-marketplace-pallets" ${
                state.outbound_profile.shipment_marketplace_pallets
                  ? "checked"
                  : ""
              }/>
              <label for="slotted-marketplace-pallets">Marketplace (Pallets)</label>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderOptionalInformation() {
    return `
      <div class="slotted-optional-toggle" id="slotted-optional-toggle">
        <span>Show Optional Information</span>
        <span class="slotted-toggle-text">(helps determine fit)</span>
        <span class="slotted-toggle-icon">▼</span>
      </div>
      
      <div class="slotted-optional-content slotted-optional-hidden" id="slotted-optional-content">
        <div class="slotted-business-context-card">
          <div class="slotted-section-header">
            <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-5 h-5" data-lov-id="src/components/ShippingProfileForm.tsx:448:18" data-lov-name="TrendingUp" data-component-path="src/components/ShippingProfileForm.tsx" data-component-line="448" data-component-file="ShippingProfileForm.tsx" data-component-name="TrendingUp" data-component-content="%7B%22className%22%3A%22w-5%20h-5%22%7D"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg></span>
          <div>
          <h4>Additional Context</h4>
          </div> 
          </div>
          
          ${renderFulfillmentMethod()}
          ${renderStartShippingDate()}
          ${renderShippingLocation()}
          ${renderSeasonalPeaks()}
          ${renderSingleSkuOrders()}
          ${renderVolumeDistribution()}
          ${renderDynamicWeightSection()}
          ${renderHazardousProducts()}
        </div>
      </div>
    `;
  }

  function renderFulfillmentMethod() {
    return `
      <div class="slotted-form-section">
        <label class="slotted-label">How do you currently fulfill orders?</label>
        <div class="slotted-radio-group" style="flex-direction: column; gap: 0.75rem;">
          <div class="slotted-radio-item">
            <input type="radio" id="slotted-fulfill-inhouse" name="fulfillment" value="inhouse" ${
              state.outbound_profile.fulfillment_method === "inhouse"
                ? "checked"
                : ""
            }/>
            <label for="slotted-fulfill-inhouse">In house fulfillment</label>
          </div>
          <div class="slotted-radio-item">
            <input type="radio" id="slotted-fulfill-3pl" name="fulfillment" value="3pl" ${
              state.outbound_profile.fulfillment_method === "3pl"
                ? "checked"
                : ""
            }/>
            <label for="slotted-fulfill-3pl">3PL provider</label>
          </div>
          <div class="slotted-radio-item">
            <input type="radio" id="slotted-fulfill-dropship" name="fulfillment" value="dropship" ${
              state.outbound_profile.fulfillment_method === "dropship"
                ? "checked"
                : ""
            }/>
            <label for="slotted-fulfill-dropship">Dropshipping</label>
          </div>
          <div class="slotted-radio-item">
            <input type="radio" id="slotted-fulfill-notyet" name="fulfillment" value="not_yet" ${
              state.outbound_profile.fulfillment_method === "not_yet"
                ? "checked"
                : ""
            }/>
            <label for="slotted-fulfill-notyet">Not fulfilling yet</label>
          </div>
        </div>

        <!-- 3PL Provider Details Card -->
        <div id="slotted-3pl-provider-card" class="slotted-3pl-provider-card ${
          state.outbound_profile.fulfillment_method === "3pl"
            ? "slotted-3pl-card-visible"
            : "slotted-3pl-card-hidden"
        }">
          
          <div class="slotted-3pl-form-section">
            <label class="slotted-3pl-label">Current 3PL Provider</label>
            <div class="slotted-provider-search-container">
              <input 
                class="slotted-input slotted-provider-search" 
                id="slotted-current-provider-search" 
                placeholder="Search for your current provider..."
                value="${state.outbound_profile.current_provider_name || ""}"
                autocomplete="off"
              />
              ${
                state.outbound_profile.current_provider_name
                  ? '<button type="button" class="slotted-provider-clear" onclick="clearProviderSearch()" title="Clear selection">×</button>'
                  : ""
              }
              <div class="slotted-provider-dropdown" id="slotted-provider-dropdown" style="display: none;">
                <div class="slotted-provider-loading" id="slotted-provider-loading" style="display: none;">
                  Loading providers...
                </div>
                <div class="slotted-provider-results" id="slotted-provider-results">
                  <!-- Dynamic provider results will appear here -->
                </div>
              </div>
            </div>
          </div>

          <div class="slotted-3pl-form-section">
            <label class="slotted-3pl-label">When does your current contract expire?</label>
            <div class="slotted-3pl-date-grid">
              <select class="slotted-input" id="slotted-contract-end-month">
                <option value="">Month</option>
                ${MONTHS.map(
                  (month) => `
                  <option value="${month.value}" ${
                    state.outbound_profile.contract_end_month === month.value
                      ? "selected"
                      : ""
                  }>${month.name}</option>
                `
                ).join("")}
              </select>
              <select class="slotted-input" id="slotted-contract-end-year">
                <option value="">Year</option>
                ${YEARS.map(
                  (year) => `
                  <option value="${year.value}" ${
                    state.outbound_profile.contract_end_year === year.value
                      ? "selected"
                      : ""
                  }>${year.name}</option>
                `
                ).join("")}
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderStartShippingDate() {
    return `
      <div class="slotted-form-section">
        <label class="slotted-label">When do you hope to start shipping orders?</label>
        <div class="slotted-grid-2">
          <select class="slotted-input" id="slotted-start-month">
            ${MONTHS.map(
              (month) => `
              <option value="${month.value}" ${
                state.outbound_profile.start_month === month.value
                  ? "selected"
                  : ""
              }>${month.name}</option>
            `
            ).join("")}
          </select>
          <select class="slotted-input" id="slotted-start-year">
            ${YEARS.map(
              (year) => `
              <option value="${year.value}" ${
                state.outbound_profile.start_year === year.value
                  ? "selected"
                  : ""
              }>${year.name}</option>
            `
            ).join("")}
          </select>
        </div>
      </div>
    `;
  }

  function renderShippingLocation() {
    return `
      <div class="slotted-form-section">
        <label class="slotted-label">Where do you currently ship from?</label>
        <input class="slotted-input" id="slotted-ship-from" placeholder="ZIP code or city" value="${
          state.outbound_profile.ship_from_location || ""
        }"/>
      </div>
    `;
  }

  function renderSeasonalPeaks() {
    return `
      <div class="slotted-form-section">
        <div class="slotted-checkbox-item">
          <input type="checkbox" id="slotted-seasonal-peaks" ${
            state.outbound_profile.seasonal_peaks ? "checked" : ""
          }/>
          <label for="slotted-seasonal-peaks">Seasonal peaks in sales</label>
        </div>
        <div class="slotted-seasonal-months" id="slotted-seasonal-months" style="display: ${
          state.outbound_profile.seasonal_peaks ? "block" : "none"
        }">
          <div class="slotted-months-grid">
            ${MONTHS.map(
              (month) => `
              <div class="slotted-month-item">
                <input type="checkbox" id="slotted-month-${
                  month.value
                }" value="${month.value}" ${
                state.outbound_profile.seasonal_months &&
                state.outbound_profile.seasonal_months.includes(
                  parseInt(month.value)
                )
                  ? "checked"
                  : ""
              }/>
                <label for="slotted-month-${month.value}">${month.name}</label>
              </div>
            `
            ).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderSingleSkuOrders() {
    return `
      <div class="slotted-form-section">
        <label class="slotted-label">Do most orders contain just one SKU?</label>
        <div class="slotted-radio-group">
          <div class="slotted-radio-item">
            <input type="radio" id="slotted-single-sku-yes" name="single_sku" value="yes" ${
              state.outbound_profile.single_sku_orders === "yes"
                ? "checked"
                : ""
            }/>
            <label for="slotted-single-sku-yes">Yes</label>
          </div>
          <div class="slotted-radio-item">
            <input type="radio" id="slotted-single-sku-no" name="single_sku" value="no" ${
              state.outbound_profile.single_sku_orders === "no" ? "checked" : ""
            }/>
            <label for="slotted-single-sku-no">No</label>
          </div>
        </div>
      </div>
    `;
  }

  function renderVolumeDistribution() {
    return `
      <div class="slotted-form-section">
        <label class="slotted-label">What percentage of your outbound volume is in eaches vs case or pallet?</label>
        <div class="slotted-volume-container">
          <div class="slotted-volume-labels">
            <span id="slotted-eaches-label">${
              state.outbound_profile.volume_distribution || 50
            }% Eaches</span>
            <span id="slotted-case-label">${
              100 - (state.outbound_profile.volume_distribution || 50)
            }% Case/Pallet</span>
          </div>
          <div class="slotted-volume-slider-wrapper">
            <div class="slotted-volume-slider-track"></div>
            <div class="slotted-volume-slider-fill" id="slotted-volume-fill" style="width: ${
              state.outbound_profile.volume_distribution || 50
            }%"></div>
            <input type="range" id="slotted-volume-distribution" min="0" max="100" value="${
              state.outbound_profile.volume_distribution || 50
            }" 
                   class="slotted-volume-slider" />
          </div>
        </div>
      </div>
    `;
  }

  function renderDynamicWeightSection() {
    return `
      <div class="slotted-form-section" id="slotted-weight-section" style="display: none;">
        <label class="slotted-label">Average weight per shipment type</label>
        <div class="slotted-weight-inputs" id="slotted-weight-inputs">
          <!-- Dynamic weight inputs will be inserted here -->
        </div>
      </div>
    `;
  }

  function renderHazardousProducts() {
    return `
      <div class="slotted-form-section">
        <label class="slotted-label">Do you sell any hazardous products?</label>
        <div class="slotted-radio-group">
          <div class="slotted-radio-item">
            <input type="radio" id="slotted-hazardous-yes" name="hazardous" value="yes" ${
              state.outbound_profile.hazardous_products === "yes"
                ? "checked"
                : ""
            }/>
            <label for="slotted-hazardous-yes">Yes</label>
          </div>
          <div class="slotted-radio-item">
            <input type="radio" id="slotted-hazardous-no" name="hazardous" value="no" ${
              state.outbound_profile.hazardous_products === "no"
                ? "checked"
                : ""
            }/>
            <label for="slotted-hazardous-no">No</label>
          </div>
        </div>
      </div>
    `;
  }

  function renderOutboundProfileStep() {
    return `
      <div class="slotted-step${
        state.step === 1 ? " active" : ""
      }" id="slotted-step-1">
        <h3>Outbound Profile</h3>
        <p class="slotted-section-description">Tell us about your volume and business context.</p>
        
        ${renderCriticalVolumeMetrics()}
        ${renderBusinessContextCard()}
        ${renderOptionalInformation()}
      </div>
    `;
  }

  function renderInboundProfileStep() {
    return `
      <div class="slotted-step${
        state.step === 2 ? " active" : ""
      }" id="slotted-step-2">
        <h3>Inbound Profile</h3>
        <p class="slotted-section-description">Tell us about your inventory and storage needs.</p>
        
        <div class="slotted-business-context-card">
          <div class="slotted-section-header">
            <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck h-5 w-5" data-lov-id="src/components/ProductNeedsForm.tsx:120:16" data-lov-name="Truck" data-component-path="src/components/ProductNeedsForm.tsx" data-component-line="120" data-component-file="ProductNeedsForm.tsx" data-component-name="Truck" data-component-content="%7B%22className%22%3A%22h-5%20w-5%22%7D"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg></span>
            <h4>Essential Inbound Information</h4>
            <span class="slotted-required-badge">Required</span>
          </div>
          
          <div class="slotted-form-section">
            <label class="slotted-label">How frequently do you send inbound inventory? *</label>
            <div class="slotted-radio-group">
              <div class="slotted-radio-item">
                <input type="radio" id="slotted-freq-weekly" name="inbound_frequency" value="weekly" ${
                  state.inbound_profile?.inbound_frequency === "weekly"
                    ? "checked"
                    : ""
                }/>
                <label for="slotted-freq-weekly">Weekly</label>
              </div>
              <div class="slotted-radio-item">
                <input type="radio" id="slotted-freq-monthly" name="inbound_frequency" value="monthly" ${
                  state.inbound_profile?.inbound_frequency === "monthly"
                    ? "checked"
                    : ""
                }/>
                <label for="slotted-freq-monthly">Monthly</label>
              </div>
              <div class="slotted-radio-item">
                <input type="radio" id="slotted-freq-quarterly" name="inbound_frequency" value="quarterly" ${
                  state.inbound_profile?.inbound_frequency === "quarterly"
                    ? "checked"
                    : ""
                }/>
                <label for="slotted-freq-quarterly">Quarterly</label>
              </div>
            </div>
          </div>
          
          <div class="slotted-form-section">
            <label class="slotted-label">Storage Type Required *</label>
            <select class="slotted-input" id="slotted-storage-type">
              <option value="">Select storage temperature requirements</option>
              ${generateStorageTypeOptions(state.inbound_profile?.storage_type)}
            </select>
          </div>
          
          <div class="slotted-form-section">
            <label class="slotted-label">Average Pallets Per Month *</label>
            <div style="position: relative;">
              <input class="slotted-input slotted-input-padded" id="slotted-avg-pallets" type="number" placeholder="10" value="${
                state.inbound_profile?.avg_pallets || ""
              }"/>
              <span style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #6b7280; font-size: 0.9rem;">pallets</span>
            </div>
            <div class="slotted-helper-text">How many pallets you need to store on average per month</div>
          </div>
          
          <div class="slotted-grid-2">
            <div class="slotted-form-section">
              <label class="slotted-label">Inbound Shipment Format *</label>
              <div class="slotted-inbound-form-group">
                <div class="slotted-checkbox-item">
                  <input type="checkbox" id="slotted-palletized" ${
                    state.inbound_profile?.palletized ? "checked" : ""
                  }/>
                  <label for="slotted-palletized">Palletized</label>
                </div>
                <div class="slotted-checkbox-item">
                  <input type="checkbox" id="slotted-floor-loaded" ${
                    state.inbound_profile?.floor_loaded ? "checked" : ""
                  }/>
                  <label for="slotted-floor-loaded">Floor Loaded</label>
                </div>
                <div class="slotted-checkbox-item">
                  <input type="checkbox" id="slotted-parcel" ${
                    state.inbound_profile?.parcel ? "checked" : ""
                  }/>
                  <label for="slotted-parcel">Parcel</label>
                </div>
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">Average Return Rate *</label>
              <div style="position: relative;">
                <input class="slotted-input slotted-input-padded-small" id="slotted-return-rate" type="number" placeholder="5" value="${
                  state.inbound_profile?.return_rate || ""
                }"/>
                <span style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #6b7280; font-size: 0.9rem;">%</span>
              </div>
              <div class="slotted-helper-text">Percentage of orders that are returned by customers</div>
            </div>
          </div>
        </div>

        <!-- Optional Information Section -->
        <div class="slotted-optional-toggle" id="slotted-inbound-optional-toggle">
          <span>Optional: Additional Details</span>
          <span class="slotted-toggle-text">(Show)</span>
          <span class="slotted-toggle-icon">▼</span>
        </div>
        
        <div class="slotted-optional-content slotted-optional-hidden" id="slotted-inbound-optional-content">
          <div class="slotted-business-context-card">
            <div class="slotted-section-header">
              <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package h-5 w-5" data-lov-id="src/components/ProductNeedsForm.tsx:254:20" data-lov-name="Package" data-component-path="src/components/ProductNeedsForm.tsx" data-component-line="254" data-component-file="ProductNeedsForm.tsx" data-component-name="Package" data-component-content="%7B%22className%22%3A%22h-5%20w-5%22%7D"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path><path d="m7.5 4.27 9 5.15"></path></svg></span>
              <h4>Additional Inbound Details</h4>
            </div>
            
            <div class="slotted-form-section">
              <div class="slotted-checkbox-item slotted-checkbox-spaced">
                <input type="checkbox" id="slotted-single-sku-case" ${
                  state.inbound_profile?.single_sku_case ? "checked" : ""
                }/>
                <div class="slotted-checkbox-content">
                  <label for="slotted-single-sku-case" style="font-weight: 600; margin-bottom: 0.25rem; display: block;">Single SKU per case</label>
                  <div style="color: #6b7280; font-size: 0.85rem;">Each case/box contains only one type of product</div>
                </div>
              </div>
              
              <div class="slotted-checkbox-item" style="margin-bottom: 1rem;">
                <input type="checkbox" id="slotted-case-barcoding" ${
                  state.inbound_profile?.case_barcoding ? "checked" : ""
                }/>
                <div style="margin-left: 0.5rem;">
                  <label for="slotted-case-barcoding" style="font-weight: 600; margin-bottom: 0.25rem; display: block;">Case-level barcoding</label>
                  <div style="color: #6b7280; font-size: 0.85rem;">Cases/boxes have barcodes for easy scanning and tracking</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // Helper function to render consistent navigation buttons
  function renderNavigationButtons(currentStep) {
    const isFirstStep = currentStep === 1; // Step 1 is the first RFP step
    const isLastStep = currentStep === 3; // Step 3 is the final step

    const backButton = isFirstStep
      ? `<button class="slotted-btn-back" disabled>
           <svg class="slotted-nav-icon slotted-nav-icon-left" viewBox="0 0 24 24" fill="none">
             <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m0 0l7 7m-7-7l7-7"/>
           </svg>
           Previous
         </button>`
      : `<button class="slotted-btn-back" id="slotted-back-step-${currentStep}">
           <svg class="slotted-nav-icon slotted-nav-icon-left" viewBox="0 0 24 24" fill="none">
             <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m0 0l7 7m-7-7l7-7"/>
           </svg>
           Previous
         </button>`;

    const nextButton = isLastStep
      ? `<button class="slotted-btn" id="slotted-submit-final">Submit RFP</button>`
      : `<button class="slotted-btn" id="slotted-next-step-${currentStep}">
           Next
           <svg class="slotted-nav-icon slotted-nav-icon-right" viewBox="0 0 24 24" fill="none">
             <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m0 0l-7-7m7 7l-7 7"/>
           </svg>
         </button>`;

    return `
      <div class="slotted-navigation-bar">
        <div class="slotted-powered-by">
          <div class="slotted-powered-text">Powered by</div>
          <img src="http://localhost:3000/assets/slotted.png" alt="Logo" />
        </div>
        ${renderBanner()}
        <div class="slotted-navigation-group">
          ${backButton}
          ${nextButton}
        </div>
      </div>
    `;
  }

  // Helper function to render weight summary in final review
  function renderWeightSummary() {
    // Define shipment types with their keys and display names
    const shipmentTypes = [
      { key: "dtcParcel", label: "DTC (Parcel)" },
      { key: "retailPallet", label: "Retail (Pallet)" },
      { key: "marketplacePallet", label: "Marketplace (Pallet)" },
      { key: "retailCases", label: "Retail (Cases)" },
      { key: "marketplaceCases", label: "Marketplace (Cases)" },
    ];

    // Check if any weight data exists
    const weightData = shipmentTypes
      .map((type) => {
        const value = state.outbound_profile?.[type.key + "Value"];
        const unit = state.outbound_profile?.[type.key + "Unit"];
        if (value && unit) {
          return `${type.label}: ${value}${unit}`;
        }
        return null;
      })
      .filter(Boolean);

    // Only render if there's weight data
    if (weightData.length === 0) {
      return "";
    }

    return `
      <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
        <h4 style="margin: 0 0 1rem 0; color: #374151; font-size: 1rem; font-weight: 600;">Average Weight per Shipment Type</h4>
        <div style="background: #f8fafc; border-radius: 8px; padding: 1rem;">
          ${weightData
            .map(
              (weight) => `
            <div style="color: #6b7280; font-size: 0.9rem; margin-bottom: 0.5rem; line-height: 1.5;">
              ${weight}
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderFinalReviewStep() {
    return `
      <div class="slotted-step${
        state.step === 3 ? " active" : ""
      }" id="slotted-step-3">
        <h3>Final Review</h3>
        <p style="margin-bottom: 16px; margin-top: 0; color: #6b7280; text-align: center;font-size: 14px">Please review your information before we submit your RFP to provider.</p>
        
        <!-- Shipping Profile Card -->
        <div class="slotted-business-context-card" style="margin-bottom: 1.5rem;">
          <div class="slotted-section-header-with-actions">
            <div class="slotted-section-header-left">
              <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-5 h-5" data-lov-id="src/components/ReviewSummary.tsx:106:18" data-lov-name="MapPin" data-component-path="src/components/ReviewSummary.tsx" data-component-line="106" data-component-file="ReviewSummary.tsx" data-component-name="MapPin" data-component-content="%7B%22className%22%3A%22w-5%20h-5%22%7D"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
              <div>
                <h4>Shipping Profile</h4>
                <p class="slotted-section-icon-description">Volume metrics and business context</p>
              </div>
            </div>
            <div class="slotted-section-header-right">
              <span class="slotted-complete-badge">✓ Complete</span>
              <button id="slotted-edit-outbound" class="slotted-edit-button" title="Edit Shipping Profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 3 3L13 14l-4 1 1-4 8.5-8.5z"></path>
                </svg>
              </button>
            </div>
          </div>
         
          
          <div class="slotted-grid-2" style="gap: 2rem;">
            <div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Monthly Orders</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.monthly_orders || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Avg Order Value</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">$${
                  state.outbound_profile?.avg_order_value || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">SKU Count</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.sku_count || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Growth Expectations</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">
                  ${
                    state.outbound_profile?.year1_best_growth !== undefined &&
                    state.outbound_profile?.year1_worst_growth !== undefined
                      ? `Year 1: ${state.outbound_profile.year1_worst_growth}% to ${state.outbound_profile.year1_best_growth}%`
                      : "Not specified"
                  }<br>
                  ${
                    state.outbound_profile?.year2_best_growth !== undefined &&
                    state.outbound_profile?.year2_worst_growth !== undefined
                      ? `Year 2: ${state.outbound_profile.year2_worst_growth}% to ${state.outbound_profile.year2_best_growth}%`
                      : ""
                  }
                </div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Serialized/Batch-Controlled</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.are_serialized === "yes"
                    ? "Yes"
                    : state.outbound_profile?.are_serialized === "no"
                    ? "No"
                    : "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Current 3PL Provider</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${(() => {
                  const fulfillmentMethod =
                    state.outbound_profile?.fulfillment_method;
                  const providerId = state.outbound_profile?.current_provider;
                  const providerName =
                    state.outbound_profile?.current_provider_name;

                  if (fulfillmentMethod !== "3pl") {
                    return "Not applicable";
                  }

                  // If we have a name, use it
                  if (providerName && providerName.trim()) {
                    return providerName;
                  }

                  // If we have an ID but no name, lookup from providers data
                  if (providerId) {
                    const provider = THREE_PL_PROVIDERS.find(
                      (p) => p.id === providerId
                    );

                    if (provider) {
                      return provider.name;
                    }
                  }

                  return "Not specified";
                })()}</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Shipping Start Date</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.start_month &&
                  state.outbound_profile?.start_year
                    ? new Date(
                        parseInt(state.outbound_profile.start_year),
                        parseInt(state.outbound_profile.start_month) - 1
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Contain Just One SKU</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.single_sku_orders === "yes"
                    ? "Yes"
                    : state.outbound_profile?.single_sku_orders === "no"
                    ? "No"
                    : "Not specified"
                }</div>
              </div>
              <div >
                <strong style="color: #374151; font-size: 0.9rem;">Average Weight per Shipment Type</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${(() => {
                  const weights = [];
                  if (
                    state.outbound_profile?.dtcParcelValue &&
                    state.outbound_profile?.dtcParcelUnit
                  ) {
                    weights.push(
                      `DTC (Parcel): ${state.outbound_profile.dtcParcelValue},${state.outbound_profile.dtcParcelUnit}`
                    );
                  }
                  if (
                    state.outbound_profile?.retailPalletValue &&
                    state.outbound_profile?.retailPalletUnit
                  ) {
                    weights.push(
                      `Retail (Pallet): ${state.outbound_profile.retailPalletValue},${state.outbound_profile.retailPalletUnit}`
                    );
                  }
                  if (
                    state.outbound_profile?.retailCasesValue &&
                    state.outbound_profile?.retailCasesUnit
                  ) {
                    weights.push(
                      `Retail (Cases): ${state.outbound_profile.retailCasesValue},${state.outbound_profile.retailCasesUnit}`
                    );
                  }
                  if (
                    state.outbound_profile?.marketplacePalletValue &&
                    state.outbound_profile?.marketplacePalletUnit
                  ) {
                    weights.push(
                      `MarketPlace (Pallet): ${state.outbound_profile.marketplacePalletValue},${state.outbound_profile.marketplacePalletUnit}`
                    );
                  }
                  if (
                    state.outbound_profile?.marketplaceCasesValue &&
                    state.outbound_profile?.marketplaceCasesUnit
                  ) {
                    weights.push(
                      `MarketPlace (Cases): ${state.outbound_profile.marketplaceCasesValue},${state.outbound_profile.marketplaceCasesUnit}`
                    );
                  }
                  return weights.length > 0
                    ? weights.join("<br>")
                    : "Not specified";
                })()}</div>
              </div>
            </div>
            <div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Avg Items/Order</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.avg_items || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Number of SKUs</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.sku_count || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Sales Channels</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.selected_countries?.length > 0
                    ? state.outbound_profile.selected_countries.join(", ")
                    : state.outbound_profile?.sell_location || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Typical Order Size</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  [
                    state.outbound_profile?.fits_in_hand
                      ? "Fits in your hand"
                      : null,
                    state.outbound_profile?.fits_on_porch
                      ? "Fits on the porch"
                      : null,
                    state.outbound_profile?.fits_in_mailbox
                      ? "Fits in your mailbox"
                      : null,
                    state.outbound_profile?.needs_two_people
                      ? "Needs two people to carry"
                      : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not specified"
                }</div>
              </div>
              
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">How do you currently fulfill orders?</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.fulfillment_method === "3pl"
                    ? "3PL Provider"
                    : state.outbound_profile?.fulfillment_method === "inhouse"
                    ? "In-house Fulfillment"
                    : state.outbound_profile?.fulfillment_method === "dropship"
                    ? "Dropshipping"
                    : state.outbound_profile?.fulfillment_method === "not_yet"
                    ? "Not Fulfilling Yet"
                    : "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Current Contract End Date</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${(() => {
                  const fulfillmentMethod =
                    state.outbound_profile?.fulfillment_method;
                  const contractMonth =
                    state.outbound_profile?.contract_end_month;
                  const contractYear =
                    state.outbound_profile?.contract_end_year;

                  if (fulfillmentMethod !== "3pl") {
                    return "Not applicable";
                  }

                  if (contractMonth && contractYear) {
                    try {
                      const date = new Date(
                        parseInt(contractYear),
                        parseInt(contractMonth) - 1
                      );
                      const formatted = date.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      });
                      return formatted;
                    } catch (error) {
                      return "Invalid date";
                    }
                  }

                  return "Not specified";
                })()}</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Shipping Zip Code</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.ship_from_location || "Not specified"
                }</div>
              </div>
              <div>
                <strong style="color: #374151; font-size: 0.9rem;">Eaches vs Case/Pallet</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.volume_distribution !== undefined
                    ? `${state.outbound_profile.volume_distribution}% Eaches`
                    : "Not specified"
                }<br>${
      state.outbound_profile?.volume_distribution !== undefined
        ? `${100 - state.outbound_profile.volume_distribution}% Case/Pallet`
        : ""
    }</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inbound Profile Card -->
        <div class="slotted-business-context-card" style="margin-bottom: 2rem;">
          <div class="slotted-section-header" >
            <div class="slotted-section-header-left">
              <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package w-5 h-5" data-lov-id="src/components/ReviewSummary.tsx:190:18" data-lov-name="Package" data-component-path="src/components/ReviewSummary.tsx" data-component-line="190" data-component-file="ReviewSummary.tsx" data-component-name="Package" data-component-content="%7B%22className%22%3A%22w-5%20h-5%22%7D"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path><path d="m7.5 4.27 9 5.15"></path></svg></span>
              <div>
                <h4>Inbound Profile</h4>
                <p class="slotted-section-icon-description">Product and operational requirements</p>
              </div>
            </div>
            <div class="slotted-section-header-right">
              <span class="slotted-complete-badge">✓ Complete</span>
              <button id="slotted-edit-inbound" class="slotted-edit-button" title="Edit Inbound Profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="m18.5 2.5 3 3L13 14l-4 1 1-4 8.5-8.5z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="slotted-inbound-grid">
            <div>
              <div class="slotted-field-item">
                <span class="slotted-field-label">Inbound Frequency</span>
                <div class="slotted-field-value">${
                  state.inbound_profile?.inbound_frequency
                    ? state.inbound_profile.inbound_frequency
                        .charAt(0)
                        .toUpperCase() +
                      state.inbound_profile.inbound_frequency.slice(1)
                    : "Not specified"
                }</div>
              </div>
              <div class="slotted-field-item">
                <span class="slotted-field-label">Storage Type</span>
                <div class="slotted-field-value">${
                  state.inbound_profile?.storage_type
                    ? getStorageTypeDisplayName(
                        state.inbound_profile.storage_type
                      )
                    : "Not specified"
                }</div>
              </div>
              <div class="slotted-field-item">
                <span class="slotted-field-label">Pallets per Month</span>
                <div class="slotted-field-value">${
                  state.inbound_profile?.avg_pallets || "Not specified"
                }</div>
              </div>
              <div class="slotted-field-item">
                <span class="slotted-field-label">Case-level barcoding</span>
                <div class="slotted-field-value">${
                  state.inbound_profile?.case_barcoding === true
                    ? "Yes"
                    : state.inbound_profile?.case_barcoding === false
                    ? "No"
                    : "Not specified"
                }</div>
              </div>
            </div>
            <div>
              <div class="slotted-field-item">
                <span class="slotted-field-label">Shipment Types</span>
                <div class="slotted-field-value">${
                  [
                    state.inbound_profile?.palletized ? "Palletized" : null,
                    state.inbound_profile?.floor_loaded ? "Floor Loaded" : null,
                    state.inbound_profile?.parcel ? "Parcel" : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not specified"
                }</div>
              </div>
              <div class="slotted-field-item">
                <span class="slotted-field-label">Single SKU per case</span>
                <div class="slotted-field-value">${
                  state.inbound_profile?.single_sku_case === true
                    ? "Yes"
                    : state.inbound_profile?.single_sku_case === false
                    ? "No"
                    : "Not specified"
                }</div>
              </div>
              <div class="slotted-field-item">
                <span class="slotted-field-label">Return Rate</span>
                <div class="slotted-field-value">${
                  state.inbound_profile?.return_rate
                    ? state.inbound_profile.return_rate + "%"
                    : "Not specified"
                }</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Volume Profile Section -->
        <div style="display:flex;justify-content:space-between;align-items:center;background: #dbeafe; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; ">
        <div >
        <h4 style="margin: 0 0 0.5rem 0; color: #374151;">Ready to submit your RFP?</h4>
          <p style="margin: 0 0 0 0; color: #6b7280; font-size: 0.9rem;">Your RFP is ready to go. Click Submit to send it to the provider, and we'll notify you once they've reviewed.</p>
        </div> 
        <img src="http://localhost:3000/assets/slotted.png" alt="Slotted" style="width: 100%; max-width: 200px; display: block;border-radius: 8px; "/>
        </div>

      </div>
    `;
  }

  function renderFooter() {
    let footer = `<div class="slotted-footer">Powered by Slotted. reCAPTCHA v3 protected.</div>`;

    if (state.status === "complete") {
      footer =
        `<div style="margin-top:1.5em;text-align:center;">
        <b>Thank you!</b><br>Want to edit this later? <a href="#">Finish your account on Slotted</a>
      </div>` + footer;
    }

    return footer;
  }

  // Inject widget CSS from external file
  function injectWidgetCSS() {
    if (document.getElementById("slotted-widget-style")) return;
    const link = document.createElement("link");
    link.id = "slotted-widget-style";
    link.rel = "stylesheet";
    link.href = "http://localhost:3000/widget.css";
    document.head.appendChild(link);
  }

  // Theme
  function applyTheme() {
    if (!PROVIDER || !PROVIDER.theme) return;
    const theme = PROVIDER.theme;
    const root = document.documentElement;
    // Card theme
    root.style.setProperty(
      "--slotted-primary",
      theme.colors.primary || "#38d92dff"
    );
    root.style.setProperty("--slotted-bg", theme.colors.background || "#fff");
    root.style.setProperty("--slotted-text", theme.colors.text || "#222");
    // Card font
    document.getElementById("slotted-easyrfp").style.fontFamily =
      theme.fonts || "Inter, Arial, sans-serif";
    // Card logo is already used in render
    // Root background (page background)
    if (theme.rootBackground) {
      document.body.style.background = theme.rootBackground;
    } else {
      document.body.style.background =
        "linear-gradient(to right bottom, rgb(239, 246, 255), rgb(224, 231, 255))";
    }
  }

  // Main render function
  function render(containerId = null) {
    injectWidgetCSS();

    // Determine which container to use
    let targetContainerId = containerId;
    if (!targetContainerId) {
      // Check if we're in modal mode
      const modalContainer = document.getElementById("slotted-easyrfp-modal");

      if (modalContainer && modalContainer.closest("#slotted-widget-modal")) {
        // Modal exists and is active
        const modal = document.getElementById("slotted-widget-modal");
        if (modal && modal.style.display === "flex") {
          targetContainerId = "slotted-easyrfp-modal";
        } else {
          targetContainerId = "slotted-easyrfp";
        }
      } else {
        targetContainerId = "slotted-easyrfp";
      }
    }

    const el = document.getElementById(targetContainerId);
    if (!el) {
      console.error("Widget container not found:", targetContainerId);
      return; // Safety check
    }

    el.innerHTML = "";

    // Auth check - if not authenticated, the error state should already be rendered by init()
    if (!isAuthenticated) {
      el.innerHTML = renderErrorState();
      return;
    }

    // If step 0 (contact form), render only contact form without step progress
    if (state.step === 0) {
      el.innerHTML = `
        <div class="slotted-content-container slotted-contact-only">
          ${renderContactStep()}
        </div>
      `;
    } else {
      // Render RFP flow with step progress
      el.innerHTML = `
        <div class="slotted-step-progress-container">
          ${renderStepProgress()}
        </div>
        <div class="slotted-content-container">
          ${renderOutboundProfileStep()}
          ${renderInboundProfileStep()}
          ${renderFinalReviewStep()}
        </div>
        ${renderNavigationButtons(state.step)}
      `;
    }

    applyTheme();
    bindEvents();
  }

  // Update weight section based on selected shipment types
  function updateWeightSection() {
    const weightSection = document.getElementById("slotted-weight-section");
    const weightInputs = document.getElementById("slotted-weight-inputs");

    if (!weightSection || !weightInputs) return;

    const shipmentTypes = [
      { id: "slotted-dtc-parcel", label: "DTC (Parcel)", key: "dtcParcel" },
      {
        id: "slotted-retail-cases",
        label: "Retail (Cases)",
        key: "retailCases",
      },
      {
        id: "slotted-retail-pallets",
        label: "Retail (Pallet)",
        key: "retailPallet",
      },
      {
        id: "slotted-marketplace-cases",
        label: "MarketPlace (Cases)",
        key: "marketplaceCases",
      },
      {
        id: "slotted-marketplace-pallets",
        label: "MarketPlace (Pallet)",
        key: "marketplacePallet",
      },
    ];

    const selectedTypes = shipmentTypes.filter((type) => {
      const checkbox = document.getElementById(type.id);
      return checkbox && checkbox.checked;
    });

    if (selectedTypes.length > 0) {
      weightSection.style.display = "block";

      weightInputs.innerHTML = selectedTypes
        .map(
          (type) => `
        <div class="slotted-weight-input-row">
          <label class="slotted-weight-label">${type.label}:</label>
          <div class="slotted-weight-controls">
            <input 
              type="number" 
              id="slotted-weight-${type.key}" 
              class="slotted-weight-value" 
              placeholder="50"
              value="${state.outbound_profile[type.key + "Value"] || ""}"
              min="0" 
              step="0.1"
            />
            <select 
              id="slotted-unit-${type.key}" 
              class="slotted-weight-unit"
            >
              <option value="oz" ${
                state.outbound_profile[type.key + "Unit"] === "oz"
                  ? "selected"
                  : ""
              }>oz</option>
              <option value="lbs" ${
                state.outbound_profile[type.key + "Unit"] === "lbs"
                  ? "selected"
                  : ""
              }>lbs</option>
              <option value="kg" ${
                state.outbound_profile[type.key + "Unit"] === "kg"
                  ? "selected"
                  : ""
              }>kg</option>
            </select>
          </div>
        </div>
      `
        )
        .join("");

      // Bind change events to weight inputs
      selectedTypes.forEach((type) => {
        const weightInput = document.getElementById(
          `slotted-weight-${type.key}`
        );
        const unitSelect = document.getElementById(`slotted-unit-${type.key}`);

        if (weightInput) {
          weightInput.onchange = function () {
            if (!state.outbound_profile) state.outbound_profile = {};
            state.outbound_profile[type.key + "Value"] =
              parseFloat(this.value) || 0;
            saveState();
          };
        }

        if (unitSelect) {
          unitSelect.onchange = function () {
            if (!state.outbound_profile) state.outbound_profile = {};
            state.outbound_profile[type.key + "Unit"] = this.value;
            saveState();
          };
        }
      });
    } else {
      weightSection.style.display = "none";
    }
  }

  // Fetch existing outbound profile data
  async function fetchOutboundProfile(leadId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/brand/volume/outbound-profile?leadId=${leadId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.data) {
          const profileData = result.data.data;

          // Map API data to state format
          const mappedData = {
            monthly_orders: profileData.monthlyOrders,
            avg_items: profileData.avgItemsPerOrder,
            avg_order_value: profileData.avgOrderValue,
            sku_count: profileData.numberOfSKUs,
            year1_best_growth: profileData.bestCaseGrowthYear1,
            year1_worst_growth: profileData.worstCaseGrowthYear1,
            year2_best_growth: profileData.bestCaseGrowthYear2,
            year2_worst_growth: profileData.worstCaseGrowthYear2,

            // Map fulfillment type back to form values
            fulfillment_method:
              profileData.fulfillmentType === "threePlProvider"
                ? "3pl"
                : profileData.fulfillmentType === "inHouseFulfillment"
                ? "inhouse"
                : profileData.fulfillmentType === "dropshipping"
                ? "dropship"
                : profileData.fulfillmentType === "notFulfillingYet"
                ? "not_yet"
                : "",

            start_month: profileData.shippingStartMonth
              ? String(profileData.shippingStartMonth)
              : null,
            start_year: profileData.shippingStartYear
              ? String(profileData.shippingStartYear)
              : null,
            contract_end_month: profileData.contractExpiryMonth
              ? String(profileData.contractExpiryMonth)
              : null,
            contract_end_year: profileData.contractExpiryYear
              ? String(profileData.contractExpiryYear)
              : null,
            current_provider: profileData.currentProvider,
            current_provider_name: (() => {
              // Try to get name from API first
              if (profileData.currentProviderRef?.name) {
                return profileData.currentProviderRef.name;
              }
              // Fallback to lookup from THREE_PL_PROVIDERS if we have provider ID
              if (profileData.currentProvider) {
                const provider = THREE_PL_PROVIDERS.find(
                  (p) => p.id === profileData.currentProvider
                );
                return provider?.name || "";
              }
              return "";
            })(),
            ship_from_location: profileData.shippingZip,
            seasonal_peaks:
              profileData.seasonalPeaks && profileData.seasonalPeaks.length > 0,
            seasonal_months: profileData.seasonalPeaks || [],
            single_sku_orders: profileData.isSingleSKU ? "yes" : "no",
            volume_distribution: profileData.percentEaches || 50,

            // Map typical order size back to checkboxes
            fits_in_hand:
              profileData.typicalOrderSize?.includes("Fits in your hand") ||
              false,
            fits_on_porch:
              profileData.typicalOrderSize?.includes("Fits on the porch") ||
              false,
            fits_in_mailbox:
              profileData.typicalOrderSize?.includes("Fits in your mailbox") ||
              false,
            needs_two_people:
              profileData.typicalOrderSize?.includes(
                "Needs two people to carry"
              ) || false,

            are_serialized: profileData.isSerialized ? "yes" : "no",
            hazardous_products: profileData.isHazardousProducts ? "yes" : "no",

            // Map shipment types back to checkboxes
            shipment_dtc_parcel:
              profileData.shipmentTypes?.includes("dtcParcelValue") || false,
            shipment_retail_cases:
              profileData.shipmentTypes?.includes("retailCasesValue") || false,
            shipment_retail_pallets:
              profileData.shipmentTypes?.includes("retailPalletValue") || false,
            shipment_marketplace_cases:
              profileData.shipmentTypes?.includes("marketplaceCasesValue") ||
              false,
            shipment_marketplace_pallets:
              profileData.shipmentTypes?.includes("marketplacePalletValue") ||
              false,

            // Map weight data
            dtcParcelValue: profileData.dtcParcelValue,
            dtcParcelUnit: profileData.dtcParcelUnit || "oz",
            retailCasesValue: profileData.retailCasesValue,
            retailCasesUnit: profileData.retailCasesUnit || "oz",
            retailPalletValue: profileData.retailPalletValue,
            retailPalletUnit: profileData.retailPalletUnit || "oz",
            marketplaceCasesValue: profileData.marketplaceCasesValue,
            marketplaceCasesUnit: profileData.marketplaceCasesUnit || "oz",
            marketplacePalletValue: profileData.marketplacePalletValue,
            marketplacePalletUnit: profileData.marketplacePalletUnit || "oz",

            // Map countries from short codes back to full names
            selected_countries: profileData.whereDoYouSell
              ? mapShortCodesToCountries(profileData.whereDoYouSell)
              : [],
          };

          // Update state with fetched data
          state.outbound_profile = { ...state.outbound_profile, ...mappedData };
          saveState();

          return true;
        }
      }
    } catch (error) {
      console.error("Error fetching outbound profile:", error);
    }
    return false;
  }

  // Helper function to map short codes back to country names
  function mapShortCodesToCountries(shortCodes) {
    if (!shortCodes || !Array.isArray(shortCodes)) return [];

    return shortCodes
      .map((shortCode) => {
        const country = COUNTRY_CODES.find((c) => c.shortCode === shortCode);
        return country ? country.name : null;
      })
      .filter(Boolean);
  }

  // Fetch existing inbound profile data
  async function fetchInboundProfile(leadId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/brand/volume/inbound-profile?leadId=${leadId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.data) {
          const profileData = result.data.data;

          // Map API data to state format
          const mappedData = {
            inbound_frequency: profileData.inventoryFrequency?.toLowerCase(),
            storage_type: profileData.storageType,
            avg_pallets: profileData.averagePalletsPerMonth,
            return_rate: profileData.averageReturnRate,
            single_sku_case: profileData.isSingleSkuPerCase,
            case_barcoding: profileData.hasCaseLevelBarcoding,

            // Map inbound formats to checkboxes
            palletized:
              profileData.inboundFormats?.includes("Palletized") || false,
            floor_loaded:
              profileData.inboundFormats?.includes("Floor Loaded") || false,
            parcel: profileData.inboundFormats?.includes("Parcels") || false,

            dataLoaded: true,
            hasExistingData: true,
          };

          // Update state with fetched data
          state.inbound_profile = {
            ...state.inbound_profile,
            ...mappedData,
          };

          return true;
        } else {
          // No data found, set flag to indicate no existing data
          state.inbound_profile = {
            ...state.inbound_profile,
            dataLoaded: true,
            hasExistingData: false,
          };
          return false;
        }
      }
    } catch (error) {
      console.error("Error fetching inbound profile:", error);
    }
    return false;
  }

  // Form validation helper functions
  function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (input) {
      input.classList.add("slotted-input-error");
    }

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("show");
    }
  }

  function hideFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (input) {
      input.classList.remove("slotted-input-error");
    }

    if (errorElement) {
      errorElement.classList.remove("show");
    }
  }

  function validateContactForm() {
    let isValid = true;

    // Clear all previous errors
    [
      "slotted-name",
      "slotted-email",
      "slotted-company",
      "slotted-website",
      "slotted-gdpr",
    ].forEach((fieldId) => {
      hideFieldError(fieldId);
    });

    // Clear reCAPTCHA error
    const recaptchaError = document.getElementById("slotted-recaptcha-error");
    if (recaptchaError) {
      recaptchaError.style.display = "none";
    }

    // Validate Name
    const name = document.getElementById("slotted-name").value.trim();
    if (!name) {
      showFieldError("slotted-name", "Name is required");
      isValid = false;
    }

    // Validate Email
    const email = document.getElementById("slotted-email").value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showFieldError("slotted-email", "Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showFieldError("slotted-email", "Please enter a valid email address");
      isValid = false;
    }

    // Validate Company
    const company = document.getElementById("slotted-company").value.trim();
    if (!company) {
      showFieldError("slotted-company", "Company is required");
      isValid = false;
    }

    // Validate Website URL
    const website = document.getElementById("slotted-website").value.trim();
    if (!website) {
      showFieldError("slotted-website", "Website URL is required");
      isValid = false;
    } else {
      try {
        new URL(website.startsWith("http") ? website : `https://${website}`);
      } catch {
        showFieldError("slotted-website", "Please enter a valid website URL");
        isValid = false;
      }
    }

    // Validate GDPR consent
    const gdpr = document.getElementById("slotted-gdpr").checked;
    if (!gdpr) {
      showFieldError(
        "slotted-gdpr",
        "You must consent to data processing to continue"
      );
      isValid = false;
    }

    // Validate reCAPTCHA
    if (!validateRecaptcha()) {
      if (recaptchaError) {
        recaptchaError.textContent =
          "Please complete the reCAPTCHA verification";
        recaptchaError.style.display = "block";
      }
      isValid = false;
    }

    return isValid;
  }

  function validateOutboundProfile() {
    let isValid = true;

    // Clear all previous errors
    [
      "slotted-monthly-orders",
      "slotted-avg-items",
      "slotted-avg-order-value",
      "slotted-sku-count",
    ].forEach((fieldId) => {
      hideFieldError(fieldId);
    });

    // Validate Monthly Orders
    const monthlyOrders = document
      .getElementById("slotted-monthly-orders")
      .value.trim();
    if (!monthlyOrders) {
      showFieldError("slotted-monthly-orders", "Monthly orders is required");
      isValid = false;
    } else if (isNaN(monthlyOrders) || parseInt(monthlyOrders) <= 0) {
      showFieldError(
        "slotted-monthly-orders",
        "Please enter a valid number greater than 0"
      );
      isValid = false;
    }

    // Validate Avg Items/Order
    const avgItems = document.getElementById("slotted-avg-items").value.trim();
    if (!avgItems) {
      showFieldError(
        "slotted-avg-items",
        "Average items per order is required"
      );
      isValid = false;
    } else if (isNaN(avgItems) || parseFloat(avgItems) <= 0) {
      showFieldError(
        "slotted-avg-items",
        "Please enter a valid number greater than 0"
      );
      isValid = false;
    }

    // Validate Avg Order Value
    const avgOrderValue = document
      .getElementById("slotted-avg-order-value")
      .value.trim();
    if (!avgOrderValue) {
      showFieldError(
        "slotted-avg-order-value",
        "Average order value is required"
      );
      isValid = false;
    } else if (isNaN(avgOrderValue) || parseFloat(avgOrderValue) <= 0) {
      showFieldError(
        "slotted-avg-order-value",
        "Please enter a valid amount greater than 0"
      );
      isValid = false;
    }

    // Validate SKU Count
    const skuCount = document.getElementById("slotted-sku-count").value.trim();
    if (!skuCount) {
      showFieldError("slotted-sku-count", "Number of SKUs is required");
      isValid = false;
    } else if (isNaN(skuCount) || parseInt(skuCount) <= 0) {
      showFieldError(
        "slotted-sku-count",
        "Please enter a valid number greater than 0"
      );
      isValid = false;
    }

    // Validate selected countries
    const hasSelectedCountries =
      state.outbound_profile?.selected_countries &&
      state.outbound_profile.selected_countries.length > 0;
    if (!hasSelectedCountries) {
      // For country selection, we'll show an alert since it's not a simple input field
      alert("Please select at least one country where you sell.");
      isValid = false;
    }

    // Validate serialized products selection (required field)
    const serializedYes = document.getElementById(
      "slotted-serialized-yes"
    )?.checked;
    const serializedNo = document.getElementById(
      "slotted-serialized-no"
    )?.checked;
    const areSerializedSelected = serializedYes || serializedNo;

    if (!areSerializedSelected) {
      alert("Please specify if your products are serialized.");
      isValid = false;
    }

    // Validate growth expectations - check if any growth error elements are visible
    const growthErrorIds = [
      "slotted-year1-best-error",
      "slotted-year1-worst-error",
      "slotted-year2-best-error",
      "slotted-year2-worst-error",
    ];

    const hasGrowthErrors = growthErrorIds.some((errorId) => {
      const errorElement = document.getElementById(errorId);
      return (
        errorElement &&
        errorElement.style.display !== "none" &&
        errorElement.textContent.trim() !== ""
      );
    });

    if (hasGrowthErrors) {
      isValid = false;
    }

    return isValid;
  }

  // 3PL Provider search and selection functions
  function filterProviders(query) {
    if (!query || query.length < 1) return [];

    const searchQuery = query.toLowerCase();
    const filtered = THREE_PL_PROVIDERS.filter((provider) =>
      provider.name.toLowerCase().includes(searchQuery)
    );

    // Sort results: exact matches first, then starts with, then contains
    filtered.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // Exact match
      if (aName === searchQuery) return -1;
      if (bName === searchQuery) return 1;

      // Starts with
      if (aName.startsWith(searchQuery) && !bName.startsWith(searchQuery))
        return -1;
      if (bName.startsWith(searchQuery) && !aName.startsWith(searchQuery))
        return 1;

      // Alphabetical order for similar matches
      return aName.localeCompare(bName);
    });

    return filtered.slice(0, 8); // Limit to 8 results
  }

  function toggle3PLCard() {
    const card = document.getElementById("slotted-3pl-provider-card");
    const fulfillmentRadio = document.querySelector(
      'input[name="fulfillment"]:checked'
    );

    if (card && fulfillmentRadio) {
      if (fulfillmentRadio.value === "3pl") {
        card.classList.remove("slotted-3pl-card-hidden");
        card.classList.add("slotted-3pl-card-visible");
      } else {
        card.classList.remove("slotted-3pl-card-visible");
        card.classList.add("slotted-3pl-card-hidden");
        // Clear 3PL data when not selected
        state.outbound_profile.current_provider = null;
        state.outbound_profile.current_provider_name = "";
        state.outbound_profile.contract_end_month = null;
        state.outbound_profile.contract_end_year = null;
      }
    }
  }

  // Events
  // Growth calculation functions
  function updateGrowthCalculations() {
    const currentOrders = parseInt(state.outbound_profile.monthly_orders) || 0;

    // Update Year 1 calculations
    updateGrowthDetail("slotted-year1-best-growth", currentOrders);
    updateGrowthDetail("slotted-year1-worst-growth", currentOrders);

    // Update Year 2 calculations (based on Year 1 results)
    const year1Best =
      parseFloat(document.getElementById("slotted-year1-best-growth")?.value) ||
      0;
    const year1Worst =
      parseFloat(
        document.getElementById("slotted-year1-worst-growth")?.value
      ) || 0;

    const year1BestOrders = Math.round(currentOrders * (1 + year1Best / 100));
    const year1WorstOrders = Math.round(currentOrders * (1 + year1Worst / 100));

    updateGrowthDetail("slotted-year2-best-growth", year1BestOrders);
    updateGrowthDetail("slotted-year2-worst-growth", year1WorstOrders);
  }

  function updateGrowthDetail(inputId, baseOrders) {
    const input = document.getElementById(inputId);
    const card = input?.closest(".slotted-growth-card");
    const detailElement = card?.querySelector(".slotted-growth-detail");

    if (input && detailElement && baseOrders > 0) {
      const growthPercent = parseFloat(input.value) || 0;
      const projectedOrders = Math.round(
        baseOrders * (1 + growthPercent / 100)
      );
      detailElement.textContent = `~${projectedOrders.toLocaleString()} orders/month`;
    } else if (detailElement) {
      detailElement.textContent = "~0 orders/month";
    }
  }

  function updateGrowthCardStyling(input) {
    const card = input.closest(".slotted-growth-card");
    const value = parseFloat(input.value);

    if (!card || isNaN(value)) {
      // Reset to default styling if no value
      card?.classList.remove(
        "slotted-growth-positive",
        "slotted-growth-negative"
      );
      return;
    }

    // Remove existing dynamic classes
    card.classList.remove("slotted-growth-positive", "slotted-growth-negative");

    // Add appropriate class based on value
    if (value > 0) {
      card.classList.add("slotted-growth-positive");
    } else if (value < 0) {
      card.classList.add("slotted-growth-negative");
    }
  }

  // Growth validation functions
  function validateGrowthInput(inputId, skipPairValidation = false) {
    const input = document.getElementById(inputId);
    const value = parseFloat(input.value);

    if (isNaN(value) || input.value.trim() === "") {
      hideGrowthError(inputId);
      return true;
    }

    let isValid = true;
    let errorMessage = "";

    // Determine the year and type
    const isBestCase = inputId.includes("best");
    const isYear1 = inputId.includes("year1");

    if (isBestCase) {
      // Best case validation
      const worstInputId = isYear1
        ? "slotted-year1-worst-growth"
        : "slotted-year2-worst-growth";
      const worstInput = document.getElementById(worstInputId);
      const worstValue = parseFloat(worstInput.value);

      if (
        !isNaN(worstValue) &&
        worstInput.value.trim() !== "" &&
        value < worstValue
      ) {
        isValid = false;
        errorMessage = "Best case growth cannot be less than worst case growth";
      }
    } else {
      // Worst case validation
      const bestInputId = isYear1
        ? "slotted-year1-best-growth"
        : "slotted-year2-best-growth";
      const bestInput = document.getElementById(bestInputId);
      const bestValue = parseFloat(bestInput.value);

      if (
        !isNaN(bestValue) &&
        bestInput.value.trim() !== "" &&
        value > bestValue
      ) {
        isValid = false;
        errorMessage =
          "Worst case growth cannot be greater than best case growth";
      }
    }

    if (isValid) {
      hideGrowthError(inputId);

      // Also validate the paired input to clear any errors there, but prevent infinite recursion
      if (!skipPairValidation) {
        const pairedInputId = isBestCase
          ? isYear1
            ? "slotted-year1-worst-growth"
            : "slotted-year2-worst-growth"
          : isYear1
          ? "slotted-year1-best-growth"
          : "slotted-year2-best-growth";
        validateGrowthInput(pairedInputId, true);
      }
    } else {
      showGrowthError(inputId, errorMessage);
    }

    return isValid;
  }

  function showGrowthError(inputId, message) {
    const errorId = inputId.replace("-growth", "-error");
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  function hideGrowthError(inputId) {
    const errorId = inputId.replace("-growth", "-error");
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.style.display = "none";
      errorElement.textContent = "";
    }
  }

  function bindEvents() {
    if (state.step === 0) {
      // Handle form submission
      const contactForm = document.getElementById("slotted-contact-form");
      if (contactForm) {
        contactForm.onsubmit = function (e) {
          e.preventDefault();
          handleContactSubmit();
        };
      }

      // Add real-time validation for form fields
      const requiredFields = [
        "slotted-name",
        "slotted-email",
        "slotted-company",
        "slotted-website",
      ];
      requiredFields.forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        if (input) {
          // Clear error on input
          input.addEventListener("input", () => {
            hideFieldError(fieldId);
          });

          // Validate on blur
          input.addEventListener("blur", () => {
            const value = input.value.trim();
            if (!value) {
              const fieldName = input.previousElementSibling.textContent
                .replace("*", "")
                .trim();
              showFieldError(fieldId, `${fieldName} is required`);
            } else if (fieldId === "slotted-email") {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                showFieldError(fieldId, "Please enter a valid email address");
              }
            } else if (fieldId === "slotted-website") {
              try {
                new URL(value.startsWith("http") ? value : `https://${value}`);
              } catch {
                showFieldError(fieldId, "Please enter a valid website URL");
              }
            }
          });
        }
      });

      // Handle GDPR checkbox
      const gdprCheckbox = document.getElementById("slotted-gdpr");
      if (gdprCheckbox) {
        gdprCheckbox.addEventListener("change", () => {
          if (gdprCheckbox.checked) {
            hideFieldError("slotted-gdpr");
          }
        });
      }

      // Initialize reCAPTCHA when contact form is shown
      setTimeout(() => {
        initializeRecaptcha();
      }, 100);
    }
    if (state.step === 1) {
      // Fetch existing outbound profile data if available
      if (state.lead_id && !state.outbound_profile?.dataLoaded) {
        fetchOutboundProfile(state.lead_id).then((loaded) => {
          if (loaded) {
            state.outbound_profile.dataLoaded = true;
            render(); // Re-render to populate form with fetched data
          }
        });
      }

      // New navigation buttons
      const nextBtn = document.getElementById("slotted-next-step-1");
      if (nextBtn) nextBtn.onclick = handleOutboundProfileSubmit;

      // Previous button is disabled in step 1, no need to bind

      // Bind optional toggle
      const optionalToggle = document.getElementById("slotted-optional-toggle");
      const optionalContent = document.getElementById(
        "slotted-optional-content"
      );
      if (optionalToggle && optionalContent) {
        optionalToggle.onclick = function () {
          const isExpanded = !optionalContent.classList.contains(
            "slotted-optional-hidden"
          );
          if (isExpanded) {
            optionalContent.classList.add("slotted-optional-hidden");
            optionalToggle.classList.remove("expanded");
            optionalToggle.querySelector("span:first-child").textContent =
              "Show Optional Information";
          } else {
            optionalContent.classList.remove("slotted-optional-hidden");
            optionalToggle.classList.add("expanded");
            optionalToggle.querySelector("span:first-child").textContent =
              "Hide Optional Information";
          }
        };
      }

      // Bind monthly orders input to update Current Monthly Orders display and growth calculations
      const monthlyOrdersInput = document.getElementById(
        "slotted-monthly-orders"
      );
      const currentOrdersDisplay = document.getElementById(
        "slotted-current-orders-display"
      );
      if (monthlyOrdersInput && currentOrdersDisplay) {
        monthlyOrdersInput.oninput = function () {
          const value = this.value.trim();
          currentOrdersDisplay.textContent = value || "0";
          state.outbound_profile.monthly_orders = value;
          updateGrowthCalculations();
          saveState();
        };
      }

      // Bind growth input fields to update calculations and styling
      const growthInputs = [
        "slotted-year1-best-growth",
        "slotted-year1-worst-growth",
        "slotted-year2-best-growth",
        "slotted-year2-worst-growth",
      ];

      growthInputs.forEach((inputId) => {
        const input = document.getElementById(inputId);
        if (input) {
          input.oninput = function () {
            // Map input ID to state field name
            const fieldMappings = {
              "slotted-year1-best-growth": "year1_best_growth",
              "slotted-year1-worst-growth": "year1_worst_growth",
              "slotted-year2-best-growth": "year2_best_growth",
              "slotted-year2-worst-growth": "year2_worst_growth",
            };

            const field = fieldMappings[inputId];
            if (field) {
              state.outbound_profile[field] = this.value;
            }

            // Validate input
            validateGrowthInput(inputId);

            updateGrowthCalculations();
            updateGrowthCardStyling(this);
            saveState();
          };

          // Initialize styling and validation for existing values
          if (input.value) {
            updateGrowthCardStyling(input);
            validateGrowthInput(inputId);
          }
        }
      });

      // Initialize growth calculations on load
      updateGrowthCalculations();

      // Bind range slider update
      const volumeRange = document.getElementById(
        "slotted-volume-distribution"
      );
      if (volumeRange) {
        // Function to update labels and fill
        const updateVolumeSlider = () => {
          const eachesPercent = parseInt(volumeRange.value);
          const casesPalletPercent = 100 - eachesPercent;

          // Update labels
          const eachesLabel = document.getElementById("slotted-eaches-label");
          const caseLabel = document.getElementById("slotted-case-label");
          if (eachesLabel && caseLabel) {
            eachesLabel.textContent = `${eachesPercent}% Eaches`;
            caseLabel.textContent = `${casesPalletPercent}% Case/Pallet`;
          }

          // Update blue fill
          const fillElement = document.getElementById("slotted-volume-fill");
          if (fillElement) {
            fillElement.style.width = `${eachesPercent}%`;
          }

          // Update state
          state.outbound_profile.volume_distribution = eachesPercent;
          saveState();
        };

        // Update on input (while dragging)
        volumeRange.oninput = updateVolumeSlider;

        // Update on change (when finished dragging)
        volumeRange.onchange = updateVolumeSlider;

        // Update immediately when binding (for loaded data)
        updateVolumeSlider();
      }

      // Bind fulfillment method radio changes
      const fulfillmentRadios = document.querySelectorAll(
        'input[name="fulfillment"]'
      );
      fulfillmentRadios.forEach((radio) => {
        radio.addEventListener("change", function () {
          state.outbound_profile.fulfillment_method = this.value;
          toggle3PLCard();
          saveState();
        });
      });

      // Bind 3PL provider search functionality
      const providerSearchInput = document.getElementById(
        "slotted-current-provider-search"
      );
      const providerDropdown = document.getElementById(
        "slotted-provider-dropdown"
      );

      if (providerSearchInput && providerDropdown) {
        let searchTimeout;

        // Search input functionality
        providerSearchInput.addEventListener("input", function () {
          const searchTerm = this.value.trim();

          // Clear existing timeout
          if (searchTimeout) {
            clearTimeout(searchTimeout);
          }

          // Show dropdown when typing
          if (searchTerm.length > 0 || this === document.activeElement) {
            providerDropdown.style.display = "block";
            updateProviderDropdown(); // Show current results immediately
          }

          // Debounce search API calls
          searchTimeout = setTimeout(() => {
            if (searchTerm.length >= 2 || searchTerm.length === 0) {
              searchProviders(searchTerm);
            }
          }, 300);
        });

        // Show dropdown on focus
        providerSearchInput.addEventListener("focus", function () {
          providerDropdown.style.display = "block";

          // Load initial data if not loaded yet
          if (THREE_PL_PROVIDERS.length === 0 && !providersLoading) {
            fetchThreePLProviders("", 1, 20, false).then(() => {
              updateProviderDropdown();
            });
          } else {
            updateProviderDropdown();
          }
        });

        // Hide dropdown when clicking outside
        document.addEventListener("click", function (e) {
          if (
            !providerSearchInput.contains(e.target) &&
            !providerDropdown.contains(e.target)
          ) {
            providerDropdown.style.display = "none";
          }
        });
      }

      // Bind contract end date selects
      const contractMonthSelect = document.getElementById(
        "slotted-contract-end-month"
      );
      const contractYearSelect = document.getElementById(
        "slotted-contract-end-year"
      );

      if (contractMonthSelect) {
        contractMonthSelect.addEventListener("change", function () {
          state.outbound_profile.contract_end_month = this.value;
          saveState();
        });
      }

      if (contractYearSelect) {
        contractYearSelect.addEventListener("change", function () {
          state.outbound_profile.contract_end_year = this.value;
          saveState();
        });
      } // Add real-time validation for Critical Volume Metrics fields
      const criticalFields = [
        "slotted-monthly-orders",
        "slotted-avg-items",
        "slotted-avg-order-value",
        "slotted-sku-count",
      ];
      criticalFields.forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        if (input) {
          // Clear error on input
          input.addEventListener("input", () => {
            hideFieldError(fieldId);
          });

          // Validate on blur
          input.addEventListener("blur", () => {
            const value = input.value.trim();
            if (!value) {
              const fieldName = input.previousElementSibling.textContent
                .replace("*", "")
                .trim();
              showFieldError(fieldId, `${fieldName} is required`);
            } else if (isNaN(value) || parseFloat(value) <= 0) {
              showFieldError(
                fieldId,
                "Please enter a valid number greater than 0"
              );
            }
          });
        }
      });

      // Bind country search functionality
      const sellLocationInput = document.getElementById(
        "slotted-sell-location"
      );
      const countryDropdown = document.getElementById(
        "slotted-country-dropdown"
      );

      if (sellLocationInput && countryDropdown) {
        // Initialize selected countries array if not exists
        if (!state.outbound_profile.selected_countries) {
          state.outbound_profile.selected_countries = [];
        }

        // Remove old event handlers - using new filterCountryDropdown system instead
        // The HTML oninput="filterCountryDropdown(this.value)" will handle search
        // Note: Removed onblur handler as it was interfering with multiselect functionality
        // The global click outside handler will manage dropdown closing
      }

      // Add click outside handler for multiselect dropdown
      document.addEventListener("click", function (e) {
        const multiselectContainer = document.querySelector(
          ".slotted-multiselect-container"
        );
        const dropdown = document.getElementById("slotted-country-dropdown");
        const arrow = document.getElementById("slotted-dropdown-arrow");
        const searchInput = document.getElementById("slotted-sell-location");

        if (
          multiselectContainer &&
          dropdown &&
          arrow &&
          !multiselectContainer.contains(e.target)
        ) {
          dropdown.style.display = "none";
          arrow.textContent = "▼";
          // Clear search and reset options when clicking outside
          if (searchInput) {
            searchInput.value = "";
            const countryOptions = document.getElementById(
              "slotted-country-options"
            );
            if (countryOptions) {
              countryOptions.innerHTML = renderCountryOptions();
            }
          }
        }
      });

      // Bind seasonal peaks functionality
      const seasonalPeaksCheckbox = document.getElementById(
        "slotted-seasonal-peaks"
      );
      const seasonalMonthsContainer = document.getElementById(
        "slotted-seasonal-months"
      );

      if (seasonalPeaksCheckbox && seasonalMonthsContainer) {
        seasonalPeaksCheckbox.onchange = function () {
          if (this.checked) {
            seasonalMonthsContainer.style.display = "block";
            state.outbound_profile.seasonal_peaks = true;
          } else {
            seasonalMonthsContainer.style.display = "none";
            state.outbound_profile.seasonal_peaks = false;
            state.outbound_profile.seasonal_months = [];
            // Uncheck all month checkboxes
            const monthCheckboxes = seasonalMonthsContainer.querySelectorAll(
              'input[type="checkbox"]'
            );
            monthCheckboxes.forEach((checkbox) => (checkbox.checked = false));
          }
          saveState();
        };

        // Bind month checkboxes
        const monthCheckboxes = seasonalMonthsContainer.querySelectorAll(
          'input[type="checkbox"]'
        );
        monthCheckboxes.forEach((checkbox) => {
          checkbox.onchange = function () {
            if (!state.outbound_profile.seasonal_months) {
              state.outbound_profile.seasonal_months = [];
            }

            const monthValue = parseInt(this.value);
            if (this.checked) {
              if (
                !state.outbound_profile.seasonal_months.includes(monthValue)
              ) {
                state.outbound_profile.seasonal_months.push(monthValue);
              }
            } else {
              const index =
                state.outbound_profile.seasonal_months.indexOf(monthValue);
              if (index > -1) {
                state.outbound_profile.seasonal_months.splice(index, 1);
              }
            }
            saveState();
          };
        });
      }

      // Bind shipment type checkboxes to show/hide weight section
      const shipmentCheckboxes = [
        "slotted-dtc-parcel",
        "slotted-retail-cases",
        "slotted-retail-pallets",
        "slotted-marketplace-cases",
        "slotted-marketplace-pallets",
      ];

      shipmentCheckboxes.forEach((id) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
          checkbox.onchange = function () {
            updateWeightSection();
            saveState();
          };
        }
      });

      // Initialize weight section on page load
      updateWeightSection();
    }
    if (state.step === 2) {
      // Fetch existing inbound profile data if available
      if (state.lead_id && !state.inbound_profile?.dataLoaded) {
        fetchInboundProfile(state.lead_id).then((loaded) => {
          if (loaded) {
            state.inbound_profile.dataLoaded = true;
            render(); // Re-render to populate form with fetched data
          }
        });
      }

      // New navigation buttons
      const nextBtn = document.getElementById("slotted-next-step-2");
      if (nextBtn) nextBtn.onclick = handleInboundProfileSubmit;

      const backBtn = document.getElementById("slotted-back-step-2");
      if (backBtn) backBtn.onclick = handleBackToOutbound;

      // Keep the centered button for now
      const inboundNextCenteredBtn = document.getElementById(
        "slotted-inbound-next-centered"
      );
      if (inboundNextCenteredBtn)
        inboundNextCenteredBtn.onclick = handleInboundProfileSubmit;

      // Bind inbound optional toggle
      const optionalToggle = document.getElementById(
        "slotted-inbound-optional-toggle"
      );
      const optionalContent = document.getElementById(
        "slotted-inbound-optional-content"
      );
      if (optionalToggle && optionalContent) {
        optionalToggle.onclick = function () {
          const isExpanded = !optionalContent.classList.contains(
            "slotted-optional-hidden"
          );
          if (isExpanded) {
            optionalContent.classList.add("slotted-optional-hidden");
            optionalToggle.classList.remove("expanded");
            optionalToggle.querySelector(".slotted-toggle-text").textContent =
              "(Show)";
          } else {
            optionalContent.classList.remove("slotted-optional-hidden");
            optionalToggle.classList.add("expanded");
            optionalToggle.querySelector(".slotted-toggle-text").textContent =
              "(Hide)";
          }
        };
      }
    }
    if (state.step === 3) {
      // Fetch existing outbound profile data if available and not already loaded
      if (state.lead_id && !state.outbound_profile?.dataLoaded) {
        fetchOutboundProfile(state.lead_id).then((loaded) => {
          if (loaded) {
            state.outbound_profile.dataLoaded = true;
            render(); // Re-render to show the updated data
          }
        });
      }

      // New navigation buttons
      const submitBtn = document.getElementById("slotted-submit-final");
      if (submitBtn) submitBtn.onclick = handleFinalSubmit;

      const backBtn = document.getElementById("slotted-back-step-3");
      if (backBtn) backBtn.onclick = handleBackToInbound;

      // Edit buttons
      const editOutboundBtn = document.getElementById("slotted-edit-outbound");
      if (editOutboundBtn) editOutboundBtn.onclick = handleEditOutbound;

      const editInboundBtn = document.getElementById("slotted-edit-inbound");
      if (editInboundBtn) editInboundBtn.onclick = handleEditInbound;
    }
  }

  function handleBackToOutbound() {
    state = {
      ...state,
      step: 1, // Previous to outbound profile
    };
    saveState();
    render();
  }

  function handleBackToInbound() {
    state = {
      ...state,
      step: 2, // Previous to inbound profile
    };
    saveState();
    render();
  }

  // Edit button handlers
  function handleEditOutbound() {
    state = {
      ...state,
      step: 1, // Go to outbound profile step
    };
    saveState();
    render();
  }

  function handleEditInbound() {
    state = {
      ...state,
      step: 2, // Go to inbound profile step
    };
    saveState();
    render();
  }

  // Step 1 handler - Contact Info
  async function handleContactSubmit() {
    // Validate the form first
    if (!validateContactForm()) {
      return; // Stop if validation fails
    }

    const name = document.getElementById("slotted-name").value.trim();
    const email = document.getElementById("slotted-email").value.trim();
    const company = document.getElementById("slotted-company").value.trim();
    const website_url = document.getElementById("slotted-website").value.trim();
    const phone = document.getElementById("slotted-phone").value.trim();
    const countryCode = document.getElementById("slotted-country-code").value;
    const gdpr = document.getElementById("slotted-gdpr").checked;

    // API integration for contact form
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/three-pl/lead/provider-lead-contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            widgetKey: PROVIDER_WIDGET_KEY,
            name,
            email,
            company,
            website: website_url,
            phone,
            countryCode: countryCode,
          }),
        }
      );
      const contactResponse = await response.json();
      if (!response.ok) {
        alert(
          contactResponse.message ||
            "Failed to submit contact form. Please try again."
        );
        return;
      }

      // Use returned lead_id if available, else fallback
      let lead_id = contactResponse.data.leadContactId;
      let status = contactResponse.data.status;
      state = {
        ...state,
        step: 1, // Start RFP flow with step 1 (Outbound Profile)
        lead_id,
        contact: { name, email, company, website_url, phone, countryCode },
        status,
      };
      saveState();
      render(); // The render function will auto-detect the correct container
    } catch (err) {
      alert("Network error. Please try again later.");
      console.error(err);
    }
  }

  // Step 2 handler - Outbound Profile
  async function handleOutboundProfileSubmit() {
    const buttonId = "slotted-next-step-1";
    // Show loading spinner
    if (!showButtonLoading(buttonId, "Saving...")) return;

    try {
      // Validate the outbound profile form first
      if (!validateOutboundProfile()) {
        hideButtonLoading(buttonId);
        return; // Stop if validation fails
      }

      const monthly_orders = document
        .getElementById("slotted-monthly-orders")
        .value.trim();
      const avg_items = document
        .getElementById("slotted-avg-items")
        .value.trim();
      const avg_order_value = document
        .getElementById("slotted-avg-order-value")
        .value.trim();
      const sku_count = document
        .getElementById("slotted-sku-count")
        .value.trim();
      const sell_location = document
        .getElementById("slotted-sell-location")
        .value.trim();

      // Growth expectations
      const year1_best_growth = document
        .getElementById("slotted-year1-best-growth")
        .value.trim();
      const year1_worst_growth = document
        .getElementById("slotted-year1-worst-growth")
        .value.trim();
      const year2_best_growth = document
        .getElementById("slotted-year2-best-growth")
        .value.trim();
      const year2_worst_growth = document
        .getElementById("slotted-year2-worst-growth")
        .value.trim();

      // Business context checkboxes and radios
      const fits_in_hand = document.getElementById("slotted-fits-hand").checked;
      const fits_in_mailbox = document.getElementById(
        "slotted-fits-mailbox"
      ).checked;
      const fits_on_porch =
        document.getElementById("slotted-fits-porch").checked;
      const needs_two_people = document.getElementById(
        "slotted-needs-two-people"
      ).checked;

      const serialized_yes = document.getElementById(
        "slotted-serialized-yes"
      ).checked;
      const serialized_no = document.getElementById(
        "slotted-serialized-no"
      ).checked;
      const are_serialized = serialized_yes ? "yes" : serialized_no ? "no" : "";

      const shipment_dtc_parcel =
        document.getElementById("slotted-dtc-parcel").checked;
      const shipment_retail_cases = document.getElementById(
        "slotted-retail-cases"
      ).checked;
      const shipment_retail_pallets = document.getElementById(
        "slotted-retail-pallets"
      ).checked;
      const shipment_marketplace_cases = document.getElementById(
        "slotted-marketplace-cases"
      ).checked;
      const shipment_marketplace_pallets = document.getElementById(
        "slotted-marketplace-pallets"
      ).checked;

      // Optional fields
      const fulfillment_inhouse = document.getElementById(
        "slotted-fulfill-inhouse"
      )?.checked;
      const fulfillment_3pl = document.getElementById(
        "slotted-fulfill-3pl"
      )?.checked;
      const fulfillment_dropship = document.getElementById(
        "slotted-fulfill-dropship"
      )?.checked;
      const fulfillment_notyet = document.getElementById(
        "slotted-fulfill-notyet"
      )?.checked;
      const fulfillment_method = fulfillment_inhouse
        ? "inhouse"
        : fulfillment_3pl
        ? "3pl"
        : fulfillment_dropship
        ? "dropship"
        : fulfillment_notyet
        ? "not_yet"
        : "";

      const start_month =
        document.getElementById("slotted-start-month")?.value || "";
      const start_year =
        document.getElementById("slotted-start-year")?.value || "";
      const ship_from_location =
        document.getElementById("slotted-ship-from")?.value?.trim() || "";
      const seasonal_peaks =
        document.getElementById("slotted-seasonal-peaks")?.checked || false;

      const single_sku_yes = document.getElementById(
        "slotted-single-sku-yes"
      )?.checked;
      const single_sku_no = document.getElementById(
        "slotted-single-sku-no"
      )?.checked;
      const single_sku_orders = single_sku_yes
        ? "yes"
        : single_sku_no
        ? "no"
        : "";

      const volume_distribution =
        document.getElementById("slotted-volume-distribution")?.value || 50;

      const hazardous_yes = document.getElementById(
        "slotted-hazardous-yes"
      )?.checked;
      const hazardous_no = document.getElementById(
        "slotted-hazardous-no"
      )?.checked;
      const hazardous_products = hazardous_yes
        ? "yes"
        : hazardous_no
        ? "no"
        : "";

      // Check if at least one shipment type is selected
      if (
        !shipment_dtc_parcel &&
        !shipment_retail_cases &&
        !shipment_retail_pallets &&
        !shipment_marketplace_cases &&
        !shipment_marketplace_pallets
      ) {
        alert("Please select at least one shipment type.");
        return;
      }

      // Prepare shipment types array with values
      const shipmentTypes = [];
      if (shipment_dtc_parcel) shipmentTypes.push("dtcParcelValue");
      if (shipment_retail_cases) shipmentTypes.push("retailCasesValue");
      if (shipment_retail_pallets) shipmentTypes.push("retailPalletValue");
      if (shipment_marketplace_cases)
        shipmentTypes.push("marketplaceCasesValue");
      if (shipment_marketplace_pallets)
        shipmentTypes.push("marketplacePalletValue");

      // Prepare typical order size array
      const typicalOrderSize = [];
      if (fits_in_hand) typicalOrderSize.push("Fits in your hand");
      if (fits_on_porch) typicalOrderSize.push("Fits on the porch");
      if (fits_in_mailbox) typicalOrderSize.push("Fits in your mailbox");
      if (needs_two_people) typicalOrderSize.push("Needs two people to carry");

      // Prepare seasonal peaks array (use selected months from state)
      const seasonalPeaksArray = [];
      if (seasonal_peaks && state.outbound_profile?.seasonal_months) {
        // Use the selected months from the checkboxes
        seasonalPeaksArray.push(...state.outbound_profile.seasonal_months);
      }

      // Get 3PL provider data if fulfillment method is 3pl
      const contract_end_month =
        document.getElementById("slotted-contract-end-month")?.value || "";
      const contract_end_year =
        document.getElementById("slotted-contract-end-year")?.value || "";

      // Prepare API payload
      const apiPayload = {
        monthlyOrders: parseInt(monthly_orders),
        avgItemsPerOrder: parseFloat(avg_items),
        avgOrderValue: parseFloat(avg_order_value),
        numberOfSKUs: parseInt(sku_count),
        bestCaseGrowthYear1: year1_best_growth
          ? parseInt(year1_best_growth)
          : null,
        worstCaseGrowthYear1: year1_worst_growth
          ? parseInt(year1_worst_growth)
          : null,
        bestCaseGrowthYear2: year2_best_growth
          ? parseInt(year2_best_growth)
          : null,
        worstCaseGrowthYear2: year2_worst_growth
          ? parseInt(year2_worst_growth)
          : null,
        fulfillmentType:
          fulfillment_method === "3pl"
            ? "threePlProvider"
            : fulfillment_method === "inhouse"
            ? "inHouseFulfillment"
            : fulfillment_method === "dropship"
            ? "dropshipping"
            : fulfillment_method === "not_yet"
            ? "notFulfillingYet"
            : null,
        // 3PL provider specific fields
        currentProvider:
          fulfillment_method === "3pl"
            ? state.outbound_profile?.current_provider
            : null,
        contractExpiryMonth:
          fulfillment_method === "3pl" && contract_end_month
            ? parseInt(contract_end_month)
            : null,
        contractExpiryYear:
          fulfillment_method === "3pl" && contract_end_year
            ? parseInt(contract_end_year)
            : null,
        shippingStartMonth: start_month ? parseInt(start_month) : null,
        shippingStartYear: start_year ? parseInt(start_year) : null,
        shippingZip: ship_from_location || null,
        seasonalPeaks: seasonalPeaksArray,
        isSingleSKU: single_sku_orders === "yes",
        typicalOrderSize: typicalOrderSize,
        isSerialized: are_serialized === "yes",
        isHazardousProducts: hazardous_products === "yes",
        shipmentTypes: shipmentTypes,
        percentEaches: parseInt(volume_distribution) || 50,
        percentCasePallet: 100 - (parseInt(volume_distribution) || 50),
        whereDoYouSell: getCountryShortCodes(
          state.outbound_profile?.selected_countries
        ),
        // Weight data for selected shipment types (include all, let backend handle nulls)
        dtcParcelValue: state.outbound_profile?.dtcParcelValue || null,
        dtcParcelUnit: state.outbound_profile?.dtcParcelUnit || null,
        retailCasesValue: state.outbound_profile?.retailCasesValue || null,
        retailCasesUnit: state.outbound_profile?.retailCasesUnit || null,
        retailPalletValue: state.outbound_profile?.retailPalletValue || null,
        retailPalletUnit: state.outbound_profile?.retailPalletUnit || null,
        marketplaceCasesValue:
          state.outbound_profile?.marketplaceCasesValue || null,
        marketplaceCasesUnit:
          state.outbound_profile?.marketplaceCasesUnit || null,
        marketplacePalletValue:
          state.outbound_profile?.marketplacePalletValue || null,
        marketplacePalletUnit:
          state.outbound_profile?.marketplacePalletUnit || null,
        leadContactId: state.lead_id,
      };

      // API integration for outbound profile
      // Determine if this is an update (PUT) or create (POST)
      const isUpdate = state.outbound_profile?.dataLoaded;
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(
        `${API_BASE_URL}/api/v1/brand/volume/outbound-profile`,
        {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
        }
      );

      const outboundResponse = await response.json();

      if (!response.ok) {
        alert(
          outboundResponse.message ||
            `Failed to ${
              isUpdate ? "update" : "submit"
            } outbound profile. Please try again.`
        );
        return;
      }

      // Update state with form data
      state = {
        ...state,
        step: 2, // Move to Inbound Profile
        outbound_profile: {
          monthly_orders: parseInt(monthly_orders),
          avg_items: parseFloat(avg_items),
          avg_order_value: parseFloat(avg_order_value),
          sku_count: parseInt(sku_count),
          sell_location:
            state.outbound_profile?.selected_countries?.join(", ") || "",
          selected_countries: state.outbound_profile?.selected_countries || [],
          current_monthly_orders: parseInt(monthly_orders), // Use monthly_orders as current
          year1_best_growth: year1_best_growth
            ? parseInt(year1_best_growth)
            : null,
          year1_worst_growth: year1_worst_growth
            ? parseInt(year1_worst_growth)
            : null,
          year2_best_growth: year2_best_growth
            ? parseInt(year2_best_growth)
            : null,
          year2_worst_growth: year2_worst_growth
            ? parseInt(year2_worst_growth)
            : null,
          fits_in_hand,
          fits_in_mailbox,
          fits_on_porch,
          needs_two_people,
          are_serialized,
          shipment_dtc_parcel,
          shipment_retail_cases,
          shipment_retail_pallets,
          shipment_marketplace_cases,
          shipment_marketplace_pallets,
          // Optional fields
          fulfillment_method,
          start_month,
          start_year,
          ship_from_location,
          seasonal_peaks,
          seasonal_months: state.outbound_profile?.seasonal_months || [],
          single_sku_orders,
          volume_distribution: parseInt(volume_distribution),
          hazardous_products,
          // API response data
          api_response: outboundResponse,
        },
      };

      saveState();
      render();

      // Show success state briefly
      showButtonSuccess(buttonId, "Saved!", 1000);
    } catch (err) {
      hideButtonLoading(buttonId);
      alert("Network error. Please try again later.");
      console.error("Outbound profile API error:", err);
    }
  }

  // Step 2 handler - Inbound Profile
  async function handleInboundProfileSubmit() {
    const buttonId = "slotted-next-step-2";

    // Show loading spinner
    if (!showButtonLoading(buttonId, "Saving...")) return;

    try {
      // Required fields
      const inbound_frequency_weekly = document.getElementById(
        "slotted-freq-weekly"
      ).checked;
      const inbound_frequency_monthly = document.getElementById(
        "slotted-freq-monthly"
      ).checked;
      const inbound_frequency_quarterly = document.getElementById(
        "slotted-freq-quarterly"
      ).checked;
      const inbound_frequency = inbound_frequency_weekly
        ? "weekly"
        : inbound_frequency_monthly
        ? "monthly"
        : inbound_frequency_quarterly
        ? "quarterly"
        : "";

      const storage_type = document
        .getElementById("slotted-storage-type")
        .value.trim();
      const avg_pallets = document
        .getElementById("slotted-avg-pallets")
        .value.trim();
      const return_rate = document
        .getElementById("slotted-return-rate")
        .value.trim();

      // Inbound shipment format
      const palletized = document.getElementById("slotted-palletized").checked;
      const floor_loaded = document.getElementById(
        "slotted-floor-loaded"
      ).checked;
      const parcel = document.getElementById("slotted-parcel").checked;

      // Optional fields
      const single_sku_case =
        document.getElementById("slotted-single-sku-case")?.checked || false;
      const case_barcoding =
        document.getElementById("slotted-case-barcoding")?.checked || false;

      // Validation
      if (!inbound_frequency || !storage_type || !avg_pallets || !return_rate) {
        hideButtonLoading(buttonId);
        alert("Please fill all required fields in the Inbound Profile.");
        return;
      }

      // Check if at least one shipment format is selected
      if (!palletized && !floor_loaded && !parcel) {
        hideButtonLoading(buttonId);
        alert("Please select at least one inbound shipment format.");
        return;
      }

      // Build inbound formats array
      const inboundFormats = [];
      if (palletized) inboundFormats.push("Palletized");
      if (floor_loaded) inboundFormats.push("Floor Loaded");
      if (parcel) inboundFormats.push("Parcels");

      // Prepare API payload
      const apiPayload = {
        inventoryFrequency: inbound_frequency.toUpperCase(),
        storageType: storage_type,
        averagePalletsPerMonth: parseInt(avg_pallets),
        inboundFormats: inboundFormats,
        averageReturnRate: parseFloat(return_rate),
        isSingleSkuPerCase: single_sku_case,
        hasCaseLevelBarcoding: case_barcoding,
        leadContactId: state.lead_id,
      };

      const isUpdate = state.inbound_profile?.hasExistingData;
      const method = isUpdate ? "PUT" : "POST";

      const response = await fetch(
        `${API_BASE_URL}/api/v1/brand/volume/inbound-profile`,
        {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
        }
      );

      const inboundResponse = await response.json();

      if (!response.ok) {
        hideButtonLoading(buttonId);
        alert(
          inboundResponse.message ||
            `Failed to ${
              isUpdate ? "update" : "submit"
            } inbound profile. Please try again.`
        );
        return;
      }

      // Update state with form data
      state = {
        ...state,
        step: 3, // Move to final review
        inbound_profile: {
          inbound_frequency,
          storage_type,
          avg_pallets: parseInt(avg_pallets),
          return_rate: parseFloat(return_rate),
          palletized,
          floor_loaded,
          parcel,
          // Optional fields
          single_sku_case,
          case_barcoding,
          // API response data
          api_response: inboundResponse,
          dataLoaded: true,
          hasExistingData: true,
        },
      };

      saveState();
      render();

      // Show success state briefly
      showButtonSuccess(buttonId, "Saved!", 1000);
    } catch (err) {
      hideButtonLoading(buttonId);
      alert("Network error. Please try again later.");
      console.error("Inbound profile API error:", err);
    }
  }

  // Step 3 handler - Final Submit
  async function handleFinalSubmit() {
    const buttonId = "slotted-submit-final";

    // Show loading spinner
    if (!showButtonLoading(buttonId, "Submitting RFP...")) return;

    try {
      // Call the real API to submit the final review
      const response = await fetch(
        `${API_BASE_URL}/api/v1/three-pl/lead/submit/lead-rfp-step`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadContactId: state.lead_id,
            // Add other required payload fields here if needed
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "API error");
      }

      // Store the response data in state
      if (result.success && result.data) {
        state.status = result.data.data.status;
        state.icpScore = result.data.data.icpScore;
      }

      // Show success state
      showButtonSuccess(buttonId, "RFP Submitted!", 3000);

      // Save state and notify parent window
      saveState();
      window.postMessage(
        { type: "slotted-rfp-form-submitted", leadId: state.lead_id },
        "*"
      );

      // Re-render after a delay to show completion state
      setTimeout(() => {
        render();
      }, 3000);
    } catch (err) {
      hideButtonLoading(buttonId);
      alert("Failed to submit RFP. Please try again.");
      console.error("Final submit error:", err);
    }
  }

  // Main initialization function
  async function init() {
    const container = document.getElementById("slotted-easyrfp");
    if (!container) return;

    // Check if there's a trigger button for modal mode
    const triggerBtn = document.getElementById("open-slotted-widget");
    if (triggerBtn) {
      // Hide the original container as we'll use modal mode
      container.style.display = "none";
      return;
    }

    // Show loading state
    container.innerHTML = `
      <div class="slotted-loading-container">
        <div class="slotted-loading-spinner"></div>
        <p class="slotted-loading-text">Loading widget...</p>
      </div>
    `;

    // Initialize provider authentication and fetch 3PL providers
    const [authSuccess] = await Promise.all([
      initializeProvider(),
      fetchThreePLProviders("", 1, 20, false), // Initial load with no search
    ]);

    if (authSuccess) {
      // Provider authenticated successfully, render the widget
      render();
    } else {
      // Show error state
      container.innerHTML = renderErrorState();
    }
  }

  // On load
  // Always initialize if container exists
  if (document.getElementById("slotted-easyrfp")) {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }

  // Modal functionality for embedded widget
  function initializeModalWidget() {
    // Create modal HTML structure
    const modalHTML = `
      <div id="slotted-widget-modal" style="
        display: none;
        position: fixed;
        z-index: 999999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div id="slotted-modal-content" style="
          background: white;
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          padding: 12px 36px
        ">
          <button id="slotted-modal-close" style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: #f3f4f6;
            border: none;
            border-radius: 50%;
            width: 35px;
            height: 35px;
            cursor: pointer;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            z-index: 1000000;
            transition: all 0.2s;
            font-family: Arial, sans-serif;
            line-height: 1;
          ">&times;</button>
          <div id="slotted-easyrfp-modal"  style="
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          "></div>
        </div>
      </div>
    `;

    // Add modal to body if it doesn't exist
    if (!document.getElementById("slotted-widget-modal")) {
      document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    // Modal control functions
    function openModal() {
      const modal = document.getElementById("slotted-widget-modal");
      const modalContainer = document.getElementById("slotted-easyrfp-modal");

      if (modal && modalContainer) {
        // Copy widget key from original container
        const originalContainer = document.getElementById("slotted-easyrfp");
        if (originalContainer) {
          const widgetKey = originalContainer.getAttribute("data-widget-key");
          modalContainer.setAttribute("data-widget-key", widgetKey);
        }

        modal.style.display = "flex";
        document.body.style.overflow = "hidden";

        // Initialize widget in modal if not already initialized
        if (
          !modalContainer.hasChildNodes() ||
          modalContainer.innerHTML.trim() === ""
        ) {
          // Show loading state
          modalContainer.innerHTML = `
            <div class="slotted-loading-container">
              <div class="slotted-loading-spinner"></div>
              <p class="slotted-loading-text">Loading widget...</p>
            </div>
          `;

          // Initialize widget in modal
          initializeWidgetInContainer(modalContainer);
        }
      }
    }

    function closeModal() {
      const modal = document.getElementById("slotted-widget-modal");
      if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
      }
    }

    // Initialize widget in specific container
    async function initializeWidgetInContainer(container) {
      if (!container) return;

      // Initialize provider authentication and fetch 3PL providers
      const [authSuccess] = await Promise.all([
        initializeProvider(),
        fetchThreePLProviders("", 1, 20, false),
      ]);

      if (authSuccess) {
        // Render the widget directly in the modal container
        render("slotted-easyrfp-modal");
      } else {
        container.innerHTML = renderErrorState();
      }
    }

    // Add event listeners
    const closeBtn = document.getElementById("slotted-modal-close");
    const modal = document.getElementById("slotted-widget-modal");

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);

      // Hover effect for close button
      closeBtn.addEventListener("mouseenter", function () {
        this.style.background = "#e5e7eb";
        this.style.color = "#374151";
      });

      closeBtn.addEventListener("mouseleave", function () {
        this.style.background = "#f3f4f6";
        this.style.color = "#6b7280";
      });
    }

    if (modal) {
      // Close when clicking outside
      modal.addEventListener("click", function (e) {
        if (e.target === this) {
          closeModal();
        }
      });
    }

    // Close with Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        const modal = document.getElementById("slotted-widget-modal");
        if (modal && modal.style.display === "flex") {
          closeModal();
        }
      }
    });

    // Look for trigger button and add click event
    function attachTriggerButton() {
      const triggerBtn = document.getElementById("open-slotted-widget");
      if (triggerBtn) {
        triggerBtn.addEventListener("click", openModal);

        // Add hover effect
        triggerBtn.addEventListener("mouseenter", function () {
          this.style.background = "#3b7ce0";
          this.style.transform = "translateY(-2px)";
          this.style.boxShadow = "0 6px 20px rgba(79, 140, 255, 0.4)";
        });

        triggerBtn.addEventListener("mouseleave", function () {
          this.style.background = "#4f8cff";
          this.style.transform = "translateY(0)";
          this.style.boxShadow = "0 4px 12px rgba(79, 140, 255, 0.3)";
        });
      }
    }

    // Try to attach immediately or wait for DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", attachTriggerButton);
    } else {
      attachTriggerButton();
    }

    // Also check periodically for dynamically added buttons (for React apps)
    setInterval(attachTriggerButton, 1000);
  }

  // Initialize modal functionality
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeModalWidget);
  } else {
    initializeModalWidget();
  }
})();
