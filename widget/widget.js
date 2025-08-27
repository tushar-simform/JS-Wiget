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
  // Simulated DB
  let leads = [];
  // State
  let state = {
    step: 1,
    lead_id: null,
    contact: {},
    rfp: {},
    status: null,
  };
  // Restore from session
  if (sessionStorage.getItem("slotted_state")) {
    state = JSON.parse(sessionStorage.getItem("slotted_state"));
  }
  function saveState() {
    sessionStorage.setItem("slotted_state", JSON.stringify(state));
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
  // UI
  function render() {
    injectWidgetCSS();
    const el = document.getElementById("slotted-easyrfp");
    el.innerHTML = "";
    // Auth check
    if (!isAuthenticated) {
      el.innerHTML = `<div class="slotted-banner" style="background:#ffeaea;color:#b00;">Widget authentication failed or subscription inactive.<br>Please contact your provider.</div>`;
      return;
    }
    // Banner
    if (state.status === "partial_contact") {
      el.innerHTML += `<div class="slotted-banner">Partial lead saved. Provider notified.</div>`;
    }
    if (state.status === "complete") {
      el.innerHTML += `<div class="slotted-banner">Lead complete! ICP Score: <b>${state.icp_score}</b></div>`;
    }
    // Step 1: Contact
    el.innerHTML += `
      <div class="slotted-step${
        state.step === 1 ? " active" : ""
      }" id="slotted-step-1">
        <img src="${
          PROVIDER.theme.logo || "assets/logo.png"
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
        <input class="slotted-input" id="slotted-phone" value="${
          state.contact.phone || ""
        }"/>
        <div style="margin:0.5em 0;">
          <input type="checkbox" id="slotted-gdpr" required/>
          <label for="slotted-gdpr" style="font-size:0.9em;">I consent to data processing (GDPR/CCPA)</label>
        </div>
        <button class="slotted-btn" id="slotted-next">Next</button>
      </div>
    `;
    // Step 2: RFP
    el.innerHTML += `
      <div class="slotted-step${
        state.step === 2 ? " active" : ""
      }" id="slotted-step-2">
        <h3>Easy RFP</h3>
        <label class="slotted-label">Channels*</label>
        <select class="slotted-input" id="slotted-channels" multiple>
          <option>DTC</option><option>Wholesale</option><option>Amazon</option><option>Retail</option>
        </select>
        <label class="slotted-label">Annual Orders*</label>
        <input class="slotted-input" id="slotted-orders" type="number" min="1" value="${
          state.rfp.annual_orders || ""
        }"/>
        <button class="slotted-btn" id="slotted-submit">Submit RFP</button>
      </div>
    `;
    // Confirmation
    if (state.status === "complete") {
      el.innerHTML += `<div style="margin-top:1.5em;text-align:center;">
        <b>Thank you!</b><br>Want to edit this later? <a href="#">Finish your account on Slotted</a>
      </div>`;
    }
    // Footer
    el.innerHTML += `<div class="slotted-footer">Powered by Slotted. reCAPTCHA v3 protected.</div>`;
    applyTheme();
    bindEvents();
  }
  // Events
  function bindEvents() {
    if (state.step === 1) {
      document.getElementById("slotted-next").onclick = handleContactSubmit;
    }
    if (state.step === 2) {
      document.getElementById("slotted-submit").onclick = handleRFPSubmit;
    }
  }
  // Step 1 handler
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

    //zoho
    const data = {
      fields: [
        { name: "firstname", value: name },
        { name: "lastname", value: company },
        { name: "email", value: email },
        // Add more fields as needed
      ],
    };

    // const portalId = "243674329";
    // const formGuid = "53bd0021-2274-4b35-b3ad-d483a7f71eec";

    // const response = await fetch(
    //   `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(data),
    //   }
    // );

    // if (response.ok) {
    //   alert("Form submitted!");
    // } else {
    //   alert("There was an error. Please try again.");
    // }
    //ending
    // saveState();
    console.log(state);
    render();
    // Simulate provider notification
    console.log("Provider notified: New partial lead captured.");
  }
  // Step 2 handler
  function handleRFPSubmit() {
    const channels = Array.from(
      document.getElementById("slotted-channels").selectedOptions
    ).map((o) => o.value);
    const annual_orders = parseInt(
      document.getElementById("slotted-orders").value,
      10
    );
    if (!channels.length || !annual_orders) {
      alert("Please fill all required RFP fields.");
      return;
    }
    // Simulate RFP save
    let lead = leads.find((l) => l.lead_id === state.lead_id);
    if (lead) {
      lead.status = "complete";
      lead.rfp_answers = { channels, annual_orders };
      lead.icp_score = calcICPScore(channels, annual_orders);
      lead.volume_profile = {
        sku_count: 120,
        monthly_orders: Math.round(annual_orders / 12),
      };
      lead.updated_at = Date.now();
    }
    state = {
      ...state,
      status: "complete",
      rfp: { channels, annual_orders },
      icp_score: lead.icp_score,
      volume_profile: lead.volume_profile,
    };
    // saveState();
    render();
    // Simulate provider notification
    console.log("Provider notified: New lead with ICP score available.");
    // Simulate CRM push queue
    setTimeout(() => {
      console.log("CRM push: ", { ...lead });
    }, 1000);
  }
  // Mock ICP scoring
  function calcICPScore(channels, annual_orders) {
    let score = 50 + channels.length * 10 + Math.min(annual_orders / 1000, 30);
    return Math.round(score);
  }
  // On load
  // Always render immediately if container exists
  if (document.getElementById("slotted-easyrfp")) {
    render();
  } else {
    document.addEventListener("DOMContentLoaded", render);
  }
  console.log("Hello I am widget");
})();
