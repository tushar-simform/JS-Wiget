// Slotted Easy-RFP Widget (Vanilla JS, static data)
(function () {
  const THEME = {
    colors: { primary: "#447ecfff", background: "#ffffffff", text: "#222" },
    fonts: "Inter, Arial, sans-serif",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThlbtKPH9W2wUhsMFRThundJCwEDaLRhjxoQ&s",
  };
  const THEME2 = {
    colors: { primary: "#f36fe3ff", background: "#b5bbc9ff", text: "#222" },
    fonts: "Inter, Arial, sans-serif",
    logo: "assets/logo.png",
  };

  // Country codes data for phone number selector
  const COUNTRY_CODES = [
    { code: "+1", flag: "🇺🇸", name: "United States" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+91", flag: "🇮🇳", name: "India" },
    { code: "+61", flag: "🇦🇺", name: "Australia" },
    { code: "+33", flag: "🇫🇷", name: "France" },
    { code: "+49", flag: "🇩🇪", name: "Germany" },
    { code: "+81", flag: "🇯🇵", name: "Japan" },
    { code: "+86", flag: "🇨🇳", name: "China" },
    { code: "+7", flag: "🇷🇺", name: "Russia" },
    { code: "+55", flag: "🇧🇷", name: "Brazil" },
    { code: "+39", flag: "🇮🇹", name: "Italy" },
    { code: "+34", flag: "🇪🇸", name: "Spain" },
    { code: "+31", flag: "🇳🇱", name: "Netherlands" },
    { code: "+46", flag: "🇸🇪", name: "Sweden" },
    { code: "+47", flag: "🇳🇴", name: "Norway" },
    { code: "+45", flag: "🇩🇰", name: "Denmark" },
    { code: "+41", flag: "🇨🇭", name: "Switzerland" },
    { code: "+43", flag: "🇦🇹", name: "Austria" },
    { code: "+32", flag: "🇧🇪", name: "Belgium" },
    { code: "+351", flag: "🇵🇹", name: "Portugal" },
    { code: "+48", flag: "🇵🇱", name: "Poland" },
    { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
    { code: "+36", flag: "🇭🇺", name: "Hungary" },
    { code: "+30", flag: "🇬🇷", name: "Greece" },
    { code: "+358", flag: "🇫🇮", name: "Finland" },
    { code: "+1", flag: "🇨🇦", name: "Canada" },
    { code: "+52", flag: "🇲🇽", name: "Mexico" },
    { code: "+54", flag: "🇦🇷", name: "Argentina" },
    { code: "+56", flag: "🇨🇱", name: "Chile" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+82", flag: "🇰🇷", name: "South Korea" },
    { code: "+65", flag: "🇸🇬", name: "Singapore" },
    { code: "+60", flag: "🇲🇾", name: "Malaysia" },
    { code: "+66", flag: "🇹🇭", name: "Thailand" },
    { code: "+84", flag: "🇻🇳", name: "Vietnam" },
    { code: "+62", flag: "🇮🇩", name: "Indonesia" },
    { code: "+63", flag: "🇵🇭", name: "Philippines" },
    { code: "+64", flag: "🇳🇿", name: "New Zealand" },
    { code: "+971", flag: "🇦🇪", name: "UAE" },
    { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
    { code: "+972", flag: "🇮🇱", name: "Israel" },
    { code: "+90", flag: "🇹🇷", name: "Turkey" },
    { code: "+20", flag: "🇪🇬", name: "Egypt" },
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
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
      description: "Submit to providers",
      percentage: 100,
    },
  ];

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
  // API Configuration
  const API_BASE_URL = "https://api-develop.izba.co"; // Replace with your actual API base URL

  // Provider state
  let PROVIDER = null;
  let isAuthenticated = false;
  let providerError = null;

  // Static provider response for development (remove when API is ready)
  function getStaticProviderResponse(widgetKey) {
    const staticProviders = {
      abc123: {
        success: true,
        data: {
          id: "provider-123",
          name: "Demo 3PL Provider",
          widget_key: "abc123",
          subscription_status: "active",
          theme: THEME,
          settings: {
            allowed_domains: ["*"],
            max_submissions_per_day: 100,
          },
        },
      },
      def456: {
        success: true,
        data: {
          id: "provider-456",
          name: "Test Provider",
          widget_key: "def456",
          subscription_status: "active",
          theme: THEME2,
          settings: {
            allowed_domains: ["localhost", "testdomain.com"],
            max_submissions_per_day: 50,
          },
        },
      },
      inactive123: {
        success: true,
        data: {
          id: "provider-inactive",
          name: "Inactive Provider",
          widget_key: "inactive123",
          subscription_status: "inactive",
          theme: THEME2,
          settings: {},
        },
      },
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        if (staticProviders[widgetKey]) {
          resolve(staticProviders[widgetKey]);
        } else {
          resolve({
            success: false,
            error: "Invalid widget key",
            message: "The provided widget key is not valid or does not exist.",
          });
        }
      }, 500); // Simulate API delay
    });
  }

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
    console.log(result);
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
    if (state.status === "Partially Completed") {
      return `<div class="slotted-banner">Partial lead saved. Provider notified.</div>`;
    }
    if (state.status === "Complete") {
      return `<div class="slotted-banner">Lead complete! ICP Score: <b>${state.icp_score}</b></div>`;
    }
    return "";
  }

  function renderContactStep() {
    return `
      <div class="slotted-step${
        state.step === 0 ? " active" : ""
      }" id="slotted-step-0">
        <img src="${
          PROVIDER.theme?.logo || "assets/logo.png"
        }" class="slotted-logo" alt="Provider Logo"/>
        <h3>Contact Info</h3>
        <label class="slotted-label">Name*</label>
        <input class="slotted-input" id="slotted-name" value="${
          state.contact.name || ""
        }"/>
        <label class="slotted-label">Email*</label>
        <input class="slotted-input" id="slotted-email" type="email" value="${
          state.contact.email || ""
        }"/>
        <label class="slotted-label">Company*</label>
        <input class="slotted-input" id="slotted-company" value="${
          state.contact.company || ""
        }"/>
        <label class="slotted-label">Website URL*</label>
        <input class="slotted-input" id="slotted-website" value="${
          state.contact.website_url || ""
        }"/>
        <label class="slotted-label">Phone</label>
        <div class="slotted-phone-container">
          <select class="slotted-country-code" id="slotted-country-code">
            ${generateCountryOptions(state.contact.countryCode)}
          </select>
          <input class="slotted-input slotted-phone-input" id="slotted-phone" placeholder="123-456-7890" value="${
            state.contact.phone || ""
          }"/>
        </div>
        <div class="slotted-gdpr-container">
          <input type="checkbox" id="slotted-gdpr" required/>
          <label for="slotted-gdpr" class="slotted-gdpr-label">I consent to data processing (GDPR/CCPA)</label>
        </div>
        <button class="slotted-btn" id="slotted-next">Start RFP Process</button>
      </div>
    `;
  }

  function renderOutboundProfileStep() {
    return `
      <div class="slotted-step${
        state.step === 1 ? " active" : ""
      }" id="slotted-step-1">
        <h3>Outbound Profile</h3>
        <p class="slotted-step-description">Tell us about your volume and business context to get the right provider matches.</p>
        
        <div class="slotted-critical-volume-card">
          <div class="slotted-section-header">
            <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-no-axes-column-increasing w-6 h-6" data-lov-id="src/components/ShippingProfileForm.tsx:238:14" data-lov-name="BarChart" data-component-path="src/components/ShippingProfileForm.tsx" data-component-line="238" data-component-file="ShippingProfileForm.tsx" data-component-name="BarChart" data-component-content="%7B%22className%22%3A%22w-6%20h-6%22%7D"><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></svg></span>
            <h4>Critical Volume Metrics</h4>
            <span class="slotted-required-badge">Required</span>
          </div>
          <p class="slotted-section-description">Essential information needed for all provider matches</p>
          
          <div class="slotted-grid-2 slotted-grid-spacing">
            <div>
              <label class="slotted-label">Monthly Orders *</label>
              <input class="slotted-input" id="slotted-monthly-orders" type="number" placeholder="e.g. 1,500" value="${
                state.outbound_profile.monthly_orders || ""
              }"/>
            </div>
            <div>
              <label class="slotted-label">Avg Items/Order *</label>
              <input class="slotted-input" id="slotted-avg-items" type="number" step="0.1" placeholder="e.g. 2.5" value="${
                state.outbound_profile.avg_items || ""
              }"/>
            </div>
          </div>
          
          <div class="slotted-grid-2">
            <div>
              <label class="slotted-label">Avg Order Value *</label>
              <input class="slotted-input" id="slotted-avg-order-value" type="number" step="0.01" placeholder="$78.50" value="${
                state.outbound_profile.avg_order_value || ""
              }"/>
            </div>
            <div>
              <label class="slotted-label">How many SKUs *</label>
              <input class="slotted-input" id="slotted-sku-count" type="number" placeholder="e.g. 250" value="${
                state.outbound_profile.sku_count || ""
              }"/>
            </div>
          </div>
        </div>

        <div class="slotted-business-context-card">
          <div class="slotted-section-header">
            <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-6 h-6" data-lov-id="src/components/ShippingProfileForm.tsx:347:14" data-lov-name="TrendingUp" data-component-path="src/components/ShippingProfileForm.tsx" data-component-line="347" data-component-file="ShippingProfileForm.tsx" data-component-name="TrendingUp" data-component-content="%7B%22className%22%3A%22w-6%20h-6%22%7D"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg></span>
            <h4>Important Business Context</h4>
            <span class="slotted-required-badge">Required</span>
          </div>
          <p class="slotted-section-description">Help us find the best provider matches for your needs</p>
          
          <div class="slotted-form-section">
            <label class="slotted-label">Where do you sell? *</label>
            <div class="slotted-search-input">
              <span class="slotted-search-icon">🔍</span>
              <input class="slotted-input" id="slotted-sell-location" placeholder="Search countries..." value="${
                state.outbound_profile.sell_location || ""
              }"/>
            </div>
          </div>
          
          <div class="slotted-growth-section">
            <div class="slotted-growth-header">
              <span class="slotted-growth-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target w-5 h-5 text-blue-600" data-lov-id="src/components/GrowthScenarioPlanner.tsx:43:10" data-lov-name="Target" data-component-path="src/components/GrowthScenarioPlanner.tsx" data-component-line="43" data-component-file="GrowthScenarioPlanner.tsx" data-component-name="Target" data-component-content="%7B%22className%22%3A%22w-5%20h-5%20text-blue-600%22%7D"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></span>
              <h5>Growth Expectations</h5>
            </div>
            <p class="slotted-growth-description">Plan for best and worst case scenarios to help providers understand your range</p>
            
            <div class="slotted-current-orders">
              <label>Current Monthly Orders</label>
              <div class="slotted-current-value">${
                state.outbound_profile.current_monthly_orders || "0"
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
                    <div class="slotted-growth-detail">~0 orders/month</div>
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
                    <div class="slotted-growth-detail">~0 orders/month</div>
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
                    <div class="slotted-growth-detail">~0 orders/month</div>
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
                    <div class="slotted-growth-detail">~0 orders/month</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="slotted-growth-note">
              <strong>Note:</strong> Negative growth is okay - it helps providers understand your realistic expectations and plan appropriate pricing structures.
            </div>
          </div>
          
          <div class="slotted-form-section">
            <label class="slotted-label">How big is your typical customer order? *</label>
            <div class="slotted-checkbox-grid">
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-fits-mailbox" ${
                  state.outbound_profile.fits_in_mailbox ? "checked" : ""
                }/>
                <label for="slotted-fits-mailbox">Fits in your mailbox</label>
              </div>
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-fits-porch" ${
                  state.outbound_profile.fits_on_porch ? "checked" : ""
                }/>
                <label for="slotted-fits-porch">Fits on the porch</label>
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
                  state.outbound_profile.are_serialized === "yes"
                    ? "checked"
                    : ""
                }/>
                <label for="slotted-serialized-yes">Yes</label>
              </div>
              <div class="slotted-radio-item">
                <input type="radio" id="slotted-serialized-no" name="serialized" value="no" ${
                  state.outbound_profile.are_serialized === "no"
                    ? "checked"
                    : ""
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
                  state.outbound_profile.shipment_retail_pallets
                    ? "checked"
                    : ""
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

        <!-- Optional Information Section - Separate Card -->
        <div class="slotted-optional-toggle" id="slotted-optional-toggle">
          <span>Show Optional Information</span>
          <span class="slotted-toggle-text">(helps determine fit)</span>
          <span class="slotted-toggle-icon">▼</span>
        </div>
        
        <div class="slotted-optional-content slotted-optional-hidden" id="slotted-optional-content">
          <div class="slotted-business-context-card">
            <div class="slotted-section-header">
              <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-5 h-5" data-lov-id="src/components/ShippingProfileForm.tsx:448:18" data-lov-name="TrendingUp" data-component-path="src/components/ShippingProfileForm.tsx" data-component-line="448" data-component-file="ShippingProfileForm.tsx" data-component-name="TrendingUp" data-component-content="%7B%22className%22%3A%22w-5%20h-5%22%7D"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg></span>
              <h4>Additional Context</h4>
            </div>
            <p class="slotted-section-description">Optional information that can help improve provider matches</p>
            
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
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">When do you hope to start shipping orders?</label>
              <div class="slotted-grid-2">
                <select class="slotted-input" id="slotted-start-month">
                  <option value="">Month</option>
                  <option value="1" ${
                    state.outbound_profile.start_month === "1" ? "selected" : ""
                  }>January</option>
                  <option value="2" ${
                    state.outbound_profile.start_month === "2" ? "selected" : ""
                  }>February</option>
                  <option value="3" ${
                    state.outbound_profile.start_month === "3" ? "selected" : ""
                  }>March</option>
                  <option value="4" ${
                    state.outbound_profile.start_month === "4" ? "selected" : ""
                  }>April</option>
                  <option value="5" ${
                    state.outbound_profile.start_month === "5" ? "selected" : ""
                  }>May</option>
                  <option value="6" ${
                    state.outbound_profile.start_month === "6" ? "selected" : ""
                  }>June</option>
                  <option value="7" ${
                    state.outbound_profile.start_month === "7" ? "selected" : ""
                  }>July</option>
                  <option value="8" ${
                    state.outbound_profile.start_month === "8" ? "selected" : ""
                  }>August</option>
                  <option value="9" ${
                    state.outbound_profile.start_month === "9" ? "selected" : ""
                  }>September</option>
                  <option value="10" ${
                    state.outbound_profile.start_month === "10"
                      ? "selected"
                      : ""
                  }>October</option>
                  <option value="11" ${
                    state.outbound_profile.start_month === "11"
                      ? "selected"
                      : ""
                  }>November</option>
                  <option value="12" ${
                    state.outbound_profile.start_month === "12"
                      ? "selected"
                      : ""
                  }>December</option>
                </select>
                <select class="slotted-input" id="slotted-start-year">
                  <option value="">Year</option>
                  <option value="2024" ${
                    state.outbound_profile.start_year === "2024"
                      ? "selected"
                      : ""
                  }>2024</option>
                  <option value="2025" ${
                    state.outbound_profile.start_year === "2025"
                      ? "selected"
                      : ""
                  }>2025</option>
                  <option value="2026" ${
                    state.outbound_profile.start_year === "2026"
                      ? "selected"
                      : ""
                  }>2026</option>
                  <option value="2027" ${
                    state.outbound_profile.start_year === "2027"
                      ? "selected"
                      : ""
                  }>2027</option>
                </select>
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">Where do you currently ship from?</label>
              <input class="slotted-input" id="slotted-ship-from" placeholder="ZIP code or city" value="${
                state.outbound_profile.ship_from_location || ""
              }"/>
            </div>
            
            <div class="slotted-form-section">
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-seasonal-peaks" ${
                  state.outbound_profile.seasonal_peaks ? "checked" : ""
                }/>
                <label for="slotted-seasonal-peaks">Seasonal peaks in sales</label>
              </div>
            </div>
            
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
                    state.outbound_profile.single_sku_orders === "no"
                      ? "checked"
                      : ""
                  }/>
                  <label for="slotted-single-sku-no">No</label>
                </div>
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">What percentage of your outbound volume is in eaches vs case or pallet?</label>
              <div class="slotted-volume-container">
                <div class="slotted-volume-labels">
                  <span>50% Eaches</span>
                  <span>50% Case/Pallet</span>
                </div>
                <input type="range" id="slotted-volume-distribution" min="0" max="100" value="${
                  state.outbound_profile.volume_distribution || 50
                }" 
                       class="slotted-volume-slider" />
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">Average weight per shipment type</label>
              <div class="slotted-grid-3">
                <div>
                  <label class="slotted-label slotted-weight-label">Eaches (lbs)</label>
                  <input class="slotted-input" id="slotted-weight-eaches" type="number" step="0.1" placeholder="2.5" value="${
                    state.outbound_profile.weight_eaches || ""
                  }"/>
                </div>
                <div>
                  <label class="slotted-label slotted-weight-label">Cases (lbs)</label>
                  <input class="slotted-input" id="slotted-weight-cases" type="number" step="0.1" placeholder="25" value="${
                    state.outbound_profile.weight_cases || ""
                  }"/>
                </div>
                <div>
                  <label class="slotted-label slotted-weight-label">Pallets (lbs)</label>
                  <input class="slotted-input" id="slotted-weight-pallets" type="number" step="0.1" placeholder="1500" value="${
                    state.outbound_profile.weight_pallets || ""
                  }"/>
                </div>
              </div>
            </div>
            
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
          </div>
        </div>

        ${renderNavigationButtons(1)}
      </div>
    `;
  }

  function renderInboundProfileStep() {
    return `
      <div class="slotted-step${
        state.step === 2 ? " active" : ""
      }" id="slotted-step-2">
        <h3>Inbound Profile</h3>
        <p class="slotted-step-description">Tell us about your inventory and storage needs.</p>
        
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
              <option value="ambient" ${
                state.inbound_profile?.storage_type === "ambient"
                  ? "selected"
                  : ""
              }>Ambient Temperature</option>
              <option value="refrigerated" ${
                state.inbound_profile?.storage_type === "refrigerated"
                  ? "selected"
                  : ""
              }>Refrigerated (32-40°F)</option>
              <option value="frozen" ${
                state.inbound_profile?.storage_type === "frozen"
                  ? "selected"
                  : ""
              }>Frozen (Below 0°F)</option>
              <option value="climate_controlled" ${
                state.inbound_profile?.storage_type === "climate_controlled"
                  ? "selected"
                  : ""
              }>Climate Controlled</option>
              <option value="multiple" ${
                state.inbound_profile?.storage_type === "multiple"
                  ? "selected"
                  : ""
              }>Multiple Temperature Zones</option>
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
          
          <!-- Centered Continue Button -->
          <div style="text-align: center; margin: 2rem 0;">
            <button class="slotted-btn" id="slotted-inbound-next-centered" style="padding: 0.8em 2em;">Continue to Review</button>
          </div>
        </div>

        ${renderNavigationButtons(2)}
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
           Back
         </button>`
      : `<button class="slotted-btn-back" id="slotted-back-step-${currentStep}">
           <svg class="slotted-nav-icon slotted-nav-icon-left" viewBox="0 0 24 24" fill="none">
             <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m0 0l7 7m-7-7l7-7"/>
           </svg>
           Back
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
        ${backButton}
        <div class="slotted-navigation-group">
          <button class="slotted-btn-secondary" id="slotted-save-progress">
            <svg class="slotted-nav-icon slotted-nav-icon-left" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 0V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3m1 0h4"/>
            </svg>
            Save Progress
          </button>
          ${nextButton}
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
        <p style="margin-bottom: 2rem; color: #6b7280; text-align: center;">Please review your information before we submit your RFP to potential providers.</p>
        
        <!-- Shipping Profile Card -->
        <div class="slotted-business-context-card" style="margin-bottom: 1.5rem;">
          <div class="slotted-section-header" style="margin-bottom: 1.5rem;">
            <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin w-5 h-5" data-lov-id="src/components/ReviewSummary.tsx:106:18" data-lov-name="MapPin" data-component-path="src/components/ReviewSummary.tsx" data-component-line="106" data-component-file="ReviewSummary.tsx" data-component-name="MapPin" data-component-content="%7B%22className%22%3A%22w-5%20h-5%22%7D"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg></span>
            <div style="flex: 1;">
              <h4 style="margin: 0;">Shipping Profile</h4>
              <p style="margin: 0; color: #6b7280; font-size: 0.85rem;">Volume metrics and business context</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">✓ Complete</span>
              <button id="slotted-edit-outbound" style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 0.25rem;" title="Edit Shipping Profile">
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
                <strong style="color: #374151; font-size: 0.9rem;">Average Order Value</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">$${
                  state.outbound_profile?.avg_order_value || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Sales Regions</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.sell_location || "Not specified"
                }</div>
              </div>
              <div>
                <strong style="color: #374151; font-size: 0.9rem;">Growth Expectations</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">
                  ${
                    state.outbound_profile?.year1_best_growth
                      ? `Year 1: ${
                          state.outbound_profile.year1_worst_growth || 0
                        }% to ${state.outbound_profile.year1_best_growth}%`
                      : "Not specified"
                  }<br>
                  ${
                    state.outbound_profile?.year2_best_growth
                      ? `Year 2: ${
                          state.outbound_profile.year2_worst_growth || 0
                        }% to ${state.outbound_profile.year2_best_growth}%`
                      : ""
                  }
                </div>
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
                <strong style="color: #374151; font-size: 0.9rem;">SKU Count</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.outbound_profile?.sku_count || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Return Rate</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">Not specified</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inbound Profile Card -->
        <div class="slotted-business-context-card" style="margin-bottom: 2rem;">
          <div class="slotted-section-header" style="margin-bottom: 1.5rem;">
            <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-package w-5 h-5" data-lov-id="src/components/ReviewSummary.tsx:190:18" data-lov-name="Package" data-component-path="src/components/ReviewSummary.tsx" data-component-line="190" data-component-file="ReviewSummary.tsx" data-component-name="Package" data-component-content="%7B%22className%22%3A%22w-5%20h-5%22%7D"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"></path><path d="M12 22V12"></path><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"></path><path d="m7.5 4.27 9 5.15"></path></svg></span>
            <div style="flex: 1;">
              <h4 style="margin: 0;">Inbound Profile</h4>
              <p style="margin: 0; color: #6b7280; font-size: 0.85rem;">Product and operational requirements</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="background: #d1fae5; color: #065f46; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 500;">✓ Complete</span>
              <button id="slotted-edit-inbound" style="background: none; border: none; color: #6b7280; cursor: pointer; padding: 0.25rem;" title="Edit Inbound Profile">
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
                <strong style="color: #374151; font-size: 0.9rem;">Storage Type</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.inbound_profile?.storage_type
                    ? state.inbound_profile.storage_type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())
                    : "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Inbound Frequency</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.inbound_profile?.inbound_frequency
                    ? state.inbound_profile.inbound_frequency
                        .charAt(0)
                        .toUpperCase() +
                      state.inbound_profile.inbound_frequency.slice(1)
                    : "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Special Storage Requirements</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">Not specified</div>
              </div>
              <div>
                <strong style="color: #374151; font-size: 0.9rem;">Eaches vs Case/Pallet</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">50% Eaches</div>
              </div>
            </div>
            <div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Shipment Types</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  [
                    state.inbound_profile?.palletized ? "Palletized" : null,
                    state.inbound_profile?.floor_loaded ? "Floor Loaded" : null,
                    state.inbound_profile?.parcel ? "Parcel" : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Not specified"
                }</div>
              </div>
              <div style="margin-bottom: 1rem;">
                <strong style="color: #374151; font-size: 0.9rem;">Return Rate</strong>
                <div style="color: #6b7280; font-size: 0.9rem;">${
                  state.inbound_profile?.return_rate
                    ? state.inbound_profile.return_rate + "%"
                    : "Not specified"
                }</div>
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
            </div>
          </div>
        </div>

        <!-- Create Volume Profile Section -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; text-align: center;">
          <h4 style="margin: 0 0 0.5rem 0; color: #374151;">Ready to create your volume profile?</h4>
          <p style="margin: 0 0 1.5rem 0; color: #6b7280; font-size: 0.9rem;">Generate a comprehensive analysis of your business volume and requirements.</p>
          <button class="slotted-btn" id="slotted-create-profile" style="background: #4f46e5; padding: 0.75rem 2rem;">Create Volume Profile</button>
        </div>

        ${renderNavigationButtons(3)}
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
  // Simulated DB
  let leads = [];

  // Inject widget CSS from external file
  function injectWidgetCSS() {
    // if (document.getElementById("slotted-widget-style")) return;
    // const link = document.createElement("link");
    // link.id = "slotted-widget-style";
    // link.rel = "stylesheet";
    // link.href = "http://localhost:3000/widget.css";
    // document.head.appendChild(link);
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
  function render() {
    injectWidgetCSS();
    const el = document.getElementById("slotted-easyrfp");
    el.innerHTML = "";

    // Auth check - if not authenticated, the error state should already be rendered by init()
    if (!isAuthenticated) {
      el.innerHTML = renderErrorState();
      return;
    }

    // If step 0 (contact form), render only contact form without step progress
    if (state.step === 0) {
      el.innerHTML = `
        <div class="slotted-content-container">
          ${renderBanner()}
          ${renderContactStep()}
          ${renderFooter()}
        </div>
      `;
    } else {
      // Render RFP flow with step progress
      el.innerHTML = `
        <div class="slotted-step-progress-container">
          ${renderStepProgress()}
        </div>
        <div class="slotted-content-container">
          ${renderBanner()}
          ${renderOutboundProfileStep()}
          ${renderInboundProfileStep()}
          ${renderFinalReviewStep()}
          ${renderFooter()}
        </div>
      `;
    }

    applyTheme();
    bindEvents();
  }
  // Events
  function bindEvents() {
    if (state.step === 0) {
      const nextBtn = document.getElementById("slotted-next");
      if (nextBtn) nextBtn.onclick = handleContactSubmit;
    }
    if (state.step === 1) {
      // New navigation buttons
      const nextBtn = document.getElementById("slotted-next-step-1");
      if (nextBtn) nextBtn.onclick = handleOutboundProfileSubmit;

      // Back button is disabled in step 1, no need to bind

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

      // Bind range slider update
      const volumeRange = document.getElementById(
        "slotted-volume-distribution"
      );
      if (volumeRange) {
        volumeRange.oninput = function () {
          const eachesPercent = this.value;
          const casesPalletPercent = 100 - this.value;
          const labels = this.parentElement.querySelector("div");
          if (labels) {
            labels.innerHTML = `<span>${eachesPercent}% Eaches</span><span>${casesPalletPercent}% Case/Pallet</span>`;
          }
        };
      }
    }
    if (state.step === 2) {
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
      // New navigation buttons
      const submitBtn = document.getElementById("slotted-submit-final");
      if (submitBtn) submitBtn.onclick = handleFinalSubmit;

      const backBtn = document.getElementById("slotted-back-step-3");
      if (backBtn) backBtn.onclick = handleBackToInbound;

      const createProfileBtn = document.getElementById(
        "slotted-create-profile"
      );
      if (createProfileBtn) createProfileBtn.onclick = handleCreateProfile;

      // Edit buttons
      const editOutboundBtn = document.getElementById("slotted-edit-outbound");
      if (editOutboundBtn) editOutboundBtn.onclick = handleEditOutbound;

      const editInboundBtn = document.getElementById("slotted-edit-inbound");
      if (editInboundBtn) editInboundBtn.onclick = handleEditInbound;
    }

    // Bind Save Progress button (available in all RFP steps)
    if (state.step > 0) {
      const saveProgressBtn = document.getElementById("slotted-save-progress");
      if (saveProgressBtn) saveProgressBtn.onclick = handleSaveProgress;
    }
  }

  // Back button handlers
  function handleBackToContact() {
    state = {
      ...state,
      step: 0, // Back to contact form
    };
    saveState();
    render();
  }

  function handleBackToOutbound() {
    state = {
      ...state,
      step: 1, // Back to outbound profile
    };
    saveState();
    render();
  }

  function handleBackToInbound() {
    state = {
      ...state,
      step: 2, // Back to inbound profile
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

  // Create Volume Profile handler
  function handleCreateProfile() {
    // This could open a modal, redirect to another page, or trigger an API call
    console.log("Create Volume Profile clicked");
    alert("Volume Profile creation feature coming soon!");
  }

  // Save Progress handler
  function handleSaveProgress() {
    // Save current state to session storage
    saveState();

    // Show confirmation message
    const button = document.getElementById("slotted-save-progress");
    const originalText = button.innerHTML;

    // Temporarily show success state
    button.innerHTML = `
      <svg class="slotted-nav-icon slotted-nav-icon-left" viewBox="0 0 24 24" fill="none">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
      Saved!
    `;
    button.style.background = "#d1fae5";
    button.style.borderColor = "#a7f3d0";
    button.style.color = "#065f46";

    // Reset after 2 seconds
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = "#f9fafb";
      button.style.borderColor = "#e5e7eb";
      button.style.color = "#6b7280";
    }, 2000);

    console.log("Progress saved:", state);
  }

  // Step 1 handler - Contact Info
  async function handleContactSubmit() {
    const name = document.getElementById("slotted-name").value.trim();
    const email = document.getElementById("slotted-email").value.trim();
    const company = document.getElementById("slotted-company").value.trim();
    const website_url = document.getElementById("slotted-website").value.trim();
    const phone = document.getElementById("slotted-phone").value.trim();
    const countryCode = document.getElementById("slotted-country-code").value;
    const gdpr = document.getElementById("slotted-gdpr").checked;

    // Log provider ID from script URL
    console.log("Provider ID from URL:", PROVIDER_WIDGET_KEY);

    if (!name || !email || !company || !website_url || !gdpr) {
      alert("Please fill all required fields and consent.");
      return;
    }

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
      render();
    } catch (err) {
      alert("Network error. Please try again later.");
      console.error(err);
    }
  }

  // Step 2 handler - Outbound Profile
  function handleOutboundProfileSubmit() {
    const monthly_orders = document
      .getElementById("slotted-monthly-orders")
      .value.trim();
    const avg_items = document.getElementById("slotted-avg-items").value.trim();
    const avg_order_value = document
      .getElementById("slotted-avg-order-value")
      .value.trim();
    const sku_count = document.getElementById("slotted-sku-count").value.trim();
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
    const fits_in_mailbox = document.getElementById(
      "slotted-fits-mailbox"
    ).checked;
    const fits_on_porch = document.getElementById("slotted-fits-porch").checked;
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
    const weight_eaches =
      document.getElementById("slotted-weight-eaches")?.value?.trim() || "";
    const weight_cases =
      document.getElementById("slotted-weight-cases")?.value?.trim() || "";
    const weight_pallets =
      document.getElementById("slotted-weight-pallets")?.value?.trim() || "";

    const hazardous_yes = document.getElementById(
      "slotted-hazardous-yes"
    )?.checked;
    const hazardous_no = document.getElementById(
      "slotted-hazardous-no"
    )?.checked;
    const hazardous_products = hazardous_yes ? "yes" : hazardous_no ? "no" : "";

    if (
      !monthly_orders ||
      !avg_items ||
      !avg_order_value ||
      !sku_count ||
      !sell_location ||
      !are_serialized
    ) {
      alert("Please fill all required fields in the Outbound Profile.");
      return;
    }

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

    state = {
      ...state,
      step: 2, // Move to Inbound Profile
      outbound_profile: {
        monthly_orders: parseInt(monthly_orders),
        avg_items: parseFloat(avg_items),
        avg_order_value: parseFloat(avg_order_value),
        sku_count: parseInt(sku_count),
        sell_location,
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
        single_sku_orders,
        volume_distribution: parseInt(volume_distribution),
        weight_eaches: weight_eaches ? parseFloat(weight_eaches) : null,
        weight_cases: weight_cases ? parseFloat(weight_cases) : null,
        weight_pallets: weight_pallets ? parseFloat(weight_pallets) : null,
        hazardous_products,
      },
    };

    saveState();
    render();
    console.log("Outbound profile completed:", state.outbound_profile);
  }

  // Step 2 handler - Inbound Profile
  function handleInboundProfileSubmit() {
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
      alert("Please fill all required fields in the Inbound Profile.");
      return;
    }

    // Check if at least one shipment format is selected
    if (!palletized && !floor_loaded && !parcel) {
      alert("Please select at least one inbound shipment format.");
      return;
    }

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
      },
    };

    saveState();
    render();
    console.log("Inbound profile completed:", state.inbound_profile);
  }

  // Step 3 handler - Final Submit
  function handleFinalSubmit() {
    // Simulate RFP save
    let lead = leads.find((l) => l.lead_id === state.lead_id);
    if (lead) {
      lead.status = "complete";
      lead.outbound_profile = state.outbound_profile;
      lead.icp_score = calcICPScore(state.outbound_profile);
      lead.updated_at = Date.now();
    }

    state = {
      ...state,
      status: "complete",
      icp_score: lead ? lead.icp_score : calcICPScore(state.outbound_profile),
    };

    saveState();
    render();
    // Notify parent window of form submission (for embedding)
    window.postMessage(
      { type: "slotted-rfp-form-submitted", leadId: state.lead_id },
      "*"
    );
    // Simulate provider notification
    console.log("Provider notified: New lead with ICP score available.");
  }

  // Mock ICP scoring based on outbound profile
  function calcICPScore(outbound_profile) {
    if (!outbound_profile) return 50;

    let score = 50;

    // Score based on monthly orders
    if (outbound_profile.monthly_orders) {
      score += Math.min(outbound_profile.monthly_orders / 100, 20);
    }

    // Score based on average order value
    if (outbound_profile.avg_order_value) {
      score += Math.min(outbound_profile.avg_order_value / 10, 15);
    }

    // Score based on SKU count
    if (outbound_profile.sku_count) {
      score += Math.min(outbound_profile.sku_count / 50, 15);
    }

    return Math.round(Math.min(score, 100));
  }

  // Main initialization function
  async function init() {
    const container = document.getElementById("slotted-easyrfp");
    if (!container) return;

    // Show loading state
    container.innerHTML = `
      <div class="slotted-loading-container">
        <div class="slotted-loading-spinner"></div>
        <p class="slotted-loading-text">Loading widget...</p>
      </div>
    `;

    // Initialize provider authentication
    const authSuccess = await initializeProvider();

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
})();
