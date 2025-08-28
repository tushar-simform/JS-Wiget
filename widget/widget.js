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

  // Step configuration
  const STEPS_CONFIG = [
    {
      id: 1,
      title: "Outbound Profile",
      description: "Volume & business context",
      percentage: 33
    },
    {
      id: 2,
      title: "Inbound Profile", 
      description: "Product & operational details",
      percentage: 66
    },
    {
      id: 3,
      title: "Final Review",
      description: "Submit to providers",
      percentage: 100
    }
  ];

  // Simulated provider DB (could be replaced by API call)
  const PROVIDER_DB = [
    {
      id: "provider-123",
      name: "Demo 3PL Provider",
      widget_key: "abc123",
      subscription_status: "active",
      theme: THEME,
    },
    {
      id: "provider-456",
      name: "Inactive Provider",
      widget_key: "def456",
      subscription_status: "active",
      theme: THEME2,
    },
    {
      id: "provider-456",
      name: "Inactive Provider",
      widget_key: "xyz999",
      subscription_status: "inactive",
      theme: THEME2,
    },
  ];

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
  const PROVIDER_ID_FROM_URL = getProviderIdFromScript();

  // Authenticate provider
  const PROVIDER = PROVIDER_DB.find((p) => p.widget_key === SNIPPET_WIDGET_KEY);
  const isAuthenticated =
    !!PROVIDER && PROVIDER.subscription_status === "active";
  // State
  let state = {
    step: 1,
    lead_id: null,
    contact: {},
    rfp: {},
    outbound_profile: {},
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
    const currentStep = STEPS_CONFIG.find(s => s.id === state.step);
    const progressPercentage = currentStep ? currentStep.percentage : 33;
    
    return `
      <div class="slotted-step-progress">
        <div class="slotted-progress-header">
          <span class="slotted-step-indicator">Step ${state.step} of ${STEPS_CONFIG.length}</span>
          <span class="slotted-progress-percent">${progressPercentage}% Complete</span>
        </div>
        <div class="slotted-progress-bar">
          <div class="slotted-progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="slotted-steps-container">
          ${STEPS_CONFIG.map(step => `
            <div class="slotted-step-item ${step.id === state.step ? 'active' : ''} ${step.id < state.step ? 'completed' : ''}">
              <div class="slotted-step-number">${step.id}</div>
              <div class="slotted-step-content">
                <div class="slotted-step-title">${step.title}</div>
                <div class="slotted-step-description">${step.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderBanner() {
    if (state.status === "partial_contact") {
      return `<div class="slotted-banner">Partial lead saved. Provider notified.</div>`;
    }
    if (state.status === "complete") {
      return `<div class="slotted-banner">Lead complete! ICP Score: <b>${state.icp_score}</b></div>`;
    }
    return '';
  }

  function renderContactStep() {
    return `
      <div class="slotted-step${state.step === 1 ? " active" : ""}" id="slotted-step-1">
        <img src="${PROVIDER.theme.logo || "assets/logo.png"}" class="slotted-logo" alt="Provider Logo"/>
        <h3>Contact Info</h3>
        <label class="slotted-label">Name*</label>
        <input class="slotted-input" id="slotted-name" value="${state.contact.name || ""}"/>
        <label class="slotted-label">Email*</label>
        <input class="slotted-input" id="slotted-email" type="email" value="${state.contact.email || ""}"/>
        <label class="slotted-label">Company*</label>
        <input class="slotted-input" id="slotted-company" value="${state.contact.company || ""}"/>
        <label class="slotted-label">Website URL*</label>
        <input class="slotted-input" id="slotted-website" value="${state.contact.website_url || ""}"/>
        <label class="slotted-label">Phone</label>
        <input class="slotted-input" id="slotted-phone" value="${state.contact.phone || ""}"/>
        <div style="margin:0.5em 0;">
          <input type="checkbox" id="slotted-gdpr" required/>
          <label for="slotted-gdpr" style="font-size:0.9em;">I consent to data processing (GDPR/CCPA)</label>
        </div>
        <button class="slotted-btn" id="slotted-next">Next</button>
      </div>
    `;
  }

  function renderOutboundProfileStep() {
    return `
      <div class="slotted-step${state.step === 2 ? " active" : ""}" id="slotted-step-2">
        <h3>Outbound Profile</h3>
        <p style="margin-bottom: 1.5rem; color: #6b7280; font-size: 0.95rem;">Tell us about your volume and business context to get the right provider matches.</p>
        
        <div class="slotted-critical-volume-card">
          <div class="slotted-section-header">
            <span class="slotted-section-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chart-no-axes-column-increasing w-6 h-6" data-lov-id="src/components/ShippingProfileForm.tsx:238:14" data-lov-name="BarChart" data-component-path="src/components/ShippingProfileForm.tsx" data-component-line="238" data-component-file="ShippingProfileForm.tsx" data-component-name="BarChart" data-component-content="%7B%22className%22%3A%22w-6%20h-6%22%7D"><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></svg></span>
            <h4>Critical Volume Metrics</h4>
            <span class="slotted-required-badge">Required</span>
          </div>
          <p class="slotted-section-description">Essential information needed for all provider matches</p>
          
          <div class="slotted-grid-2" style="margin-bottom: 1rem;">
            <div>
              <label class="slotted-label">Monthly Orders *</label>
              <input class="slotted-input" id="slotted-monthly-orders" type="number" placeholder="e.g. 1,500" value="${state.outbound_profile.monthly_orders || ""}"/>
            </div>
            <div>
              <label class="slotted-label">Avg Items/Order *</label>
              <input class="slotted-input" id="slotted-avg-items" type="number" step="0.1" placeholder="e.g. 2.5" value="${state.outbound_profile.avg_items || ""}"/>
            </div>
          </div>
          
          <div class="slotted-grid-2">
            <div>
              <label class="slotted-label">Avg Order Value *</label>
              <input class="slotted-input" id="slotted-avg-order-value" type="number" step="0.01" placeholder="$78.50" value="${state.outbound_profile.avg_order_value || ""}"/>
            </div>
            <div>
              <label class="slotted-label">How many SKUs *</label>
              <input class="slotted-input" id="slotted-sku-count" type="number" placeholder="e.g. 250" value="${state.outbound_profile.sku_count || ""}"/>
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
              <input class="slotted-input" id="slotted-sell-location" placeholder="Search countries..." value="${state.outbound_profile.sell_location || ""}"/>
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
              <div class="slotted-current-value">${state.outbound_profile.current_monthly_orders || "0"}</div>
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
                      <input class="slotted-growth-input" id="slotted-year1-best-growth" type="number" placeholder="50" value="${state.outbound_profile.year1_best_growth || ""}"/>
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
                      <input class="slotted-growth-input" id="slotted-year1-worst-growth" type="number" placeholder="-10" value="${state.outbound_profile.year1_worst_growth || ""}"/>
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
                      <input class="slotted-growth-input" id="slotted-year2-best-growth" type="number" placeholder="75" value="${state.outbound_profile.year2_best_growth || ""}"/>
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
                      <input class="slotted-growth-input" id="slotted-year2-worst-growth" type="number" placeholder="5" value="${state.outbound_profile.year2_worst_growth || ""}"/>
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
                <input type="checkbox" id="slotted-fits-mailbox" ${state.outbound_profile.fits_in_mailbox ? 'checked' : ''}/>
                <label for="slotted-fits-mailbox">Fits in your mailbox</label>
              </div>
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-fits-porch" ${state.outbound_profile.fits_on_porch ? 'checked' : ''}/>
                <label for="slotted-fits-porch">Fits on the porch</label>
              </div>
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-needs-two-people" ${state.outbound_profile.needs_two_people ? 'checked' : ''}/>
                <label for="slotted-needs-two-people">Needs two people to carry</label>
              </div>
            </div>
          </div>
          
          <div class="slotted-form-section">
            <label class="slotted-label">Are your SKUs serialized or batch controlled? *</label>
            <div class="slotted-radio-group">
              <div class="slotted-radio-item">
                <input type="radio" id="slotted-serialized-yes" name="serialized" value="yes" ${state.outbound_profile.are_serialized === 'yes' ? 'checked' : ''}/>
                <label for="slotted-serialized-yes">Yes</label>
              </div>
              <div class="slotted-radio-item">
                <input type="radio" id="slotted-serialized-no" name="serialized" value="no" ${state.outbound_profile.are_serialized === 'no' ? 'checked' : ''}/>
                <label for="slotted-serialized-no">No</label>
              </div>
            </div>
          </div>
          
          <div class="slotted-form-section">
            <label class="slotted-label">What types of shipments do you fulfill? *</label>
            <div class="slotted-checkbox-grid">
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-dtc-parcel" ${state.outbound_profile.shipment_dtc_parcel ? 'checked' : ''}/>
                <label for="slotted-dtc-parcel">DTC (Parcel)</label>
              </div>
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-retail-cases" ${state.outbound_profile.shipment_retail_cases ? 'checked' : ''}/>
                <label for="slotted-retail-cases">Retail (Cases)</label>
              </div>
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-retail-pallets" ${state.outbound_profile.shipment_retail_pallets ? 'checked' : ''}/>
                <label for="slotted-retail-pallets">Retail (Pallets)</label>
              </div>
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-marketplace-cases" ${state.outbound_profile.shipment_marketplace_cases ? 'checked' : ''}/>
                <label for="slotted-marketplace-cases">Marketplace (Cases)</label>
              </div>
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-marketplace-pallets" ${state.outbound_profile.shipment_marketplace_pallets ? 'checked' : ''}/>
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
        
        <div class="slotted-optional-content" id="slotted-optional-content" style="display: none;">
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
                  <input type="radio" id="slotted-fulfill-inhouse" name="fulfillment" value="inhouse" ${state.outbound_profile.fulfillment_method === 'inhouse' ? 'checked' : ''}/>
                  <label for="slotted-fulfill-inhouse">In house fulfillment</label>
                </div>
                <div class="slotted-radio-item">
                  <input type="radio" id="slotted-fulfill-3pl" name="fulfillment" value="3pl" ${state.outbound_profile.fulfillment_method === '3pl' ? 'checked' : ''}/>
                  <label for="slotted-fulfill-3pl">3PL provider</label>
                </div>
                <div class="slotted-radio-item">
                  <input type="radio" id="slotted-fulfill-dropship" name="fulfillment" value="dropship" ${state.outbound_profile.fulfillment_method === 'dropship' ? 'checked' : ''}/>
                  <label for="slotted-fulfill-dropship">Dropshipping</label>
                </div>
                <div class="slotted-radio-item">
                  <input type="radio" id="slotted-fulfill-notyet" name="fulfillment" value="not_yet" ${state.outbound_profile.fulfillment_method === 'not_yet' ? 'checked' : ''}/>
                  <label for="slotted-fulfill-notyet">Not fulfilling yet</label>
                </div>
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">When do you hope to start shipping orders?</label>
              <div class="slotted-grid-2">
                <select class="slotted-input" id="slotted-start-month">
                  <option value="">Month</option>
                  <option value="1" ${state.outbound_profile.start_month === '1' ? 'selected' : ''}>January</option>
                  <option value="2" ${state.outbound_profile.start_month === '2' ? 'selected' : ''}>February</option>
                  <option value="3" ${state.outbound_profile.start_month === '3' ? 'selected' : ''}>March</option>
                  <option value="4" ${state.outbound_profile.start_month === '4' ? 'selected' : ''}>April</option>
                  <option value="5" ${state.outbound_profile.start_month === '5' ? 'selected' : ''}>May</option>
                  <option value="6" ${state.outbound_profile.start_month === '6' ? 'selected' : ''}>June</option>
                  <option value="7" ${state.outbound_profile.start_month === '7' ? 'selected' : ''}>July</option>
                  <option value="8" ${state.outbound_profile.start_month === '8' ? 'selected' : ''}>August</option>
                  <option value="9" ${state.outbound_profile.start_month === '9' ? 'selected' : ''}>September</option>
                  <option value="10" ${state.outbound_profile.start_month === '10' ? 'selected' : ''}>October</option>
                  <option value="11" ${state.outbound_profile.start_month === '11' ? 'selected' : ''}>November</option>
                  <option value="12" ${state.outbound_profile.start_month === '12' ? 'selected' : ''}>December</option>
                </select>
                <select class="slotted-input" id="slotted-start-year">
                  <option value="">Year</option>
                  <option value="2024" ${state.outbound_profile.start_year === '2024' ? 'selected' : ''}>2024</option>
                  <option value="2025" ${state.outbound_profile.start_year === '2025' ? 'selected' : ''}>2025</option>
                  <option value="2026" ${state.outbound_profile.start_year === '2026' ? 'selected' : ''}>2026</option>
                  <option value="2027" ${state.outbound_profile.start_year === '2027' ? 'selected' : ''}>2027</option>
                </select>
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">Where do you currently ship from?</label>
              <input class="slotted-input" id="slotted-ship-from" placeholder="ZIP code or city" value="${state.outbound_profile.ship_from_location || ''}"/>
            </div>
            
            <div class="slotted-form-section">
              <div class="slotted-checkbox-item">
                <input type="checkbox" id="slotted-seasonal-peaks" ${state.outbound_profile.seasonal_peaks ? 'checked' : ''}/>
                <label for="slotted-seasonal-peaks">Seasonal peaks in sales</label>
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">Do most orders contain just one SKU?</label>
              <div class="slotted-radio-group">
                <div class="slotted-radio-item">
                  <input type="radio" id="slotted-single-sku-yes" name="single_sku" value="yes" ${state.outbound_profile.single_sku_orders === 'yes' ? 'checked' : ''}/>
                  <label for="slotted-single-sku-yes">Yes</label>
                </div>
                <div class="slotted-radio-item">
                  <input type="radio" id="slotted-single-sku-no" name="single_sku" value="no" ${state.outbound_profile.single_sku_orders === 'no' ? 'checked' : ''}/>
                  <label for="slotted-single-sku-no">No</label>
                </div>
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">What percentage of your outbound volume is in eaches vs case or pallet?</label>
              <div style="margin: 1rem 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: #6b7280;">
                  <span>50% Eaches</span>
                  <span>50% Case/Pallet</span>
                </div>
                <input type="range" id="slotted-volume-distribution" min="0" max="100" value="${state.outbound_profile.volume_distribution || 50}" 
                       style="width: 100%; height: 6px; border-radius: 3px; background: #e5e7eb; outline: none; -webkit-appearance: none;" />
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">Average weight per shipment type</label>
              <div class="slotted-grid-3">
                <div>
                  <label class="slotted-label" style="font-size: 0.8rem; margin-bottom: 0.25rem;">Eaches (lbs)</label>
                  <input class="slotted-input" id="slotted-weight-eaches" type="number" step="0.1" placeholder="2.5" value="${state.outbound_profile.weight_eaches || ''}"/>
                </div>
                <div>
                  <label class="slotted-label" style="font-size: 0.8rem; margin-bottom: 0.25rem;">Cases (lbs)</label>
                  <input class="slotted-input" id="slotted-weight-cases" type="number" step="0.1" placeholder="25" value="${state.outbound_profile.weight_cases || ''}"/>
                </div>
                <div>
                  <label class="slotted-label" style="font-size: 0.8rem; margin-bottom: 0.25rem;">Pallets (lbs)</label>
                  <input class="slotted-input" id="slotted-weight-pallets" type="number" step="0.1" placeholder="1500" value="${state.outbound_profile.weight_pallets || ''}"/>
                </div>
              </div>
            </div>
            
            <div class="slotted-form-section">
              <label class="slotted-label">Do you sell any hazardous products?</label>
              <div class="slotted-radio-group">
                <div class="slotted-radio-item">
                  <input type="radio" id="slotted-hazardous-yes" name="hazardous" value="yes" ${state.outbound_profile.hazardous_products === 'yes' ? 'checked' : ''}/>
                  <label for="slotted-hazardous-yes">Yes</label>
                </div>
                <div class="slotted-radio-item">
                  <input type="radio" id="slotted-hazardous-no" name="hazardous" value="no" ${state.outbound_profile.hazardous_products === 'no' ? 'checked' : ''}/>
                  <label for="slotted-hazardous-no">No</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="slotted-btn-group">
          <button class="slotted-btn-back" id="slotted-back-to-contact">Back</button>
          <button class="slotted-btn" id="slotted-outbound-next">Continue to Inbound Profile</button>
        </div>
      </div>
    `;
  }

  function renderInboundProfileStep() {
    return `
      <div class="slotted-step${state.step === 3 ? " active" : ""}" id="slotted-step-3">
        <h3>Final Review</h3>
        <p style="margin-bottom: 1.5rem; color: #6b7280;">Review your information and submit to providers.</p>
        
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <h4 style="margin: 0 0 1rem 0; color: #374151;">Contact Information</h4>
          <p><strong>Name:</strong> ${state.contact.name || 'Not provided'}</p>
          <p><strong>Email:</strong> ${state.contact.email || 'Not provided'}</p>
          <p><strong>Company:</strong> ${state.contact.company || 'Not provided'}</p>
          <p><strong>Website:</strong> ${state.contact.website_url || 'Not provided'}</p>
        </div>

        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <h4 style="margin: 0 0 1rem 0; color: #374151;">Outbound Profile</h4>
          <p><strong>Monthly Orders:</strong> ${state.outbound_profile.monthly_orders || 'Not provided'}</p>
          <p><strong>Average Items per Order:</strong> ${state.outbound_profile.avg_items || 'Not provided'}</p>
          <p><strong>Average Order Value:</strong> $${state.outbound_profile.avg_order_value || 'Not provided'}</p>
          <p><strong>SKU Count:</strong> ${state.outbound_profile.sku_count || 'Not provided'}</p>
          <p><strong>Sell Location:</strong> ${state.outbound_profile.sell_location || 'Not provided'}</p>
          <p><strong>Year 1 Best Case Growth:</strong> ${state.outbound_profile.year1_best_growth ? state.outbound_profile.year1_best_growth + '%' : 'Not provided'}</p>
          <p><strong>Year 1 Worst Case Growth:</strong> ${state.outbound_profile.year1_worst_growth ? state.outbound_profile.year1_worst_growth + '%' : 'Not provided'}</p>
          <p><strong>Year 2 Best Case Growth:</strong> ${state.outbound_profile.year2_best_growth ? state.outbound_profile.year2_best_growth + '%' : 'Not provided'}</p>
          <p><strong>Year 2 Worst Case Growth:</strong> ${state.outbound_profile.year2_worst_growth ? state.outbound_profile.year2_worst_growth + '%' : 'Not provided'}</p>
          <p><strong>Serialized/Batch Controlled:</strong> ${state.outbound_profile.are_serialized === 'yes' ? 'Yes' : state.outbound_profile.are_serialized === 'no' ? 'No' : 'Not provided'}</p>
        </div>

        <div class="slotted-btn-group">
          <button class="slotted-btn-back" id="slotted-back-to-outbound">Back</button>
          <button class="slotted-btn" id="slotted-submit">Submit RFP</button>
        </div>
      </div>
    `;
  }

  function renderFooter() {
    let footer = `<div class="slotted-footer">Powered by Slotted. reCAPTCHA v3 protected.</div>`;
    
    if (state.status === "complete") {
      footer = `<div style="margin-top:1.5em;text-align:center;">
        <b>Thank you!</b><br>Want to edit this later? <a href="#">Finish your account on Slotted</a>
      </div>` + footer;
    }
    
    return footer;
  }
  // Simulated DB
  let leads = [];

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
  function render() {
    injectWidgetCSS();
    const el = document.getElementById("slotted-easyrfp");
    el.innerHTML = "";
    
    // Auth check
    if (!isAuthenticated) {
      el.innerHTML = `<div class="slotted-banner" style="background:#ffeaea;color:#b00;">Widget authentication failed or subscription inactive.<br>Please contact your provider.</div>`;
      return;
    }
    
    // Render components with separate containers
    el.innerHTML = `
      <div class="slotted-step-progress-container">
        ${renderStepProgress()}
      </div>
      <div class="slotted-content-container">
        ${renderBanner()}
        ${renderContactStep()}
        ${renderOutboundProfileStep()}
        ${renderInboundProfileStep()}
        ${renderFooter()}
      </div>
    `;
    
    applyTheme();
    bindEvents();
  }
  // Events
  function bindEvents() {
    if (state.step === 1) {
      const nextBtn = document.getElementById("slotted-next");
      if (nextBtn) nextBtn.onclick = handleContactSubmit;
    }
    if (state.step === 2) {
      const outboundNextBtn = document.getElementById("slotted-outbound-next");
      if (outboundNextBtn) outboundNextBtn.onclick = handleOutboundProfileSubmit;
      
      const backBtn = document.getElementById("slotted-back-to-contact");
      if (backBtn) backBtn.onclick = handleBackToContact;
      
      // Bind optional toggle
      const optionalToggle = document.getElementById("slotted-optional-toggle");
      const optionalContent = document.getElementById("slotted-optional-content");
      if (optionalToggle && optionalContent) {
        optionalToggle.onclick = function() {
          const isExpanded = optionalContent.style.display !== 'none';
          if (isExpanded) {
            optionalContent.style.display = 'none';
            optionalToggle.classList.remove('expanded');
            optionalToggle.querySelector('span:first-child').textContent = 'Show Optional Information';
          } else {
            optionalContent.style.display = 'block';
            optionalToggle.classList.add('expanded');
            optionalToggle.querySelector('span:first-child').textContent = 'Hide Optional Information';
          }
        };
      }
      
      // Bind range slider update
      const volumeRange = document.getElementById("slotted-volume-distribution");
      if (volumeRange) {
        volumeRange.oninput = function() {
          const eachesPercent = this.value;
          const casesPalletPercent = 100 - this.value;
          const labels = this.parentElement.querySelector('div');
          if (labels) {
            labels.innerHTML = `<span>${eachesPercent}% Eaches</span><span>${casesPalletPercent}% Case/Pallet</span>`;
          }
        };
      }
    }
    if (state.step === 3) {
      const submitBtn = document.getElementById("slotted-submit");
      if (submitBtn) submitBtn.onclick = handleFinalSubmit;
      
      const backBtn = document.getElementById("slotted-back-to-outbound");
      if (backBtn) backBtn.onclick = handleBackToOutbound;
    }
  }

  // Back button handlers
  function handleBackToContact() {
    state = {
      ...state,
      step: 1,
    };
    saveState();
    render();
  }

  function handleBackToOutbound() {
    state = {
      ...state,
      step: 2,
    };
    saveState();
    render();
  }

  // Step 1 handler - Contact Info
  async function handleContactSubmit() {
    const name = document.getElementById("slotted-name").value.trim();
    const email = document.getElementById("slotted-email").value.trim();
    const company = document.getElementById("slotted-company").value.trim();
    const website_url = document.getElementById("slotted-website").value.trim();
    const phone = document.getElementById("slotted-phone").value.trim();
    const gdpr = document.getElementById("slotted-gdpr").checked;

    // Log provider ID from script URL
    console.log("Provider ID from URL:", PROVIDER_ID_FROM_URL);

    if (!name || !email || !company || !website_url || !gdpr) {
      alert("Please fill all required fields and consent.");
      return;
    }
    
    // Simulate duplicate check
    let existing = leads.find(
      (l) => l.email === email && l.website_url === website_url
    );
    let lead_id = existing
      ? existing.lead_id
      : "uuid-" + Math.random().toString(36).substr(2, 9);
    if (!existing) {
      leads.push({
        lead_id,
        provider_id: PROVIDER.id,
        name,
        email,
        company,
        website_url,
        phone,
        status: "partial_contact",
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    } else {
      existing.updated_at = Date.now();
      existing.provider_id = PROVIDER.id;
    }
    
    state = {
      ...state,
      step: 2,
      lead_id,
      contact: { name, email, company, website_url, phone },
      status: "partial_contact",
    };

    saveState();
    console.log(state);
    render();
    // Simulate provider notification
    console.log("Provider notified: New partial lead captured.");
  }

  // Step 2 handler - Outbound Profile
  function handleOutboundProfileSubmit() {
    const monthly_orders = document.getElementById("slotted-monthly-orders").value.trim();
    const avg_items = document.getElementById("slotted-avg-items").value.trim();
    const avg_order_value = document.getElementById("slotted-avg-order-value").value.trim();
    const sku_count = document.getElementById("slotted-sku-count").value.trim();
    const sell_location = document.getElementById("slotted-sell-location").value.trim();
    
    // Growth expectations
    const year1_best_growth = document.getElementById("slotted-year1-best-growth").value.trim();
    const year1_worst_growth = document.getElementById("slotted-year1-worst-growth").value.trim();
    const year2_best_growth = document.getElementById("slotted-year2-best-growth").value.trim();
    const year2_worst_growth = document.getElementById("slotted-year2-worst-growth").value.trim();
    
    // Business context checkboxes and radios
    const fits_in_mailbox = document.getElementById("slotted-fits-mailbox").checked;
    const fits_on_porch = document.getElementById("slotted-fits-porch").checked;
    const needs_two_people = document.getElementById("slotted-needs-two-people").checked;
    
    const serialized_yes = document.getElementById("slotted-serialized-yes").checked;
    const serialized_no = document.getElementById("slotted-serialized-no").checked;
    const are_serialized = serialized_yes ? 'yes' : (serialized_no ? 'no' : '');
    
    const shipment_dtc_parcel = document.getElementById("slotted-dtc-parcel").checked;
    const shipment_retail_cases = document.getElementById("slotted-retail-cases").checked;
    const shipment_retail_pallets = document.getElementById("slotted-retail-pallets").checked;
    const shipment_marketplace_cases = document.getElementById("slotted-marketplace-cases").checked;
    const shipment_marketplace_pallets = document.getElementById("slotted-marketplace-pallets").checked;

    // Optional fields
    const fulfillment_inhouse = document.getElementById("slotted-fulfill-inhouse")?.checked;
    const fulfillment_3pl = document.getElementById("slotted-fulfill-3pl")?.checked;
    const fulfillment_dropship = document.getElementById("slotted-fulfill-dropship")?.checked;
    const fulfillment_notyet = document.getElementById("slotted-fulfill-notyet")?.checked;
    const fulfillment_method = fulfillment_inhouse ? 'inhouse' : 
                              fulfillment_3pl ? '3pl' : 
                              fulfillment_dropship ? 'dropship' : 
                              fulfillment_notyet ? 'not_yet' : '';
    
    const start_month = document.getElementById("slotted-start-month")?.value || '';
    const start_year = document.getElementById("slotted-start-year")?.value || '';
    const ship_from_location = document.getElementById("slotted-ship-from")?.value?.trim() || '';
    const seasonal_peaks = document.getElementById("slotted-seasonal-peaks")?.checked || false;
    
    const single_sku_yes = document.getElementById("slotted-single-sku-yes")?.checked;
    const single_sku_no = document.getElementById("slotted-single-sku-no")?.checked;
    const single_sku_orders = single_sku_yes ? 'yes' : (single_sku_no ? 'no' : '');
    
    const volume_distribution = document.getElementById("slotted-volume-distribution")?.value || 50;
    const weight_eaches = document.getElementById("slotted-weight-eaches")?.value?.trim() || '';
    const weight_cases = document.getElementById("slotted-weight-cases")?.value?.trim() || '';
    const weight_pallets = document.getElementById("slotted-weight-pallets")?.value?.trim() || '';
    
    const hazardous_yes = document.getElementById("slotted-hazardous-yes")?.checked;
    const hazardous_no = document.getElementById("slotted-hazardous-no")?.checked;
    const hazardous_products = hazardous_yes ? 'yes' : (hazardous_no ? 'no' : '');

    if (!monthly_orders || !avg_items || !avg_order_value || !sku_count || !sell_location || !are_serialized) {
      alert("Please fill all required fields in the Outbound Profile.");
      return;
    }

    // Check if at least one shipment type is selected
    if (!shipment_dtc_parcel && !shipment_retail_cases && !shipment_retail_pallets && !shipment_marketplace_cases && !shipment_marketplace_pallets) {
      alert("Please select at least one shipment type.");
      return;
    }

    state = {
      ...state,
      step: 3,
      outbound_profile: {
        monthly_orders: parseInt(monthly_orders),
        avg_items: parseFloat(avg_items),
        avg_order_value: parseFloat(avg_order_value),
        sku_count: parseInt(sku_count),
        sell_location,
        current_monthly_orders: parseInt(monthly_orders), // Use monthly_orders as current
        year1_best_growth: year1_best_growth ? parseInt(year1_best_growth) : null,
        year1_worst_growth: year1_worst_growth ? parseInt(year1_worst_growth) : null,
        year2_best_growth: year2_best_growth ? parseInt(year2_best_growth) : null,
        year2_worst_growth: year2_worst_growth ? parseInt(year2_worst_growth) : null,
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
    // Simulate provider notification
    console.log("Provider notified: New lead with ICP score available.");
    // Simulate CRM push queue
    setTimeout(() => {
      console.log("CRM push: ", { ...lead });
    }, 1000);
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
  // On load
  // Always render immediately if container exists
  if (document.getElementById("slotted-easyrfp")) {
    render();
  } else {
    document.addEventListener("DOMContentLoaded", render);
  }
})();
